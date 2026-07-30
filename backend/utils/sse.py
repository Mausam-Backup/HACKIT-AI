import asyncio
import logging
from collections.abc import AsyncGenerator, AsyncIterator, Awaitable, Callable

from fastapi import HTTPException

from models.sse_response import SSEErrorResponse


async def safe_sse_stream(
    stream: AsyncIterator[str],
    *,
    logger: logging.Logger,
    error_detail: str,
    on_error: Callable[[], Awaitable[None]] | None = None,
    ping_interval: float = 15.0,
) -> AsyncGenerator[str, None]:
    queue: asyncio.Queue = asyncio.Queue()

    async def producer():
        try:
            async for chunk in stream:
                await queue.put({"type": "chunk", "data": chunk})
            await queue.put({"type": "done"})
        except asyncio.CancelledError:
            pass
        except Exception as exc:
            await queue.put({"type": "error", "exc": exc})

    task = asyncio.create_task(producer())

    try:
        while True:
            try:
                msg = await asyncio.wait_for(queue.get(), timeout=ping_interval)
                if msg["type"] == "chunk":
                    yield msg["data"]
                elif msg["type"] == "done":
                    break
                elif msg["type"] == "error":
                    raise msg["exc"]
            except asyncio.TimeoutError:
                yield ": keepalive\n\n"
    except asyncio.CancelledError:
        logger.info("SSE stream cancelled by client")
        task.cancel()
        return
    except Exception as exc:
        task.cancel()
        logger.exception("SSE stream failed after response started")
        if on_error:
            try:
                await on_error()
            except Exception:
                logger.exception("SSE stream error cleanup failed")
        detail = exc.detail if isinstance(exc, HTTPException) else error_detail
        yield SSEErrorResponse(detail=str(detail)).to_string()

