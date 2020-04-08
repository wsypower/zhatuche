<template>
  <div class="index">
    <!-- 查询 -->
    <div class="search">
      <a-input-search
        placeholder="请输入车牌号"
        @search="onSearch"
        enterButton="查询"
      />
    </div>
    <!-- 图层控制面板 -->
    <div class="ctrl-panel bsb f13">
      <div class="ctrl-panel-b">
        <ul>
          <li class="ctrl-panel-item" v-for="(state,index) in carStates" :key="index">
            <p class="ctrl-panel-item-checkbox df aic poi" @click="toggleState(state.name)">
              <img :src="getSelectState(state.name)">
            </p>
            <div class="ctrl-panel-item-middle">
              <p class="ctrl-panel-item-icon df aic">
                <img :src="state.icon">
              </p>
              <p>{{state.name}}</p>
            </div>
            <p class="ctrl-panel-item-num">{{state.num}}</p>
          </li>
        </ul>
      </div>
    </div>
    <!-- 轨迹播放条 -->
    <playerBar v-if="$store.state.isPlayerBarShow" :startTime="$store.state.playerBarOptions.startTime"
               :endTime="$store.state.playerBarOptions.endTime" @close="closePlayerBar"
               @onValueChange="onPlayBarValueChange"></playerBar>
    <!-- 地图 -->
    <LayoutMap ref="olMap"></LayoutMap>
    <div hidden>
      <!-- 车辆信息弹框 -->
      <poiInfo ref="carOverlay" :title="carInfo.title"
               style=" width: 436px;height: 351px;"
               :icon="carInfo.icon" @onClose="closeCarOverlay">
        <vTab tabWidth="80px" :tabs="carTabs" class=""></vTab>
      </poiInfo>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import LayoutMap from '@/views/map/olMap.vue';
// import MapManager from '@/util/util.map.manage';
import MapManager from '@/js/map/MapManager';
import selectedImg from '@/assets/car/selected.png';
import unselectedImg from '@/assets/car/unselected.png';
import poiInfo from '@/components/PoiInfo.vue';
import playerBar from '@/components/playerBar.vue';
import vTab from '@/components/vTab.vue';
// 车辆tab
import basicInfo from '@/views/car/car-detail-tab/basicInfo.vue';
import errRecord from '@/views/car/car-detail-tab/errRecord.vue';
import carTrack from '@/views/car/car-detail-tab/carTrack.vue';

import {
  getCarList, getCarStateCount, filterCar, getCarByCarCode, getCarInfoByCarId,
} from '@/api/service';
import { ptStyle } from '@/util/util.map.style';
import { findPosition, genPointByCoord } from '@/js/map/mapUtils';


