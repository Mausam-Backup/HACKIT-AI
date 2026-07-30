import asyncio
import importlib.util
import os
import subprocess
import sys

CAPTURE_DIR = "reviews/screenshots"

# Global flag — set by orchestrator from config
PLAYWRIGHT_HEADLESS = True

VIEWPORTS = [
    {"name": "mobile", "width": 375, "height": 812},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1920, "height": 1080},
]

HAS_PILLOW = importlib.util.find_spec("PIL") is not None


def _ensure_browsers():
    try:
        subprocess.run(
            [sys.executable, "-m", "playwright", "install", "chromium"],
            capture_output=True, timeout=120,
        )
    except Exception:
        pass


async def _capture_one(
    browser,
    url: str,
    route: str,
    vp: dict,
    project_dir: str,
    screenshot_dir: str,
    iteration: str | int,
    index: int,
    prev_iter: int | None,
) -> dict:
    """Capture a single viewport for a single route."""
    context = await browser.new_context(
        viewport={"width": vp["width"], "height": vp["height"]},
        ignore_https_errors=True,
    )
    page = await context.new_page()
    filename = f"{index+1:02d}-{vp['name']}-{route.replace('/', '_').strip('_') or 'root'}.png"
    filepath = os.path.join(screenshot_dir, f"iter-{iteration}-{filename}")

    try:
        resp = await page.goto(url, wait_until="networkidle", timeout=15000)
        status = resp.status if resp else 0
        await page.screenshot(path=filepath, full_page=True)

        entry = {
            "route": route,
            "viewport": vp["name"],
            "viewport_width": vp["width"],
            "viewport_height": vp["height"],
            "status": status,
            "screenshot": os.path.relpath(filepath, project_dir),
            "error": None,
            "diff": None,
        }

        if prev_iter and HAS_PILLOW:
            prev_file = os.path.join(screenshot_dir, f"iter-{prev_iter}-{filename}")
            if os.path.exists(prev_file):
                diff_file = os.path.join(screenshot_dir, f"diff-iter-{iteration}-vs-{prev_iter}-{filename}")
                from visual_diff import compute_diff
                diff_result = compute_diff(prev_file, filepath, diff_file)
                if diff_result:
                    entry["diff"] = diff_result
                    if diff_result.get("has_changes"):
                        print(f"  [browser] visual diff ({vp['name']}): {diff_result['diff_percentage']}% changed -> {diff_file}", flush=True)

        print(f"  [browser] {url} [{vp['name']}] -> {status} -> {filename}", flush=True)
        return entry
    except Exception as e:
        print(f"  [browser] {url} [{vp['name']}] FAILED: {e}", flush=True)
        return {
            "route": route,
            "viewport": vp["name"],
            "viewport_width": vp["width"],
            "viewport_height": vp["height"],
            "status": 0,
            "screenshot": None,
            "error": str(e),
            "diff": None,
        }
    finally:
        await page.close()
        await context.close()


async def capture_screenshots(
    base_url: str,
    routes: list[str],
    project_dir: str,
    iteration: str | int,
    max_pages: int = 8,
) -> list[dict]:
    _ensure_browsers()

    screenshot_dir = os.path.join(project_dir, CAPTURE_DIR)
    os.makedirs(screenshot_dir, exist_ok=True)

    pages_to_visit = routes[:max_pages]

    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("  [browser] playwright not installed — skipping screenshots", flush=True)
        return []

    prev_iter = None
    if isinstance(iteration, int) and iteration > 1:
        prev_iter = iteration - 1

    try:
        async with async_playwright() as p:
            headless = PLAYWRIGHT_HEADLESS
            browser = await p.chromium.launch(headless=headless)

            tasks = []
            for i, route in enumerate(pages_to_visit):
                url = base_url.rstrip("/") + "/" + route.lstrip("/")
                for vp in VIEWPORTS:
                    tasks.append(
                        _capture_one(browser, url, route, vp, project_dir, screenshot_dir, iteration, i, prev_iter)
                    )

            results = await asyncio.gather(*tasks, return_exceptions=True)
            # Flatten exceptions into error entries
            clean = []
            for r in results:
                if isinstance(r, Exception):
                    clean.append({
                        "route": "?",
                        "viewport": "?",
                        "viewport_width": 0,
                        "viewport_height": 0,
                        "status": 0,
                        "screenshot": None,
                        "error": str(r),
                        "diff": None,
                    })
                else:
                    clean.append(r)
            await browser.close()
            return clean
    except Exception as e:
        print(f"  [browser] playwright error: {e}", flush=True)
        return []


def generate_routes_from_files(project_dir: str) -> list[str]:
    routes = ["/"]
    frontend_dir = os.path.join(project_dir, "frontend")
    if not os.path.isdir(frontend_dir):
        return routes

    for root, _dirs, files in os.walk(frontend_dir):
        for fname in files:
            if fname.endswith((".jsx", ".tsx", ".vue", ".svelte")):
                fpath = os.path.join(root, fname)
                try:
                    with open(fpath, encoding="utf-8") as f:
                        content = f.read()
                except Exception:
                    continue
                import re
                for match in re.finditer(r'(?:path|to|href)=["\']([^"\']+)["\']', content):
                    route = match.group(1)
                    if route.startswith("/") and route not in routes and len(route) < 100:
                        routes.append(route)
    return routes[:12]


def screenshots_to_markdown(results: list[dict]) -> str:
    from collections import defaultdict
    by_route = defaultdict(list)
    for r in results:
        by_route[r["route"]].append(r)

    lines = ["## Screenshots Taken", ""]
    for route, entries in by_route.items():
        lines.append(f"### {route}")
        for r in entries:
            vp = r.get("viewport", "desktop")
            status_str = f"HTTP {r['status']}" if r["status"] else "FAILED"
            ss_str = f" → `{r['screenshot']}`" if r["screenshot"] else ""
            err_str = f" — error: {r['error']}" if r["error"] else ""
            diff_str = ""
            diff = r.get("diff")
            if diff:
                if diff.get("has_changes"):
                    diff_str = f" [diff: {diff['diff_percentage']}% changed]"
                    if diff.get("highlight_path"):
                        diff_str += f" → `{diff['highlight_path']}`"
                else:
                    diff_str = " [no visual changes]"
            lines.append(f"- `[{vp}]` {status_str}{ss_str}{err_str}{diff_str}")
        lines.append("")
    return "\n".join(lines)
