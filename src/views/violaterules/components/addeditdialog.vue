<template>
    <a-modal :title="modalTitle"
             v-model="addEditDialogVisible"
             wrapClassName="modalwrap"
             width="100%"
             style="paddingBottom: 0px;margin: 0px;height: 100%;top:0px"
             :bodyStyle="{height:'calc(100% - 108px)',padding:'0'}"
             okText="保存"
             cancelText="取消"
             :centered="true"
             :maskClosable="false"
             :destroyOnClose="true"
             @ok="handleSave">
      <!-- 地图 -->
      <LayoutMap ref="editMap"></LayoutMap>
      <!--编辑工具条-->
      <div class="edit-tools">
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
          <a-card title="区域命名：" style="width: 250px" v-if="editType==1">
            <a-input v-model="areaName" placeholder="请输入区域名称" />
          </a-card>
          <!--禁行路段-->
          <a-card title="禁行路段命名：" style="width: 250px" v-if="editType==2">
            <a-input v-model="areaName" placeholder="请输入路段名称" />
          </a-card>
          <!--指定路段-->
          <a-card title="指定路段命名：" style="width: 250px" v-if="editType==3">
            <a-input v-model="areaName" placeholder="请输入指定路段名称" />
          </a-card>
          <!--限速区域-->
          <a-card title="限速区域命名：" style="width: 250px" v-if="editType==4">
            <a-input v-model="areaName" placeholder="请输入区域名称" />
            <p style="padding: 10px;font-size: 16px">限速（公里/小时）</p>
            <!--<a-input size="middle" placeholder="请输入限速值" />-->
            <a-input-number id="inputNumber" :min="0" v-model="limitSpeed" />
          </a-card>
        </div>
      </div>
    </a-modal>
</template>
<script type="text/ecmascript-6">
import LayoutMap from '@/views/violaterules/map/olMap.vue';
import MapManager from '@/js/map/MapManager';
import { editStyle } from '@/util/util.map.style';
import { addEditAreaOrLine } from '@/api/vrules';
import { postFeatures, getFeatures } from '@/api/mapService';

