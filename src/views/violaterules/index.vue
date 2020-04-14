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
            <area-set type="yjxs" @openBindCarPage="openBindCarPage" @showEditTools="showEditTools('yjxs')"></area-set>
          </a-tab-pane>
          <a-tab-pane tab="禁行路段" key="2">
            <area-set type="jxld" @openBindCarPage="openBindCarPage" @showEditTools="showEditTools('jxld')"></area-set>
          </a-tab-pane>
          <a-tab-pane tab="指定路段" key="3">
            <area-set type="zdld" @openBindCarPage="openBindCarPage" @showEditTools="showEditTools('zdld')"></area-set>
          </a-tab-pane>
          <a-tab-pane tab="超速限定" key="4">
            <area-set type="csxd" @openBindCarPage="openBindCarPage" @showEditTools="showEditTools('csxd')"></area-set>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <div class="bind-page" :class="{trans: showPage}">
      <div class="page-header" @click="closeBindPage">
        << 返回
      </div>
      <bind-car :type="type" :areaId="areaId" :bindCarIdArr="bindCarIdArr" @getBindCarIdData="getBindCarIdData"></bind-car>
    </div>
    <!-- 地图 -->
    <LayoutMap ref="olMap"></LayoutMap>
    <!--编辑工具条-->
    <div class="edit-tools" v-if="showTools">
      <a-button-group>
        <a-button
          v-for="item in btnArr"
          @click="buttonClick(item.name)"
          :disabled="item.disabled"
        >
          <img :src="item.icon" alt="" class="img">
          {{item.name}}
        </a-button>
      </a-button-group>
      <!-- 输入区域信息 -->
      <div class="edit-input">
        <!-- 越界行驶 -->
        <a-card title="区域命名：" bordered="false" style="width: 250px" v-if="inputType=='yjxs'">
          <a-input size="middle" placeholder="请输入区域名称" />
        </a-card>
        <!--禁行路段-->
        <a-card title="禁行路段命名：" bordered="false" style="width: 250px" v-if="inputType=='jxld'">
          <a-input size="middle" placeholder="请输入路段名称" />
        </a-card>
        <!--指定路段-->
        <a-card title="指定路段命名：" bordered="false" style="width: 250px" v-if="inputType=='zdld'">
          <a-input size="middle" placeholder="请输入指定路段名称" />
        </a-card>
        <!--限速区域-->
        <a-card title="限速区域命名：" bordered="false" style="width: 250px" v-if="inputType=='csxd'">
          <a-input size="middle" placeholder="请输入区域名称" />
          <p style="padding: 10px;font-size: 16px">限速（公里/小时）</p>
          <a-input size="middle" placeholder="请输入限速值" />
        </a-card>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import LayoutMap from '@/views/map/olMap.vue';
import MapManager from '@/js/map/MapManager';
import { editStyle } from '@/util/util.map.style';
import { findPosition, genPointByCoord } from '@/js/map/mapUtils';
import {
  getCarList, getCarStateCount, filterCar, getCarByCarCode, getCarInfoByCarId,
} from '@/api/service';
import AreaSet from './components/areaset.vue';
import BindCar from './components/bindcar.vue';

