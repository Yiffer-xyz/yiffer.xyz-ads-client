<template>
  <div style="width: 100%;">
    <h1>Advertising dashboard</h1>

    <div class="full-width-text">
      <button class="y-button y-button-neutral marginAuto mt-16"
              @click="() => isShowingInstructions = !isShowingInstructions">
        {{isShowingInstructions ? 'Hide instructions' : 'Show instructions'}}
      </button>

      <div v-if="isShowingInstructions">
        <img v-if="isDarkTheme" src="https://i.imgur.com/xC4NPCS.png" class="adFlowImg"/>
        <img v-else src="https://i.imgur.com/HZCHqIO.png" class="adFlowImg"/>

        <h3>
          Payment details
        </h3>

        <p>
          When paying initially, or when renewing an ad, you can choose for what duration you wish to pay. We will automatically extend the expiry date according to the amount received. You'll send the money to advertising@yiffer.xyz on PayPal. It is vital that you <u>include your ad's ID in the message field</u> when sending the money, so we know which ad to update. You should never pay anything if your ad is in the <span class="monoInfo">PENDING</span> or <span class="monoWarning">NEEDS CORRECTION</span> states.
        </p>

        <p class="mt-16">
          It is important that you pay the <u>total</u> price from the options on your ad, not the monthly one.
        </p>

        <p class="mt-16">
          It may take a few days to get your ad approved, as well as for us to register your payment afterwards. In the near future, we aim to automate the payment process by creating a solution where you can pay by credit card instead. This will eliminate the need for manual payment review.
        </p>
      </div>

      <SelectedAdBox v-if="selectedAd" :ad="selectedAd" @updateAds="fetchAndUpdateAds"/>

      <div class="adDashboardBox simpleShadowNoHover">
        <h3 class="mb-8">Your ads</h3>
        
        <Loading v-if="myPaidImages.fetching || !myPaidImages.fetched" text="Fetching ads" />

        <p v-else-if="myPaidImages.failed">
          There was an error fetching your ads.
        </p>

        <p v-else-if="myPaidImages.payload.length === 0">
          You have no current or previous ads.
        </p>

        <div v-else class="scrolling-table-container">
          <table cellspacing=0 class="paidImageTable" colspacing=0>
            <thead>
              <tr>
                <th>Name</th>
                <th>Clicks</th>
                <th>Status</th>
                <th>Type</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tr v-for="ad in myPaidImages.payload"
                :key="ad.id"
                @click="() => selectAd(ad)"
                :class="{'selectedAd': selectedAd && selectedAd.id === ad.id}"
                class="paidImageRow">
              <td>
                <p>
                  {{ad.adName}}
                </p>
              </td>
              <td>
                <p>
                  {{ad.clicks}}
                </p>
              </td>
              <td>
                <p :class="getAdStatusClass(ad.status)">
                  {{ad.status}} 
                </p>
              </td>
              <td>
                <p>
                  {{capitalizeString(ad.adType)}}
                </p>
              </td>
              <td>
                <p v-if="adTypesToShowExpiryDates.includes(ad.status)">
                  {{formatShortTimestamp(ad.expiryDate)}}
                </p>
                <p v-else></p>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SelectedAdBox from '@/pages/dashboard/SelectedAdBox.vue'
import Loading from '@/components/LoadingIndicator.vue'
import miscApi from '@/api/miscApi'
import advertisingApi from '../../api/advertisingApi'
import { doFetch } from '../../utils/statefulFetch'
import { mapGetters } from 'vuex'
import { format } from 'date-fns'

export default {
  name: 'advertisingDashboard',
  
  components: {
    Loading, SelectedAdBox,
  },

  mounted () {
    miscApi.logRoute('ads dashboard')
    doFetch(this.$store.commit, 'myPaidImages', advertisingApi.getMyAds())
  },

  computed: {
    ...mapGetters(['myPaidImages', 'isDarkTheme']),
  },

  data: function () {
    return {
      isShowingInstructions: false,
      selectedAd: null,
      adTypesToShowExpiryDates: ['ACTIVE', 'ACTIVE BUT PENDING', 'ACTIVE BUT NEEDS CORR.', 'ENDED'],
    }
  },

  methods: {
    selectAd (ad) {
      this.selectedAd = ad
      doFetch(this.$store.commit, 'paidImagePayments', advertisingApi.getAdPayments(ad.id))
    },

    async fetchAndUpdateAds (adIdToSetSelectedWhenDone) {
      try {
        let newAdsResult = await advertisingApi.getMyAds()
        this.$store.commit('set_myPaidImages_fetched', newAdsResult)

        if (adIdToSetSelectedWhenDone) {
          this.selectedAd = this.myPaidImages.payload.find(paidImg => paidImg.id === adIdToSetSelectedWhenDone)
        }
        else {
          this.selectedAd = null
        }
      }
      catch (err) {
        this.$store.commit('set_myPaidImages_error')
      }
    },

    getAdStatusClass (status) {
      if (['PENDING', 'ACTIVE BUT PENDING'].includes(status)) {
        return 'mono monoInfo'
      }
      else if (['NEEDS CORRECTION', 'AWAITING PAYMENT', 'ACTIVE BUT NEEDS CORR. '].includes(status)) {
        return 'mono monoWarning'
      }
      else if (status === 'ENDED') {
        return 'mono monoError'
      }
      else {
        return 'mono monoSuccess'
      }
    },

    formatShortTimestamp (timestamp) {
      return format(new Date(timestamp), 'MMM do')
    },

    capitalizeString (s) {
      return s[0].toUpperCase() + s.substr(1)
    },
  },

  metaInfo () {
    let title = `Ads dashboard - Yiffer.xyz`
    return {
      title: title,
      meta: [
        {vmid: 'twitterTitle', name: 'twitter:title', content: title},
        {vmid: 'ogTitle', property: 'og:title', content: title},
        {vmid: 'twitterDesc', name: 'twitter:description', content: "The internet's best collection of high quality furry porn comics, easily readable and free!"},
        {vmid: 'ogDesc', property: 'og:description', content: "The internet's best collection of high quality furry porn comics, easily readable and free!"},
      ]
    }
  },
}
</script>

<style lang="scss">
.paidImageTable {
  width: 100%;
  border-bottom: 1px solid #ddd;
  th, td {
    padding: 0.5rem;
  }
}
.paidImageRow {
  &:hover {
    cursor: pointer;
    td {
      background-color: $themeGreen1VeryLight;
    }
  }
  td {
    border-top: 1px solid #ddd;
  }
}

.selectedAd {
  background: linear-gradient(to right, $themeGreen1, $themeGreen2) !important;
  td, &:hover>td {
    background: transparent !important;
    p:not(.mono) {
      color: $themeDark4;
    }
  }
}
.adDashboardBox {
  background-color: white;
  padding: 2rem;
  margin: 2rem auto;
  width: fit-content;
  overflow-x: auto;
  max-width: 100%;
  box-sizing: border-box;
}

.editAdLoading {
  width: fit-content;
  margin-top: 2rem;
}

.correctionNote {
  border: 1px solid $themeWarningBorder;
  background-color: $themeWarning;
  padding: 0.5rem;
  color: black !important;
}

@media screen and (max-width: 900px) {
  .adDashboardBox {
    padding: 1rem;
    margin: 1rem auto;
  }
}

.dark {
  .adDashboardBox {
    background-color: $themeDark2;
  }

  .paidImageRow {
    &:hover {
      td {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
