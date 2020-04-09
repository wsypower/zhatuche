<template>
  <div class="bind-car-page">
    <div class="bind-car-page-header">
      <a-input-search
        placeholder="请输入车辆名称"
        v-model="searchContent"
        @search="onSearch"
        enterButton="搜索"
      />
    </div>
    <div class="bind-car-page-body">
      <div class="spin-panel" flex="main:center cross:center" v-if="showLoading">
        <a-spin tip="数据加载中..."></a-spin>
      </div>
      <my-scroll v-if="!showLoading&&treeData.length>0">
        <a-tree
          checkable
          v-model="checkedKeys"
          :treeData="treeData"
          :expandedKeys.sync = "expandedKeys"
          :autoExpandParent="autoExpandParent"
          @expand="onExpand"
          @check="onCheck"
        >
          <a-icon slot="switcherIcon" type="down" />
          <template slot="title" slot-scope="{ title }">
            <span v-if="title.indexOf(searchValue) > -1">
              {{ title.substr(0, title.indexOf(searchValue)) }}
              <span style="color: #f50">{{ searchValue }}</span>
              {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
            </span>
            <span v-else>{{ title }}</span>
          </template>
        </a-tree>
      </my-scroll>
      <div v-if="!showLoading && treeData.length == 0" class="nodata-panel" flex="main:center cross:center">
        <img src="../../../assets/images/zanwudata.png" />
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  name: 'bindcar',
  props: {
    type: {
      type: String,
      default: '',
    },
    areaId: {
      type: String,
      default: '',
    },
    bindCarIdArr: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      searchValue: '',
      searchContent: '',
      showLoading: false,
      autoExpandParent: true,
      checkedKeys: [],
      expandedKeys: [],
      treeData: [],
      carListData: [],
    };
  },
  computed: {
    totalSize() {
      return this.carListData.length;
    },
  },
  watch: {
    areaId(value) {
      console.log(`changed areaId:${value}`);
      this.searchContent = '';
      this.checkedKeys = [];
      this.expandedKeys = [];
      this.treeData = [];
      this.carListData = [];
      this.getCarTreeData();
    },
  },
  mounted() {
    this.getCarTreeData();
  },
  methods: {
    // 获取所有区域数据
    getCarTreeData() {
      this.showLoading = true;
      this.treeData = [
        {
          title: '全部',
          key: '0-0',
          isLeaf: false,
          children: [
            {
              title: '公司公司A',
              key: '0-0-0',
              isLeaf: false,
              children: [
                { title: 'A车辆1', key: '0-0-0-0', isLeaf: true },
                { title: 'C车辆2', key: '0-0-0-1', isLeaf: true },
                { title: 'D车辆3', key: '0-0-0-2', isLeaf: true },
              ],
            },
            {
              title: '公司公司B',
              key: '0-0-1',
              isLeaf: false,
              children: [
                { title: 'T车辆1', key: '0-0-1-0', isLeaf: true },
                { title: 'G车辆2', key: '0-0-1-1', isLeaf: true },
                { title: 'B车辆3', key: '0-0-1-2', isLeaf: true },
              ],
            },
            {
              title: '公司公司C',
              key: '0-0-2',
              isLeaf: false,
              children: [
                { title: 'K车辆1', key: '0-0-2-0', isLeaf: true },
                { title: 'Z车辆2', key: '0-0-2-1', isLeaf: true },
                { title: 'X车辆3', key: '0-0-2-2', isLeaf: true },
              ],
            },
            {
              title: '公司公司D',
              key: '0-0-3',
              isLeaf: false,
              children: [
                { title: 'D车辆1', key: '0-0-3-0', isLeaf: true },
                { title: 'C车辆2', key: '0-0-3-1', isLeaf: true },
                { title: 'J车辆3', key: '0-0-3-2', isLeaf: true },
              ],
            },
            {
              title: '公司公司E',
              key: '0-0-4',
              isLeaf: false,
              children: [
                { title: '车辆1', key: '0-0-4-0', isLeaf: true },
                { title: '车辆2', key: '0-0-4-1', isLeaf: true },
                { title: '车辆3', key: '0-0-4-2', isLeaf: true },
              ],
            },
            {
              title: '公司公司F',
              key: '0-0-5',
              isLeaf: false,
              children: [
                { title: '车辆1', key: '0-0-5-0', isLeaf: true },
                { title: '车辆2', key: '0-0-5-1', isLeaf: true },
                { title: '车辆3', key: '0-0-5-2', isLeaf: true },
              ],
            },
          ],
        },
      ];
      this.carListData = [];
      this.getCarListData(this.treeData);
      this.treeData[0].title = `全部(${this.totalSize})`;
      this.checkedKeys = [...this.bindCarIdArr];
      this.expandedKeys = [...this.bindCarIdArr];
      setTimeout(() => {
        this.showLoading = false;
      }, 1000);
    },
    // 查询后直接筛选数据，不走后端接口调用
    onSearch(val) {
      if (val.trim() === '') {
        return;
      }
      this.expandedKeys = [];
      this.searchValue = val;
      this.carListData.forEach((item) => {
        if (item.title.indexOf(val) >= 0) {
          this.expandedKeys.push(item.key);
        }
      });
      this.autoExpandParent = true;
      // if (this.expandedKeys.length === 0) {
      //   this.showTree = false;
      // } else {
      //   this.showTree = true;
      // }
    },
    // 展开时触发
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    // 点击树中复选框时触发
    onCheck() {
      // checkedKeys中存在父节点，需要过滤
      console.log('carListData', this.carListData);
      const checkedId = [];
      this.checkedKeys.forEach((key) => {
        if (this.carListData.some(item => item.key === key)) {
          checkedId.push(key);
        }
      });
      this.$emit('getBindCarIdData', checkedId);
    },
    // 获取所有叶子节点（车辆信息）
    getCarListData(arr) {
      const _this = this;
      arr.forEach((item) => {
        if (item.isLeaf) {
          item.scopedSlots = { title: 'title' };
          _this.carListData.push(item);
        } else {
          _this.getCarListData(item.children);
        }
      });
    },
  },
};
</script>
<style lang="stylus" scoped>
  .bind-car-page{
    width: 100%;
    height: 100%;
    padding: 0px 20px 20px 20px;
    .bind-car-page-header{
      /deep/.ant-btn{
        border-radius: 0px;
      }
      /deep/.ant-input{
        border-radius: 0px;
      }
    }
    .bind-car-page-body{
      background-color: #f5f5f5;
      width: 100%;
      margin-top: 20px;
      padding: 5px 0px 5px 5px;
      height: calc(100% - 105px);
      /deep/.ant-tree-switcher-icon{
        font-size: 14px;
      }
      .spin-panel, .nodata-panel{
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
