import os
import subprocess
import sys
import tempfile
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from orchestrator import (
    _check_cached,
    _save_response,
    _verify_models,
    _create_root_integration,
    run_validation,
    FAILURE_SENTINELS,
    _COACH_CACHE,
)


@pytest.fixture(autouse=True)
def clear_coach_cache():
    _COACH_CACHE.clear()



class TestCheckCached:
    def test_no_file(self):
        with tempfile.TemporaryDirectory() as td:
            result = _check_cached(td, "phase", "agent")
            assert result is None

    def test_empty_file(self):
        with tempfile.TemporaryDirectory() as td:
            runs = os.path.join(td, "runs")
            os.makedirs(runs)
            with open(os.path.join(runs, "phase-agent.txt"), "w") as f:
                f.write("")
            result = _check_cached(td, "phase", "agent")
            assert result is None

    def test_valid_file(self):
        with tempfile.TemporaryDirectory() as td:
            runs = os.path.join(td, "runs")
            os.makedirs(runs)
            fpath = os.path.join(runs, "phase-agent.txt")
            with open(fpath, "w") as f:
                f.write("valid content with needed pattern")
            result = _check_cached(td, "phase", "agent", min_bytes=10, requires_patterns=["needed"])
            assert result is not None
            assert "needed" in result

    def test_too_small(self):
        with tempfile.TemporaryDirectory() as td:
            runs = os.path.join(td, "runs")
            os.makedirs(runs)
            fpath = os.path.join(runs, "phase-agent.txt")
            with open(fpath, "w") as f:
                f.write("small")
            result = _check_cached(td, "phase", "agent", min_bytes=100)
            assert result is None
            assert not os.path.exists(fpath)

    def test_missing_pattern(self):
        with tempfile.TemporaryDirectory() as td:
            runs = os.path.join(td, "runs")
            os.makedirs(runs)
            fpath = os.path.join(runs, "phase-agent.txt")
            with open(fpath, "w") as f:
                f.write("no match here")
            result = _check_cached(td, "phase", "agent", requires_patterns=["MUST_HAVE"])
            assert result is None
            assert not os.path.exists(fpath)

    def test_failure_sentinel(self):
        with tempfile.TemporaryDirectory() as td:
            runs = os.path.join(td, "runs")
            os.makedirs(runs)
            fpath = os.path.join(runs, "phase-agent.txt")
            with open(fpath, "w") as f:
                f.write("FAILED: something went wrong")
            result = _check_cached(td, "phase", "agent")
            assert result is None


class TestSaveResponse:
    def test_saves_content(self):
        with tempfile.TemporaryDirectory() as td:
            _save_response(td, "test", "agent", "hello world")
            fpath = os.path.join(td, "runs", "test-agent.txt")
            assert os.path.isfile(fpath)
            assert open(fpath).read() == "hello world"

    def test_saves_empty_as_marker(self):
        with tempfile.TemporaryDirectory() as td:
            _save_response(td, "test", "agent", "")
            fpath = os.path.join(td, "runs", "test-agent.txt")
            assert os.path.isfile(fpath)
            assert open(fpath).read() == "(empty or skipped)"


class TestFailureSentinels:
    def test_sentinels_defined(self):
        assert len(FAILURE_SENTINELS) > 0
        assert any("FAILED" in s for s in FAILURE_SENTINELS)
        assert any("ABORT" in s for s in FAILURE_SENTINELS)


class TestCreateRootIntegration:
    def test_creates_package_json(self):
        with tempfile.TemporaryDirectory() as td:
            import json
            import asyncio
            result = asyncio.run(_create_root_integration(td))
            pkg_path = os.path.join(td, "package.json")
            assert os.path.isfile(pkg_path)
            pkg = json.load(open(pkg_path))
            assert "scripts" in pkg
            assert "dev" in pkg["scripts"]
            assert "build" in pkg["scripts"]

    def test_skips_if_exists(self):
        with tempfile.TemporaryDirectory() as td:
            import json
            pkg_path = os.path.join(td, "package.json")
            with open(pkg_path, "w") as f:
                json.dump({"custom": True}, f)
            import asyncio
            asyncio.run(_create_root_integration(td))
            assert json.load(open(pkg_path)) == {"custom": True}


