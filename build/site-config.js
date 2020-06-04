let ROOT = process.env.PWD;

if (!ROOT) {
  ROOT = process.cwd();
}

const config = {
  dev_host: '0.0.0.0',
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV,
  root: ROOT,
  paths: {
    config: 'config',
    src: 'frontend',
    dist: 'dist'
  }
};

module.exports = config;
