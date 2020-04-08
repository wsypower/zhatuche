import axios from 'axios';
import {
  addTaskApi,
  getAllTasksApi,
  cpWFSUrl,
  caWFSUrl,
  projectWFSUrl,
  trashWFSUrl,
  parkingWFSUrl,
  keyRoadWFSUrl,
  getCpInfoApi,
  getKrInfoApi,
  getCleanTcarInfoListApi,
  getCarTreeApi,
  getCompaniesApi,
  getCarInfoByIdApi,
  searchCarsApi,
  getCarViolateInfoApi,
  getTrackApi,
  getRealTimeTrackApi,
  getCarTypeCountApi,
  getTaskByIdApi,
  deleteViolateInfoByIdApi,
  carRoadWFSUrl
} from '@/conf/api';
import { dateFmt } from '@/js/utils';
import GeoJSON from 'ol/format/GeoJSON';
import companyImg from '@/assets/images/gongsi.png';
import errlCar from '@/assets/images/err.png';
import norlCar from '@/assets/images/normal.png';
import offlinelCar from '@/assets/images/offline.png';
// import offlinelCarPt from '@/assets/images/offline-pt-0.png';
// import offlinewCarPt from '@/assets/images/offline-pt-1.png';
// import norlCarPt from '@/assets/images/normal-pt-0.png';
// import norwCarPt from '@/assets/images/normal-pt-1.png';
// import errlCarPt from '@/assets/images/err-pt-0.png';
// import errwCarPt from '@/assets/images/err-pt-1.png';

const dFmt = 'yyyy-MM-dd';
const fieldMapping = {
  '超时停留': 'overtime',
  '超速': 'overspeed',
  '超范围': 'overrange',
  '禁行路段': 'lineforbid',
  // '未审批': 'unapproval',
  '线路偏移': 'lineoffset',
  '疑似偷盗':'doubtsteal'
}
const errLabels = [{
  name: '超时停留',
  code: '1',
}, {
  name: '超速',
  code: '2',
}, {
  name: '超范围',
  code: '3',
}, {
  name: '禁行路段',
  code: '4',
}, {
  name: '线路偏移',
  code: '5',
},{
  name:'疑似偷盗',
  code:'6'
}];
/**
 * 获取自卸货车树
 * @return {[type]} [description] type=1为轻型，type=2为重型，type=3为环卫车
 */
export async function getCarTree(type) {
  let url;
  let points = [];
  if (type === '3') {
    url = getCleanTcarInfoListApi;
  } else {
    url = `${getCarTreeApi}?type=${type}`;
  }
  const { data } = await axios.get(url);
  const obj = data.obj;
  let tree = [];
  let tag;
  let allOnlineNum = 0;
  let allTotalNum = 0;
  if (obj) {
    const carComps = obj.children;
    tree = carComps.map(com => {
      const totalNum = com.children.length;
      let onlineNum = totalNum;
      const cars = com.children.map(car => {
        const { isOnline, lineforbid, lineoffset, overrange, overspeed, overtime,doubtsteal} = car;
        let state;
        let icon;
        if (!isOnline) {
          onlineNum--;
          icon = offlinelCar;
          state = 'offline';
        } else if (!Number(lineforbid) || !Number(lineoffset) || !Number(overrange) || !Number(overspeed) || !Number(overtime)|| !Number(doubtsteal)) {
          icon = errlCar;
          state = 'err';
        } else {
          //debugger;
          icon = norlCar;
          state = 'normal';
        }
        return {
          ...car,
          icon,
          state,
          name: car.carcode,
          checked: true,
        }
      })
      points = [...cars, ...points];
      const tag = `${onlineNum}/${totalNum}`;
      allOnlineNum += onlineNum;
      allTotalNum += totalNum;
      return {
        name: com.name,
        icon: companyImg,
        expand: false,
        tag,
        checked: true,
        children: cars,
      }
    })

  }
  tag = `${allOnlineNum}/${allTotalNum}`;
  return { tree, tag, points };
}

// export async function getCarRealTimePoints(type) {
//   const { data: cars } = await axios.get(getCarTreeApi + '?type=' + type);
//   let carPoints = []
//   if (cars.obj) {
//     const carComps = cars.obj.children;
//     carPoints = carComps.map(comp => comp.children).reduce((p, n) => p.concat(n))
//     carPoints.forEach((car) => {
//       const { isOnline, lineforbid, lineoffset, overrange, overspeed, overtime,doubtsteal } = car;
//       let icon;
//       if (!isOnline) {
//         icon = type === '1' ? offlinelCarPt : offlinewCarPt;
//       } else if (!Number(lineforbid) || !Number(lineoffset) || !Number(overrange) || !Number(overspeed) || !Number(overtime)|| !Number(doubtsteal)) {
//         icon = type === '1' ? errlCarPt : errwCarPt
//       } else {
//         icon = type === '1' ? norlCarPt : norwCarPt
//       }
//       car.icon = icon;
//     })
//   }
//   return carPoints;
// }