class TestRunValidation:
    def test_no_project_returns_failure(self):
        with tempfile.TemporaryDirectory() as td:
            import asyncio
            result = asyncio.run(run_validation(td))
            assert isinstance(result, dict)
            assert "build_ok" in result
            assert "passed" in result
            assert result["passed"] is False

from unittest.mock import AsyncMock, patch, MagicMock
from orchestrator import phase_coach, phase_builder, run_pipeline

@pytest.mark.asyncio
class TestOrchestratorAdvanced:
    @patch("orchestrator._run_agent", new_callable=AsyncMock)
    @patch("orchestrator.git_commit")
    async def test_phase_coach_parallelism(self, mock_git, mock_run_agent):
        mock_run_agent.return_value = "dummy response"
        client = AsyncMock()
        with tempfile.TemporaryDirectory() as td:
            expected = ["PLAN.md", "README.md", "TASKS.md", "api-contract.json",
                        os.path.join("tasks", "frontend-task.md"), os.path.join("tasks", "backend-task.md"),
                        "ARCHITECTURE.md", "WALKTHROUGH.md", "NEXT-STEPS.md", "HACKATHON.md"]
            
            for d in ["tasks"]:
                os.makedirs(os.path.join(td, d), exist_ok=True)
            for f in expected:
                with open(os.path.join(td, f), "w") as fd:
                    fd.write("A" * 60)
                    
            res = await phase_coach(client, td, "my task")
            assert res is True
            assert mock_run_agent.call_count == 2
            
    @patch("orchestrator.run_validation", new_callable=AsyncMock)
    @patch("orchestrator._run_agent", new_callable=AsyncMock)
    @patch("orchestrator._create_root_integration", new_callable=AsyncMock)
    @patch("orchestrator.git_commit")
    async def test_phase_builder_success(self, mock_git, mock_integration, mock_run_agent, mock_validation):
        client = AsyncMock()
        with tempfile.TemporaryDirectory() as td:
            os.makedirs(os.path.join(td, "frontend"))
            os.makedirs(os.path.join(td, "backend"))
            
            mock_run_agent.return_value = "code"
            mock_integration.return_value = True
            
            from orchestrator import phase_builder
            client.run_agent = AsyncMock(return_value="code")
            res = await phase_builder(client, td)
            assert res is True

    @patch("orchestrator.phase_coach", new_callable=AsyncMock)
    @patch("orchestrator.phase_builder", new_callable=AsyncMock)
    @patch("orchestrator.phase_validation", new_callable=AsyncMock)
    @patch("orchestrator.phase_pitch_update", new_callable=AsyncMock)
    @patch("orchestrator.phase_judge_score", new_callable=AsyncMock)
    @patch("orchestrator.scaffold_project")
    @patch("orchestrator.HackitClient")
    async def test_run_pipeline_full(self, mock_client_class, mock_scaffold, mock_judge, mock_pitch, mock_validation, mock_builder, mock_coach):
        mock_scaffold.return_value = ("/tmp/project", "test-slug")
        
        mock_client = AsyncMock()
        mock_client_class.return_value = mock_client
        
        mock_coach.return_value = True
        mock_builder.return_value = True
        mock_validation.return_value = {"passed": True, "build_ok": True, "lint_ok": True, "test_ok": True}
        mock_pitch.return_value = True
        mock_judge.return_value = True
        
        from orchestrator import run_pipeline
        from config import Config
        cfg = Config()
        
        await run_pipeline("test task", cfg, mode="full", force=True)
        
        mock_coach.assert_called_once()
        mock_builder.assert_called_once()
        mock_validation.assert_called_once()
        mock_pitch.assert_called_once()
        mock_judge.assert_called_once()
