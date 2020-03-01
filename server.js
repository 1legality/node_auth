require('dotenv/config');
require('reflect-metadata');
require('ts-node/register');

require('./src/Bootstrap.ts')
  .bootstrap()
  .catch(console.error);