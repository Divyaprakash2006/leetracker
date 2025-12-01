module.exports = {
  apps: [
    {
      name: 'leetracker-backend',
      cwd: './backend',
      script: 'tsx',
      args: 'src/index.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 5001
      }
    },
    {
      name: 'leetracker-frontend',
      cwd: './frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      interpreter: 'node',
      watch: false
    }
  ]
};
