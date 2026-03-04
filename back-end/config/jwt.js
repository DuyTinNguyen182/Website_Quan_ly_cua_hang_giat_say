const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  SECRET_KEY: process.env.SECRET_KEY
};