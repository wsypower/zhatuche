<template>
  <div class="page">
    <!-- 违规配置页面 -->
    <div class="set-page">
      <div class="page-header">
        配置搜索
      </div>
      <div class="page-body">
        <a-tabs v-model="activeTab" @change="changeTab" class="content_tab">
          <a-tab-pane tab="越界行驶" key="1">
            <area-set ref="yjxs" :typeNumber="1"
                      @openBindCarPage="openBindCarPage"></area-set>
          </a-tab-pane>
          <a-tab-pane tab="禁行路段" key="2">
            <area-set ref="jxld" :typeNumber="2" @openBindCarPage="openBindCarPage"></area-set>
          </a-tab-pane>
          <a-tab-pane tab="指定路段" key="3">
            <area-set ref="zdld" :typeNumber="3" @openBindCarPage="openBindCarPage"></area-set>
          </a-tab-pane>
          <a-tab-pane tab="超速限定" key="4">
            <area-set ref="csxd" :typeNumber="4" @openBindCarPage="openBindCarPage"></area-set>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <div class="bind-page" :class="{trans: showPage}">
      <div class="page-header" flex="dir:left cross:center main:justify">
        <span @click="closeBindPage"><< 保存并返回</span>
        <span>{{areaName}}</span>
      </div>
      <bind-car :typeNumber="typeNumber" :areaId="areaId"
                :bindCarIdArr="bindCarIdArr"
                @getBindCarIdData="getBindCarIdData"></bind-car>
    </div>
    <!-- 地图 -->
    <LayoutMap ref="olMap"></LayoutMap>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import LayoutMap from '@/views/map/olMap.vue';
import MapManager from '@/js/map/MapManager';
import { saveBindCarsList } from '@/api/vrules';
import AreaSet from './components/areaset.vue';
import BindCar from './components/bindcar.vue';

let map;
export default {
  name: 'vrules',
  components: {
    LayoutMap,
    AreaSet,
    BindCar,
  },
  data() {
    return {
      activeTab: '1',
      // 是否展示绑定车辆页
      showPage: false,
      // tab类型（yjxs1、jxld2、zdld3、csxd4）
      typeNumber: 0,
      // 区域ID
      areaId: '',
      // 区域名称
      areaName: '',
      // 编辑时已绑定的车辆的ID数组
      bindCarIdArr: [],
      // 保存时已绑定的车辆的ID数组
      saveBindCarIdArr: [],
    };
  },
  computed: {
    ...mapState([
      'mapManager',
    ]),
  },
  mounted() {
    this.$nextTick().then(() => {
      // map = this.$refs.olMap.getMap();
      // console.log('map', map);
      // this.mapManager = new MapManager(map);
      // console.log('mapManager', this.mapManager);
    });
  },
  methods: {
    changeTab(val) {
      console.log('页面切换', val);
      this.showPage = false;
      // 清除图层
      const layers = this.mapManager.getMap().getLayers().array_;
      const cloneLayer = [...layers];
      const _this = this;
      cloneLayer.forEach((l) => {
        if (l.get('layerType')) {
          if (val == 1) {
            if (l.get('layerType') == '1') {
              l.setVisible(true);
              _this.mapManager.getMap().getView().fit(l.getSource().getExtent());
            } else {
              l.setVisible(false);
            }
          } else if (val == 2) {
            if (l.get('layerType') == '2') {
              l.setVisible(true);
              _this.mapManager.getMap().getView().fit(l.getSource().getExtent());
            } else {
              l.setVisible(false);
            }
          } else if (val == 3) {
            if (l.get('layerType') == '3') {
              l.setVisible(true);
              _this.mapManager.getMap().getView().fit(l.getSource().getExtent());
            } else {
              l.setVisible(false);
            }
          } else if (val == 4) {
            if (l.get('layerType') == '4') {
              l.setVisible(true);
              _this.mapManager.getMap().getView().fit(l.getSource().getExtent());
            } else {
              l.setVisible(false);
            }
          }
        }
      });
    },
    // 打开绑定车辆页面
    openBindCarPage(data) {
      console.log('openBindCarPage');
      // 如果同一个区域绑定按钮反复点击,则绑定页自动收起展开
      if (this.areaId === data.areaId) {
        this.showPage = !this.showPage;
      } else {
        this.typeNumber = data.type;
        this.areaId = data.areaId;
        this.areaName = data.areaName;
        this.bindCarIdArr = data.bindCarIdArr;
        this.showPage = true;
      }
    },
    // 获取此区域绑定的车辆ID数组
    getBindCarIdData(data) {
      this.saveBindCarIdArr = data;
    },
    // 关闭绑定车辆页面
    closeBindPage() {
      // 调取接口保存绑定车辆数据
      console.log('保存接口所需入参');
      console.log(`type: ${this.typeNumber}`);
      console.log(`areaId: ${this.areaId}`);
      console.log('saveBindCarIdArr', this.saveBindCarIdArr);
      const params = {
        carIds: this.saveBindCarIdArr.join(','),
        areaId: this.areaId,
      };
      saveBindCarsList(params).then((data) => {
        if (data.code === 0) {
          this.$message.success('绑定成功！！！');
          this.showPage = false;
          const tabArr = ['yjxs', 'jxld', 'zdld', 'csxd'];
          this.$refs[tabArr[this.typeNumber - 1]].getAreaListData();
        } else {
          this.$message.error('绑定失败，请检查！！！');
        }
      });
    },
  },
};
</script>

