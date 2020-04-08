// geoserver服务器
const gsHost = 'http://36.22.189.85:6350';
// 重点路段
const keyRoadWFSUrl = `${gsHost}/geoserver/hescgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hescgis:重点区域&outputFormat=application%2Fjson`;
// 消纳点
const cpWFSUrl = `${gsHost}/geoserver/hescgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hescgis:消纳点&outputFormat=application%2Fjson`;
// 消纳场
const caWFSUrl = `${gsHost}/geoserver/hescgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hescgis:消纳场&outputFormat=application%2Fjson`;
// 项目
const projectWFSUrl = `${gsHost}/geoserver/hescgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hescgis:项目&outputFormat=application%2Fjson`;
// 垃圾堆放点
const trashWFSUrl = `${gsHost}/geoserver/hescgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hescgis:建筑垃圾临时堆放点&outputFormat=application%2Fjson`;
// 停车场
const parkingWFSUrl = `${gsHost}/geoserver/hescgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hescgis:停车场&outputFormat=application%2Fjson`;
// 车辆范围图层
const carExtentWFSUrl = `${gsHost}/geoserver/hescgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hescgis:车辆范围&outputFormat=application%2Fjson`;
// 车辆路径图层
const carRoadWFSUrl = `${gsHost}/geoserver/hescgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hescgis:车辆路径&outputFormat=application%2Fjson`;


const apiHost2 = 'http://192.168.77.0:8080/zhcg_mqsb_war_exploded';
// const apiHost = 'http://36.22.189.85:83/api';
const apiHost = '/api';

// 报表导出url
const reportExportUrl = 'http://36.22.189.85:83/haining_bigscreen/login/bigscreen?menuIndex=1&clickId=bmtj_zfaj';

// 根据type获取车辆列表，type  1 轻型自卸货车 2 重型自卸货车
const getCarTreeApi = `${apiHost}/gw/tcarinfo/getTcarInfoCompanyListByType`;
// 获取环卫车列表
const getCleanTcarInfoListApi = `${apiHost}/gw/tcarinfo/getCleanTcarInfoList`;
// 获取消纳点进出信息
const getCpInfoApi = 'http://36.22.189.85:83/api' + '/gw/tcarinfo/getDissolveCarActionList';
// 获取重点区域报警数信息
const getKrInfoApi = `${apiHost}gw/tcarinfo/getForbidCarActionList`;
// 获取公司列表
const getCompaniesApi = `${apiHost}/gw/tcarinfo/getCompanyList`;
// 根据carId或carcode获取车辆基础信息, 传carId,
const getCarInfoByIdApi = `${apiHost}/gw/tcarinfo/carInfoByCarId`;
// 根据消纳点和重点区域的实时追踪信息 id=2&type=1重点路段 type:'2','3','4','5','6'/消纳点，消纳场，堆放点，停车场，项目（工地）
const getRealTimeTrackApi = `${apiHost}/gw/tcarinfo/getActionDetails`;
// 根据条件查询车辆信息，传json字符串
const searchCarsApi = `${apiHost}/gw/tcarinfo/getCarGapInfo`;
// 根据车辆id和时间段获取轨迹 carid startTime endTime
const getTrackApi = `${apiHost}/gw/tcarlocation/carLocationList`;
// 根据车辆ID查询车辆违规信息 ?carId=1064603510550&startTime=2019-01-01 00:00:00
const getCarViolateInfoApi = `${apiHost}/gw/tcarinfo/getCarviolateList`;
// 根据ID删除违规信息 ?id
const deleteViolateInfoByIdApi = `${apiHost}/gw/tcarviolate/delete`;
// 新增分析任务接口
const addTaskApi = `${apiHost}/gw/tcartask/createTask`;
// 获取所有任务列表
const getAllTasksApi = `${apiHost}/gw/tcartask/getTaskList`;
// 根据ID获取任务id
const getTaskByIdApi = `${apiHost}/gw/tcartask/getTaskResult`;
// 获取状态对应的数量
const getCarTypeCountApi = `${apiHost}/gw/tcarinfo/getTcarCount`;

export {
  reportExportUrl,
  keyRoadWFSUrl,
  cpWFSUrl,
  carExtentWFSUrl,
  carRoadWFSUrl,
  getCpInfoApi,
  getKrInfoApi,
  getCarTreeApi,
  getCleanTcarInfoListApi,
  getCompaniesApi,
  getCarInfoByIdApi,
  getCarViolateInfoApi,
  deleteViolateInfoByIdApi,
  searchCarsApi,
  getTrackApi,
  getRealTimeTrackApi,
  addTaskApi,
  getAllTasksApi,
  getCarTypeCountApi,
  getTaskByIdApi,
  caWFSUrl,
  projectWFSUrl,
  trashWFSUrl,
  parkingWFSUrl,
};
