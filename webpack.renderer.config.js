const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

const assets = ["images"];

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

module.exports = {
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    ...assets.map((asset) => {
      return new CopyWebpackPlugin({
        patterns: [{ from: path.resolve(__dirname, "src", asset), to: asset }],
      });
    }),
  ],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
