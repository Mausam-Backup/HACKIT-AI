import os
import sys
import subprocess
import tempfile


sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from scaffold import (
    slugify,
    _has_changes,
    _force_rmtree,
    scaffold_project,
    copy_agents,
    git_commit,
    run_lint_and_test,
    _escape_template,
    load_prompt,
    _run_npm_script,
    estimate_tokens,
    truncate_to_limit,
)


class TestSlugify:
    def test_basic(self):
        s = slugify("Build a finance tracker app")
        assert s.startswith("build-a-finance-tracker-app-")

    def test_special_chars_removed(self):
        s = slugify("Hello! @ World # 2024")
        assert "!" not in s
        assert "@" not in s
        assert "#" not in s

    def test_consistency(self):
        s1 = slugify("same task")
        s2 = slugify("same task")
        assert s1 == s2

    def test_different_inputs(self):
        s1 = slugify("task one")
        s2 = slugify("task two")
        assert s1 != s2

    def test_whitespace_collapsed(self):
        s = slugify("lots    of   spaces")
        assert "lots-of-spaces" in s
        assert "    " not in s

    def test_length_limit(self):
        long_input = "very long task name that should be truncated nicely at some point " * 5
        s = slugify(long_input)
        assert len(s) < 70

    def test_hash_suffix(self):
        s = slugify("check hash is present")
        parts = s.split("-")
        assert len(parts[-1]) == 8

    def test_empty_string(self):
        s = slugify("")
        assert len(s.split("-")[-1]) == 8


class TestHasChanges:
    def test_no_git_dir(self):
        with tempfile.TemporaryDirectory() as td:
            result = _has_changes(td)
            assert result is True

    def test_clean_repo(self):
        with tempfile.TemporaryDirectory() as td:
            subprocess.run(["git", "init"], cwd=td, capture_output=True, timeout=10)
            result = _has_changes(td)
            assert result is False

    def test_dirty_repo(self):
        with tempfile.TemporaryDirectory() as td:
            subprocess.run(["git", "init"], cwd=td, capture_output=True, timeout=10)
            test_file = os.path.join(td, "test.txt")
            with open(test_file, "w") as f:
                f.write("hello")
            result = _has_changes(td)
            assert result is True

    def test_node_modules_ignored(self):
        with tempfile.TemporaryDirectory() as td:
            subprocess.run(["git", "init"], cwd=td, capture_output=True, timeout=10)
            os.makedirs(os.path.join(td, "node_modules"))
            dirty = os.path.join(td, "node_modules", "dep.txt")
            with open(dirty, "w") as f:
                f.write("stuff")
            result = _has_changes(td)
            assert result is False

    def test_git_error_returns_true(self):
        result = _has_changes("C:\\nonexistent_path_xyz")
        assert result is True


class TestForceRmtree:
    def test_remove_normal_dir(self):
        with tempfile.TemporaryDirectory() as td:
            subdir = os.path.join(td, "sub")
            os.makedirs(subdir)
            _force_rmtree(subdir)
            assert not os.path.exists(subdir)

    def test_nonexistent_dir(self):
        _force_rmtree("C:\\nonexistent_path_xyz_force_rmtree")

    def test_remove_file(self):
        with tempfile.TemporaryDirectory() as td:
            fpath = os.path.join(td, "test.txt")
            with open(fpath, "w") as f:
                f.write("data")
            _force_rmtree(fpath)
            assert not os.path.exists(fpath)


