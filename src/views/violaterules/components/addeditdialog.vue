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
import { addEditAreaOrLine } from '@/api/vrules';

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
        tempArea.locationId = 'jgjhgfsdhfgjsd';
        tempArea.name = '修改的区域';
      } else {
        tempArea.locationId = '1254sdkfig';
        tempArea.name = '新增的区域A';
      }

      addEditAreaOrLine(tempArea).then((data) => {
        if (data.code === 0) {
          this.$message.success('保存成功！！！');
          this.addEditDialogVisible = false;
          this.$emit('refreshList');
        } else {
          this.$message.error('保存失败，请检查！！！');
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>

</style>
