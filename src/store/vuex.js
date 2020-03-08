import Vue from "vue";
import Vuex from "vuex";
import fa from "element-ui/src/locale/lang/fa";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    menuList: [],
    addDialogVisible: false,
  }
})

export default store