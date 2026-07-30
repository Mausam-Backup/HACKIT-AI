import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from tui import tui_event_handler, stages_status, current_stage, logs_buffer, generate_layout


class TestTuiState:
    def test_initial_state(self):
        assert stages_status["coach"] == "pending"
        assert stages_status["builder"] == "pending"
        assert stages_status["validation"] == "pending"
        assert stages_status["pitch"] == "pending"

    def test_event_handler_coach_start(self):
        tui_event_handler("coach_start", message="Starting coach analysis...")
        assert stages_status["coach"] == "active"
        assert "Starting coach analysis..." in logs_buffer

    def test_event_handler_builder_complete(self):
        tui_event_handler("builder_complete", success=True, message="Frontend and backend built.")
        assert stages_status["builder"] == "done"
        assert "Frontend and backend built." in logs_buffer

    def test_event_handler_validation_complete(self):
        tui_event_handler("validation_complete", passed=False, message="Build validation failed.")
        assert stages_status["validation"] == "failed"
        assert "Build validation failed." in logs_buffer

    def test_generate_layout(self):
        # Verify layout generation runs without errors
        layout = generate_layout()
        assert layout is not None
        assert any("HACKIT" in str(r) for r in layout.renderables)

