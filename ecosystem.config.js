module.exports = {
  apps: [
    {
      name: 'todo-app',
      script: 'server.js',
      watch: true,
      env: {
        "NODE_ENV": "production",
      }
    },
    {
      name: 'mcp-server',
      script: 'mcp_server.js',
      watch: true,
      env: {
        "NODE_ENV": "production",
      }
    }
  ]
};
