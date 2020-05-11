<template>
  <div class="area-page">
    <div class="area-page-header" flex="dir:left">
      <a-input-search
        placeholder="请输入区域"
        v-model="searchContent"
        @search="onSearch"
        enterButton="搜索"
      />
      <a-button type="primary" class="margin-left" @click="addArea">新增</a-button>
    </div>
    <div class="area-page-body">
      <my-scroll>
        <div class="area-page-body-total" flex="dir:left cross:center main:justify">
          <div class="total-left">
            <a-checkbox :indeterminate="indeterminate" @change="onCheckAllChange" v-model="checkAll"></a-checkbox>
            <span class="box-label">全部区域({{totalSize}})</span>
          </div>
          <a-icon type="delete" @click="deleteCheckedArea"/>
        </div>
        <div class="area-page-body-item"
             flex="dir:left cross:center main:justify"
             v-for="(area, index) in areaList" :key="index" v-show="area.areaName.indexOf(content)>=0">
          <div class="item-left">
            <a-checkbox @change="onCheckChange(index)" v-model="area.checked"></a-checkbox>
            <span class="box-label" @click="showItemLayer(index)">{{area.areaName}}{{area.speed}}</span>
          </div>
          <span class="text-btn" v-if="typeNumber!==4" @click="openBindCarPage(area.areaId, area.areaName,area.carIdList)">绑定({{area.carIdList.length}})</span>
          <span class="opt-btns">
            <a-icon type="edit" @click="editItem(index)"/>
            <a-popconfirm title="确定删除此区域吗？" okText="是" cancelText="否" @confirm="deleteItem(index)">
              <a-icon type="delete"/>
            </a-popconfirm>
          </span>
        </div>
      </my-scroll>
    </div>
    <add-edit-dialog :visible.sync="addEditDialogVisible"
                     :dialogTitle="modalTitle"
                     :areaObj="areaInfo"
                     :editType="typeNumber"
                     :optType="optType"
                     @refreshList="getAreaListData">
    </add-edit-dialog>
  </div>
</template>
<script type="text/ecmascript-6">
import { mapState } from 'vuex';
import { getAreaOrLineList, deleteAreaOrLine } from '@/api/vrules';
import { getFeaturesByIds, getFeatures } from '@/api/mapService';
import { editStyle, showItemStyle } from '@/util/util.map.style';
import AddEditDialog from './addeditdialog.vue';

