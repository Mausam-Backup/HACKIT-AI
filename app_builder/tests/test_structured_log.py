import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from structured_log import StructuredLogger, log_event, get_logger


class TestStructuredLogger:
    def test_log_adds_entry(self):
        logger = StructuredLogger()
        logger.log("test_event", key="value")
        recent = logger.get_recent()
        assert len(recent) == 1
        assert recent[0]["event"] == "test_event"
        assert recent[0]["key"] == "value"

    def test_log_with_timestamp(self):
        logger = StructuredLogger()
        logger.log("event_with_time")
        assert "timestamp" in logger.get_recent()[0]

    def test_get_recent_returns_n_latest(self):
        logger = StructuredLogger()
        for i in range(10):
            logger.log(f"event_{i}")
        recent = logger.get_recent(3)
        assert len(recent) == 3
        assert recent[-1]["event"] == "event_9"

    def test_get_all_returns_all(self):
        logger = StructuredLogger()
        for i in range(5):
            logger.log(f"event_{i}")
        all_entries = logger.get_all()
        assert len(all_entries) == 5

    def test_writes_to_file(self):
        with tempfile.TemporaryDirectory() as td:
            logger = StructuredLogger(log_dir=td, log_file="test.log")
            logger.log("file_event", data="hello")
            log_path = os.path.join(td, "test.log")
            assert os.path.exists(log_path)
            with open(log_path) as f:
                line = json.loads(f.readline())
            assert line["event"] == "file_event"
            assert line["data"] == "hello"

    def test_multiple_entries_in_file(self):
        with tempfile.TemporaryDirectory() as td:
            logger = StructuredLogger(log_dir=td, log_file="test.log")
            logger.log("first")
            logger.log("second")
            with open(os.path.join(td, "test.log")) as f:
                lines = f.readlines()
            assert len(lines) == 2

    def test_set_log_dir(self):
        logger = StructuredLogger()
        with tempfile.TemporaryDirectory() as td:
            logger.set_log_dir(td)
            logger.log("after_set_dir")
            log_path = os.path.join(td, "pipeline.log")
            assert os.path.exists(log_path)

    def test_log_event_global(self):
        get_logger().log("global_test")
        assert any(e["event"] == "global_test" for e in get_logger().get_recent(10))

    def test_log_event_function(self):
        log_event("function_test", param=42)
        assert any(e["event"] == "function_test" and e.get("param") == 42 for e in get_logger().get_recent(10))

    def test_repr_of_non_string_values(self):
        logger = StructuredLogger()
        logger.log("complex", items=[1, 2, 3], nested={"a": 1})
        entry = logger.get_recent()[0]
        assert entry["items"] == [1, 2, 3]
        assert entry["nested"] == {"a": 1}
