FROM python:3.11-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Copy everything into /app
COPY . .

# Fix line endings — path is /app/entrypoint.sh NOT /entrypoint.sh
RUN dos2unix /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Create dirs
RUN mkdir -p /app/models_cache /app/logs

# Run entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