export default {
  name: 'areaset',
  components: {
    AddEditDialog,
  },
  props: {
    typeNumber: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      content: '',
      searchContent: '',
      indeterminate: false,
      checkAll: false,
      areaList: [],
      // 新增/编辑弹窗
      optType: 'add',
      addEditDialogVisible: false,
      areaInfo: {},
      ids: null,
      allDataLayer: null,
      itemLayer: null,
      partDataLayer: null,
    };
  },
  computed: {
    ...mapState([
      'mapManager',
    ]),
    modalTitle() {
      if (this.optType === 'add') {
        return this.typeNumber === 1 || this.typeNumber === 4 ? '新增区域' : '新增路段';
      }
      return this.typeNumber === 1 || this.typeNumber === 4 ? '编辑区域' : '编辑路段';
    },
    totalSize() {
      const num = this.areaList.reduce((acc, item, arr) => {
        if (item.areaName.indexOf(this.content) >= 0) {
          acc += 1;
        }
        return acc;
      }, 0);
      return num;
    },
  },
  watch: {
    areaList: {
      handler(newObj, oldObj) {
        console.log('handler');
        const num = newObj.reduce((acc, item, arr) => {
          if (item.checked) {
            acc += 1;
          }
          return acc;
        }, 0);
        if (num > 0 && num < this.totalSize) {
          this.indeterminate = true;
          this.checkAll = false;
        } else {
          this.indeterminate = false;
          if (num === this.totalSize) {
            this.checkAll = true;
          } else {
            this.checkAll = false;
          }
        }
      },
      deep: true,
    },
    // addEditDialogVisible(val) {
    //   // this.updataMap();
    // },
  },
  mounted() {
    this.getAreaListData();
  },
  methods: {
    // 获取所有区域数据
    getAreaListData() {
      const _this = this;
      getAreaOrLineList({ type: this.typeNumber, name: this.searchContent }).then((data) => {
        this.areaList = data;
        console.log('areaList', this.areaList);
        this.areaList.map((item) => {
          item.checked = true;
          item.type = this.typeNumber;
          return item;
        });
        _this.updataMap();
        // if (data.length > 0) {
        //   this.ids = '(';
        //   for (let i = 0; i < data.length; i++) {
        //     this.ids += `'${data[i].locationId}'`;
        //     if (i + 1 < data.length) {
        //       this.ids += ',';
        //     }
        //   }
        //   this.ids += ')';
        // }
        // // 获取所有区域图形
        // getFeaturesByIds(this.ids, _this.typeNumber).then((data) => {
        //   _this.allDataLayer = _this.mapManager.addVectorLayerByFeatures(data, editStyle(), 2);
        //   _this.mapManager.getMap().getView().fit(_this.allDataLayer.getSource().getExtent());
        // });
      });
    },
    // 搜索
    onSearch() {
      console.log(`searchContent: ${this.searchContent}`);
      // this.content = this.searchContent.trim();
      this.getAreaListData();
    },
    // 全选
    onCheckAllChange() {
      console.log(`checkAll: ${this.checkAll}`);
      if (this.checkAll) {
        this.areaList.forEach((item, index) => {
          item.checked = true;
          this.$set(this.areaList, index, item);
        });
      } else {
        this.areaList.forEach((item, index) => {
          item.checked = false;
          this.$set(this.areaList, index, item);
        });
      }
      this.updataMap();
    },
    // 删除选中的区域
    deleteCheckedArea() {
      let checkedAreaId = '';
      this.areaList.forEach((item, index) => {
        if (item.checked) {
          checkedAreaId = `${checkedAreaId},${item.areaId}`;
        }
      });
      if (checkedAreaId.trim().length > 0) {
        checkedAreaId = checkedAreaId.substring(1);
        console.log('checkedAreaId', checkedAreaId);
        const deleteObj = {
          type: this.typeNumber,
          ids: checkedAreaId,
        };
        deleteAreaOrLine(deleteObj).then((data) => {
          if (data.code === 0) {
            this.$message.success('删除成功！！！');
            this.getAreaListData();
          } else {
            this.$message.error('删除失败！！！');
          }
        });
      } else {
        this.$message.warning('请至少选择一个区域进行删除！！！');
      }
    },
    // 一个区域的复选框选中状态改变
    onCheckChange(index) {
      const _this = this;
      console.log('index', index);
      this.$set(this.areaList, index, this.areaList[index]);
      console.log('this.areaList', this.areaList);
      this.updataMap();
    },
    // 区域复选框选中状态变化时改变地图显示区域
    updataMap() {
      const _this = this;
      _this.itemLayer && _this.itemLayer.getSource().clear();
      // 勾选发生变化后更新地图数据
      this.ids = '(';
      let count = 0;
      for (let i = 0; i < this.areaList.length; i++) {
        if (this.areaList[i].checked) {
          count += 1;
          this.ids += `'${this.areaList[i].locationId}',`;
        }
      }
      if (count > 0) {
        this.ids = this.ids.substring(0, this.ids.length - 1);
        this.ids += ')';
        // 获取所有区域图形
        getFeaturesByIds(this.ids, this.typeNumber).then((data) => {
          if (_this.allDataLayer) {
            _this.allDataLayer.getSource().clear();
            _this.allDataLayer.getSource().addFeatures(data);
          } else {
            _this.allDataLayer = _this.mapManager.addVectorLayerByFeatures(data, editStyle(), 2);
            _this.allDataLayer.set('layerType', _this.typeNumber);
          }
          _this.mapManager.getMap().getView().fit(_this.allDataLayer.getSource().getExtent());
        });
      }
    },
    // 新增区域
    addArea() {
      console.log('add area');
      this.optType = 'add';
      this.areaInfo = {
        type: this.typeNumber,
      };
      this.addEditDialogVisible = true;
    },
    // 编辑某个区域
    editItem(index) {
      console.log('edit area', this.areaList[index]);
      this.optType = 'edit';
      this.areaInfo = this.areaList[index];
      this.addEditDialogVisible = true;
    },
    // 删除某个区域
    deleteItem(index) {
      console.log('delete area', this.areaList[index]);
      const deleteObj = {
        type: this.typeNumber,
        ids: this.areaList[index].areaId,
      };
      deleteAreaOrLine(deleteObj).then((data) => {
        if (data.code === 0) {
          this.$message.success('删除成功！！！');
          this.getAreaListData();
        } else {
          this.$message.error('删除失败！！！');
        }
      });
    },
    // 显示某个区域
    showItemLayer(index) {
      const mapId = this.areaList[index].locationId;
      const _this = this;
      _this.itemLayer && _this.itemLayer.getSource().clear();
      getFeatures(mapId, this.typeNumber).then((points) => {
        _this.itemLayer = _this.mapManager.addVectorLayerByFeatures(points[0], showItemStyle(), 5);
        _this.mapManager.getMap().getView().fit(_this.itemLayer.getSource().getExtent());
      });
    },
    // 打开绑定车辆页面
    openBindCarPage(areaId, areaName, bindCarIdArr) {
      const data = {
        type: this.typeNumber,
        bindCarIdArr,
        areaId,
        areaName,
      };
      console.log('openBindCarPage data', data);
      this.$emit('openBindCarPage', data);
    },
  },
};
</script>
<style lang="scss">
  .modalwrap{
    top:10px;
    left:10px;
    height: calc(100% - 80px);
    width: calc(100% - 20px);
    .ant-modal-content {
      height: 100%;
    }
    .ant-collapse-header {
      .anticon {
        color: #00a4fe;
      }
    }
    .ant-modal-footer {
      text-align: center;
    }
  }
