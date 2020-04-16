import axios from 'axios';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { dateFmt } from '@/js/utils';
// 获取车辆列表接口
const getCarsListAPI = `${URL_CONFIG.carURL}/gw/tcarinfo/getMuckTcarInfoCompanyList`;
const getCarStateCountAPI = `${URL_CONFIG.carURL}/gw/tcarinfo/getTcarCount`;
const getCarByCarCodeAPI = `${URL_CONFIG.carURL}/gw/tcarinfo/getCarInfoByCarCode`;
const getCarInfoByCarIdAPI = `${URL_CONFIG.carURL}/gw/tcarinfo/carInfoByCarId`;
const getTrackAPI = `${URL_CONFIG.carURL}/gw/tcarlocation/carLocationList`;
const getCarViolateInfoAPI = `${URL_CONFIG.carURL}/gw/tcarinfo/getCarviolateList`;

/*
* 获取车辆列表方法
* */
export async function getCarList() {
  const { data } = await axios.get(getCarsListAPI);
  const result = data.obj;
  const features = result.map((d) => {
    let feature;
    if (d.pointx && d.pointx.length > 0 && d.pointy && d.pointy.length > 0) {
      feature = new Feature({
        geometry: new Point([parseFloat(d.pointx), parseFloat(d.pointy)]),
      });
      feature.setProperties(d);
      const {
        isOnline, lineforbid, lineoffset, overrange, overspeed, overtime, doubtsteal,
      } = d;
      if (!isOnline) {
        feature.set('state', 'offline');
      } else if (!Number(lineforbid) || !Number(lineoffset) || !Number(overrange) || !Number(overspeed) || !Number(overtime) || !Number(doubtsteal)) {
        feature.set('state', 'err');
      } else {
        feature.set('state', 'normal');
      }
    }
    return feature;
  });
  return features;
}

/*
* 获取车辆状态数量
* */
export async function getCarStateCount() {
  const { data } = await axios.get(getCarStateCountAPI);
  return data.result;
}

/**
 * 过滤车辆
 * @param  {[type]} carFeature     [description]
 * @param  {[type]} selectedStates [description]
 * @return {[type]}                [description]
 */
const fieldMapping = {
  超时停留: 'overtime',
  超速: 'overspeed',
  超范围: 'overrange',
  禁行路段: 'lineforbid',
  // '未审批': 'unapproval',
  线路偏移: 'lineoffset',
  疑似偷盗: 'doubtsteal',
};
export function filterCar(carFeature, selectedStates) {
  // debugger;
  let filterCarFeatures;
  if (selectedStates.includes('全部状态')) {
    filterCarFeatures = carFeature;
  } else {
    if (!selectedStates.includes('离线')) {
      // 不含离线
      filterCarFeatures = carFeature.filter(f => f.get('isOnline') === 1);
    } else {
      filterCarFeatures = carFeature;
    }
    filterCarFeatures = filterCarFeatures.filter((f) => {
      const fields = selectedStates.filter(state => state !== '正常' && state !== '离线').map(state => fieldMapping[state]);
      let filterJudge = false;
      if (fields.length > 0) {
        fields.forEach((field) => {
          filterJudge = filterJudge || f.get(field) === '0';
        });
      }
      let isNormal = true;
      for (const item in fieldMapping) {
        const field = fieldMapping[item];
        isNormal = (f.get(field) !== '0') && isNormal;
      }
      if (selectedStates.includes('正常')) {
        if (selectedStates.length === 1) {
          filterJudge = isNormal;
        } else {
          filterJudge = filterJudge || isNormal;
        }
      }
      return f.get('isOnline') === 0 || filterJudge;
    });
  }
  return filterCarFeatures;
}

/*
* 通过车牌号获取车辆信息方法
* */
export async function getCarByCarCode(code) {
  const { data } = await axios.get(`${getCarByCarCodeAPI}?carCode=${code}`);
  return data;
}
/*
* 通过车辆id获取车辆信息方法
* */
export async function getCarInfoByCarId(id) {
  const { data } = await axios.get(`${getCarInfoByCarIdAPI}?carId=${id}`);
  const {
    cCarcode,
    cIdentifier,
    cUnit,
    cTelephone,
    hdzzl,
    jsy,
    lxdh,
    hzbh,
    hzlx,
    clsl,
    fddbr,
    gslxdh,
    gslxr,
    fddbrlxdh,
  } = data.obj;
  return {
    carInfos: [{
      name: '车牌号',
      value: cCarcode,
    }, {
      name: '车辆类型',
      value: cIdentifier,
    }, {
      name: '运输企业',
      value: cUnit,
    }, {
      name: '驾驶员',
      value: jsy,
    }, {
      name: '联系电话',
      value: lxdh,
    }, {
      name: '核定载质量',
      value: hdzzl,
    }],
    companyInfos: [{
      name: '企业名称',
      value: cUnit,
    }, {
      name: '核准编号',
      value: hzbh,
    }, {
      name: '核准类型',
      value: hzlx,
    }, {
      name: '车辆数量',
      value: clsl,
    }, {
      name: '法定代表人',
      value: fddbr,
      phoneName: '联系电话',
      phoneNum: fddbrlxdh,
    }, {
      name: '公司联系人',
      value: gslxr,
      phoneName: '联系电话',
      phoneNum: gslxdh,
    }],
  };
}

/*
*
* */
export async function searchTrack(carid, startTime, endTime) {
  const { data } = await axios.post(`${getTrackAPI}?startIndex=1&pageSize=99999&carid=${carid}&startTime=${startTime}&endTime=${endTime}`);
  console.log(data);
  return data.obj.tCarlocationList;
}
/**
 * 获取车辆违章信息
 * @param  {[type]} carId     [description]
 * @param  {[type]} startTime [description]
 * @param  {[type]} endTime   [description]
 * @return {[type]}           [description]
 */
const dFmt = 'yyyy-MM-dd';
export async function getCarViolateInfo(carId, startTime, endTime) {
  if (!startTime) {
    startTime = `${dateFmt(dFmt, new Date())} 00:00:00`;
  }
  if (!endTime) {
    endTime = `${dateFmt(dFmt, new Date())} 23:59:59`;
  }
  const { data } = await axios.get(getCarViolateInfoAPI, {
    params: {
      carId,
      startTime,
      endTime,
    },
  });
  return data.obj;
}
