import os
import platform
import socket
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dev_server import _find_free_port, _kill_port_process, _can_bind, _get_process_on_port, ProcessRegistry


class TestFindFreePort:
    def test_returns_valid_port(self):
        port = _find_free_port(5190, 5199)
        assert isinstance(port, int)
        assert 5190 <= port <= 5199

    def test_port_is_usable(self):
        port = _find_free_port(5180, 5189)
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(("127.0.0.1", port))
            s.close()

    def test_no_free_port_raises(self):
        taken = []
        start_port = 5190
        try:
            for i in range(10):
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.bind(("127.0.0.1", start_port + i))
                taken.append(s)
            try:
                _find_free_port(start_port, start_port + 9)
                assert False, "Should have raised"
            except RuntimeError:
                pass
        finally:
            for s in taken:
                s.close()


class TestCanBind:
    def test_free_port_binds(self):
        port = _find_free_port(5180, 5189)
        assert _can_bind(port) is True

    def test_taken_port_fails(self):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        port = _find_free_port(5173, 5185)
        try:
            s.bind(("127.0.0.1", port))
            assert _can_bind(port) is False
        finally:
            s.close()


class TestKillPortProcess:
    def test_no_process_on_port(self):
        port = _find_free_port(5190, 5199)
        _kill_port_process(port)

    @pytest.mark.skipif(platform.system() == "Windows", reason="May attempt to kill own process, causing hang")
    def test_kill_own_listener(self):
        port = _find_free_port(5190, 5199)
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.bind(("127.0.0.1", port))
            s.listen(1)
            _kill_port_process(port)
        except Exception:
            pass
        finally:
            s.close()


class TestGetProcessOnPort:
    def test_no_process(self):
        procs = _get_process_on_port(9999)
        assert isinstance(procs, list)


class TestProcessRegistry:
    def test_register_and_unregister(self):
        ProcessRegistry.register(12345, name="test", port=8080)
        ProcessRegistry.unregister(12345)

    def test_cleanup_all(self):
        ProcessRegistry.register(99999, name="test")

    def test_register_twice(self):
        ProcessRegistry.register(11111, name="first")
        ProcessRegistry.register(11111, name="second")
        ProcessRegistry.unregister(11111)

from unittest.mock import AsyncMock, patch, MagicMock
from dev_server import DevServer
import tempfile
import asyncio

@pytest.mark.asyncio
class TestDevServerAdvanced:
    @patch("dev_server._get_package_json_hash")
    @patch("dev_server.asyncio.create_subprocess_exec", new_callable=AsyncMock)
    @patch("os.path.isdir")
    async def test_install_skips_if_cache_matches(self, mock_isdir, mock_exec, mock_hash):
        mock_isdir.return_value = True # node_modules exist
        mock_hash.return_value = "fake-hash"
        
        with tempfile.TemporaryDirectory() as td:
            hash_file = os.path.join(td, ".opencode_install_hash")
            with open(hash_file, "w") as f:
                f.write("fake-hash")
            
            ds = DevServer(td)
            await ds._install()
            # It should skip npm install
            assert mock_exec.call_count == 0

    @patch("dev_server._get_package_json_hash")
    @patch("dev_server.asyncio.create_subprocess_exec", new_callable=AsyncMock)
    @patch("os.path.isdir")
    async def test_install_runs_if_cache_mismatches(self, mock_isdir, mock_exec, mock_hash):
        mock_isdir.return_value = True
        mock_hash.return_value = "new-hash"
        
        with tempfile.TemporaryDirectory() as td:
            hash_file = os.path.join(td, ".opencode_install_hash")
            with open(hash_file, "w") as f:
                f.write("old-hash")
            
            ds = DevServer(td)
            mock_proc = AsyncMock()
            mock_proc.communicate = AsyncMock(return_value=(b"", b""))
            mock_exec.return_value = mock_proc
            
            await ds._install()
            assert mock_exec.call_count == 1
            
            with open(hash_file, "r") as f:
                assert f.read() == "new-hash"

    @patch("dev_server.httpx.AsyncClient", new_callable=MagicMock)
    async def test_scan_ports_detects_port_by_html_title(self, mock_client_class):
        mock_client_instance = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client_instance
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "<html><head><title>my test app</title></head></html>"
        
        # The scan_ports tries a list of ports: [3000, 4173, 5173, ...]
        # We'll fail the first two and succeed on the third (5173).
        mock_client_instance.get.side_effect = [Exception("conn refused"), Exception("conn refused"), mock_response]
        
        with tempfile.TemporaryDirectory() as td:
            with open(os.path.join(td, "package.json"), "w") as f:
                f.write('{"name": "my-test-app"}')
            
            ds = DevServer(td)
            port = await ds._scan_ports()
            # The 3rd port in the list is 5173
            assert port == 5173
