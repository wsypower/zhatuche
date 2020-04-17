import axios from 'axios';
import WFS from 'ol/format/WFS';
import GeoJSON from 'ol/format/GeoJSON';

// 推送数据到gis库接口
const postGISDataAPI = `${URL_CONFIG.gisURL}/geoserver/${MAP_CONFIG.featurePrefix}/wfs`;
const getGISDataAPI = `${URL_CONFIG.gisURL}/geoserver/${MAP_CONFIG.featurePrefix}/ows`;

// 根据id和类型获取数据
function getData(id, featureType, projectType) {
  let type;
  // if (featureType == 'Point') {
  //   type = `${MAP_CONFIG.featurePrefix}:${MAP_CONFIG.pointTable}`;
  // } else
  if (featureType == 'LineString') {
    type = `${MAP_CONFIG.featurePrefix}:${MAP_CONFIG.lineTable}`;
  } else if (featureType == 'Polygon') {
    type = `${MAP_CONFIG.featurePrefix}:${MAP_CONFIG.polygonTable}`;
  }
  return axios.get(getGISDataAPI, {
    params: {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: type,
      outputFormat: 'application/json',
      cql_filter: `"id" = '${id}' and "type" = '${projectType}'`,
    },
  });
}
// 根据id组和类型获取数据
function getDataByIds(ids, featureType, projectType) {
  let type;
  // if (featureType == 'Point') {
  //   type = `${MAP_CONFIG.featurePrefix}:${MAP_CONFIG.pointTable}`;
  // } else
  if (featureType == 'LineString') {
    type = `${MAP_CONFIG.featurePrefix}:${MAP_CONFIG.lineTable}`;
  } else if (featureType == 'Polygon') {
    type = `${MAP_CONFIG.featurePrefix}:${MAP_CONFIG.polygonTable}`;
  }
  return axios.get(getGISDataAPI, {
    params: {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: type,
      outputFormat: 'application/json',
      cql_filter: `"id" in ${ids} and "type" = '${projectType}'`,
    },
  });
}


/**
 * @description:保存绘制数据到gis数据库
 * @param type 编辑的类型：add,edit,delete
 * @param drawType 保存的图形类型：Point,LineString,Polygon
 * @param feature 保存的图形要素
 * @author: sijianting
 */
export async function postFeatures(drawType, feature, postType) {
  const format = new WFS();
  let featureType;
  switch (drawType) {
    case 'Point':
      featureType = `${MAP_CONFIG.pointTable}`;
      break;
    case 'LineString':
      featureType = `${MAP_CONFIG.lineTable}`;
      break;
    case 'Polygon':
      featureType = `${MAP_CONFIG.polygonTable}`;
      break;
    default:
      featureType = `${MAP_CONFIG.lineTable}`;
      break;
  }
  const obj = {
    featureNS: `${MAP_CONFIG.featureNS}`, // 该图层所在工作空间的url
    featurePrefix: `${MAP_CONFIG.featurePrefix}`, // 工作空间名称0
    featureType, // 图层名称
  };
  // let addFeature = null;
  // let updateFeature = null;
  // let deleteFeature = null;
  // if (feature.add) {
  //   addFeature = feature.add;
  // }
  // if (feature.update) {
  //   updateFeature = feature.update;
  // }
  // if (feature.delete) {
  //   deleteFeature = feature.delete;
  // }
  let xml;
  if (postType == 'add') {
    xml = format.writeTransaction(feature.add, null, null, obj);
  } else {
    xml = format.writeTransaction(feature.add, null, feature.delete, obj);
  }
  const serializer = new XMLSerializer();
  // 将参数转换为xml格式数据
  const featString = serializer.serializeToString(xml);
  const result = await axios({
    method: 'post',
    url: postGISDataAPI,
    headers: { 'Content-Type': 'text/xml' },
    transformRequest: [
      function (data) {
        // 对 data 进行任意转换处理
        return data;
      },
    ],
    data: `${featString}`,
  });
  return result;
}
/**
 * @description:根据id获取gis数据库数据
 * @param type 编辑的类型：add,edit,delete
 * @param id 保存的图形类型：Point,LineString,Polygon
 * @author: sijianting
 */
export async function getFeatures(id, type) {
  let features = [];
  let pointFeature;
  let lineFeature;
  let PolygonFeature;
  // const data1 = await getData(id, 'Point', type);
  // if (data1.data.features && data1.data.features.length > 0) {
  //   pointFeature = new GeoJSON().readFeatures(data1.data);
  //   features = features.concat(pointFeature);
  // }
  const data2 = await getData(id, 'LineString', type);
  if (data2.data.features && data2.data.features.length > 0) {
    lineFeature = new GeoJSON().readFeatures(data2.data);
    features = features.concat(lineFeature);
  }
  const data3 = await getData(id, 'Polygon', type);
  if (data3.data.features && data3.data.features.length > 0) {
    PolygonFeature = new GeoJSON().readFeatures(data3.data);
    features = features.concat(PolygonFeature);
  }
  const typeFeature = {
    point: pointFeature,
    line: lineFeature,
    polygon: PolygonFeature,
  };
  return [features, typeFeature];
}
/**
 * @description:根据id组获取gis数据库数据
 * @param type 编辑的类型：add,edit,delete
 * @param ids 保存的图形类型：Point,LineString,Polygon
 * @author: sijianting
 */
export async function getFeaturesByIds(ids, type) {
  let features = [];
  // let pointFeature;
  let lineFeature;
  let PolygonFeature;
  // const data1 = await getData(id, 'Point', type);
  // if (data1.data.features && data1.data.features.length > 0) {
  //   pointFeature = new GeoJSON().readFeatures(data1.data);
  //   features = features.concat(pointFeature);
  // }
  const data2 = await getDataByIds(ids, 'LineString', type);
  if (data2.data.features && data2.data.features.length > 0) {
    lineFeature = new GeoJSON().readFeatures(data2.data);
    features = features.concat(lineFeature);
  }
  const data3 = await getDataByIds(ids, 'Polygon', type);
  if (data3.data.features && data3.data.features.length > 0) {
    PolygonFeature = new GeoJSON().readFeatures(data3.data);
    features = features.concat(PolygonFeature);
  }
  // const typeFeature = {
  //   // point: pointFeature,
  //   line: lineFeature,
  //   polygon: PolygonFeature,
  // };
  return features;
  // return [features, typeFeature];
}


/**
 * @description:根据id组获取gis数据库数据
 * @param id 保存的图形类型：Point,LineString,Polygon
 * @author: sijianting
 */
export async function getAllFeatures(ids) {
  let features = [];
  let lineFeature;
  let PolygonFeature;
  const data2 = await getData(id, 'LineString', type);
  if (data2.data.features && data2.data.features.length > 0) {
    lineFeature = new GeoJSON().readFeatures(data2.data);
    features = features.concat(lineFeature);
  }
  const data3 = await getData(id, 'Polygon', type);
  if (data3.data.features && data3.data.features.length > 0) {
    PolygonFeature = new GeoJSON().readFeatures(data3.data);
    features = features.concat(PolygonFeature);
  }
  const typeFeature = {
    line: lineFeature,
    polygon: PolygonFeature,
  };
  return [features, typeFeature];
}
