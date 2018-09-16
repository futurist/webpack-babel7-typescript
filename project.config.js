const path = require('path')
const base = __dirname

require('dotenv').config()

module.exports = {
  base,
  src: path.resolve(base, 'src'),
  dist: path.resolve(base, 'dist'),
  env: process.env.NODE_ENV || 'development',
  public: './'
}
