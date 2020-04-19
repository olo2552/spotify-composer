const {
  override,
  fixBabelImports,
  addLessLoader,
  addWebpackPlugin,
} = require("customize-cra");

const webpack = require("webpack");
const lessToJS = require("less-vars-to-js");
const fs = require("fs");
const path = require("path");

const { ROOT_URL, T_AND_C_URL } = process.env;
if (!ROOT_URL) {
  throw new Error("ROOT_URL is a required envvar");
}

// Where your antd-custom.less file lives
const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, "assets/antd-custom.less"), "utf8")
);

module.exports = override(
  fixBabelImports("antd", {
    libraryName: "antd",
  }),
  fixBabelImports("lodash", {
    libraryName: "lodash",
    libraryDirectory: "",
    camel2DashComponentName: false,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: themeVariables, // make your antd custom effective
  }),
  addWebpackPlugin(
    new webpack.DefinePlugin({
      "process.env.ROOT_URL": JSON.stringify(ROOT_URL),
      "process.env.T_AND_C_URL": JSON.stringify(T_AND_C_URL || null),
    })
  )
);
