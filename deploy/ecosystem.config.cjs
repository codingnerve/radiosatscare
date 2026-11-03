// PM2 process file. From the repository root on the server:
//   pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup
// One process serves the website and the /api routes.
// Configuration comes from .env.local in the project root (Next.js loads it at start-up).
const path = require("node:path");
const root = path.resolve(__dirname, "..");

module.exports = {
  apps: [
    {
      name: "radiosatscare",
      cwd: root,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3400 -H 127.0.0.1",
      env: { NODE_ENV: "production" },
      // Keep ONE instance: rate-limit counters are held in memory (see README, "Scaling").
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "700M",
      kill_timeout: 8000, // lets in-flight requests finish before the process exits
      out_file: "/var/log/radiosatscare/app.out.log",
      error_file: "/var/log/radiosatscare/app.err.log",
      time: true,
    },
  ],
};
