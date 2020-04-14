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
          <a-checkbox :indeterminate="indeterminate" @change="onCheckAllChange" v-model="checkAll">全部区域({{totalSize}})</a-checkbox>
          <a-icon type="delete" @click="deleteCheckedArea"/>
        </div>
        <div class="area-page-body-item"
             flex="dir:left cross:center main:justify"
             v-for="(area, index) in areaList" :key="index" v-show="area.name.indexOf(content)>=0">
          <a-checkbox @change="onCheckChange(index)" v-model="area.checked"><span class="box-label">{{area.name}}{{area.speed}}</span></a-checkbox>
          <span class="text-btn" @click="openBindCarPage(area.id,area.bindCarIdArr)">绑定({{area.bindCarIdArr.length}})</span>
          <span class="opt-btns">
            <a-icon type="edit" @click="editItem(index)"/>
            <a-popconfirm title="确定删除此区域吗？" okText="是" cancelText="否" @confirm="deleteItem(index)">
              <a-icon type="delete"/>
            </a-popconfirm>
          </span>
        </div>
      </my-scroll>
    </div>
    <a-modal :title="modalTitle"
             v-model="visible"
             wrapClassName="modalwrap"
             width="100%"
             style="paddingBottom: 0px;margin: 0px;height: 100%;top:0px"
             :bodyStyle="{height:'calc(100% - 108px)',padding:'20px'}"
             okText="保存"
             cancelText="取消"
             :centered="true"
             :maskClosable="false"
             :destroyOnClose="true"
             @ok="handleSave">
    </a-modal>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  name: 'areaset',
  props: {
    type: {
      type: String,
      default: '',
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
      visible: false,
    };
  },
  computed: {
    modalTitle() {
      if (this.optType === 'add') {
        return this.type === 'yjxs' || this.type == 'csxd' ? '新增区域' : '新增路段';
      }

      return this.type === 'yjxs' || this.type == 'csxd' ? '编辑区域' : '编辑路段';
    },
    totalSize() {
      const num = this.areaList.reduce((acc, item, arr) => {
        if (item.name.indexOf(this.content) >= 0) {
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
  },
  mounted() {
    this.getAreaListData();
  },
  methods: {
    // 获取所有区域数据
    getAreaListData() {
      this.areaList = [{
        id: '0001',
        name: '区域A',
        bindCarIdArr: ['0-0-0-2'],
        mapId: '',
      }, {
        id: '0002',
        name: '区域B',
        bindCarIdArr: ['0-0-1-2', '0-0-0-1'],
        mapId: '',
      }, {
        id: '0003',
        name: '区域C',
        bindCarIdArr: ['0-0-3-2'],
        mapId: '',
      }, {
        id: '0004',
        name: '区域D',
        bindCarIdArr: ['0-0-4-2', '0-0-0-2'],
        mapId: '',
      }, {
        id: '0005',
        name: '区域E',
        bindCarIdArr: ['0-0-2-1', '0-0-2-2', '0-0-4-2'],
        mapId: '',
      }, {
        id: '0006',
        name: '区域F',
        bindCarIdArr: ['0-0-2-2', '0-0-1-2'],
        mapId: '',
      }];
      this.areaList.map((item) => {
        item.checked = false;
        return item;
      });
      console.log('this.areaList', this.areaList);
    },
    // 搜索
    onSearch() {
      console.log(`searchContent: ${this.searchContent}`);
      this.content = this.searchContent.trim();
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
    },
    // 删除选中的区域
    deleteCheckedArea() {
      let checkedAreaId = '';
      this.areaList.forEach((item, index) => {
        if (item.checked) {
          checkedAreaId = `${checkedAreaId},${item.id}`;
        }
      });
      if (checkedAreaId.trim().length > 0) {
        checkedAreaId = checkedAreaId.substring(1);
        console.log('checkedAreaId', checkedAreaId);
      } else {
        this.$message.warning('请至少选择一个区域进行删除！！！');
      }
    },
    // 一个区域的复选框选中状态改变
    onCheckChange(index) {
      console.log('index', index);
      this.$set(this.areaList, index, this.areaList[index]);
      console.log('this.areaList', this.areaList);
    },
    // 新增区域
    addArea() {
      console.log('add area');
      this.optType = 'add';
      this.visible = true;
    },
    // 编辑某个区域
    editItem(index) {
      console.log('edit area', this.areaList[index]);
      this.optType = 'edit';
      this.visible = true;
    },
    // 删除某个区域
    deleteItem(index) {
      console.log('delete area', this.areaList[index]);
    },
    // 打开绑定车辆页面
    openBindCarPage(areaId, bindCarIdArr) {
      const data = {
        type: this.type,
        bindCarIdArr,
        areaId,
      };
      console.log('openBindCarPage data', data);
      this.$emit('openBindCarPage', data);
    },

    handleSave(e) {
      console.log('确定保存');
      console.log(e);
      this.visible = false;
      this.getAreaListData();
    },
  },
};
</script>
<style lang="scss">
  .modalwrap{
    top:10px;
    left:10px;
    height: calc(100% - 20px);
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
    }
    .area-page-body-item{
      padding: 5px 10px 5px 30px;
      .box-label{
        display: inline-block;
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
