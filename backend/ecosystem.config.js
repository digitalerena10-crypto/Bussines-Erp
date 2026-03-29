module.exports = {
    apps: [
        {
            name: 'erp-backend',
            script: 'server.js',
            instances: 1,
            autorestart: true,
            watch: true,
            ignore_watch: ["node_modules", "logs", "uploads"],
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            }
        }
    ]
};
