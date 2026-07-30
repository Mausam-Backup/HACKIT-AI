import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from browser_test import generate_routes_from_files, screenshots_to_markdown


class TestGenerateRoutesFromFiles:
    def test_no_frontend_dir(self):
        with tempfile.TemporaryDirectory() as td:
            routes = generate_routes_from_files(td)
            assert routes == ["/"]

    def test_empty_frontend_dir(self):
        with tempfile.TemporaryDirectory() as td:
            os.makedirs(os.path.join(td, "frontend"))
            routes = generate_routes_from_files(td)
            assert routes == ["/"]

    def test_detects_react_routes(self):
        with tempfile.TemporaryDirectory() as td:
            fe = os.path.join(td, "frontend", "src")
            os.makedirs(fe)
            app_file = os.path.join(fe, "App.jsx")
            with open(app_file, "w") as f:
                f.write("""import { Route } from 'react-router';
<Route path="/about" component={About} />
<Route path="/contact" component={Contact} />""")
            routes = generate_routes_from_files(td)
            assert "/" in routes
            assert "/about" in routes
            assert "/contact" in routes

    def test_detects_link_href(self):
        with tempfile.TemporaryDirectory() as td:
            fe = os.path.join(td, "frontend")
            os.makedirs(fe)
            comp = os.path.join(fe, "Nav.jsx")
            with open(comp, "w") as f:
                f.write('<a href="/dashboard">Dashboard</a>')
            routes = generate_routes_from_files(td)
            assert "/dashboard" in routes

    def test_dedupes_routes(self):
        with tempfile.TemporaryDirectory() as td:
            fe = os.path.join(td, "frontend")
            os.makedirs(fe)
            comp = os.path.join(fe, "App.jsx")
            with open(comp, "w") as f:
                f.write('<Route path="/home" />\n<Route path="/home" />')
            routes = generate_routes_from_files(td)
            assert routes.count("/home") == 1

    def test_max_twelve_routes(self):
        with tempfile.TemporaryDirectory() as td:
            fe = os.path.join(td, "frontend")
            os.makedirs(fe)
            comp = os.path.join(fe, "App.jsx")
            paths = "\n".join(f'<Route path="/page{n}" />' for n in range(20))
            with open(comp, "w") as f:
                f.write(paths)
            routes = generate_routes_from_files(td)
            assert len(routes) <= 12

    def test_only_supported_extensions(self):
        with tempfile.TemporaryDirectory() as td:
            fe = os.path.join(td, "frontend")
            os.makedirs(fe)
            for ext in [".jsx", ".tsx", ".vue", ".svelte"]:
                with open(os.path.join(fe, f"comp{ext}"), "w") as f:
                    f.write(f'<Route path="/from-{ext}" />')
            with open(os.path.join(fe, "style.css"), "w") as f:
                f.write('<Route path="/should-not-exist" />')
            with open(os.path.join(fe, "file.py"), "w") as f:
                f.write("path='/should-not-appear'")
            routes = generate_routes_from_files(td)
            assert "/from-.jsx" in routes
            assert "/from-.tsx" in routes
            assert "/should-not-exist" not in routes
            assert "/should-not-appear" not in routes

    def test_detects_vue_routes(self):
        with tempfile.TemporaryDirectory() as td:
            fe = os.path.join(td, "frontend")
            os.makedirs(fe)
            comp = os.path.join(fe, "App.vue")
            with open(comp, "w") as f:
                f.write('<router-link to="/dashboard">Dashboard</router-link>')
            routes = generate_routes_from_files(td)
            assert "/dashboard" in routes

    def test_detects_svelte_routes(self):
        with tempfile.TemporaryDirectory() as td:
            fe = os.path.join(td, "frontend")
            os.makedirs(fe)
            comp = os.path.join(fe, "App.svelte")
            with open(comp, "w") as f:
                f.write('<a href="/settings">Settings</a>')
            routes = generate_routes_from_files(td)
            assert "/settings" in routes

    def test_limit_route_length(self):
        with tempfile.TemporaryDirectory() as td:
            fe = os.path.join(td, "frontend")
            os.makedirs(fe)
            comp = os.path.join(fe, "App.jsx")
            long_route = "/" + "a" * 200
            with open(comp, "w") as f:
                f.write(f'<Route path="{long_route}" />')
            routes = generate_routes_from_files(td)
            assert len(long_route) < 100 or long_route not in routes

    def test_tsx_extension_supported(self):
        with tempfile.TemporaryDirectory() as td:
            fe = os.path.join(td, "frontend")
            os.makedirs(fe)
            comp = os.path.join(fe, "App.tsx")
            with open(comp, "w") as f:
                f.write('<Route path="/tsx-route" />')
            routes = generate_routes_from_files(td)
            assert "/tsx-route" in routes


class TestScreenshotsToMarkdown:
    def test_empty_results(self):
        md = screenshots_to_markdown([])
        assert "Screenshots Taken" in md

    def test_successful_screenshot(self):
        results = [
            {"route": "/", "status": 200, "screenshot": "reviews/screenshots/01-root.png", "error": None},
        ]
        md = screenshots_to_markdown(results)
        assert "HTTP 200" in md
        assert "01-root.png" in md

    def test_failed_screenshot(self):
        results = [
            {"route": "/fail", "status": 0, "screenshot": None, "error": "timeout"},
        ]
        md = screenshots_to_markdown(results)
        assert "FAILED" in md
        assert "timeout" in md

    def test_multiple_results(self):
        results = [
            {"route": "/", "status": 200, "screenshot": "a.png", "error": None},
            {"route": "/about", "status": 404, "screenshot": "b.png", "error": "not found"},
        ]
        md = screenshots_to_markdown(results)
        assert "HTTP 200" in md
        assert "HTTP 404" in md
        assert "/about" in md

    def test_includes_diff_info(self):
        results = [
            {
                "route": "/", "status": 200, "screenshot": "a.png", "error": None,
                "diff": {"has_changes": True, "diff_percentage": 12.5, "highlight_path": "diff.png"},
            },
        ]
        md = screenshots_to_markdown(results)
        assert "12.5%" in md
        assert "no visual changes" not in md

    def test_includes_no_diff_changes(self):
        results = [
            {
                "route": "/", "status": 200, "screenshot": "a.png", "error": None,
                "diff": {"has_changes": False, "diff_percentage": 0.0},
            },
        ]
        md = screenshots_to_markdown(results)
        assert "no visual changes" in md

    def test_no_diff_key(self):
        results = [
            {"route": "/", "status": 200, "screenshot": "a.png", "error": None},
        ]
        md = screenshots_to_markdown(results)
        assert "HTTP 200" in md
        assert "diff" not in md

    def test_groups_by_route_with_viewport(self):
        results = [
            {"route": "/", "viewport": "mobile", "status": 200, "screenshot": "a.png", "error": None},
            {"route": "/", "viewport": "desktop", "status": 200, "screenshot": "b.png", "error": None},
            {"route": "/about", "viewport": "mobile", "status": 200, "screenshot": "c.png", "error": None},
        ]
        md = screenshots_to_markdown(results)
        assert "/" in md
        assert "/about" in md
        assert "[mobile]" in md
        assert "[desktop]" in md

    def test_viewport_in_output(self):
        results = [
            {"route": "/", "viewport": "tablet", "status": 200, "screenshot": "t.png", "error": None, "diff": None},
        ]
        md = screenshots_to_markdown(results)
        assert "[tablet]" in md
        assert "HTTP 200" in md
