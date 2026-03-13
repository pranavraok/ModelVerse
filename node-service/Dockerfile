FROM python:3.11-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy entrypoint BEFORE switching user, chmod as root
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Non-root user
RUN useradd -m -u 1001 nodeuser
WORKDIR /app

# Python deps (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Model cache + logs dirs
RUN mkdir -p /app/models_cache /app/logs \
    && chown -R nodeuser:nodeuser /app

USER nodeuser

ENTRYPOINT ["/entrypoint.sh"]