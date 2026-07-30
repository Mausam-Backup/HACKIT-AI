try:
    from PIL import Image, ImageChops, ImageDraw
    HAS_PILLOW = True
except ImportError:
    HAS_PILLOW = False


def compute_diff(before_path: str, after_path: str, output_path: str | None = None) -> dict | None:
    if not HAS_PILLOW:
        return None

    try:
        before = Image.open(before_path).convert("RGB")
        after = Image.open(after_path).convert("RGB")

        if before.size != after.size:
            after = after.resize(before.size, Image.LANCZOS)

        diff = ImageChops.difference(before, after)
        bbox = diff.getbbox()

        # Calculate diff percentage
        pixels = before.size[0] * before.size[1]
        if pixels == 0:
            diff_pct = 0.0
        else:
            import numpy as np
            diff_arr = np.array(diff)
            changed_pixels = np.sum(diff_arr > 10) // 3
            diff_pct = (changed_pixels / pixels) * 100

        result = {
            "diff_pixels": int(bbox is not None),
            "diff_percentage": round(float(diff_pct), 2),
            "has_changes": bool(bbox is not None and diff_pct > 0.5),
        }

        if output_path and bbox:
            highlighted = after.copy()
            draw = ImageDraw.Draw(highlighted)
            draw.rectangle(bbox, outline="red", width=3)
            highlighted.save(output_path)
            result["highlight_path"] = output_path

        return result
    except Exception as e:
        return {"error": str(e)}


def has_visual_changes(before_path: str, after_path: str, threshold: float = 0.5) -> bool:
    result = compute_diff(before_path, after_path)
    if result is None:
        return False
    if "error" in result:
        return False
    return result.get("has_changes", False) and result.get("diff_percentage", 0) > threshold
