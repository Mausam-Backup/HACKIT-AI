import os
import json
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dashboard import _slugify, _build_tree, _get_html, _read_project_info


class TestSlugify:
    def test_basic(self):
        s = _slugify("Build a finance tracker")
        assert s.startswith("build-a-finance-tracker-")
        assert "-" in s

    def test_special_chars_removed(self):
        s = _slugify("Hello! @ World # 2024")
        assert "!" not in s
        assert "@" not in s

    def test_whitespace_collapsed(self):
        s = _slugify("lots    of   spaces")
        assert "lots-of-spaces" in s

    def test_max_length(self):
        long_input = "very long task name that should be truncated at some point " * 10
        s = _slugify(long_input)
        assert len(s) < 70

    def test_md5_hash_suffix(self):
        s = _slugify("test")
        parts = s.split("-")
        assert len(parts[-1]) == 8

    def test_deterministic(self):
        assert _slugify("hello world") == _slugify("hello world")

    def test_different_inputs_different(self):
        assert _slugify("task one") != _slugify("task two")


class TestBuildTree:
    def test_empty_dir(self):
        with tempfile.TemporaryDirectory() as td:
            tree = _build_tree(td, td)
            assert tree == []

    def test_single_file(self):
        with tempfile.TemporaryDirectory() as td:
            with open(os.path.join(td, "test.txt"), "w") as f:
                f.write("hello")
            tree = _build_tree(td, td)
            assert len(tree) == 1
            assert tree[0]["name"] == "test.txt"
            assert tree[0]["type"] == "file"

    def test_directory_structure(self):
        with tempfile.TemporaryDirectory() as td:
            os.makedirs(os.path.join(td, "subdir"))
            with open(os.path.join(td, "subdir", "nested.txt"), "w") as f:
                f.write("nested")
            tree = _build_tree(td, td)
            assert len(tree) == 1
            assert tree[0]["type"] == "dir"
            assert tree[0]["name"] == "subdir"
            assert len(tree[0]["children"]) == 1
            assert tree[0]["children"][0]["name"] == "nested.txt"

    def test_filters_node_modules(self):
        with tempfile.TemporaryDirectory() as td:
            os.makedirs(os.path.join(td, "node_modules"))
            with open(os.path.join(td, "node_modules", "dep.js"), "w") as f:
                f.write("dep")
            tree = _build_tree(td, td)
            assert tree == []

    def test_filters_dot_dirs(self):
        with tempfile.TemporaryDirectory() as td:
            os.makedirs(os.path.join(td, ".hidden"))
            with open(os.path.join(td, ".hidden", "file.txt"), "w") as f:
                f.write("secret")
            tree = _build_tree(td, td)
            assert tree == []

    def test_forward_slash_paths(self):
        with tempfile.TemporaryDirectory() as td:
            os.makedirs(os.path.join(td, "frontend"))
            tree = _build_tree(td, td)
            assert tree[0]["path"].replace("\\", "/") == "frontend"

    def test_filters_pycache(self):
        with tempfile.TemporaryDirectory() as td:
            os.makedirs(os.path.join(td, "__pycache__"))
            with open(os.path.join(td, "__pycache__", "c.pyc"), "w") as f:
                f.write("c")
            tree = _build_tree(td, td)
            assert tree == []

    def test_mixed_content(self):
        with tempfile.TemporaryDirectory() as td:
            os.makedirs(os.path.join(td, "src"))
            with open(os.path.join(td, "src", "main.js"), "w") as f:
                f.write("// main")
            with open(os.path.join(td, "readme.md"), "w") as f:
                f.write("# Readme")
            tree = _build_tree(td, td)
            names = {e["name"] for e in tree}
            assert "src" in names
            assert "readme.md" in names


class TestGetHtml:
    def test_returns_fallback_when_no_static(self):
        with tempfile.TemporaryDirectory() as td:
            import dashboard as d
            orig = d.static_dir
            d.static_dir = td
            try:
                html = _get_html()
                assert "Dashboard" in html or "Coach" in html
            finally:
                d.static_dir = orig

    def test_reads_index_html(self):
        with tempfile.TemporaryDirectory() as td:
            import dashboard as d
            orig = d.static_dir
            d.static_dir = td
            try:
                with open(os.path.join(td, "index.html"), "w") as f:
                    f.write("<html><body>Custom</body></html>")
                html = _get_html()
                assert "Custom" in html
                assert "not found" not in html
            finally:
                d.static_dir = orig


class TestReadProjectInfo:
    def test_no_dirs(self):
        with tempfile.TemporaryDirectory() as td:
            info = _read_project_info(td)
            assert info["slug"] == os.path.basename(td)
            assert info["has_frontend"] is False
            assert info["has_backend"] is False
            assert info["has_plan"] is False
            assert info["has_code"] is False
            assert info["phase"] == "new"

    def test_with_frontend_and_backend(self):
        with tempfile.TemporaryDirectory() as td:
            os.makedirs(os.path.join(td, "frontend"))
            os.makedirs(os.path.join(td, "backend"))
            info = _read_project_info(td)
            assert info["has_frontend"] is True
            assert info["has_backend"] is True
            assert info["has_code"] is True

    def test_with_plan(self):
        with tempfile.TemporaryDirectory() as td:
            with open(os.path.join(td, "PLAN.md"), "w") as f:
                f.write("# Plan")
            info = _read_project_info(td)
            assert info["has_plan"] is True
            assert info["phase"] == "planned"

    def test_with_new_docs(self):
        for doc in ["ARCHITECTURE.md", "WALKTHROUGH.md", "NEXT-STEPS.md"]:
            with tempfile.TemporaryDirectory() as td:
                with open(os.path.join(td, doc), "w") as f:
                    f.write("# doc content")
                info = _read_project_info(td)
                assert info["has_plan"] is True
                assert info["phase"] == "planned"

    def test_validation_result(self):
        with tempfile.TemporaryDirectory() as td:
            runs = os.path.join(td, "runs")
            os.makedirs(runs)
            with open(os.path.join(runs, "validation-result.json"), "w") as f:
                json.dump({"passed": True}, f)
            os.makedirs(os.path.join(td, "frontend"))
            with open(os.path.join(td, "JUDGE_SCORE.md"), "w") as f:
                f.write("mock judge score")
            info = _read_project_info(td)
            assert info["validation_passed"] is True
            assert info["phase"] == "done"

    def test_phase_new(self):
        with tempfile.TemporaryDirectory() as td:
            info = _read_project_info(td)
            assert info["phase"] == "new"

    def test_project_name_from_slug(self):
        with tempfile.TemporaryDirectory() as td:
            info = _read_project_info(td)
            assert info["name"] == os.path.basename(td).replace("-", " ").title()
