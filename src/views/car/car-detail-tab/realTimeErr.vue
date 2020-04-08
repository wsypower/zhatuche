<!-- 实时违章 -->
<template>
  <div>
    {{content}}
  </div>
</template>
<script>
import { getCar } from '@/js/clgl/service';

export default {
  name: '',
  data() {
    return {
      content: '',
    };
  },
  props: {
    tabData: String, // 实际是车辆ID
    default: [],
  },
  mounted() {
    this.$nextTick().then(() => {
      this.showContent(this.tabData);
    });
  },
  methods: {
    showContent(carId) {
      this.content = '';
      getCar(carId).then((car) => {
        const {
          cLineForbid, cLineoffset, cOverrange, cOverspeed, cOvertime, cDoubtsteal,
        } = car;
        if (cLineForbid === '0') {
          this.content += '禁行路段 ';
        }
        if (cLineoffset === '0') {
          this.content += '线路偏移 ';
        }
        if (cOverrange === '0') {
          this.content += '超范围 ';
        }
        if (cOverspeed === '0') {
          this.content += '超速 ';
        }
        if (cOvertime === '0') {
          this.content += '超时停留 ';
        }
        if (cDoubtsteal === '0') {
          this.content += '疑似偷盗 ';
        }
      });
    },
  },
  computed: {

  },
  watch: {
    tabData(carId) {
      this.showContent(carId);
    },
  },
  components: {

  },

};

</script>
<style scoped lang='stylus'>
</style>