let map;
let mapManager;
export default {
  name: 'addEditDialog',
  components: {
    LayoutMap,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
      default: '新增区域',
    },
    areaObj: {
      type: Object,
      default() {
        return {};
      },
    },
    editType: {
      type: Number,
      default: 1,
    },
    updataLayer: null,
  },
  data() {
    return {
      addEditDialogVisible: false,
      // 编辑工具组
      btnArr: null,
      source: null,
      draw: null,
      drawFeature: {
        point: {
          add: [],
          delete: [],
        },
        line: {
          add: [],
          delete: [],
        },
        polygon: {
          add: [],
          delete: [],
        },
      },
      areaName: null,
      limitSpeed: null,
      mapId: null,
      failCount: 0,
      optType: null,
    };
  },
  computed: {
  },
  created() {
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
      // {
      //   name: '保存',
      //   icon: require('@/assets/save.png'),
      //   visible: false,
      //   disabled: false,
      // },
    ];
    switch (this.editType) {
      case 1:
        this.btnArr.splice(0, 1);
        break;
      case 2:
        this.btnArr.splice(1, 1);
        break;
      case 3:
        this.btnArr.splice(1, 1);
        break;
      case 4:
        break;
      default:
        break;
    }
  },
  mounted() {},
  watch: {
    addEditDialogVisible(val) {
      if (val) {
        this.init();
      } else {
        this.$emit('update:visible', false);
      }
    },
    visible(val) {
      if (val) {
        this.addEditDialogVisible = true;
      }
    },
  },
  methods: {
    init() {
      this.$nextTick().then(() => {
        map = this.$refs.editMap.getMap();
        mapManager = new MapManager(map);
        this.mapId = this.generateUUID().replace(/-/g, '');
        this.areaName = this.areaObj.areaName;
        // 编辑状态,将已保存的数据gis数据显示出来
        const _this = this;
        if(this.areaObj.areaId) {
          getFeatures(this.areaObj.locationId, this.editType).then((points) => {
            _this.initFeatures = points[0];
            if (points[0].length > 0) {
              _this.optType = 'update';
              _this.updateLayer = mapManager.addVectorLayerByFeatures(points[0], editStyle(), 2);
              map.getView().fit(_this.updateLayer.getSource().getExtent());
            } else {
              _this.optType = 'add';
            }
            _this.updateData = points[1];
          });
        }
      });
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
          const _this=this;
          this.$confirm({
            title: '是否确定清空当前所有图形?',
            content: '当前操作将会清空地图上所有绘制的图形',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
              _this.updateLayer && _this.updateLayer.getSource().clear();
              _this.source && _this.source.clear();
              _this.drawFeature = {
                point: {
                  add: [],
                  delete: _this.updateData.point ? _this.updateData.point : [],
                },
                line: {
                  add: [],
                  delete: _this.updateData.line ? _this.updateData.line : [],
                },
                polygon: {
                  add: [],
                  delete: _this.updateData.polygon ? _this.updateData.polygon : [],
                },
              };
            },
            onCancel() {
              console.log('Cancel');
            },
          });
          break;
        // case '保存':
        //   mapManager.inactivateDraw(this.draw);// 取消绘制
        //   console.log('uuid', this.generateUUID().replace(/-/g, ''));
        //   console.log(this.drawFeature);
        //   this.mapDataSave();
        //   break;
        default:
          break;
      }
    },
    // 绘制事件
    drawEndFeature(type) {
      const drawItem = mapManager.activateDraw(this.draw, type, this.source, editStyle());
      this.draw = drawItem[0];
      this.source = drawItem[1];
      const _this = this;
      this.draw.on('drawend', (e) => {
        const { feature } = e;
        feature.set('id', _this.mapId);
        feature.set('type', _this.editType);
        const geoType = feature.getGeometry().getType();
        if (geoType == 'Point') {
          _this.drawFeature.point.add.push(feature);
        } else if (geoType == 'LineString') {
          _this.drawFeature.line.add.push(feature);
        } else if (geoType == 'Polygon') {
          _this.drawFeature.polygon.add.push(feature);
        }
      });
    },
    // 保存地图数据
    mapDataSave() {
      // if (this.drawFeature.point.add.length > 0 || this.drawFeature.point.delete.length > 0) {
      //   this.postData('Point', this.drawFeature.point);
      // }
      if (this.drawFeature.line.add.length > 0 || this.drawFeature.line.delete.length > 0) {
        this.postData('LineString', this.drawFeature.line);
      }
      if (this.drawFeature.polygon.add.length > 0 || this.drawFeature.polygon.delete.length > 0) {
        this.postData('Polygon', this.drawFeature.polygon);
      }
      // if (this.failCount > 0) {
      //   this.$message.error('保存失败，请重试！');
      // } else {
      //   // this.$message.success('保存成功！');
      // }
    },
    // 推送图形数据到gis数据库
    postData(type, data) {
      const _this = this;
      postFeatures(type, data, this.optType).then((res) => {
        const xmlDoc = (new DOMParser()).parseFromString(res.data, 'text/xml');
        const insertNum = xmlDoc.getElementsByTagName('wfs:totalInserted')[0].textContent;
        const deleteNum = xmlDoc.getElementsByTagName('wfs:totalDeleted')[0].textContent;
        if (insertNum > 0 || deleteNum > 0) {
          console.log('===保存成功====');
        } else {
          _this.failCount += 1;
        }
      });
    },
    handleSave(e) {
      console.log('确定保存');
      console.log(e);
      this.mapDataSave();
      mapManager.inactivateDraw(this.draw);// 取消绘制
      if (this.failCount > 0) {
        this.$message.error('图形数据保存失败，请重试！');
      } else {
        // this.$message.success('保存成功！');
        const tempArea = {
          id: '',
          type: this.areaObj.type,
          locationId: '',
          name: '',
          speed: '',
        };
        // 通过areaId判断是新增还是编辑
        if (this.areaObj.areaId) {
          tempArea.id = this.areaObj.areaId;
          tempArea.locationId = this.mapId;
          tempArea.name = this.areaName;
        } else {
          tempArea.locationId = this.mapId;
          tempArea.name = this.areaName;
        }
        addEditAreaOrLine(tempArea).then((data) => {
          if (data.code === 0) {
            this.$message.success('保存成功！！！');
            this.addEditDialogVisible = false;
            this.$emit('refreshList');
          } else {
            this.$message.error('区域名称保存失败，请检查！！！');
          }
        });
      }
    },
    // 生成地图唯一标识
    generateUUID() {
      let d = new Date().getTime();
      if (window.performance && typeof window.performance.now === 'function') {
        d += performance.now(); // use high-precision timer if available
      }
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid;
    },
  },
};
</script>
<style lang="scss" scoped>
/*/deep/.ant-modal-body{*/
  /*padding: 0;*/
/*}*/
  .edit-tools{
    position: absolute;
    top: 80px;
    right: 20px;
    z-index: 100;
  }
.edit-input{
  position: absolute;
  top:40px;
  right:2px;
  z-index:10;
}
/deep/.ant-card-body{
  padding:0 12px 12px 12px;
}
/deep/.ant-card-head-title{
  padding:8px 0;
}
/deep/.ant-card-head{
  min-height:24px;
  border-bottom:0;
}
  /deep/.ant-input-number{
    width: 100%;
  }
</style>
