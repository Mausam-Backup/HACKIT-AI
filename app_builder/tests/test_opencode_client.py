import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from opencode_client import OpencodeClient, OpencodeStuck


class TestOpencodeStuck:
    def test_exception_can_be_raised(self):
        try:
            raise OpencodeStuck("test error")
        except OpencodeStuck as e:
            assert "test error" in str(e)


class TestOpencodeClientConfig:
    def test_init_defaults(self):
        client = OpencodeClient(port=4096, project_dir="/tmp/test")
        assert client.port == 4096
        assert client.project_dir == "/tmp/test"
        assert client.timeout == 1800
        assert client.strict_models is False
        assert client.base_url == "http://127.0.0.1:4096"

    def test_init_custom_timeout(self):
        client = OpencodeClient(port=5000, project_dir="/tmp/test", timeout=600, strict_models=True)
        assert client.timeout == 600
        assert client.strict_models is True

    def test_base_url_format(self):
        client = OpencodeClient(port=8080, project_dir="/tmp/test")
        assert client.base_url == "http://127.0.0.1:8080"

    def test_default_strict_models(self):
        client = OpencodeClient(port=4096, project_dir="/tmp/test")
        assert client.strict_models is False

    def test_default_timeout(self):
        client = OpencodeClient(port=4096, project_dir="/tmp/test")
        assert client.timeout == 1800

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from opencode_client import TimeoutTracker

class TestTimeoutTracker:
    def test_timeout_tracker_logic(self):
        tracker = TimeoutTracker(base_timeout=10, max_timeout=100, multiplier=2.0)
        assert tracker.get_timeout("agent_a") == 10
        
        # Record some times
        tracker.record("agent_a", 20.0)
        tracker.record("agent_a", 30.0)
        # Avg = 25.0, multiplier = 2.0 => 50
        assert tracker.get_timeout("agent_a") == 50
        
        # Max cap
        tracker.record("agent_b", 100.0)
        assert tracker.get_timeout("agent_b") == 100
        
    def test_retry_delay(self):
        tracker = TimeoutTracker(backoff_base=2.0, backoff_cap=10)
        delay_0 = tracker.get_retry_delay(0)
        assert 1.0 <= delay_0 <= 2.0
        
        delay_3 = tracker.get_retry_delay(3)
        assert 8.0 <= delay_3 <= 9.0

@pytest.mark.asyncio
class TestOpencodeClientAdvanced:
    @patch("opencode_client.httpx.AsyncClient")
    async def test_ensure_session_reuses_session(self, mock_client_class):
        client = OpencodeClient(port=4096, project_dir="/tmp/test")
        mock_client = AsyncMock()
        client.client = mock_client
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"id": "session-123"}
        mock_client.post.return_value = mock_resp
        
        sid1 = await client._ensure_session("coach")
        sid2 = await client._ensure_session("coach")
        
        assert sid1 == "session-123"
        assert sid2 == "session-123"
        assert mock_client.post.call_count == 1
        
    @patch("opencode_client.httpx.AsyncClient")
    async def test_run_one_success_regular_json(self, mock_client_class):
        client = OpencodeClient(port=4096, project_dir="/tmp/test")
        client.client = MagicMock()
        client.client.post = AsyncMock()
        
        mock_stream_ctx = MagicMock()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.headers = {"content-type": "application/json"}
        mock_resp.aread = AsyncMock()
        mock_resp.json.return_value = {"parts": [{"type": "text", "text": "hello"}]}
        
        mock_stream_ctx.__aenter__ = AsyncMock(return_value=mock_resp)
        mock_stream_ctx.__aexit__ = AsyncMock()
        client.client.stream.return_value = mock_stream_ctx
        
        # mock _ensure_session
        client._ensure_session = AsyncMock(return_value="sess-1")
        
        result = await client.run_agent("coach", "say hello")
        assert result == "hello"

    @patch("opencode_client.httpx.AsyncClient")
    async def test_run_one_sse_streaming(self, mock_client_class):
        client = OpencodeClient(port=4096, project_dir="/tmp/test")
        client.client = MagicMock()
        client.client.post = AsyncMock()
        client._ensure_session = AsyncMock(return_value="sess-1")
        
        mock_stream_ctx = MagicMock()
        mock_resp = AsyncMock()
        mock_resp.status_code = 200
        mock_resp.headers = {"content-type": "text/event-stream"}
        
        async def mock_aiter_lines():
            yield 'data: {"parts": [{"type": "text", "text": "hel"}]}'
            yield 'data: {"parts": [{"type": "text", "text": "lo"}]}'
            yield 'data: [DONE]'
            
        mock_resp.aiter_lines = mock_aiter_lines
        mock_stream_ctx.__aenter__ = AsyncMock(return_value=mock_resp)
        mock_stream_ctx.__aexit__ = AsyncMock()
        client.client.stream.return_value = mock_stream_ctx
        
        result = await client.run_agent("coach", "say hello")
        assert result == "hello"

    @patch("opencode_client.httpx.AsyncClient")
    @patch("asyncio.sleep", new_callable=AsyncMock)
    async def test_run_one_429_retry(self, mock_sleep, mock_client_class):
        client = OpencodeClient(port=4096, project_dir="/tmp/test")
        client.client = MagicMock()
        client.client.post = AsyncMock()
        client._ensure_session = AsyncMock(return_value="sess-1")
        client._get_agent_config = MagicMock(return_value=(100, 2))  # max_retries = 2
        
        mock_stream_ctx_429 = MagicMock()
        mock_resp_429 = MagicMock()
        mock_resp_429.status_code = 429
        mock_resp_429.headers = {"Retry-After": "5"}
        mock_stream_ctx_429.__aenter__ = AsyncMock(return_value=mock_resp_429)
        mock_stream_ctx_429.__aexit__ = AsyncMock()

        mock_stream_ctx_200 = MagicMock()
        mock_resp_200 = MagicMock()
        mock_resp_200.status_code = 200
        mock_resp_200.headers = {"content-type": "application/json"}
        mock_resp_200.aread = AsyncMock()
        mock_resp_200.json.return_value = {"parts": [{"type": "text", "text": "success"}]}
        mock_stream_ctx_200.__aenter__ = AsyncMock(return_value=mock_resp_200)
        mock_stream_ctx_200.__aexit__ = AsyncMock()

        client.client.stream.side_effect = [mock_stream_ctx_429, mock_stream_ctx_200]
        
        result = await client.run_agent("coach", "try again")
        assert result == "success"
        mock_sleep.assert_called_with(5)


class TestExtractText:
    def test_extract_text_variations(self):
        from opencode_client import _extract_text
        assert _extract_text("hello") == "hello"
        assert _extract_text({"text": "world"}) == "world"
        assert _extract_text({"content": "foo"}) == "foo"
        assert _extract_text({"value": "bar"}) == "bar"
        assert _extract_text({"delta": "baz"}) == "baz"
        assert _extract_text({"parts": [{"type": "step-start"}, {"content": "nested"}]}) == "nested"
        assert _extract_text([{"text": "a"}, {"text": "b"}]) == "ab"
        assert _extract_text({"parts": [{"type": "step-start"}]}) == ""
