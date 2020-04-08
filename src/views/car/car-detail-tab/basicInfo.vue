<!-- 基本信息tab页 -->
<template>
  <div class="basic-info">
    <!--<el-button class="shzu" size="small" @click="onRealTimeTrace">实时追踪</el-button>-->
    <ul class="tab f14">
      <li class="tab-i poi" @click="toggleTab(i)" :class="{active: activeTab === i}" v-for="(item, i) in tabs" :key="i">{{item}}</li>
    </ul>
    <ul class="table f13">
      <li class="tr" v-for="(item,i) in getCurrentInfo" :key="i">
        <p class="td td-k g6">{{item.name}}</p>
        <p class="td td-v g3">{{item.value ? item.value :'无数据'}}</p>
        <p v-if="item.phoneName" class="td td-k td-phname g6">{{item.phoneName}}</p>
        <p v-if="item.phoneName" class="td td-v td-phnum g3 ">{{item.phoneNum}}</p>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'basicInfo',
  data() {
    return {
      tabs: ['车辆', '公司'],
      activeTab: 0,
    };
  },
  mounted() {
    this.$nextTick().then(() => {});
  },
  methods: {
    toggleTab(i) {
      this.activeTab = i;
    },
  },
  computed: {
    getCurrentInfo() {
      return this.activeTab === 0 ? this.tabData.carInfos : this.tabData.companyInfos;
    },
  },
  props: {
    tabData: Object,
    default: {
      carInfos: [{
        name: '车牌号',
        value: '',
      }, {
        name: '车辆类型',
        value: '',
      }, {
        name: '运输企业',
        value: '',
      }, {
        name: '驾驶员',
        value: '',
      }, {
        name: '联系电话',
        value: '',
      }, {
        name: '核定载质量',
        value: '',
      }],
      companyInfos: [{
        name: '企业名称',
        value: '',
      }, {
        name: '核准编号',
        value: '',
      }, {
        name: '核准类型',
        value: '',
      }, {
        name: '车辆数量',
        value: '',
      }, {
        name: '法定代表人',
        value: '',
      }, {
        name: '联系电话',
        value: '',
      }],
    },
  },
  components: {

  },
};

</script>
<style scoped lang='stylus'>
@import '~@/styles/views/car-detail-tab/basic-info.styl';

</style>
