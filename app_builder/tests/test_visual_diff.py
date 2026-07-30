import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from visual_diff import compute_diff, has_visual_changes, HAS_PILLOW


def _create_test_image(path, size=(100, 100), color=(255, 0, 0)):
    if HAS_PILLOW:
        from PIL import Image
        img = Image.new("RGB", size, color)
        img.save(path)
    else:
        with open(path, "w") as f:
            f.write("")


class TestComputeDiff:
    def test_no_pillow_returns_none(self):
        if not HAS_PILLOW:
            result = compute_diff("a.png", "b.png")
            assert result is None

    def test_identical_images(self):
        if HAS_PILLOW:
            with tempfile.TemporaryDirectory() as td:
                a = os.path.join(td, "a.png")
                b = os.path.join(td, "b.png")
                _create_test_image(a)
                _create_test_image(b)
                result = compute_diff(a, b)
                assert result is not None
                assert "error" not in result
                assert result["diff_percentage"] == 0.0
                assert result["has_changes"] is False

    def test_different_images(self):
        if HAS_PILLOW:
            with tempfile.TemporaryDirectory() as td:
                a = os.path.join(td, "a.png")
                b = os.path.join(td, "b.png")
                _create_test_image(a, color=(255, 0, 0))
                _create_test_image(b, color=(0, 255, 0))
                result = compute_diff(a, b)
                assert result is not None
                assert result["has_changes"] is True
                assert result["diff_percentage"] > 0

    def test_diff_highlight_path(self):
        if HAS_PILLOW:
            with tempfile.TemporaryDirectory() as td:
                a = os.path.join(td, "a.png")
                b = os.path.join(td, "b.png")
                diff_out = os.path.join(td, "diff.png")
                _create_test_image(a, color=(255, 0, 0))
                _create_test_image(b, color=(0, 255, 0))
                result = compute_diff(a, b, output_path=diff_out)
                assert result is not None
                assert os.path.exists(diff_out)

    def test_different_sizes(self):
        if HAS_PILLOW:
            with tempfile.TemporaryDirectory() as td:
                a = os.path.join(td, "a.png")
                b = os.path.join(td, "b.png")
                _create_test_image(a, size=(100, 100))
                _create_test_image(b, size=(200, 200))
                result = compute_diff(a, b)
                assert result is not None

    def test_file_not_found(self):
        if HAS_PILLOW:
            result = compute_diff("nonexistent.png", "b.png")
            assert result is not None
            assert "error" in result

    def test_invalid_image(self):
        if HAS_PILLOW:
            with tempfile.TemporaryDirectory() as td:
                a = os.path.join(td, "a.png")
                b = os.path.join(td, "b.png")
                with open(a, "w") as f:
                    f.write("not an image")
                with open(b, "w") as f:
                    f.write("also not an image")
                result = compute_diff(a, b)
                assert result is not None
                assert "error" in result


class TestHasVisualChanges:
    def test_no_changes(self):
        if HAS_PILLOW:
            with tempfile.TemporaryDirectory() as td:
                a = os.path.join(td, "a.png")
                b = os.path.join(td, "b.png")
                _create_test_image(a)
                _create_test_image(b)
                assert has_visual_changes(a, b, threshold=0.5) is False

    def test_has_changes(self):
        if HAS_PILLOW:
            with tempfile.TemporaryDirectory() as td:
                a = os.path.join(td, "a.png")
                b = os.path.join(td, "b.png")
                _create_test_image(a, color=(255, 0, 0))
                _create_test_image(b, color=(0, 0, 255))
                assert has_visual_changes(a, b, threshold=0.5) is True

    def test_no_pillow_returns_false(self):
        if not HAS_PILLOW:
            assert has_visual_changes("a.png", "b.png") is False
