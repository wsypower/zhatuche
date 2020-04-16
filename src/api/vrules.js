import axios from 'axios';
var qs = require('qs');
// 获取区域获取路线列表接口
const getAreaOrLineListAPI = `${URL_CONFIG.vRulesURL}/unauthorized/area/getAreaList`;
// 增加\编辑区域或者路线接口
const addEditAreaOrLineAPI = `${URL_CONFIG.vRulesURL}/unauthorized/area/addOrUpdateArea`;
// 删除区域或者路线接口
const deleteAreaOrLineAPI = `${URL_CONFIG.vRulesURL}/unauthorized/area/deleteByIds`;
// 获取全部车辆接口
const getAllCarTreeDataAPI = `${URL_CONFIG.vRulesURL}/unauthorized/area/getAreaBind`;
// 保存区域/路线绑定车辆接口
const saveBindCarsListAPI = `${URL_CONFIG.vRulesURL}/unauthorized/area/bindCarByIds`;


/*
*  获取区域获取路线列表接口
* */
export async function getAreaOrLineList(obj) {
  const { data } = await axios.get(`${getAreaOrLineListAPI}?type=${obj.type}&name=${obj.name}`);
  console.log('getAreaOrLineList', data);
  return data.result;
}

/*
*  增加编辑区域或者路线接口
* */
export async function addEditAreaOrLine(areaObj) {
  const { data } = await axios.post(addEditAreaOrLineAPI, qs.stringify(areaObj));
  console.log('addEditAreaOrLine', data);
  return data;
}

/*
*  删除区域或者路线接口
* */
export async function deleteAreaOrLine(deleteObj) {
  const { data } = await axios.post(deleteAreaOrLineAPI, qs.stringify(deleteObj));
  return data;
}

/*
*  获取全部车辆接口
* */
export async function getAllCarTreeData(params) {
  const { data } = await axios.get(`${getAllCarTreeDataAPI}?type=${params.type}&areaId=${params.areaId}`);
  return [data.result];
}

/*
*  保存区域/路线绑定车辆接口
* */
export async function saveBindCarsList(bindObj) {
  const { data } = await axios.post(saveBindCarsListAPI, qs.stringify(bindObj));
  return data;
}
