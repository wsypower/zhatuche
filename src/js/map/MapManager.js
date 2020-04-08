/**
 * 车辆管理地图管理器
 * @authors jisj
 * @date    2019-03-11 15:40:13
 */
import VectorLayer from 'ol/layer/Vector';
import { Heatmap as HeatmapLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';
import { Draw, Modify } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { Style, Stroke, Fill } from 'ol/style';
import {
  carExtentWFSUrl,
  carRoadWFSUrl,
} from '@/conf/api';
import {
  carExtentStyle,
  carRoadStyle,
  trackStyle,
  trackPointStyle,
} from '@/util/util.map.style';

export default class MapManager {
  constructor(map) {
    this.map = map;
    this.initMap();
  }

  initMap() {

  }

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
   * 添加热力图
   */
  addHeatMapLayerByFeatures(features, gradient, blur, radius) {
    const source = new VectorSource({});
    const heatmapLayer = new HeatmapLayer({
      source,
      gradient,
      blur,
      radius,
    });
    source.addFeatures(features);
    this.map.addLayer(heatmapLayer);
    return heatmapLayer;
  }

  /**
   * 添加弹框
   * @param {[type]} options [description]
   */
  addOverlay(options) {
    const overlay = new Overlay(options);
    this.map.addOverlay(overlay);
    return overlay;
  }

  /**
   * 定位
   * @param  {[type]} coord [description]
   * @return {[type]}       [description]
   */
  locateTo(coord) {
    this.map.getView().animate({
      center: coord,
      zoom: 17,
      duration: 500,
    });
  }

  /**
   * 激活绘制功能
   * type可为Point LineString Polygon Circle
   */
  activateDraw() {
    const source = new VectorSource();
    const draw = new Draw({
      source,
      type: 'Circle',
      geometryFunction: createBox(),
    });
    this.map.addInteraction(draw);
    return draw;
  }

  /**
   * 取消激活绘制功能
   * @return {[type]} [description]
   */
  inactivateDraw(draw) {
    this.map.removeInteraction(draw);
  }

  removeLayer(layer) {
    this.map.removeLayer(layer);
  }

  /**
   * 获取车辆范围图层
   * @return {[type]} [description]
   */
  getCarExtentLayer() {
    const feature = new Feature(new Polygon([[[120.823152, 29.570056], [120.830249,29.569909], [120.828828,29.561969], [120.821972, 29.561924]]]));
    const style = new Style({
      stroke: new Stroke({
        color: '#E20011',
        width: 4,
      }),
    });
    this.carRoadLayer = this.addVectorLayerByFeatures([feature], style, 3);
  }

  /**
   * 获取车辆路径图层
   * @return {[type]} [description]
   */
  getCarRoadLayer(visible = true) {
    if (!this.carRoadLayer) {
      this.carRoadLayer = this.addVectorLayerByUrl(carRoadWFSUrl, carRoadStyle());
    }
    this.carRoadLayer.setVisible(visible);
    return this.carRoadLayer;
  }

  /**
   * 统一轨迹图层
   * @return {[type]} [description]
   */
  getTrackLayer(visible = true) {
    if (!this.trackLayer) {
      this.trackLayer = new VectorLayer({
        source: new VectorSource(),
        style: trackStyle(),
        zIndex: 999,
      });
      this.map.addLayer(this.trackLayer);
    }
    return this.trackLayer;
  }

  getAllTrackLayer(visible = true) {
    if (!this.allTrackLayer) {
      this.allTrackLayer = new VectorLayer({
        source: new VectorSource(),
        style: trackStyle(),
      });
      this.map.addLayer(this.allTrackLayer);
    }
    return this.allTrackLayer;
  }

  /**
   * 统一轨迹点位图层
   * @param  {Boolean} visible [description]
   * @return {[type]}          [description]
   */
  getTrackPointLayer(visible = true) {
    if (!this.trackPointLayer) {
      this.trackPointLayer = new VectorLayer({
        source: new VectorSource(),
        style: trackPointStyle(),
        zIndex: 99,
      });
      this.map.addLayer(this.trackPointLayer);
    }
    return this.trackPointLayer;
  }
}
