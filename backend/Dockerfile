FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY pyproject.toml .
# Assuming standard pip install from pyproject.toml
RUN pip install --no-cache-dir -e .

# Copy application source
COPY . .

EXPOSE 8000

# Assuming backend runs a standard uvicorn server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
