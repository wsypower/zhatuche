const URL_CONFIG = {
  // baseURL: 'http://192.168.71.33:8875/api', // 测试服务器
  baseURL: 'http://szzhcg.szzj.gov.cn/api', // 正式服务器
  carURL: 'http://220.191.224.151/carApi',
  // vRulesURL: 'http://192.168.71.33:8078/api', // 违规配置页面测试环境
  vRulesURL: 'http://61.190.177.254:91/api', // 违规配置页面正式环境
  gisURL: 'http://192.168.1.10:8080', // gis正式服务器
};
const MAP_CONFIG = {
  featurePrefix: 'hescgis', // 工作空间名称0
  featureNS: 'http://www.hescgis.com', // 该图层所在工作空间的url
  pointTable: 'la_point',
  lineTable: 'zhatuche_line',
  polygonTable: 'zhatuche_polygon',
};// 六安测试服务器配置