class TestScaffoldProject:
    def test_scaffold_creates_directories(self):
        with tempfile.TemporaryDirectory() as td:
            orig = os.path.join(os.path.dirname(__file__), "..")
            agents_src = os.path.join(td, "agents")
            prompts_src = os.path.join(td, "prompts")
            os.makedirs(agents_src)
            os.makedirs(prompts_src)
            agent_file = os.path.join(agents_src, "test-agent.md")
            with open(agent_file, "w") as f:
                f.write("# agent")
            import scaffold as sc
            sc.AGENTS_SOURCE = agents_src
            sc.PROMPTS_SOURCE = prompts_src
            sc.APP_BUILDER_DIR = td
            project_dir, slug = scaffold_project("test app", force=True)
            try:
                assert os.path.isdir(project_dir)
                assert slug in project_dir
                assert os.path.isfile(os.path.join(project_dir, "hackit.json"))
                assert os.path.isdir(os.path.join(project_dir, "tasks"))
                assert os.path.isdir(os.path.join(project_dir, "reviews"))
                assert os.path.isdir(os.path.join(project_dir, "audits"))
                assert os.path.isdir(os.path.join(project_dir, "runs"))
                assert os.path.isdir(os.path.join(project_dir, ".hackit", "agents"))
            finally:
                sc.AGENTS_SOURCE = os.path.join(orig, "agents")
                sc.PROMPTS_SOURCE = os.path.join(orig, "prompts")
                sc.APP_BUILDER_DIR = orig
                _force_rmtree(project_dir)

    def test_scaffold_force_overwrite(self):
        with tempfile.TemporaryDirectory() as td:
            import scaffold as sc
            orig_dir = sc.APP_BUILDER_DIR
            orig_agents = sc.AGENTS_SOURCE
            orig_prompts = sc.PROMPTS_SOURCE
            agents_src = os.path.join(td, "agents")
            prompts_src = os.path.join(td, "prompts")
            os.makedirs(agents_src)
            os.makedirs(prompts_src)
            with open(os.path.join(agents_src, "a.md"), "w") as f:
                f.write("# a")
            sc.AGENTS_SOURCE = agents_src
            sc.PROMPTS_SOURCE = prompts_src
            sc.APP_BUILDER_DIR = td
            project_dir, slug = scaffold_project("test app", force=True)
            try:
                assert os.path.isdir(project_dir)
                project_dir2, slug2 = scaffold_project("test app", force=True)
                assert os.path.isdir(project_dir2)
            finally:
                sc.AGENTS_SOURCE = orig_agents
                sc.PROMPTS_SOURCE = orig_prompts
                sc.APP_BUILDER_DIR = orig_dir
                _force_rmtree(project_dir)


class TestCopyAgents:
    def test_copies_agent_files(self):
        with tempfile.TemporaryDirectory() as td:
            agents_src = os.path.join(td, "agents")
            os.makedirs(agents_src)
            with open(os.path.join(agents_src, "coach.md"), "w") as f:
                f.write("# coach")
            with open(os.path.join(agents_src, "dev.md"), "w") as f:
                f.write("# dev")
            with open(os.path.join(agents_src, "notes.txt"), "w") as f:
                f.write("not an agent")
            import scaffold as sc
            orig_agents = sc.AGENTS_SOURCE
            sc.AGENTS_SOURCE = agents_src
            dest = os.path.join(td, "project", ".hackit", "agents")
            try:
                copy_agents(os.path.join(td, "project"))
                assert os.path.isfile(os.path.join(dest, "coach.md"))
                assert os.path.isfile(os.path.join(dest, "dev.md"))
                assert not os.path.isfile(os.path.join(dest, "notes.txt"))
            finally:
                sc.AGENTS_SOURCE = orig_agents


class TestGitCommit:
    def test_commit_with_changes(self):
        with tempfile.TemporaryDirectory() as td:
            subprocess.run(["git", "init"], cwd=td, capture_output=True, timeout=10)
            subprocess.run(
                ["git", "config", "user.email", "test@test.com"],
                cwd=td, capture_output=True, timeout=10,
            )
            subprocess.run(
                ["git", "config", "user.name", "Test"],
                cwd=td, capture_output=True, timeout=10,
            )
            with open(os.path.join(td, "file.txt"), "w") as f:
                f.write("content")
            git_commit(td, "test commit")
            r = subprocess.run(
                ["git", "log", "--oneline"],
                cwd=td, capture_output=True, text=True, timeout=10,
            )
            assert "test commit" in r.stdout

    def test_commit_no_changes(self):
        with tempfile.TemporaryDirectory() as td:
            subprocess.run(["git", "init"], cwd=td, capture_output=True, timeout=10)
            subprocess.run(
                ["git", "config", "user.email", "test@test.com"],
                cwd=td, capture_output=True, timeout=10,
            )
            subprocess.run(
                ["git", "config", "user.name", "Test"],
                cwd=td, capture_output=True, timeout=10,
            )
            git_commit(td, "noop commit")
            r = subprocess.run(
                ["git", "log", "--oneline"],
                cwd=td, capture_output=True, text=True, timeout=10,
            )
            assert "noop commit" not in r.stdout

    def test_commit_no_git_dir(self):
        with tempfile.TemporaryDirectory() as td:
            git_commit(td, "should not crash")


