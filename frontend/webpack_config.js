const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

module.exports = (_env, options) => {
  return {
    mode: 'production',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        }
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        inject: true,
        template: path.resolve(__dirname, 'static/index.html'),
      }),
      new FaviconsWebpackPlugin(path.resolve(__dirname, 'static/favicon.png')),
    ],
    optimization: {
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin(),
      ],
    },
  }
};







// const webpack = require('webpack');
// const path = require('path');
// const TerserPlugin = require('terser-webpack-plugin');
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// const config = {
//   module: {
//     rules: [
//       {
//         test: /\.css$/,
//         use: [
//           MiniCssExtractPlugin.loader,
//           'css-loader',
//         ],
//       }
//     ],
//   },
//   plugins: [
//     new MiniCssExtractPlugin({
//       filename: '[name].[contenthash].css',
//     }),

//   ],
//   optimization: {
//     minimizer: [
//       new CssMinimizerPlugin(),
//       new TerserPlugin(),
//     ],
//   },
//   // mode: 'development'
//   mode: 'production',
// };

// module.exports = config;
