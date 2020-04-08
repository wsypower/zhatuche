<!-- tab页签 -->
<template>
  <div class="wrapper">
    <ul class="tab">
      <li :style="liStyle" class="tab-i f14 g3 tc poi" v-for="(tab,i) in tabs" :key="i" @click="toggleTab(tab,i)">{{tab.name}}
      </li>
      <div :style="lineStyle" class="active-line" ref="tabLine"></div>
    </ul>
    <keep-alive>
      <component class="tab-con" :is="tabs[activeTab].content" :tabData="tabs[activeTab].data"></component>
    </keep-alive>
  </div>
</template>
<script>
export default {
  name: '',
  data() {
    return {
      activeTab: 0,
    };
  },
  mounted() {
    this.$nextTick().then(() => {

    });
  },
  props: {
    tabWidth: {
      type: String,
    },
    /* tabs:[{
		name:'基本信息',
		content:'',
    data:null
	},{
		name:'违章记录',
		content:'',
    data:null
	}], */
    tabs: {
      type: Array,
      required: true,
    },
  },
  methods: {
    toggleTab(tab, i) {
      // 设置tab-line的位置
      this.$refs.tabLine.style.transform = `translateX(${100 * i}%)`;
      this.activeTab = i;
    },
  },
  computed: {
    liStyle() {
      return {
        width: this.tabWidth,
      };
    },
    lineStyle() {
      return {
        width: this.tabWidth,
      };
    },
  },
  watch: {

  },
  components: {

  },

};

</script>
<style scoped lang='stylus'>
.wrapper{
	display:flex;
	flex-direction: column;
}
.tab {
  display: flex;
  position: relative;
  flex:none;
}

.tab-i {
  height: 40px;
  line-height: 40px;
  border: solid 1px #ddd;
  border-left: none;
  box-sizing: border-box;

  &:first-child {
    border-left: solid 1px #ddd;
  }
}

.active-line {
  position: absolute;
  top: 0;
  height: 3px;
  background-color: #2b90f3;
  transition: transform .3s;
}

.tab-con{

}

</style>
