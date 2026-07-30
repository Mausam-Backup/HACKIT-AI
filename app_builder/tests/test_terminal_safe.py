import os
import signal
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from terminal_safe import SafeTerminalContext, graceful_terminate


class TestSafeTerminalContext:
    def test_context_manager_exits_cleanly(self):
        with SafeTerminalContext() as ctx:
            assert ctx is not None

    def test_restore(self):
        SafeTerminalContext.restore()

    def test_signal_handler_registered(self):
        assert signal.getsignal(signal.SIGINT) is not None


class TestGracefulTerminate:
    def test_none_process(self):
        graceful_terminate(None)

    def test_invalid_pid(self):
        class FakeProc:
            pid = -1
        graceful_terminate(FakeProc())
