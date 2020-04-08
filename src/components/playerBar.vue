<!-- 播放条 -->
<template>
  <div class="track-player-bar aic jca">
    <div class="player-btn poi aic" @click="togglePlaying">
      <img :src="getBtnImg">
    </div>
      <div class="player-progress">
        <el-slider v-model="sliderValue" :min="minSliderValue" :max="maxSliderValue" :step="1000" :format-tooltip="dateFormat"></el-slider>
      </div>
      <div class="speed-btn-group f12 wh">
        <p v-for="rate in rates" :key="rate" @click="toggleRate(rate)" class="speed-btn-i" :class="{active:rate === speedRate}">{{rate}}×</p>
      </div>
      <div class="close-btn f16 wh poi" @click="onClose">
        退出播放
      </div>
    </div>
</template>
<script>
import playBtnImg from '@/assets/car/bofang.png';
import stopBtnImg from '@/assets/car/tingzhi.png';
import { dateFmt } from '@/js/utils';

let interval;
const rates = [1, 2, 4];
export default {
  name: '',
  data() {
    return {
      rates,
      playing: false,
      sliderValue: 0,
      speedRate: 1,
    };
  },
  props: {
    startTime: {
      type: Number,
      required: true,
    },
    endTime: {
      type: Number,
      required: true,
    },
  },
  mounted() {
    this.$nextTick().then(() => {

    });
  },
  methods: {
    /**
     * 调节速度
     * @param  {[type]} rate [description]
     * @return {[type]}      [description]
     */
    toggleRate(rate) {
      this.speedRate = rate;
      clearInterval(interval);
      interval = setInterval(() => {
        this.sliderValue += 1000;
      }, 1000 / this.speedRate);
    },
    /**
     * 切换播放状态
     * @return {[type]} [description]
     */
    togglePlaying() {
      this.playing = !this.playing;
      if (this.playing) {
        this.play();
      } else {
        this.stop();
      }
    },
    dateFormat(date) {
      return dateFmt('yyyy-MM-dd hh:mm:ss', new Date(date));
    },
    /**
     * 播放
     * @return {[type]} [description]
     */
    play() {
      clearInterval(interval);
      interval = setInterval(() => {
        this.sliderValue += 1000;
      }, 1000 / this.speedRate);
      this.$emit('play', this.sliderValue); // 返回当前值
    },
    stop() {
      clearInterval(interval);
      this.$emit('stop', this.sliderValue); // 返回当前值
    },
    onClose() {
      clearInterval(interval);
      this.$emit('close');
    },
  },
  computed: {
    getBtnImg() {
      return this.playing ? stopBtnImg : playBtnImg;
    },
    minSliderValue() {
      return +this.startTime;
    },
    maxSliderValue() {
      return +this.endTime;
    },
  },
  watch: {
    sliderValue(value) {
      if (value >= this.maxSliderValue) {
        this.togglePlaying();
      }
      this.$emit('onValueChange', value);
    },
    minSliderValue(value) {
      this.sliderValue = value;
    },
  },
  components: {

  },
  destroyed() {
    clearInterval(interval);
  },

};

</script>
<style scoped lang='stylus'>
.track-player-bar {
  display: flex;
  position: absolute;
  height: 50px;
  left: 20px;
  right: 20px;
  bottom: 10px;
  padding: 8px 7px;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: -1px 0px 4px 0px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  border: solid 1px rgba(221, 221, 221, 1);
  box-sizing: border-box;
  z-index 3;
}

.player-btn {
  display: flex;
  margin-right: 20px;
}

.player-progress {
  flex: auto;
  margin-right: 20px;
}

.speed-btn-group {
  display: flex;
  margin-right: 30px;
}

.speed-btn-i {
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, .5);
  text-align: center;
  line-height: 24px;
  margin-right: 1px;
  cursor: pointer;
  transition: all .8s;

  &.active {
    background-color: #2b90f3;
  }
}

.close-btn {
  width: 94px;
  height: 34px;
  background-color: #2b90f3;
  border-radius: 4px;
  text-align: center;
  line-height: 34px;
}

</style>
