<!-- 违章记录 -->
<template>
  <div class="err-record">
    <div class="filter">
      <el-date-picker class="el-date-picker" v-model="dateRange" type="daterange" value-format="yyyy-MM-dd" @change="dateChange" size="mini" range-separator="-">
      </el-date-picker>
      <el-select size="mini" class="el-select" v-model="carState" placeholder="所有状态" @change="onSelectChange()">
        <el-option v-for="(item,i) in carStates" :key="i" :label="item.label" :value="item.name">
        </el-option>
      </el-select>
    </div>
    <div class="result">
      <div class="title aic">
        <p class="f16 g3">违章轨迹</p>
        <p class="title-line"></p>
        <p class="total f13 g6">共{{filteredData.length}}条</p>
      </div>
      <ul class="tracks">
        <li class="track-i jca aic f13 g3 poi" v-for="(t,i) in filteredData" :key="i" @click="showTrack(t)">
          <p class="track-i-range">{{getTimeRange(t.startTime, t.endTime)}}</p>
          <p class="track-i-dur">{{getDuration(t.startTime,t.endTime)}}</p>
          <p class="track-i-type" :class="'type-'+getType(t.violate)">{{t.violate}}</p>
          <p class="track-i-del-btn poi" @click.stop="onDelete(t,i)">删除</p>
          <!-- <p class="track-i-play-btn">播放</p> -->
        </li>
      </ul>
    </div>
    <div hidden>
      <!-- 轨迹弹框 -->
      <poiInfo ref="trackOverlay" noTitle style="height:80px;width:200px;top:-85px;" @onClose="closeOverlay">
        <div class="overlay-desc f14">
          <p v-for="item in overlayDesc" :key="item">{{item}}</p>
        </div>
      </poiInfo>
    </div>
  </div>
</template>
<script>
// import { mapState } from 'vuex';
import { dateFmt, getDuringMinutes, dateToTimeStamp } from '@/js/utils';
import { deleteViolateInfoById } from '@/js/clgl/service';
import { searchTrack, getCarViolateInfo } from '@/api/service';
import { genTrackFeaturesByLocationList } from '@/js/map/mapUtils';
import poiInfo from '@/components/PoiInfo.vue';

const dtFmt = 'MM/dd hh:mm:ss';
const today = new Date();
const fmt = 'yyyy-MM-dd';
const dateRange = [dateFmt(fmt, today), dateFmt(fmt, today)];
const carStates = [{
  label: '所有状态',
  name: undefined,
}, {
  name: '超时停留',
  label: '超时停留',
}, {
  name: '超速',
  label: '超速',
}, {
  name: '超范围',
  label: '超范围',
}, {
  name: '禁行路段',
  label: '禁行路段',
}, {
  name: '线路偏移',
  label: '线路偏移',
}, {
  name: '疑似偷盗',
  label: '疑似偷盗',
}];
const violateType = {
  超时停留: 1,
  超速: 2,
  超范围: 3,
  禁行路段: 4,
  线路偏移: 5,
  疑似偷盗: 6,
};
let carExtentLayer;
let carRoadLayer;
let carForbidRoadLayer;
let trackOverlay;
let allTrackLayer;

