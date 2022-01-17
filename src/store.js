/* eslint-disable no-undef */
import Vue from 'vue'
import Vuex from 'vuex'
import { registerFetchNames } from './utils/statefulFetch'
import authApi from '@/api/authApi'

Vue.use(Vuex)

const store = {
  state: {
    darkTheme: false,
    userData: undefined,
    isAuthenticated: false,
  },

  actions: {
    async logout ({dispatch}) {
      dispatch('destroyUserData')
      authApi.logout()
    },

    async checkAndSetLoginStatus ({commit, dispatch}) {
      if ($cookies.isKey('yiffer_userdata')) {
        commit('setUserData', $cookies.get('yiffer_userdata'))
        commit('setIsAuthenticated', true)
        dispatch('refreshUserData')
        return true
      }
      else {
        commit('setIsAuthenticated', false)
        commit('setUserData', undefined)
        return false
      }
    },

    async refreshUserData ({commit, dispatch}) {
      let response = await authApi.refreshAuth()
      if (response === null) {
        dispatch('destroyUserData')
      }
      else {
        commit('setUserData', response)
        commit('setIsAuthenticated', true)
      }
    },

    setUserData (context, userData) {
      context.commit('setUserData', userData)
      context.commit('setIsAuthenticated', true)
    },

    destroyUserData (context) {
      context.commit('setUserData', undefined)
      context.commit('setIsAuthenticated', false)
    },
  },

  mutations: {
    setDarkTheme (state, isDarkTheme) { state.darkTheme = isDarkTheme },
    setUserData (state, userData) { state.userData = userData },
    setIsAuthenticated (state, isAuthenticated) { state.isAuthenticated = isAuthenticated },
  },

  getters: {
    isDarkTheme: state => state.darkTheme,
    isAuthenticated: state => state.isAuthenticated,
    getIsAuthenticated: () => state => state.isAuthenticated,
    userData: state => state.userData,
  }
}

registerFetchNames(store, 
  {name: 'myPaidImages', defaultValue: []},
  {name: 'advertisingApplySubmit', defaultValue: {}},
  {name: 'fetchLogin', defaultValue: {}},
  {name: 'paidImagePrices', defaultValue: []},
  {name: 'paidImagePayments', defaultValue: []},
  {name: 'paidImageClickStats', defaultValue: []},
)

export default new Vuex.Store(store)