let map;
let mapManager;
let trackPointLayer;// 轨迹点位图层
const selectedStates = ['全部状态', '正常', '超时停留', '超速', '超范围', '禁行路段', '线路偏移', '离线', '疑似偷盗'];
export default {
  name: 'CarTruck',
  components: {
    LayoutMap,
    poiInfo,
    vTab,
    playerBar,
  },
  data() {
    return {
      carOverlay: null,
      carLayer: null,
      carFeatures: [],
      selectedStates: [...selectedStates],
      carStates: [{
        name: '全部状态',
        num: 0,
      }, {
        name: '正常',
        icon: require('@/assets/car/正常.png'),
        num: 0,
      }, {
        name: '超时停留',
        icon: require('@/assets/car/超时停留.png'),
        num: 0,
      }, {
        name: '超速',
        icon: require('@/assets/car/超速.png'),
        num: 0,
      }, {
        name: '超范围',
        icon: require('@/assets/car/超范围.png'),
        num: 0,
      }, {

        name: '禁行路段',
        icon: require('@/assets/car/禁行区.png'),
        num: 0,
      }, {
        name: '线路偏移',
        icon: require('@/assets/car/偏离路线.png'),
        num: 0,
      }, {
        name: '离线',
        icon: require('@/assets/car/离线.png'),
        num: 0,
      }, {
        name: '疑似偷盗',
        icon: require('@/assets/car/疑似偷盗.png'),
        num: 0,
      }],
      // 车辆tab
      carTabs: [{
        name: '基本信息',
        content: basicInfo,
        data: {},
      }, {
        name: '违章记录',
        content: errRecord,
        data: '',
      },
      {
        name: '车辆轨迹',
        content: carTrack,
        data: {},
      }, /* ,
        {
          name: '实时违章',
          content: realTimeErr,
          data: {},
        } */
      ],
      carInfo: {
        title: 'linyoujia',
        icon: '',
      },
    };
  },
  mounted() {
    this.$nextTick().then(() => {
      map = this.$refs.olMap.getMap();
      mapManager = new MapManager(map);
      map.getView().setZoom(14);
      this.$store.commit('setMapManager', mapManager);
      this.getCars();
      this.carOverlay = mapManager.addOverlay({
        element: this.$refs.carOverlay.$el,
      });
      map.on('click', this.mapClickHandler);
    });
  },
  methods: {
    // 初始化车辆数据
    getCars() {
      const _this = this;
      getCarList().then((data) => {
        _this.carLayer = mapManager.addVectorLayerByFeatures(data, ptStyle(), 2);
        map.getView().fit(_this.carLayer.getSource().getExtent());
        _this.carFeatures = data;
      });
      // 4.获取状态对应的车数量
      getCarStateCount().then((count) => {
        const {
          all, nomal, overtime, overspeed, overrange, lineforbid, lineoffset, outline, doubtsteal,
        } = count;
        const counts = [all, nomal, overtime, overspeed, overrange, lineforbid, lineoffset, outline, doubtsteal];
        this.carStates.forEach((s, i) => {
          s.num = counts[i];
        });
      });
      mapManager.getCarExtentLayer();
    },
    // 切换车辆状态
    toggleState(state) {
      if (state === '全部状态') {
        if (this.selectedStates.includes(state)) {
          this.selectedStates = [];
        } else {
          this.selectedStates = [...selectedStates];
        }
      } else {
        const index = this.selectedStates.indexOf(state);
        if (index !== -1) {
          this.selectedStates.splice(index, 1);
          // 同时取消选中全部状态
          const allStateIndex = this.selectedStates.indexOf('全部状态');
          if (allStateIndex !== -1) {
            this.selectedStates.splice(allStateIndex, 1);
          }
        } else {
          this.selectedStates.push(state);
        }
      }
      if (this.selectedStates.includes('全部状态') && this.selectedStates.length === 1) {
        this.selectedStates = [];
      }
      if (!this.selectedStates.includes('全部状态') && this.selectedStates.length === selectedStates.length - 1) {
        this.selectedStates = [...selectedStates];
      }
      // 过滤车辆
      const carSource = this.carLayer.getSource();
      carSource.clear();
      carSource.addFeatures(filterCar(this.carFeatures, this.selectedStates));
    },
    // 根据车牌号查询车辆
    onSearch(value) {
      getCarByCarCode(value).then((data) => {
        console.log(data.obj);
        if (data.obj.pointx && data.obj.pointx.length > 0 && data.obj.pointy && data.obj.pointy.length > 0) {
          const xy = [parseFloat(data.obj.pointx), parseFloat(data.obj.pointy)];
          const carId = data.obj.id;
          this.carTabs[2].data = { carId };
          // const carCode = value;
          this.carInfo.icon = require('@/assets/images/huochedong-wh.png');
          this.carInfo.title = `渣土车(${value})`;
          // 根据carID查询车辆信息
          this.carTabs[1].data = carId;
          getCarInfoByCarId(carId).then((info) => {
            this.carTabs[0].data = info;
            this.carOverlay.setPosition(xy);
            // carOverlayFeatureId = carId;
          });
          mapManager.locateTo(xy);
        } else {
          this.$message.error('当前车牌号未查询到车辆！');
        }
      });
    },
    // 地图点击事件处理器
    mapClickHandler({ pixel, coordinate }) {
      // if (trackLayer) {
      //   trackLayer.getSource().clear();
      // }
      const feature = map.forEachFeatureAtPixel(pixel, feature => feature);
      if (feature) {
        // this.$store.state.trackSegments = [];
        // this.$store.state.historyTrack.map((layer) => {
        //   mapManager.removeLayer(layer);
        // });
        const carId = feature.get('carid');
        this.carTabs[2].data = { carId };
        const carCode = feature.get('carcode');
        this.carInfo.icon = require('@/assets/images/huochedong-wh.png');
        this.carInfo.title = `渣土车(${carCode})`;
        // 根据carID查询车辆信息
        this.carTabs[1].data = carId;
        getCarInfoByCarId(carId).then((info) => {
          this.carTabs[0].data = info;
          this.carOverlay.setPosition(coordinate);
          // carOverlayFeatureId = carId;
        });
      }
    },
    // 车辆弹框关闭
    closeCarOverlay() {
      this.carOverlay.setPosition(undefined);
      this.$store.state.historyTrack.map((layer) => {
        mapManager.removeLayer(layer);
      });
      this.$store.state.trackSegments = [];
      mapManager.getTrackLayer().getSource().clear();
      mapManager.getAllTrackLayer().getSource().clear();
      errRecord.methods.closeOverlay();
    },
    /**
     * 关闭播放条
     * @return {[type]} [description]
     */
    closePlayerBar() {
      mapManager.getTrackPointLayer().getSource().clear();
      this.$store.commit('setPlayerBarShow', false);
    },
    /**
     * 播放条值发生改变监听事件
     * @return {[type]} [description]
     */
    onPlayBarValueChange(currentValue) {
      // 获取当前轨迹trackList
      const trackList = this.playerBarOptions.track;
      // 将当前轨迹点显示在地图上
      if (trackList && trackList.length > 1) {
        const point = findPosition(currentValue, trackList);
        // let pointTo = findPosition(currentValue + 1000, trackList);
        // const angle = getAngle(point, pointTo);
        const feature = genPointByCoord([Number(point.cCoordinatex), Number(point.cCoordinatey)]);
        if (this.playerBarOptions.carInfo) {
          const { carInfo } = this.playerBarOptions;
          const { carType } = carInfo;
          feature.set('carType', carType);
        }
        if (this.playerBarOptions.trackInfo) {
          const { trackInfo } = this.playerBarOptions;
          const { violate } = trackInfo;
          feature.set('type', violate);
        }
        // feature.set('angle', angle);
        trackPointLayer = mapManager.getTrackPointLayer();
        trackPointLayer.getSource().clear();
        trackPointLayer.getSource().addFeature(feature);
      }
    },
  },
  computed: {
    ...mapState([
      'isPlayerBarShow',
      'playerBarOptions',
      'historyTrack',
    ]),
    getSelectState(carState) {
      return function (carState) {
        return this.selectedStates.includes(carState) ? selectedImg : unselectedImg;
      };
    },
  },
};
</script>

<style scoped lang="stylus">
.index
  width 100%
  height 100%
  #map
    position relative
  .search
    position absolute
    top 20px
    left 20px
    z-index 2
  .ctrl-panel
    position: absolute;
    top 8px
    right 10px
    padding 20px 15px
    background-color rgba(255, 255, 255, 1)
    border solid 1px rgba(221, 221, 221, 1)
    z-index 99
    box-sizing border-box
    font-size 13px
    .ctrl-panel-item
      display flex
      align-items center
      margin-bottom 12px
      height 18px
      &:last-child
        margin-bottom 0
      .ctrl-panel-item-checkbox
        margin-right 18px
        display flex
        align-items center
        cursor pointer
      .ctrl-panel-item-middle
        display flex
        width 100px
        flex none
        .ctrl-panel-item-icon
          margin-right 5px
          display flex
          align-items center
      .ctrl-panel-item-num
        width 35px
        flex none
</style>
