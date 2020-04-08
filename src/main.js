import Vue from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import vuescroll from 'vuescroll';

import '@/styles/common.css';
import '@/styles/utils.css';

import router from './router';
import store from './store';
import App from './App.vue';

Vue.use(Antd);
Vue.config.productionTip = false;
Vue.use(ElementUI);

Vue.use(vuescroll, {
  ops: {}, // 在这里设置全局默认配置
  name: 'myScroll', // 在这里自定义组件名字，默认是vueScroll
});

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