class TestRunNpmScript:
    def test_no_package_json(self):
        with tempfile.TemporaryDirectory() as td:
            result = _run_npm_script(td, "test", 10)
            assert result is None

    def test_script_not_in_package(self):
        with tempfile.TemporaryDirectory() as td:
            pkg = os.path.join(td, "package.json")
            with open(pkg, "w") as f:
                f.write('{"name":"test","scripts":{"build":"echo ok"}}')
            result = _run_npm_script(td, "nonexistent", 10)
            assert result is None

    def test_bad_json(self):
        with tempfile.TemporaryDirectory() as td:
            pkg = os.path.join(td, "package.json")
            with open(pkg, "w") as f:
                f.write("not json")
            result = _run_npm_script(td, "test", 10)
            assert result is None


class TestRunLintAndTest:
    def test_no_subprojects(self):
        with tempfile.TemporaryDirectory() as td:
            result = run_lint_and_test(td)
            assert "lint" in result
            assert "test" in result

    def test_detects_subdirs(self):
        with tempfile.TemporaryDirectory() as td:
            for sub in ["frontend", "backend"]:
                sp = os.path.join(td, sub)
                os.makedirs(sp)
                pkg = os.path.join(sp, "package.json")
                with open(pkg, "w") as f:
                    f.write('{"name":"test","scripts":{}}')
            result = run_lint_and_test(td)
            assert result["lint"] is not None


class TestEscapeTemplate:
    def test_escapes_dollar_signs(self):
        assert _escape_template("$foo") == "$$foo"

    def test_no_dollar_signs(self):
        assert _escape_template("hello world") == "hello world"

    def test_none_value(self):
        assert _escape_template(None) is None

    def test_non_string(self):
        assert _escape_template(42) == 42


class TestLoadPrompt:
    def test_loads_text(self):
        with tempfile.TemporaryDirectory() as td:
            import scaffold as sc
            orig = sc.PROMPTS_SOURCE
            sc.PROMPTS_SOURCE = td
            fpath = os.path.join(td, "test_prompt.txt")
            with open(fpath, "w") as f:
                f.write("Hello $name")
            try:
                result = load_prompt("test_prompt.txt", name="World")
                assert result == "Hello World"
            finally:
                sc.PROMPTS_SOURCE = orig

    def test_substitute_multiple(self):
        with tempfile.TemporaryDirectory() as td:
            import scaffold as sc
            orig = sc.PROMPTS_SOURCE
            sc.PROMPTS_SOURCE = td
            fpath = os.path.join(td, "multi.txt")
            with open(fpath, "w") as f:
                f.write("$a and $b")
            try:
                result = load_prompt("multi.txt", a="X", b="Y")
                assert result == "X and Y"
            finally:
                sc.PROMPTS_SOURCE = orig

    def test_no_kwargs(self):
        with tempfile.TemporaryDirectory() as td:
            import scaffold as sc
            orig = sc.PROMPTS_SOURCE
            sc.PROMPTS_SOURCE = td
            fpath = os.path.join(td, "plain.txt")
            with open(fpath, "w") as f:
                f.write("no templates")
            try:
                result = load_prompt("plain.txt")
                assert result == "no templates"
            finally:
                sc.PROMPTS_SOURCE = orig

    def test_dollar_sign_escaped_before_substitution(self):
        with tempfile.TemporaryDirectory() as td:
            import scaffold as sc
            orig = sc.PROMPTS_SOURCE
            sc.PROMPTS_SOURCE = td
            fpath = os.path.join(td, "dollar.txt")
            with open(fpath, "w") as f:
                f.write('Use "$name" as placeholder')
            try:
                result = load_prompt("dollar.txt", name="USER")
                assert result == 'Use "USER" as placeholder'
            finally:
                sc.PROMPTS_SOURCE = orig

    def test_missing_template_key_falls_back_to_jinja(self):
        with tempfile.TemporaryDirectory() as td:
            import scaffold as sc
            orig = sc.PROMPTS_SOURCE
            sc.PROMPTS_SOURCE = td
            fpath = os.path.join(td, "cond.txt")
            with open(fpath, "w") as f:
                f.write("{% if show %}Hello {{ name }}{% endif %}")
            try:
                result = load_prompt("cond.txt", show=True, name="World")
                assert "Hello World" in result
            finally:
                sc.PROMPTS_SOURCE = orig

    def test_load_prompt_no_template_substitution(self):
        with tempfile.TemporaryDirectory() as td:
            import scaffold as sc
            orig = sc.PROMPTS_SOURCE
            sc.PROMPTS_SOURCE = td
            fpath = os.path.join(td, "static.txt")
            with open(fpath, "w") as f:
                f.write("Static content with $$dollar signs")
            try:
                result = load_prompt("static.txt")
                assert "$$dollar" in result
            finally:
                sc.PROMPTS_SOURCE = orig

    def test_load_prompt_extra_kwargs_not_in_template(self):
        with tempfile.TemporaryDirectory() as td:
            import scaffold as sc
            orig = sc.PROMPTS_SOURCE
            sc.PROMPTS_SOURCE = td
            fpath = os.path.join(td, "simple.txt")
            with open(fpath, "w") as f:
                f.write("Hello $name")
            try:
                result = load_prompt("simple.txt", name="World", extra="ignored")
                assert result == "Hello World"
            finally:
                sc.PROMPTS_SOURCE = orig


