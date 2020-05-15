/**
 * 地图相关工具
 */
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
/**
 * 根据点位信息生成features
 * @param  {[type]} points [description]
 * @return {[type]}        [description]
 */
export function genPointFeatures(points, tag) {
  return points.map((pt) => {
    const ptFeature = new Feature(new Point([Number(pt.pointx), Number(pt.pointy)]));
    ptFeature.setProperties(pt);
    ptFeature.set('tag', tag);
    return ptFeature;
  });
}
/*
 * 市容监测根据点位信息生成feature
 * */
export function setPointsFeature(points) {
  const features = [];
  for (let i = 0; i < points.length; i++) {
    const feature = new Feature(new Point([Number(points[i].x), Number(points[i].y)]));
    features[i] = feature;
    feature.setProperties(points[i]);
    feature.set('state', points[i].state);
  }
  return features;
}
/*
 * 市容监测根据点位信息生成feature
 * */
export function setryPointsFeature(points) {
  const features = [];
  for (let i = 0; i < points.length; i++) {
    const feature = new Feature(new Point([Number(points[i].position.x), Number(points[i].position.y)]));
    features[i] = feature;
    feature.setProperties(points[i]);
    feature.set('state', points[i].status);
  }
  return features;
}

/**
 * 根据点列生成点位轨迹feature
 * @param  {[type]} coords [description]
 * @return {[type]}        [description]
 */
export function genTrackFeatureByCoords(coords) {
  return new Feature(new LineString(coords));
}

export function genPointByCoord(coord) {
  return new Feature(new Point(coord));
}

/**
 * 根据请求到的点位列表数据生成轨迹矢量集合
 * @param  {[type]} track [description]
 * @return {[type]}       [description]
 */
export function genTrackFeaturesByLocationList(track) {
  const features = [];
  const coords = [];
  // 根据点列生成轨迹线
  track.forEach((trackPt) => {
    if (trackPt.cCoordinatex && trackPt.cCoordinatey) {
      const coord = [Number(trackPt.cCoordinatex), Number(trackPt.cCoordinatey)];
      coords.push(coord);
    }
  });
  if (coords.length > 0) {
    // 根据数据生成feature
    const trackLine = genTrackFeatureByCoords(coords);
    const firstPoint = genPointByCoord(coords[0]);
    const lastPoint = genPointByCoord(coords[coords.length - 1]);
    firstPoint.set('isFirst', true);
    lastPoint.set('isLast', true);
    features.push(
      trackLine,
      firstPoint,
      lastPoint,
    );
  }
  return features;
}
export function findPosition(curTime, trackCoordinates) {
  let index = 0;
  if (trackCoordinates && trackCoordinates.length > 1) {
    if (curTime < trackCoordinates[0].cCreatetime) {
      index = 0;
      return trackCoordinates[0];
    }
    if (curTime > trackCoordinates[trackCoordinates.length - 1].cCreatetime) {
      index = trackCoordinates.length - 1;
      return trackCoordinates[trackCoordinates.length - 1];
    }
    index = binarySearch(trackCoordinates, curTime);
    if (index > 0 && index < trackCoordinates.length - 2) {
      if (curTime === trackCoordinates[index].cCreatetime) {
        return trackCoordinates[index];
      }
      return createEncytPoi(index, curTime, trackCoordinates);
    }
    return trackCoordinates[index];
  }
}
/**
 * 二分查找法
 * @param {Array} array
 * @param {Number} value
 * @returns
 */
function binarySearch(array, value) {
  let startIndex = 0;
  let stopIndex = array.length - 1;
  let middle = (stopIndex + startIndex) >>> 1;
  while (array[middle].cCreatetime / 1000 != value / 1000 && startIndex < stopIndex) {
    if (value < array[middle].cCreatetime) {
      stopIndex = middle - 1;
    } else if (value > array[middle].cCreatetime) {
      startIndex = middle + 1;
    }
    middle = (stopIndex + startIndex) >>> 1;
  }
  return (array[middle].cCreatetime != value) ? middle : middle;
}
/**
 * 根据时间和坐标索引新建定位
 * @param {Number} index
 * @param {Number} time
 * @returns
 */
function createEncytPoi(index, time, trackCoordinates) {
  let pre = index;
  if (time > trackCoordinates[index].cCreatetime) {
    index += 1;
  }
  if (time < trackCoordinates[index].cCreatetime) {
    pre = index - 1;
  }
  if ((trackCoordinates[index].cCreatetime - trackCoordinates[pre].cCreatetime) / 1000 < 300) {
    const tpoi = { cCoordinatex: 0, cCoordinatey: 0, cCreatetime: time };
    const d = trackCoordinates[index].cCreatetime - trackCoordinates[pre].cCreatetime;
    const c = time - trackCoordinates[pre].cCreatetime;
    const x = linear(parseFloat(trackCoordinates[pre].cCoordinatex), parseFloat(trackCoordinates[index].cCoordinatex), c, d);
    const y = linear(parseFloat(trackCoordinates[pre].cCoordinatey), parseFloat(trackCoordinates[index].cCoordinatey), c, d);
    tpoi.cCoordinatex = x;
    tpoi.cCoordinatey = y;
    return tpoi;
  }
  return trackCoordinates[index];
}

/**
 * 线性插值
 * @param {ol.Coordinate} initPos
 * @param {ol.Coordinate} targetPos
 * @param {Number} currentCount
 * @param {Number} count
 * @returns
 */
function linear(initPos, targetPos, currentCount, count) {
  const b = initPos;
  const c = targetPos - initPos;
  const t = currentCount;
  const d = count;
  return c * t / d + b;
}

/**
 * @description:过滤出图形id
 * @author:sijianting
 * @createDate:2019/8/14 10:57
 */
export function filterMapId(data) {
  // 面查询idlist
  let ids;
  if (data.length > 0) {
    ids = '(';
    for (let i = 0; i < data.length; i++) {
      ids += `'${data[i].locationId}'`;
      if (i + 1 < data.length) {
        ids += ',';
      }
    }
    ids += ')';
  }
  return ids;
}
