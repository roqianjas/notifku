#!/bin/bash
# ============================================================
# NotifKu — Auto-start Reverb & Queue Worker
# Tambahkan ke Cron Job (setiap 5 menit):
#   */5 * * * * /home/username/notifku/start-workers.sh
# ============================================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start Reverb jika belum jalan
if ! pgrep -f "reverb:start" > /dev/null; then
    cd "$PROJECT_DIR"
    nohup php artisan reverb:start --host=0.0.0.0 --port=8080 >> storage/logs/reverb.log 2>&1 &
    echo "[$(date)] Reverb started (PID: $!)" >> storage/logs/workers.log
fi

# Start Queue Worker jika belum jalan
if ! pgrep -f "queue:work" > /dev/null; then
    cd "$PROJECT_DIR"
    nohup php artisan queue:work database --sleep=3 --tries=3 --max-time=3600 >> storage/logs/queue.log 2>&1 &
    echo "[$(date)] Queue worker started (PID: $!)" >> storage/logs/workers.log
fi
