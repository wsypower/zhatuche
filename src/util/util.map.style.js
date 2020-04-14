/**
 * @description:地图样式公共方法
 * @author:sijianting
 * @createDate:2019/9/25 11:16
 */
import Icon from 'ol/style/Icon';
import { Style, Stroke, Fill } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import carTrackIcon from '@/assets/images/taxi.png';

/**
 * @description:绿道样式
 * @author:sijianting
 * @createDate:2019/9/25 11:16
 */
export function greenwayStyle() {
  return new Style({
    stroke: new Stroke({
      color: 'rgba(80,207,63)',
      width: 6,
    }),
  });
}
export function selectGreenwayStyle() {
  return new Style({
    stroke: new Stroke({
      color: 'rgba(0,255,0)',
      width: 6,
    }),
  });
}


/**
 * @description:人员点位样式
 * @author:sijianting
 * @createDate:2019/9/25 11:16
 */
export function userStyle() {
  return new Style({
    image: new Icon({
      src: require('@/assets/人员-zx.png'),
    }),
    anchor: [0.5, 1],
  });
}

/**
 * @description:古树名木点位样式
 * @author:sijianting
 * @createDate:2019/9/25 11:16
 */
export function treeStyle() {
  return new Style({
    image: new Icon({
      src: require('@/assets/tree.png'),
    }),
    anchor: [0.5, 1],
  });
}

/**
 * @description:公园点位样式
 * @author:sijianting
 * @createDate:2019/9/25 11:16
 */
export function parkStyle() {
  return new Style({
    image: new Icon({
      src: require('@/assets/park.png'),
    }),
    anchor: [0.5, 1],
  });
}

/**
 * 车辆范围样式
 * @return {[type]} [description]
 */
export function carExtentStyle() {
  return new Style({
    stroke: new Stroke({
      color: 'rgb(240,113,113)',
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(80,207,63,.1)',
    }),
  });
}

export function carRoadStyle() {
  return new Style({
    stroke: new Stroke({
      color: [80, 207, 63, 0.6],
      width: 20,
    }),
  });
}

/**
 * 轨迹样式
 * @return {[type]} [description]
 */
const colorMapping = {
  超时停留: 'rgba(29,206,200,1)',
  超速: 'rgba(254,187,8,1)',
  超范围: 'rgba(254,135,8,1)',
  禁行路段: 'rgba(240,113,113,1)',
  线路偏移: 'rgba(134,122,253,1)',
  普通轨迹线: 'rgba(80, 207, 63,.8)',
  普通轨迹点: 'rgba(255, 255, 255,.8)',
  正常: 'rgba(80,207,63,1)',
  疑似偷盗: 'rgba(33,40,180,.4)',
};
const colorMappingAlpha = {
  超时停留: 'rgba(29,206,200,.4)',
  超速: 'rgba(254,187,8,.4)',
  超范围: 'rgba(254,135,8,.4)',
  禁行路段: 'rgba(240,113,113,.4)',
  线路偏移: 'rgba(134,122,253,.4)',
  普通轨迹点: 'rgba(255, 255, 255,.8)',
  正常: 'rgba(80,207,63,.4)',
  疑似偷盗: 'rgba(33,40,180,.4)',
};
export function trackStyle() {
  return function (feature) {
    if (feature.get('type')) {
      let type = feature.get('type');
      type = type || '正常';
      const isLast = feature.get('isLast');
      const image = isLast ? new CircleStyle({
        fill: new Fill({
          color: colorMapping[type],
        }),
        radius: 8,
        stroke: new Stroke({
          width: 20,
          color: colorMappingAlpha[type],
        }),
      }) : undefined;
      return new Style({
        stroke: new Stroke({
          color: colorMapping[type],
          width: 2,
        }),
        image,
      });
    }
    return new Style({
      stroke: new Stroke({
        color: 'rgba(80,207,63)',
        width: 6,
      }),
    });
  };
}

/**
 * 轨迹点样式
 * @return {[type]} [description]
 */
const typeMapping = {
  超时停留: 'overtime',
  超速: 'overspeed',
  超范围: 'overrange',
  禁行路段: 'err',
  线路偏移: 'lineoffset',
  疑似偷盗: 'suspectedtheft',
};
const carTypeMapping = {
  轻型自卸货车: '0',
  重型自卸货车: '1',
};
export function trackPointStyle() {
  return function (feature) {
    if (feature.get('type') || feature.get('carType')) {
      const type = feature.get('type');
      const carType = feature.get('carType');
      return new Style({
        image: new Icon({
          src: require(`@/assets/images/${typeMapping[type]}-pt-${carTypeMapping[carType]}.png`),
        }),
        anchor: [0.5, 1],
      });
    }
    return new Style({
      image: new Icon({
        src: require('@/assets/images/taxi.png'),
      }),
      anchor: [0.5, 1],
    });
  };
}

/*
* 车辆样式
* */
export function ptStyle() {
  return function (feature) {
    const state = feature.get('state');
    const iconOptions = {
      src: require(`@/assets/images/${state}.png`),
    };
    const style = new Style({
      image: new Icon(iconOptions),
      anchor: [0.5, 1],
    });
    return style;
  };
}
/*
 * 车辆轨迹样式
 * */
export function carTrackStyle() {
  return function (feature) {
    let iconOptions = {};
    iconOptions = {
      src: carTrackIcon,
    };

    return new Style({
      image: new Icon(iconOptions),
    });
  };
}

/**
 * @description:编辑图形样式
 * @author:sijianting
 * @createDate:2019/9/25 11:16
 */
export function editStyle() {
  return new Style({
    fill: new Fill({
      color: 'rgba(34,139,34, 0.3)',
    }),
    stroke: new Stroke({
      color: '#228B22',
      width: 3,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#228B22',
      }),
    }),
  });
}
