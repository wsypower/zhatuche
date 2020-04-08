<!-- 车辆轨迹tab页 -->
<template>
  <div id="cartrack">
    <el-date-picker class="el-date-picker" v-model="dateRange" value-format="yyyy-MM-dd" type="daterange" size="mini" range-separator="-">
    </el-date-picker>
    <span class="sp2" @click="queryTrack()"> 查询 </span>
    <div class="trace-section-header">
      <span class="jl1">分段轨迹</span>
    </div>
    <ul class="tracks">
      <li class="track-i jca aic f13 g3 poi" v-for="(item,index) in this.$store.state.trackSegments" :key="index">
        <p class="track-i-range"> {{getTimeRange(item[0].cGpstime,item[item.length-1].cGpstime)}}</p>
        <p class="sp2" @click="playTrack(index,item[0].cGpstime,item[item.length-1].cGpstime)"> 播放 </p>
      </li>
    </ul>
  </div>
</template>
<script>
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
// import { mapState, mapMutations } from 'vuex';
import { searchTrack } from '@/api/service';
import { dateFmt } from '@/js/utils';
import { trackStyle, carTrackStyle } from '@/util/util.map.style';
import { genTrackFeaturesByLocationList } from '@/js/map/mapUtils';
import carTrackIcon from '@/assets/images/taxi.png';

let trackLayers;// 所有轨迹段
let carIconLayer;// 所有轨迹点图层
const dtFmt = 'MM/dd hh:mm:ss';
const today = new Date();
const fmt = 'yyyy-MM-dd';
const dateRange = [dateFmt(fmt, today), dateFmt(fmt, today)];
export default {
  name: 'carTrack',
  data() {
    return {
      historyTrack: [],
      dateRange,
      // trackSegments: this.$store.state.trackSegments, // 轨迹详情分段
      currentQueryTracks: [], // 轨迹点分段
      thisTrackLine: [], // 当前播放的轨迹段
      timer: null,
      isStart: false,
      timeRun: 0, // 播放次数
      trackPointStyle: new Style({
        image: new Icon({
          src: carTrackIcon,
        }),
      }),
    };
  },
  created() {
    trackLayers = this.$store.state.mapManager.addVectorLayerByFeatures([], trackStyle());
    carIconLayer = this.$store.state.mapManager.addVectorLayerByFeatures([], carTrackStyle());
    carIconLayer.setZIndex(99);
  },
  mounted() {
    this.$nextTick().then(() => {
    });
  },
  methods: {
    // ...mapMutations('clgl', [
    //   'setPlayerBarShow',
    //   'setPlayerBarOptions',
    // ]),
    dateFmt,
    queryTrack() {
      this.currentQueryTracks = [];
      trackLayers.getSource().clear();
      this.$store.state.trackSegments = [];
      let startTime = `${this.dateRange[0]} 00:00:00`;
      startTime = startTime.substring(0, 19);
      startTime = startTime.replace(/-/g, '/');
      const st = new Date(startTime).getTime();
      let endTime = `${this.dateRange[1]} 23:59:59`;
      endTime = endTime.substring(0, 19);
      endTime = endTime.replace(/-/g, '/');
      const et = new Date(endTime).getTime();
      // 根据ID和时间查询轨迹
      searchTrack(this.tabData.carId, st, et).then((track) => {
        const coords = track;
        if (coords.length > 0) {
          this.trackDataHandler(coords);
        } else {
          this.$message.warning('未查询到轨迹信息！');
        }
      });
    },
    trackDataHandler(coords) {
      // 按间隔时间轨迹分段
      let currentCoord = coords[0];
      let nextCoord = null;
      let lineCoordinates = [];
      lineCoordinates.push(currentCoord); // 加载第一个点
      for (let i = 1; i < coords.length - 1; i++) {
        nextCoord = coords[i];
        if (nextCoord.cGpstime - currentCoord.cGpstime <= 60 * 1000 * 30) { // 小于间隔时间 30分钟
          lineCoordinates.push(nextCoord); // 加入当前线段
        } else { // 大于间隔时间
          if (lineCoordinates.length > 3) {
            this.$store.state.trackSegments.push(lineCoordinates);
            this.currentQueryTracks.push(lineCoordinates);
          }
          lineCoordinates = [];
          // 将下一个线段的第一点加入
          lineCoordinates.push(nextCoord); // 加入当前线段
        }
        currentCoord = nextCoord;
      }
      // 处理最后一次
      if (lineCoordinates.length > 0) {
        this.$store.state.trackSegments.push(lineCoordinates);
        this.currentQueryTracks.push(lineCoordinates);
      }
    },
    playTrack(index, startTime, endTime) {
      trackLayers.getSource().clear();
      this.thisTrackLine = this.currentQueryTracks[index];
      const features = genTrackFeaturesByLocationList(this.thisTrackLine);
      const [trackLine, firstPoint, lastPoint] = features;
      if (lastPoint) {
        // lastPoint.set('isLast', true);
        trackLayers = this.$store.state.mapManager.addVectorLayerByFeatures(features, trackStyle());
        this.historyTrack.push(trackLayers);
        this.$store.commit('sethistoryTrack', this.historyTrack);
        // 定位到轨迹
        this.$store.state.mapManager.map.getView().fit(trackLine.getGeometry());
      } else {
        this.$message.warning('未查询到轨迹信息！');
      }
      // 显示播放条
      const playerOptions = {
        startTime,
        endTime,
        track: this.thisTrackLine,
      }
      this.$store.commit('setPlayerBarOptions', playerOptions);
      // this.setPlayerBarShow(true);
      this.$store.commit('setPlayerBarShow', true);
    },
  },
  props: {
    tabData: Object,
    default: [],
  },
  computed: {
    // ...mapState('clgl', [
    //   'mapManager',
    // ]),
    getTimeRange(startTime, endTime) {
      return function (startTime, endTime) {
        const st = dateFmt(dtFmt, new Date(startTime));
        const et = dateFmt(dtFmt, new Date(endTime));
        return `${st} - ${et}`;
      };
    },
  },
  destroyed() {
    if (trackLayers) {
      this.$store.state.mapManager.removeLayer(trackLayers);
    }
    if (carIconLayer) {
      this.$store.state.mapManager.removeLayer(carIconLayer);
    }
  },
};
</script>
<style scoped lang='stylus'>
@import '~@/styles/views/car-detail-tab/err-record.styl';

#cartrack {
  /*display: none;*/
  margin-top: 10px;
  .sp2{
    font-size: 13px;
    font-weight: normal;
    color: #3296fa;
    cursor: pointer;
    padding-left: 5px;
  }
  .track-i-range{
    margin-right: 130px;
  }
  .trace-section-header {
    border-left: 6px solid #2b90f3;
    margin-top: 21px;
    .jl1 {
      padding-left: 10px;
      font-size: 16px;
      line-height: 22px;
      color: #333333;
    }
  }

}
</style>
