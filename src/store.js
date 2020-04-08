import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isPlayerBarShow: false, // 轨迹播放条是否显示
    playerBarOptions: {},
    mapManager: null, // 车辆管理-地图管理器
    trackSegments: [],
    historyTrack: [],
  },
  mutations: {
    setPlayerBarShow(state, isPlayerBarShow) {
      state.isPlayerBarShow = isPlayerBarShow;
      state.mapManager.getTrackPointLayer().getSource().clear();
    },
    setPlayerBarOptions(state, options) {
      state.playerBarOptions = options;
    },
    setMapManager(state, mapManager) {
      state.mapManager = mapManager;
    },
    setTrackSegments(state, trackSegments) {
      state.trackSegments = trackSegments;
      localStorage.setItem('trackSegments', trackSegments);
    },
    sethistoryTrack(state, historyTrack) {
      state.historyTrack = historyTrack;
      localStorage.setItem('historyTrack', historyTrack);
    },
  },
  actions: {

  },
});
