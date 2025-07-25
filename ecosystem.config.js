module.exports = {
  apps: [
    {
      name: 'grabhealth-strapi',
      script: '/root/.bun/bin/bun',
      args: 'run start',
      cwd: './apps/app-strapi',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 1337
      },
      error_file: './logs/strapi-error.log',
      out_file: './logs/strapi-out.log',
      log_file: './logs/strapi-combined.log',
      time: true,
      watch: false,
      max_memory_restart: '1G',
      autorestart: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      name: 'grabhealth-web',
      script: '/root/.bun/bin/bun',
      args: 'run start',
      cwd: './apps/app-web',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log',
      time: true,
      watch: false,
      max_memory_restart: '1G',
      autorestart: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/grabhealth-app.git',
      path: '/var/www/grabhealth',
      'pre-deploy-local': '',
      'post-deploy': 'bun install && bun run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};