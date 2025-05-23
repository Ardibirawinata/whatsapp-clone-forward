#!/bin/bash

# WhatsApp Bot Fix Script untuk aaPanel
echo "=== Memperbaiki WhatsApp Bot untuk aaPanel ==="

# Stop aplikasi jika sedang berjalan
pm2 stop waclone 2>/dev/null || true

# Kill semua proses Chrome/Chromium yang sedang berjalan
pkill -f chrome 2>/dev/null || true
pkill -f chromium 2>/dev/null || true
sleep 2

# Hapus file lock yang menyebabkan konflik
rm -rf ~/.config/chromium/SingletonLock 2>/dev/null || true
rm -rf ~/snap/chromium/common/chromium/SingletonLock 2>/dev/null || true
rm -rf /tmp/.org.chromium.Chromium.* 2>/dev/null || true
rm -rf /tmp/.com.google.Chrome.* 2>/dev/null || true

# Set environment variables untuk XDG
export XDG_RUNTIME_DIR="/tmp"
export TMPDIR="/tmp"

# Buat script wrapper untuk xdg-settings
cat > /tmp/xdg-settings << 'EOF'
#!/bin/bash
case "$1" in
    get) echo "default" ;;
    set) exit 0 ;;
    *) exit 0 ;;
esac
EOF

chmod +x /tmp/xdg-settings
export PATH="/tmp:$PATH"

# Set permission yang tepat
chown -R www:www . 2>/dev/null || chown -R $(whoami):$(whoami) .

echo "✅ Perbaikan selesai! Jalankan: pm2 start ecosystem.config.js"