// pm2.config.js
module.exports = {
  apps: [
    {
      name: 'nest-aws',
      script: 'dist/main.js',
      instances: '1', // 集群模式 = CPU 核心数
      exec_mode: 'cluster', // 负载均衡
      interpreter: './node_modules/.bin/ts-node', // 使用本地 ts-node
      env: {
        NODE_ENV: 'production',
        TS_NODE_PROJECT: './tsconfig.json',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        TS_NODE_PROJECT: './tsconfig.json',
      },
      monitor: false, // 生产关闭监控日志,windos 不关闭有错误提示
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      watch: false, // 生产关闭文件监听
      max_memory_restart: '500M', // 内存超限自动重启
    },
  ],
};
