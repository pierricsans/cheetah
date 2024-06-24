const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

module.exports = (_env, options) => {
  return {
    mode: "production",
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.png$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'emojis'
              }
            },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        filename: "index.html",
        inject: true,
        template: path.resolve(__dirname, "static/index.html"),
      }),
      new FaviconsWebpackPlugin({
        logo: path.resolve(__dirname, "static/favicon.png"),
        favicons: {
          appName: "gospot.it",
          appDescription: "Pick a trajectory, and spot the icon following it",
          developerName: "Pierric Sans",
          developerURL: null, // prevent retrieving from the nearest package.json
          background: "#ddd",
          theme_color: "#333",
          icons: {
            coast: false,
            yandex: false,
            appleIcon: false,
            appleStartup: false,
            android: false,
          },
        },
      }),
    ],
    optimization: {
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin({
          terserOptions: {
            module: true,
            toplevel: true,
            mangle: {
              eval: true,
              module: true,
              toplevel: true,
            },
          },
        }),
      ],
    },
    mode: "production",
    target: ["web"],
  };
};