/**
 * 添加类型点，可选：消纳点，垃圾堆放点，项目，停车场，消纳场
 * type:'2','3','4','5','6'/消纳点，消纳场，堆放点，停车场，项目（工地）
 * @return {[type]} [description]
 */
const TYPEMAPPING = {
  cp: {
    code: 2,
    url: cpWFSUrl,
    name:'地点',
  },
  ca: {
    code: 3,
    url: caWFSUrl,
    name:'地点'
  },
  trash: {
    code: 4,
    url: trashWFSUrl,
    name:'名称'
  },
  parking: {
    code: 5,
    url: parkingWFSUrl,
    name:'地址'
  },
  project: {
    code: 6,
    url: projectWFSUrl,
    name:'名称'
  }
}
export async function getTypePoints(type) {
  const cpWFSPromise = axios.get(TYPEMAPPING[type].url);
  const cpInfoPromise = axios.get(getCpInfoApi + "?type=" + TYPEMAPPING[type].code+"&range=300000");
  const { data: geojson } = await cpWFSPromise;
  const { data: cpData } = await cpInfoPromise;
  const cpInfo = cpData.obj;
  const points = new GeoJSON().readFeatures(geojson);
  points.forEach(pt => {
    let id = pt.getId();
    id = id.substr(id.indexOf('.') + 1);
    const target = cpInfo.filter(i => i.id === id);
    let enterNum = 0;
    let leaveNum = 0;
    if (target.length > 0) {
      enterNum = target[0].enterNum ? target[0].enterNum : 0;
      leaveNum = target[0].leaveNum ? target[0].leaveNum : 0;
    }
    pt.set('id', id);
    pt.set('enterNum', enterNum);
    pt.set('leaveNum', leaveNum);
    pt.set('type', type);
    pt.set('name', pt.get(TYPEMAPPING[type].name));
    const coordinates = pt.getGeometry().getCoordinates()[0];
    pt.set('pointx', coordinates[0]);
    pt.set('pointy', coordinates[1]);
  })
  return points;
}

/**
 * 获取重点区域
 * @return {[type]} [description]
 */
export async function getKeyRoads() {
  const { data: geojson } = await axios.get(keyRoadWFSUrl);
  const roads = new GeoJSON().readFeatures(geojson);
  roads.forEach(r => {
    r.set('type', 'kr');
    let id = r.getId();
    id = id.substr(id.indexOf('.') + 1);
    r.set('id', id);
  })
  return roads;
}
/**
 * 获取车辆路径
 * @return {[type]} [description]
 */
export async function getCarRoads() {
  const { data: geojson } = await axios.get(carRoadWFSUrl);
  let carRoads=[];
  if(geojson){
    carRoads = new GeoJSON().readFeatures(geojson);
  }
  return carRoads;
}


/**
 * 过滤车辆
 * @param  {[type]} carFeature     [description]
 * @param  {[type]} selectedStates [description]
 * @return {[type]}                [description]
 */
export function filterCar(carFeature, selectedStates, uncheckedCarIds) {
  //debugger;
  let filterCarFeatures;
  if (selectedStates.includes('全部状态')) {
    filterCarFeatures = carFeature;
  } else {
    if (!selectedStates.includes('离线')) {
      //不含离线
      filterCarFeatures = carFeature.filter(f => f.get('isOnline') === 1);
    } else {
      filterCarFeatures = carFeature;
    }

    filterCarFeatures = filterCarFeatures.filter(f => {
      const fields = selectedStates.filter(state => state !== '正常' && state !== '离线').map(state => fieldMapping[state]);
      let filterJudge = false;
      if (fields.length > 0) {
        fields.forEach(field => {
          filterJudge = filterJudge || f.get(field) === '0';
        })
      }
      let isNormal = true;
      for (let item in fieldMapping) {
        const field = fieldMapping[item];
        isNormal = (f.get(field) !== '0') && isNormal;
      }
      if (selectedStates.includes('正常')) {
        if(selectedStates.length === 1){
          filterJudge = isNormal;
        }else{
          filterJudge = filterJudge || isNormal;
        }
      }
      return f.get('isOnline') === 0 || filterJudge;
    })
  }
  if (uncheckedCarIds.length>0) {
    filterCarFeatures = filterCarByChecked(filterCarFeatures, uncheckedCarIds);
  }
  return filterCarFeatures;
}

export async function getCompanies() {
  const { data } = await axios.get(getCompaniesApi);
  const companies = data.obj;
  return companies.map(c => {
    c.label = c.name;
    return c;
  });
}