</style>
<style lang="scss" scoped>
.area-page{
  width: 100%;
  height: 100%;
  .area-page-header{
    padding: 20px 0px;
    /deep/.ant-btn{
      border-radius: 0px;
    }
    /deep/.ant-input{
      border-radius: 0px;
    }
    .margin-left{
      margin-left: 8px;
    }
  }
  .area-page-body{
    background-color: #f5f5f5;
    width: 100%;
    height: calc(100% - 70px);
    .area-page-body-total{
      padding: 15px 10px 5px 15px;
      i{
        color: #999999;
        &:hover{
          color: #2b90f3;
        }
      }
      .box-label{
        margin-left: 5px;
      }
    }
    .area-page-body-item{
      padding: 5px 10px 5px 30px;
      .box-label{
        display: inline-block;
        margin-left: 5px;
        width: 120px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: middle;
      }
      .text-btn{
        font-family: PingFang-SC-Medium;
        font-size: 13px;
        color: #2b90f3;
        cursor: pointer;
        border-bottom: 1px solid transparent;
        &:hover{
          border-bottom: 1px solid #2b90f3;
        }
      }
      .opt-btns{
        width: 38px;
        i{
          display: none;
          font-size: 14px;
          color: #999999;
          cursor: pointer;
          &:hover {
            color: #2b90f3;
          }
        }
        i:last-child{
          margin-left: 10px;
        }
      }
      &:hover{
        background-color: #e8eaee;
        .opt-btns i{
          display: inline-block;
        }
      }
    }
  }
}
</style>
