import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueCookies from 'vue-cookies'
import "vue-material-design-icons/styles.css"
import breakpoint from 'better-vue-breakpoints'
import Meta from 'vue-meta';

Vue.config.productionTip = false

Vue.use(VueCookies)

Vue.use(Meta);

Vue.use(breakpoint, {
  xs: 500,
  sm: 900,
  md: 1200,
  lg: 1920,
  xl: 1920,
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
