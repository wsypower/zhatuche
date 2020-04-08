<template>
  <div id="poi" v-show="visible" :draggable="draggable">
    <!-- 弹框标题栏 -->
    <div v-if="!noTitle" id="poi-header" class="f16 wh">
      <div class="h-l aic">
        <img :src="icon" class="h-l-icon" alt="">
        <span>{{title}}</span>
      </div>
      <div class="h-r aic">
        <span>{{tag}}</span>
        <!--<span v-if="canMinimize" class="minimize" @click="onMinimize">__</span>-->
        <div class="delete ml20 poi" @click="onClose">
          <img src="./img/delete.png" alt="">
        </div>
        </div>
      </div>
      <!-- 弹框内容 -->
      <div class="poi-main" ref="main">
        <!-- 如果没有标题，则在此显示关闭按钮 -->
        <div v-if="noTitle" class="main-close-btn f14 poi" @click="onClose">
          <!-- <img src="./img/delete.png" alt=""> -->
          ×
        </div>
        <slot></slot>
      </div>
    </div>
</template>
<script>
export default {
  name: 'poiInfo',
  data() {
    return {
    };
  },
  props: {
    title: {
      type: String,
      default: '标题',
    },
    icon: {
      type: String,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    tag: {
      type: String,
    },
    noTitle: {
      type: Boolean,
      default: false,
    },
    canMinimize: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    if (this.noTitle) {
      this.$refs.main.style.padding = '0';
      this.$refs.main.style.overflow = 'inherit';
    }
  },
  methods: {
    onClose() {
      this.$emit('onClose');
    },
    // onMinimize() {
    //   this.$emit('onMinimize');
    // },
  },
};

</script>
<style scoped lang="stylus">
#poi {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  width: 300px;
  height: 200px;
  background-color: #ffffff;
  box-shadow: -1px 0px 4px 0px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  border: solid 1px #ddd;
  z-index: 2;
  box-sizing: border-box;

  #poi-header {
    display: flex;
    flex: none;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;
    width: 100%;
    height: 40px;
    background-image: linear-gradient(90deg,
      #0065ea 0%,
      #00a5ff 100%);
    box-shadow: -1px 0px 4px 0px rgba(0, 0, 0, 0.12);
    border-radius: 4px 4px 0px 0px;
  }
}

.h-l,
.h-r,
.delete {
  display: flex;

}
.delete{
  transition:transform .5s;
  &:hover{
    transform:rotate(90deg);
  }
}
.minimize{
  font-weight: bold;
  padding-bottom:5px;
  &:hover{
    cursor: pointer;
  }
}
.h-l-icon {
  margin-right: 12px;
}

.poi-main {
  flex: auto;
  position: relative;
  padding: 10px 10px;
  overflow: auto;
}

.main-close-btn {
  position: absolute;
  display: inline;
  height: 18px;
  top: 10px;
  right: 10px;
  font-size: 30px;
  color: rgba(81, 79, 77, 0.9);
  line-height: 14px;
  z-index:1;
  transition:all .5s;
  user-select: none;
  &:hover{
    color:#0065ea;
    transform:rotate(90deg);
  }
}

</style>
