const webpack = require('webpack');
const path = require('path');

const config = {
  devServer: {
    allowedHosts: "all"
  },
  optimization: {
    minimize: true
  },
};

module.exports = config;