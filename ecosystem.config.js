module.exports = {
  apps: [{
    name: "waclone",
    script: "index.js",
    watch: false,
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "1G",
    min_uptime: "10s",
    max_restarts: 3,
    restart_delay: 10000,
    kill_timeout: 10000,
    wait_ready: true,
    listen_timeout: 15000,
    env: {
      NODE_ENV: "production",
      DISPLAY: ":99",
      XDG_RUNTIME_DIR: "/tmp",
      TMPDIR: "/tmp",
      PATH: "/tmp:" + process.env.PATH,
      CHROME_PATH: "/usr/bin/chromium-browser"
    },
    error_file: "logs/pm2-error.log",
    out_file: "logs/pm2-out.log",
    log_file: "logs/pm2-combined.log",
    time: true,
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    autorestart: true,
    ignore_watch: [
      "node_modules",
      ".auth_whatsapp",
      "logs"
    ]
  }]
};