function clearPresetLayer() {
  carExtentLayer && carExtentLayer.setVisible(false);
  carRoadLayer && carRoadLayer.setVisible(false);
  carForbidRoadLayer && carForbidRoadLayer.setVisible(false);
}
export default {
  name: '',
  data() {
    return {
      dtFmt,
      carState: undefined,
      dateRange,
      carStates,
      vInfo: [],
      overlayDesc: [],
    };
  },
  mounted() {
    this.$nextTick().then(() => {
      const _this = this;
      getCarViolateInfo(this.tabData).then((vInfo) => {
        const time = dateToTimeStamp(this.dateRange[0], this.dateRange[1]);
        const id = vInfo[0].carId;
        // 根据id查出车辆一天的轨迹
        searchTrack(id, time[0], time[1]).then((track) => {
          const allFeatures = genTrackFeaturesByLocationList(track);
          const [, , lastPoint] = allFeatures;
          if (lastPoint) {
            lastPoint.set('isLast', true);
            allTrackLayer = _this.$store.state.mapManager.getAllTrackLayer();
            allTrackLayer.getSource().clear();
            allTrackLayer.getSource().addFeatures(allFeatures);
          }
        });
        clearPresetLayer();
        for (let i = 0; i < vInfo.length; i++) {
          // 根据ID和时间查询轨迹
          searchTrack(vInfo[i].carId, vInfo[i].startTime, vInfo[i].endTime).then((track) => {
            const features = genTrackFeaturesByLocationList(track);
            const [, , lastPoint] = features;
            features.forEach((f) => {
              f.set('type', vInfo[i].violate);
            });
            if (lastPoint) {
              lastPoint.set('isLast', true);
              lastPoint.set('timeRange', getDuringMinutes(vInfo[i].startTime, vInfo[i].endTime));
              vInfo[i].lastPoint = lastPoint;
              const trackLayer = _this.$store.state.mapManager.getTrackLayer();
              trackLayer.getSource().addFeatures(features);
            } else {
              this.$message.warning('未查询到轨迹信息！');
            }
          });
        }
        this.vInfo = vInfo;
      });
      // 初始化预设图层
      // carExtentLayer = this.$store.state.mapManager.getCarExtentLayer(false);
      // carRoadLayer = this.$store.state.mapManager.getCarRoadLayer(false);
      // carForbidRoadLayer = this.$store.state.mapManager.getForbidRoadLayer(false);
      // 初始化弹框
      trackOverlay = _this.$store.state.mapManager.addOverlay({
        element: _this.$refs.trackOverlay.$el,
        positioning: 'bottom-left',
      });
    });
  },
  watch: {
    tabData(carId) {
      getCarViolateInfo(carId).then((vInfo) => {
        const _this = this;
        const time = dateToTimeStamp(this.dateRange[0], this.dateRange[1]);
        const id = vInfo[0].carId;
        // 根据id查出车辆一天的轨迹
        searchTrack(id, time[0], time[1]).then((track) => {
          const allFeatures = genTrackFeaturesByLocationList(track);
          const [, , lastPoint] = allFeatures;
          if (lastPoint) {
            lastPoint.set('isLast', true);
            allTrackLayer = _this.$store.state.mapManager.getAllTrackLayer();
            allTrackLayer.getSource().clear();
            allTrackLayer.getSource().addFeatures(allFeatures);
          }
        });
        clearPresetLayer();
        for (let i = 0; i < vInfo.length; i++) {
          // 根据ID和时间查询轨迹
          searchTrack(vInfo[i].carId, vInfo[i].startTime, vInfo[i].endTime).then((track) => {
            const features = genTrackFeaturesByLocationList(track);
            const [, , lastPoint] = features;
            features.forEach((f) => {
              f.set('type', vInfo[i].violate);
            });
            if (lastPoint) {
              lastPoint.set('isLast', true);
              vInfo[i].lastPoint = lastPoint;
              const trackLayer = _this.$store.state.mapManager.getTrackLayer();
              trackLayer.getSource().addFeatures(features);
            } else {
              this.$message.warning('未查询到轨迹信息！');
            }
          });
        }
        this.vInfo = vInfo;
      });
    },
  },
  methods: {
    dateFmt,
    async onDelete(t, i) {
      // 删除违章记录
      await deleteViolateInfoById(t.id);
      // 重新请求
      this.vInfo = await getCarViolateInfo(this.tabData);
    },
    async dateChange() {
      this.vInfo = await getCarViolateInfo(this.tabData, `${this.dateRange[0]} 00:00:00`, `${this.dateRange[1]} 23:59:59`);
    },
    showTrack({
      carId, startTime, endTime, violate,
    }) {
      // 根据ID和时间查询轨迹
      searchTrack(carId, startTime, endTime).then((track) => {
        const features = genTrackFeaturesByLocationList(track);
        const [, , lastPoint] = features;
        if (violate === '超范围') {
          carExtentLayer.setVisible(true);
        } else if (violate === '线路偏移') {
          carRoadLayer.setVisible(true);
        } else if (violate === '禁行路段') {
          // carForbidRoadLayer.setVisible(true);
        } else if (violate === '超时停留') {
          // 显示overlay
          this.overlayDesc = ['限停留时间：10min', `实际停留时间：${getDuringMinutes(startTime, endTime)}min`];
          trackOverlay.setPosition(lastPoint.getGeometry().getCoordinates());
        } else if (violate === '超速') {
          this.overlayDesc = ['限速：60km', `超速持续时长：${getDuringMinutes(startTime, endTime)}min`];
          // 显示overlay
          trackOverlay.setPosition(lastPoint.getGeometry().getCoordinates());
        }
        // 定位到轨迹
        this.$store.state.mapManager.locateTo(lastPoint.getGeometry().getCoordinates());
      });
    },
    onSelectChange() {
      this.$store.state.mapManager.getTrackLayer().getSource().clear();
      for (let i = 0; i < this.filteredData.length; i++) {
        // 根据ID和时间查询轨迹
        searchTrack(this.filteredData[i].carId, this.filteredData[i].startTime, this.filteredData[i].endTime).then((track) => {
          const features = genTrackFeaturesByLocationList(track);
          const [, , lastPoint] = features;
          features.forEach((f) => {
            f.set('type', this.filteredData[i].violate);
          });
          if (lastPoint) {
            lastPoint.set('isLast', true);
            this.filteredData[i].lastPoint = lastPoint;
            const trackLayer = this.$store.state.mapManager.getTrackLayer();
            trackLayer.getSource().addFeatures(features);
          } else {
            this.$message.warning('未查询到轨迹信息！');
          }
        });
      }
    },
    closeOverlay() {
      trackOverlay && trackOverlay.setPosition(void 0);
    },
  },
  props: {
    tabData: String, // 实际是车辆ID
    default: [],
  },
  computed: {
    getType(violate) {
      return function (violate) {
        return violateType[violate];
      };
    },
    filteredData() {
      if (!this.carState) {
        return this.vInfo;
      }
      return this.vInfo.filter(item => item.violate === this.carState);
    },
    getDuration(startTime, endTime) {
      return function (startTime, endTime) {
        const dur = endTime - startTime;
        let second = dur / 1000;
        const minute = (second / 60).toFixed(0);
        second = Math.round(second % 60);
        return dateFmt(`${minute}分${second}秒`, new Date(dur));
      };
    },
    getTimeRange(startTime, endTime) {
      return function (startTime, endTime) {
        const st = dateFmt(dtFmt, new Date(startTime));
        const et = dateFmt(dtFmt, new Date(endTime));
        return `${st} - ${et}`;
      };
    },
  },
  destroyed() {},
  components: {
    poiInfo,
  },

};

</script>
<style scoped lang='stylus'>
@import '~@/styles/views/car-detail-tab/err-record.styl';

</style>
