import Vue from 'vue';
import Router from 'vue-router';
// import GreenWay from './views/greenway/greenway.vue';
// import WaterSupply from './views/watersupply/watersupply.vue';

Vue.use(Router);

const router = new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/carTruck',
      name: 'carTruck',
      meta: {
        title: '车辆',
      },
      component: () => import(/* webpackChunkName: "about" */ './views/car/CarTruck.vue'),
    },
    {
      path: '/violateRulesSet',
      name: 'violateRulesSet',
      meta: {
        title: '违规配置',
      },
      component: () => import(/* webpackChunkName: "about" */ './views/violaterules/index.vue'),
    },
  ],
});

router.afterEach((to) => {
  // 更改标题
  window.document.title = to.meta.title;
});

export default router;
