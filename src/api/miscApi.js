import axios from 'axios'
import config from '@/config.json'
let baseUrl = config.apiBaseUrl

export default {
  async logRoute (route, description) {
    try {
      axios.post(baseUrl + '/log-route', {route, description})
    }
    // eslint-disable-next-line no-empty
    catch (err) {}
  },
}
