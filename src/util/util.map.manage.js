/**
 * @description: 地图管理类
 * @author:sijianting
 * @createDate:2019/7/11 9:48
 */
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';

export default class MapManager {
  constructor(map) {
    this.map = map;
  }

  /**
   * @description: 通过url添加矢量图层
   * @param {String} url
   * @param {style} style
   */
  addVectorLayerByUrl(url, style) {
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url,
      }),
      style,
    });
    this.map.addLayer(vectorLayer);
    return vectorLayer;
  }

  /**
   * @description: 通过geojson格式数据添加矢量图层
   * @param {geojson} geojson
   * @param {style} style
   */
  addVectorLayerByGeoJSON(geojson, style) {
    const source = new VectorSource({});
    const vectorLayer = new VectorLayer({
      source,
      style,
    });
    const features = new GeoJSON().readFeatures(geojson);
    source.addFeatures(features);
    this.map.addLayer(vectorLayer);
    return vectorLayer;
  }

  /**
   * @description: 通过features数组添加矢量图层
   * @param {Array} features
   * @param {style} style
   * @param {number} zIndex
   */
  addVectorLayerByFeatures(features, style, zIndex) {
    const source = new VectorSource({});
    const vectorLayer = new VectorLayer({
      source,
      style,
      zIndex,
    });
    source.addFeatures(features);
    this.map.addLayer(vectorLayer);
    return vectorLayer;
  }

  /**
   * @description: 添加弹框
   * @param {[type]} options [description]
   */
  addOverlay(options) {
    const overlay = new Overlay(options);
    this.map.addOverlay(overlay);
    return overlay;
  }

  /**
   * @description: 定位
   * @param  {Array} coord 经纬度
   */
  locateTo(coord) {
    this.map.getView().animate({
      center: coord,
      zoom: 17,
      duration: 500,
    });
  }

  /**
   * @description:移除单个图层
   * @param layer 需要移除的图层
   */

  removeLayer(layer) {
    this.map.removeLayer(layer);
  }

  /**
   * @description:获取map对象
   */
  getMap() {
    return this.map;
  }
}
