import { getDistance } from 'ol/sphere';
import Point from 'ol/geom/Point';

let lastAngle = 0;

function dateFmt(fmt, date) {
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length)); }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length))); }
  }
  return fmt;
}

function getAngle(_pointFrom, _pointTo) {
  let angle = 0;
  const pointFrom = new Point([Number(_pointFrom.cCoordinatex), Number(_pointFrom.cCoordinatey)]);
  const pointTo = new Point([Number(_pointTo.cCoordinatex), Number(_pointTo.cCoordinatey)]);
  const verticalPt = new Point([pointTo.getCoordinates()[0], pointFrom.getCoordinates()[1]]); // 垂点
  // 获取两点间距离
  const distance = getDistance(pointFrom.getCoordinates(), pointTo.getCoordinates());
  // 获取终点的垂直距离
  const verticalDistance = getDistance(pointTo.getCoordinates(), verticalPt.getCoordinates());
  // 求夹角

  const includedAngle = Math.asin(verticalDistance / distance);
  if (pointTo.getCoordinates()[0] > pointFrom.getCoordinates()[0]) { // 终点在起点的东侧
    if (pointTo.getCoordinates()[1] > pointFrom.getCoordinates()[1]) { // 终点在起点的东北侧
      angle = -includedAngle;
    } else if (pointTo.getCoordinates()[1] < pointFrom.getCoordinates()[1]) { // 终点在起点的东南侧
      angle = includedAngle;
    } else { // 终点在起点的正东侧
      angle = 0;
    }
  } else if (pointTo.getCoordinates()[0] < pointFrom.getCoordinates()[0]) { // 终点在起点的西侧
    if (pointTo.getCoordinates()[1] > pointFrom.getCoordinates()[1]) { // 终点在起点的西北侧
      angle = includedAngle + 2 * Math.PI;
    } else if (pointTo.getCoordinates()[1] < pointFrom.getCoordinates()[1]) { // 终点在起点的西南侧
      angle = Math.PI - includedAngle;
    } else { // 终点在起点的正西侧
      angle = Math.PI;
    }
  } else { // 相等
    if (pointTo.getCoordinates()[1] > pointFrom.getCoordinates()[1]) { // 终点在起点的正北侧
      angle = -Math.PI / 2;
    } else if (pointTo.getCoordinates()[1] < pointFrom.getCoordinates()[1]) { // 终点在起点的正南侧
      angle = Math.PI / 2;
    } else { // 终点和起点重合
      angle = lastAngle;
    }
  }
  lastAngle = angle;
  return angle;
}

/**
 * 时间列表
 * @param   diff 时间段间隔
 * @return  {[type]}            [时间列表]
 */
function getDiffDate(start, end, diff) {
  const startTime = new Date(start); // 复制对象，不能直接赋值！！
  const endTime = new Date(end); // 复制对象
  const dateArr = [];
  while ((endTime.getTime() - startTime.getTime()) >= 0) {
    const year = startTime.getFullYear();
    const month = startTime.getMonth().toString().length === 1 ? `0${parseInt(startTime.getMonth().toString(), 10) + 1}` : (startTime.getMonth() + 1);
    const day = startTime.getDate().toString().length === 1 ? `0${startTime.getDate()}` : startTime.getDate();
    dateArr.push(`${year}-${month}-${day}`);
    startTime.setDate(startTime.getDate() + diff);
  }
  return dateArr;
}

function getDuringMinutes(st, et) {
  const dur = Number(et) - Number(st);
  return Math.round(dur / 1000 / 60);
}

function dateToTimeStamp(startTime, endTime) {
  startTime += ' 00:00:00';
  startTime = startTime.substring(0, 19);
  startTime = startTime.replace(/-/g, '/');
  const st = new Date(startTime).getTime();
  endTime += ' 23:59:59';
  endTime = endTime.substring(0, 19);
  endTime = endTime.replace(/-/g, '/');
  const et = new Date(endTime).getTime();
  return [st, et];
}


export {
  dateFmt, getAngle, getDiffDate, getDuringMinutes, dateToTimeStamp,
};
