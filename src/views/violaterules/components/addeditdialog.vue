<template>
  <a-modal :title="modalTitle"
           v-model="addEditDialogVisible"
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
</template>
<script type="text/ecmascript-6">

export default {
  name: 'addEditDialog',
  components: {

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
  },
  data() {
    return {
      addEditDialogVisible: false,
    };
  },
  computed: {
  },
  created() {

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

    },
    handleSave(e) {
      console.log('确定保存');
      console.log(e);
      this.addEditDialogVisible = false;
      this.$emit('refreshList');
    },
  },
};
</script>
<style lang="scss" scoped>

</style>