class TestEstimateTokens:
    def test_returns_int(self):
        result = estimate_tokens("hello world")
        assert isinstance(result, int)

    def test_longer_text_more_tokens(self):
        short = estimate_tokens("short")
        long = estimate_tokens("longer text with more words")
        assert long >= short

    def test_empty_string(self):
        assert estimate_tokens("") >= 0


class TestTruncateToLimit:
    def test_short_text_not_truncated(self):
        result = truncate_to_limit("hello world", max_tokens=1000)
        assert result == "hello world"

    def test_long_text_truncated(self):
        long_text = "word " * 5000
        result = truncate_to_limit(long_text, max_tokens=100)
        assert len(result) < len(long_text)
        assert "truncated" in result

    def test_empty_string(self):
        result = truncate_to_limit("", max_tokens=100)
        assert result == ""

from unittest.mock import patch, MagicMock

class TestScaffoldAdvanced:
    @patch("psutil.Process")
    @patch("psutil.pids", return_value=[100, 101])
    def test_force_rmtree_kills_processes(self, mock_pids, mock_process):
        mock_proc_100 = MagicMock()
        mock_proc_101 = MagicMock()
        
        mock_process.side_effect = [mock_proc_100, mock_proc_101]
        
        with tempfile.TemporaryDirectory() as td:
            with patch("scaffold.shutil.rmtree"):
                with patch("time.sleep"):
                    from scaffold import _force_rmtree
                    mock_proc_100.cwd.return_value = td
                    mock_proc_100.open_files.return_value = []
                    
                    mock_file = MagicMock()
                    mock_file.path = os.path.join(td, "file.txt")
                    mock_proc_101.cwd.return_value = "/other"
                    mock_proc_101.open_files.return_value = [mock_file]
                    
                    _force_rmtree(td)
                    
                    mock_proc_100.kill.assert_called_once()
                    mock_proc_101.kill.assert_called_once()

    @patch("scaffold.subprocess.Popen")
    def test_scaffold_project_runs_npm_install_background(self, mock_popen):
        mock_proc = MagicMock()
        mock_proc.communicate.return_value = (b"", b"")
        mock_proc.__enter__.return_value = mock_proc
        mock_popen.return_value = mock_proc
        
        with tempfile.TemporaryDirectory() as td:
            import scaffold as sc
            orig_app = sc.APP_BUILDER_DIR
            orig_agents = sc.AGENTS_SOURCE
            orig_prompts = sc.PROMPTS_SOURCE
            
            sc.APP_BUILDER_DIR = td
            sc.AGENTS_SOURCE = os.path.join(td, "agents")
            sc.PROMPTS_SOURCE = os.path.join(td, "prompts")
            os.makedirs(sc.AGENTS_SOURCE)
            os.makedirs(sc.PROMPTS_SOURCE)
            
            try:
                from scaffold import scaffold_project
                scaffold_project("my task")
                
                cache_dir = os.path.join(td, ".npm-cache")
                assert mock_popen.call_count >= 1
                args = mock_popen.call_args[0][0]
                assert "npm" in args[0] or "npm.cmd" in args[0]
                assert "install" in args
            finally:
                sc.APP_BUILDER_DIR = orig_app
                sc.AGENTS_SOURCE = orig_agents
                sc.PROMPTS_SOURCE = orig_prompts