<style scoped lang="stylus">
  .page
    width 100%
    height 100%
    #map
      position relative
</style>
<style lang="scss" scoped>
  .set-page {
    position: absolute;
    top: 10px;
    left: 10px;
    bottom: 10px;
    width: 357px;
    background-color: #ffffff;
    box-shadow: 1px 0px 10px 0px rgba(1, 44, 104, 0.2);
    border: solid 2px #ffffff;
    z-index: 2;
    .page-header {
      height: 55px;
      line-height: 55px;
      padding-left: 20px;
      font-family: PingFang-SC-Heavy;
      font-size: 18px;
      letter-spacing: 0px;
      color: #2b90f3;
    }
    .page-body {
      width: 100%;
      padding: 0px 20px 20px 20px;
      height: calc(100% - 55px);
      .content_tab {
        height: 100%;
        /deep/ .ant-tabs-nav-scroll {
          height: 44px;
        }
        /deep/ .ant-tabs-nav {
          border: 1px solid #dddddd;
          .ant-tabs-tab {
            padding: 10px;
            font-size: 14px !important;
            color: #333333;
            border-right: solid 1px #dddddd;
            &:last-child {
              border-right: unset;
            }
          }
          .ant-tabs-tab-active {
            background-color: #ffffff;
          }
          .ant-tabs-ink-bar {
            top: 0px;
          }
        }
        /deep/ .ant-tabs-bar {
          background-color: #f5f7f8 !important;
          margin-bottom: 0px !important;
          padding: 0px !important;
          .ant-tabs-nav {
            width: 100%;
            .ant-tabs-tab {
              width: 25% !important;
              text-align: center;
              margin: 0px;
            }
          }
        }
        /deep/ .ant-tabs-content {
          height: calc(100% - 45px) !important;
          .ant-tabs-tabpane {
            position: relative;
            height: 100%;
          }
        }
      }
    }
  }
  .bind-page{
    position: absolute;
    top: 10px;
    left: 367px;
    bottom: 10px;
    width: 278px;
    background-color: #ffffff;
    border: solid 2px #ffffff;
    z-index: 1;
    transform: translateX(-300px);
    transition: all 0.6s;
    &.trans{
      box-shadow: 1px 0px 10px 0px rgba(1, 44, 104, 0.2);
      transform: translateX(0px);
    }
    .page-header {
      height: 55px;
      padding: 0px 20px;
      span{
        font-family: PingFang-SC-Heavy;
        font-size: 14px;
        &:first-child{
          color: #2b90f3;
          cursor: pointer;
        }
      }
    }
  }
</style>