let map;
let mapManager;
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
      // tab类型（yjxs、jxld、zdld、csxd）
      type: '',
      // 区域ID
      areaId: '',
      // 编辑时已绑定的车辆的ID数组
      bindCarIdArr: [],
      // 保存时已绑定的车辆的ID数组
      saveBindCarIdArr: [],
      // 编辑工具组
      btnArr: [
        {
          name: '标线',
          icon: require('@/assets/line.png'),
          visible: false,
          disabled: false,
        },
        {
          name: '标面',
          icon: require('@/assets/polygon.png'),
          visible: true,
          disabled: false,
        },
        {
          name: '清空',
          icon: require('@/assets/clear.png'),
          visible: false,
          disabled: false,
        },
        {
          name: '保存',
          icon: require('@/assets/save.png'),
          visible: false,
          disabled: false,
        },
      ],
      showTools: false,
      inputType: null,
      source: null,
      draw: null,
      drawFeature: {
        point: [],
        line: [],
        polygon: [],
      },
    };
  },
  computed: {
    ...mapState([
      'isPlayerBarShow',
      'playerBarOptions',
      'historyTrack',
    ]),
  },
  mounted() {
    this.$nextTick().then(() => {
      map = this.$refs.olMap.getMap();
      mapManager = new MapManager(map);
    });
  },
  methods: {
    changeTab() {
      this.showPage = false;
    },
    // 打开绑定车辆页面
    openBindCarPage(data) {
      this.type = data.type;
      this.areaId = data.areaId;
      this.bindCarIdArr = data.bindCarIdArr;
      this.showPage = true;
    },
    // 显示编辑工具条
    showEditTools(type) {
      this.showTools = true;
      this.btnArr = [
        {
          name: '标线',
          icon: require('@/assets/line.png'),
          visible: false,
          disabled: false,
        },
        {
          name: '标面',
          icon: require('@/assets/polygon.png'),
          visible: true,
          disabled: false,
        },
        {
          name: '清空',
          icon: require('@/assets/clear.png'),
          visible: false,
          disabled: false,
        },
        {
          name: '保存',
          icon: require('@/assets/save.png'),
          visible: false,
          disabled: false,
        },
      ];
      this.inputType = type;
      switch (type) {
        case 'yjxs':
          this.btnArr.splice(0, 1);
          break;
        case 'jxld':
          this.btnArr.splice(1, 1);
          break;
        case 'zdld':
          this.btnArr.splice(1, 1);
          break;
        case 'csxd':
          break;
        default:
          break;
      }
    },
    // 编辑按钮事件
    buttonClick(name) {
      switch (name) {
        case '标线':
          this.drawEndFeature('LineString');
          break;
        case '标面':
          this.drawEndFeature('Polygon');
          break;
        case '清空':
          mapManager.inactivateDraw(this.draw);// 取消绘制
          this.$confirm({
            title: '是否确定清空当前所有图形?',
            content: '当前操作将会清空地图上所有绘制的图形',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
              console.log('ok');
            },
            onCancel() {
              console.log('Cancel');
            },
          });
          break;
        case '保存':
          this.showTools = false;
          mapManager.inactivateDraw(this.draw);// 取消绘制
          console.log(this.drawFeature);
          break;
        default:
          break;
      }
    },
    // 绘制完毕事件
    drawEndFeature(type) {
      const drawItem = mapManager.activateDraw(this.draw, type, this.source, editStyle());
      this.draw = drawItem[0];
      this.source = drawItem[1];
      const _this = this;
      this.draw.on('drawend', (e) => {
        const { feature } = e;
        const geoType = feature.getGeometry().getType();
        if (geoType == 'Point') {
          _this.drawFeature.point.push(feature);
        } else if (geoType == 'LineString') {
          _this.drawFeature.line.push(feature);
        } else if (geoType == 'Polygon') {
          _this.drawFeature.polygon.push(feature);
        }
      });
    },
    // 获取此区域绑定的车辆ID数组
    getBindCarIdData(data) {
      this.saveBindCarIdArr = data;
    },
    // 关闭绑定车辆页面
    closeBindPage() {
      // 调取接口保存绑定车辆数据
      console.log('保存接口所需入参');
      console.log(`type: ${this.type}`);
      console.log(`areaId: ${this.areaId}`);
      console.log('saveBindCarIdArr', this.saveBindCarIdArr);
      this.showPage = false;
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
  .edit-tools
    position absolute
    top 10px
    right 20px
    z-index 10
    .img
      width 18px
      height 18px
      margin-right 5px
  .edit-input
    position absolute
    top 40px
    right 2px
    z-index 10
  /deep/ .ant-card-body{
    padding 0 12px 12px 12px
  }
  /deep/ .ant-card-head-title{
    padding 8px 0
  }
  /deep/ .ant-card-head{
    min-height 24px
    border-bottom 0
  }
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
      line-height: 55px;
      padding-left: 20px;
      font-family: PingFang-SC-Heavy;
      font-size: 14px;
      color: #2b90f3;
      cursor: pointer;
    }
  }

</style>
