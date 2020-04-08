/* 模拟数据接口 */

const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  baseUrl: './',
  // outputDir: "dataSreen",
  assetsDir: 'public',
  runtimeCompiler: true,
  productionSourceMap: undefined,
  parallel: undefined,
  css: undefined,
};
