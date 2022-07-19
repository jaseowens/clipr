const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const assets = ["images"];
module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/index.ts",
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  plugins: assets.map((asset) => {
    return new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, "src", asset), to: asset }],
    });
  }),
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
};
