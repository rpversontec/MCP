module.exports = {
  apps: [
    {
      name: 'main-app',
      script: 'server.js',
      watch: false,
      env: {
        "NODE_ENV": "production"
      }
    },
    {
      name: 'mcp-proxy',
      script: 'proxy.js',
      watch: false,
      env: {
        "NODE_ENV": "production"
      }
    }
  ]
};