/**
 * 根据id或carcode查询车辆相关信息
 * @return {[type]} [description]
 */
export async function getCar(carId) {

  const { data } = await axios.post(getCarInfoByIdApi, {
    carId,
  });
  return data.obj;
}

export async function getCarInfoById(carId) {

  const { data } = await axios.post(getCarInfoByIdApi, {
    carId,
  });
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
      phoneNum: gslxdh
    }],
  };
}


/**
 * 根据条件查询车辆
 */
export async function searchCarByCondition(condition) {
  const { data } = await axios.post(searchCarsApi, condition);
  const result = data.obj;
  if (result.errRecords) {
    result.errRecords.forEach(item => {
      item.expand = false;
      const violates = [];
      item.details.forEach(d => {
        d.code = errLabels.filter(l => l.name === d.violate)[0].code;
        violates.push(d.violate);
      })
      item.errLabels = errLabels.filter(label => {
        return violates.includes(label.name)
      });
    })
  }
  if (result.errInfo) {
    result.errInfo.forEach(item => {
      item.name = item.type;
      item.value = item.num;
    })
  }
  return result;
}

/**
 * 获取车辆违章信息
 * @param  {[type]} carId     [description]
 * @param  {[type]} startTime [description]
 * @param  {[type]} endTime   [description]
 * @return {[type]}           [description]
 */
export async function getCarViolateInfo(carId, startTime, endTime) {
  if (!startTime) {
    startTime = dateFmt(dFmt, new Date()) + ' 00:00:00';
  }
  if (!endTime) {
    endTime = dateFmt(dFmt, new Date()) + ' 23:59:59';
  }
  const { data } = await axios.get(getCarViolateInfoApi, {
    params: {
      carId,
      startTime,
      endTime
    }
  });
  return data.obj;
}

export async function searchTrack(carid, startTime, endTime) {
  const { data } = await axios.post(getTrackApi + `?startIndex=1&pageSize=99999&carid=${carid}&startTime=${startTime}&endTime=${endTime}`);
  return data.obj.tCarlocationList;
}


export async function getRealTimeTrack(id, type,range=300000) {
  const { data } = await axios.get(getRealTimeTrackApi, {
    params: {
      id,
      type,
      range
    }
  })
  const info = data.obj;
  // const enterNum = info.length;
  // const leaveNum = info.filter(item => item.end_time).length;
  // const enterNum = info.data;
  let enterNum=0;
  let leaveNum=0;
  for(let i=0;i<info.length;i++){
    enterNum +=info[i].data.length;
    leaveNum += info[i].data.filter(item => item.end_time).length;
  }
  // const leaveNum = info.filter(item => item.end_time).length;
  return {
    enterNum,
    leaveNum,
    info,
  }
}

/**
 * 新增分析任务
 */
export async function addTask(params) {
  let paramsStr = '';
  for (const k in params) {
    if (params[k]) {
      paramsStr += `${k}=${params[k]}&`
    }
  }
  let url = addTaskApi;
  url += `?${paramsStr}`;
  const { data } = await axios.post(url);
  return data.obj;
}

/**
 * 获取任务列表
 * @return {[type]} [description]
 */
export async function getAllTasks() {
  const { data } = await axios.get(getAllTasksApi);
  if (data.obj) {
    data.obj.forEach(item => {
      item.state = item.taskState;
      item.result = [];
    })
  }
  return data.obj;
}

export async function getCarTypeCount() {
  const { data } = await axios.get(getCarTypeCountApi);
  return data.result;
}

export async function getTaskById(id) {
  const { data } = await axios.get(getTaskByIdApi + "?id=" + id);
  return data.obj;
}

export function updateCarTree(oldTree, newTree) {
  oldTree.forEach(oldTreeItem => {
    //在newTree中找到当前oldTreeItem对应的树节点
    const targetTreeItem = newTree.filter(item => item.name === oldTreeItem.name)[0];
    if (targetTreeItem) {
      oldTreeItem.tag = targetTreeItem.tag;
      const cars = oldTreeItem.children;
      if (cars.length > 0) {
        cars.forEach(c => {
          const filteredTarget = targetTreeItem.children.filter(item => item.carid === c.carid)[0];
          if (filteredTarget) {
            c.icon = filteredTarget.icon;
            if (c.pointx !== filteredTarget.pointx) {
              c.pointx = filteredTarget.pointx;
            }

            c.pointy = filteredTarget.pointy;
          }

        })
      }
    }

  })
}

export function filterCarByChecked(features, uncheckedCarIds) {
  return features.filter(f => !uncheckedCarIds.includes(f.get('carid')));
}


export async function deleteViolateInfoById(id) {
  const {data} = await axios.get(deleteViolateInfoByIdApi, {
    params: {
      id,
    }
  })
  return data;
}
