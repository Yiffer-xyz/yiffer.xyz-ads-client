import Vue from 'vue'
import store from '@/store.js'
import Router from 'vue-router'
import LandingPage from '@/pages/landing-page.vue'

Vue.use(Router)

async function rerouteIfNotLoggedIn(to, from, next) {
  try {
    let isLoggedIn = await store.dispatch('checkAndSetLoginStatus')
    if (isLoggedIn) {
      next()
    }
    else {
      next({ name: 'landingPage' })
    }
  }
  catch (err) {
    next({ name: 'landingPage' })
  }
}

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'landingPage',
      component: LandingPage,
      // beforeEnter: rerouteIfNotLoggedIn,
      meta: {
        redirectOnLogout: true,
      }
    },
  ],
  scrollBehavior () {
    return {x: 0, y: 0}
  }
})
