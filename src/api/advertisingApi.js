import axios from 'axios'
import config from '@/config.json'
let baseUrl = config.apiBaseUrl

export default {
  async submitAdvertisingApplication (file1, file2, adType, adName, adLink, adMainText, adSecondaryText, advertiserNotes) {
    let formData = new FormData()
    formData.append('adType', adType)
    formData.append('adName', adName)
    formData.append('adLink', adLink)
    formData.append('adMainText', adMainText)
    formData.append('adSecondaryText', adSecondaryText)
    formData.append('advertiserNotes', advertiserNotes)
    formData.append('file1', file1)
    formData.append('file2', file2)

    let response = await axios.post(
      baseUrl + '/paid-images',
      formData,
      {
        headers: {'Content-Type': 'multipart/form-data'},
      }
    )

    return response.data
  },

  async getAdPrices () {
    let response = await axios.get(`${baseUrl}/paid-images-prices`)
    return response.data
  },

  async updateAd ({id, price, status, activationDate, deactivationDate, adminNotes, correctionNote}) {
    let response = await axios.post(`${baseUrl}/paid-images/${id}`, {
      price, status, activationDate, deactivationDate, adminNotes, correctionNote,
    })
    if (!response.data.error) { return response.data }
    else { return {success: false, message: response.data.error} }
  },

  async updateAdNeedingCorrection (id, link, mainText, secondaryText, file) {
    let formData = new FormData()
    formData.append('link', link)
    if (mainText) { formData.append('mainText', mainText) }
    if (secondaryText) { formData.append('secondaryText', secondaryText) }
    if (file) { formData.append('file', file) }

    try {
      let response = await axios.post(
        `${baseUrl}/paid-images/${id}/correct`,
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        }
      )

      return response.data
    }
    catch (err) {
      return {success: false, message: err.response.data}
    }
  },

  async getAdsByStatuses (statuses) {
    let params = new URLSearchParams()
    statuses.forEach(status => params.append('statuses', status))
    let requestQuery = {params: params}

    let response = await axios.get(baseUrl + '/paid-images', requestQuery)
    if (!response.data.error) { return response.data }
    else { return [] }
  },
  
  async getAllAds () {
    let response = await axios.get(baseUrl + '/paid-images')
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async getMyAds () {
    try {
      let response = await axios.get(baseUrl + '/paid-images/me')
      return response.data
    }
    catch (err) {
      throw {message: err.response.data}
    }
  },

  async toggleRenewal (adId, shouldRenew) {
    try {
      let response = await axios.post(`${baseUrl}/paid-images/${adId}/toggle-renew`, {shouldRenew})
      return response.data
    }
    catch (err) {
      return {success: false, message: err.response.data}
    }
  },

  async getAdsBasic () {
    let response = await axios.get(baseUrl + '/paid-images-basic')
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async deleteOrDeactivateAd (adId) {
    try {
      await axios.delete(`${baseUrl}/paid-images/${adId}`)
      return {success: true}
    }
    catch (err) {
      return {success: false, message: err.response.data}
    }
  },

  async reactivateAd (adId) {
    try {
      await axios.post(`${baseUrl}/paid-images/${adId}/reactivate`)
      return {success: true}
    }
    catch (err) {
      return {success: false, message: err.response.data}
    }
  },

  async logAdClick (adId) {
    axios.post(baseUrl + '/paid-images-click', {adId})
  },
}
