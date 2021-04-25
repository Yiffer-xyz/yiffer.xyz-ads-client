/* eslint-disable no-undef */
import Vue from 'vue'
import Vuex from 'vuex'
import { registerFetchNames, doFetch, doFetchSilent } from './utils/statefulFetch'
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
      if ($cookies.isKey('user-data')) {
        commit('setUserData', $cookies.get('user-data'))
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

    async refreshUserData ({commit}) {
      let response = await authApi.refreshAuth()
      if (response === null) {
        commit('setIsAuthenticated', false)
        commit('setUserData', undefined)
      }
      else {
        commit('setUserData', response)
        commit('setIsAuthenticated', true)
      }
    },

    setUserData (context, userData) {
      context.commit('setUserData', userData)
      context.commit('setIsAuthenticated', true)
      $cookies.set('user-data', userData)
    },

    destroyUserData (context) {
      context.commit('setUserData', undefined)
      context.commit('setIsAuthenticated', false)
      $cookies.remove('user-data')
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
  {name: 'allKeywords', defaultValue: []},
  {name: 'allComics', defaultValue: []},
  {name: 'feedback', defaultValue: []},
  {name: 'myPaidImages', defaultValue: []},
  {name: 'blogs', defaultValue: []},
  {name: 'submitFeedback', defaultValue: {}},
  {name: 'modApplicationSubmit', defaultValue: {}},
  {name: 'comicSuggestionSubmit', defaultValue: {}},
  {name: 'changePasswordSubmit', defaultValue: {}},
  {name: 'addEmailSubmit', defaultValue: {}},
  {name: 'forgottenPasswordSubmit', defaultValue: {}},
  {name: 'resetPasswordSubmit', defaultValue: {}},
  {name: 'advertisingApplySubmit', defaultValue: {}},
  {name: 'fetchLogin', defaultValue: {}},
  {name: 'fetchSignup', defaultValue: {}},
  {name: 'paidImagePrices', defaultValue: []},
)

export default new Vuex.Store(store)
