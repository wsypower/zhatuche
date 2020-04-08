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
            <area-set :type="yjxs"></area-set>
          </a-tab-pane>
          <a-tab-pane tab="禁行路段" key="2">
            <area-set :type="jxld"></area-set>
          </a-tab-pane>
          <a-tab-pane tab="指定路段" key="3">
            <area-set :type="zdld"></area-set>
          </a-tab-pane>
          <a-tab-pane tab="超速限定" key="4">
            <area-set :type="csxd"></area-set>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <!-- 地图 -->
    <LayoutMap ref="olMap"></LayoutMap>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import LayoutMap from '@/views/map/olMap.vue';
import MapManager from '@/js/map/MapManager';
import { ptStyle } from '@/util/util.map.style';
import { findPosition, genPointByCoord } from '@/js/map/mapUtils';
import {
  getCarList, getCarStateCount, filterCar, getCarByCarCode, getCarInfoByCarId,
} from '@/api/service';
import AreaSet from './components/areaset.vue';

export default {
  name: 'vrules',
  components: {
    LayoutMap,
    AreaSet,
  },
  data() {
    return {
      activeTab: '1',
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
    });
  },
  methods: {
    changeTab() {

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
    .set-page
      position absolute
      top 10px
      left 10px
      bottom 10px
      width 357px
      background-color #ffffff
      box-shadow 1px 0px 10px 0px  rgba(1, 44, 104, 0.2)
      border solid 2px #ffffff
      z-index 2
      .page-header
        height 55px
        line-height 55px
        padding-left 20px
        font-family: PingFang-SC-Heavy;
        font-size: 18px;
        letter-spacing: 0px;
        color: #2b90f3;
      .page-body
        width: 100%;
        padding: 0px 20px 20px 20px;
        height: calc(100% - 55px);
        .content_tab {
          height: 100%;
          /deep/.ant-tabs-nav-scroll {
            height: 44px;
          }
          /deep/.ant-tabs-nav {
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
          /deep/.ant-tabs-bar {
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
          /deep/.ant-tabs-content {
            height: calc(100% - 45px) !important;
            .ant-tabs-tabpane {
              position: relative;
              height: 100%;
            }
          }
        }
</style>
