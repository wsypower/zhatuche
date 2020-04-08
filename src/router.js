import Vue from 'vue';
import Router from 'vue-router';
// import GreenWay from './views/greenway/greenway.vue';
// import WaterSupply from './views/watersupply/watersupply.vue';

Vue.use(Router);

export default new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/carTruck',
      name: 'carTruck',
      component: () => import(/* webpackChunkName: "about" */ './views/car/CarTruck.vue'),
    },
  ],
});
