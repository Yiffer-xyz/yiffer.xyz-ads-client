<template>
  <div class="adDashboardBox simpleShadowNoHover firstAdDashboardBox">
    <p v-if="!ad">
      Select an ad from the list below to see its full details
    </p>

    <span v-else class="paidImageDetail" id="paidImageDetail">
      <p v-if="!isEditingAd">
        <strong>{{ad.adName}}</strong> - {{config.adTypeInfos[ad.adType].displayName}} ad
      </p>
      <TextInput @change="newVal => editedAd.adName = newVal"
                 :value="editedAd.adName"
                 v-else
                 type="text"
                 title="Ad name (only visible to you)"
                 textAlign="left"
                 classes="mb-32"/>

      <p v-if="!isEditingAd">
        ID: <strong>{{ad.id}}</strong>
      </p>

      <p v-if="!isEditingAd" :class="getAdStatusClass(ad.status)">
        {{ad.status}}
      </p>

      <p v-if="ad.status === 'NEEDS CORRECTION'" class="correctionNote">
        Correction note: {{ad.correctionNote}}
      </p>

      <!-- HR LINE -->
      <hr style="border-top: 1px solid #ccc; border-bottom: none; margin-top: 1rem;"
          v-if="!isEditingAd"/>
      
      <!-- LINK -->
      <p v-if="!isEditingAd">
        Link: <a :href="ad.link" target="_blank" class="underline-link">
          {{ad.link}}
        </a>
      </p>
      <TextInput @change="newVal => editedAd.link = newVal"
                  :value="editedAd.link"
                  v-if="isEditingAd"
                  type="text"
                  :title="`Link`"
                  textAlign="left"
                  classes="mb-32"/>

      <!-- MAIN TEXT -->
      <p v-if="ad.adType.includes('card') && !isEditingAd">
        Main text: <i>{{ad.mainText}}</i>
      </p>
      <TextInput @change="newVal => editedAd.mainText = newVal"
                  :value="editedAd.mainText"
                  v-if="ad.adType.includes('card') && isEditingAd"
                  type="text"
                  :title="`Main text (${remainingCharsMainText} characters left)`"
                  textAlign="left"
                  classes="mb-32"/>

      <!-- SECONDARY TEXT -->
      <p v-if="ad.adType.includes('card') && !isEditingAd">
        Secondary text: <i>{{ad.secondaryText || '-'}}</i>
      </p>
      <TextInput @change="newVal => editedAd.secondaryText = newVal"
                  :value="editedAd.secondaryText"
                  v-if="ad.adType.includes('card') && isEditingAd"
                  type="text"
                  :title="`Secondary text (${remainingCharsSecondaryText} characters left)`"
                  textAlign="left"
                  classes="mb-32"/>

      <!-- EXPIRES -->
      <p v-if="adTypesToShowExpiryDates.includes(ad.status) && ad.expiryDate && !isEditingAd">
        Expires: {{formatTimestamp(ad.expiryDate)}}
      </p>

      <!-- MEDIA -->
      <picture v-if="ad.filetype === 'webp' || ad.filetype === 'jpg'" :key="ad.id">
        <source :srcset="`${config.paidImagesBaseUrl}/${ad.id}.webp`"
                type="image/webp">
        <img :src="`${config.paidImagesBaseUrl}/${ad.id}.jpg`"
              type="image/jpeg"
              border="0"
              style="max-width: 100%;">
      </picture>

      <video v-else-if="ad.filetype === 'webm'" autoplay muted loop playsinline webkit-playsinline style="max-width: 100%;" :key="ad.id">
        <source :src="`${config.paidImagesBaseUrl}/${ad.id}.webm`"
                type="video/webm">
        <source :src="`${config.paidImagesBaseUrl}/${ad.id}.mp4`"
                type="video/mp4">
      </video>

      <img v-else
           :src="`${config.paidImagesBaseUrl}/${ad.id}.${ad.filetype}`"
           :key="ad.id"
           border="0"
           style="max-width: 100%;">

      <!-- CHANGE MEDIA -->
      <span v-if="isEditingAd">
        <p>
          Change media? If not, ignore this and the current one will be kept.
        </p>
        
        <p class="mt-8 red-text">
          Note: If you change the media of the ad, it will be given a new ID. All click and payment stats will remain, only the ID will change. This is done for efficiency reasons (caching).
        </p>

        <div class="horizontalFlexLeft flexWrap mt-4">
          <div class="pretty-input-upload mr-8">
            <input type="file"
                   @change="processFileUploadChange"
                   accept="image/png,image/gif,image/jpeg"
                   class="input-file"/>
            <p>Replace file</p>
          </div>
          <p v-if="adFile" class="alignSelfCenter bold" style="word-break: break-all;">
            Selected: {{adFile.name}}
          </p>
        </div>

        <p v-if="fileErrorMessage" class="red-color mt-4 bold">
          {{fileErrorMessage}}
        </p>
        <p v-else-if="adFile" class="mt-4">
          <CheckIcon/> File matches size requirements.
        </p>
      </span>

      <!-- HR LINE -->
      <hr style="border-top: 1px solid #ccc; border-bottom: none; margin-top: 1rem;"/>

      <ResponseMessage :message="responseMessage"
                       :messageType="responseMessageType"
                       disableElevation
                       outsideStyle="margin-bottom: 1rem; margin-top: 1rem; margin-left: 0; width: 100%;"
                       @closeMessage="() => {responseMessage = ''}" />

      <!-- BUTTONS: EDIT, DEACTIVATE -->
      <div class="horizontalFlexLeft mt-16" v-if="!isEditingOrDeleting && !isCancelled">
        <button @click="() => isEditingAd = true"
                class="y-button mr-16">
          Edit ad
        </button>

        <button v-if="ad.status !== 'ENDED'"
                @click="startDeletingAd"
                class="y-button y-button-red">
          {{(isDeletePermanent && !canOnlyDeactivate) ? 'Delete ad' : 'Deactivate ad'}}
        </button>
      </div>


      <!-- BUTTONS: EDITING: CANCEL, SAVE -->
      <div v-if="isEditingAd && !isCancelled" class="mt-16 mb-16">
        <div class="horizontalFlex justifyStart">
          <button @click="cancelEdit"
                  class="y-button y-button-neutral mr-16"
                  :class="{'yButtonDisabled': isSubmitting}">
            Cancel editing
          </button>

          <LoadingButton :text="'Save'"
                          :iconType="'save'"
                          :isDisabled="!isSavable"
                          :isLoading="isSubmitting"
                          @click="saveEdit"
                          styles="align-self: center;"/>
        </div>
      </div>

      <!-- DELETE -->
      <div v-if="isDeletingAd" class="mt-16">
        <p class="bold" v-if="canOnlyDeactivate">
          Your ad will be put in the <span class="mono monoError">ENDED</span> state. It cannot be permanently deleted since it has payments associated with it.
        </p>
        <p class="bold" v-else-if="isDeletePermanent">
          Are you sure you want to delete your ad? There is no goig back from this, and the ad will be removed from the list below. To confirm this action, type the ad's ID into the field below and submit.
        </p>
        <p class="bold" v-else>
          Are you sure you want to deactivate your ad? If you have paid money for it, this money will be lost. The ad will immediately be deactivated. It will remain in the list below, so you can reactivate it at any point if you so desire, but you will have to pay anew. To confirm this action, type the ad's ID into the field below and submit.
        </p>
        <input type="text" v-model="deleteAdConfirmText" class="mt-8" />

        <div class="mt-16 mb-16 horizontalFlex justifyStart">
          <button @click="cancelDelete"
                  class="y-button y-button-neutral mr-16">
            Cancel
          </button>

          <LoadingButton :text="(isDeletePermanent && !canOnlyDeactivate) ? 'Delete' : 'Deactivate'"
                          :isDisabled="deleteAdConfirmText !== ad.id"
                          :isLoading="isSubmitting"
                          @click="deleteAd"/>
        </div>
      </div>

      <!-- PAYMENT -->
      <span v-if="!isEditingAd && !isDeletingAd">
        <!-- HR LINE -->
        <hr style="border-top: 1px solid #ccc; border-bottom: none; margin-top: 1rem;"/>
        
        <p>
          <b>Payment &amp; pricing</b>
        </p>
        <p v-if="adTypesDontPayYet.includes(ad.status)">
          You should NOT pay at this point - wait until your ad has the <span class="monoWarning">AWAITING PAYMENT</span> state. Your pricing options later are:
        </p>
        <p v-else-if="ad.status === 'ENDED'">
          You can pay now to reactivate your ad. It will be activated as soon as we register the payment (manually), since there are no new changes to be approved. Alternatively, if you want to edit your ad, do so and wait for approval, and then pay after that. Your pricing options are:
        </p>
        <p v-else-if="ad.status === 'ACTIVE'">
          You can pay now to extend your ad's duration. Pay either of the amounts below, and we will change the expiry date accordingly. Your pricing options are:
        </p>
        <p v-else-if="['ACTIVE BUT PENDING', 'ACTIVE BUT NEEDS CORR.'].includes(ad.status)">
          You should NOT pay at this point - wait until you ad has <span class="monoSuccess">ACTIVE</span> state. Your pricing options later are:
        </p>
        <p v-else-if="ad.status === 'AWAITING PAYMENT'">
          You should now pay to activate your ad! Your pricing options are:
        </p>

        <ul class="textLeft" style="font-size: 0.9rem;">
          <li v-for="priceText in adPriceTexts" :key="priceText">
            {{priceText}}
          </li>
        </ul>

        <p class="mt-16">
          Detailed payment instructions at the top of the page.
        </p>

        <Loading v-if="paidImagePayments.fetching" text="Fetching your payments"/>

        <span v-if="paidImagePayments.fetched && paidImagePayments.payload.length > 0">
          <p class="mb-0" v-if="paidImagePayments.payload.length > 0">
            <b>Your payments</b>
          </p>
          <ul v-if="paidImagePayments.payload.length > 0">
            <li v-for="payment in paidImagePayments.payload" :key="payment.id" style="font-size: 0.9rem;">
              ${{payment.amount}}, registered {{formatTimestamp(payment.date)}}
            </li>
          </ul>
        </span>

        <p v-else-if="paidImagePayments.payload.length === 0 && paidImagePayments.fetched">
          We have not registered any payments for this ad yet.
        </p>

        <p v-else-if="paidImagePayments.failed">
          There was an error fetching your payments for this ad.
        </p>

        <!-- HR LINE -->
        <hr style="border-top: 1px solid #ccc; border-bottom: none; margin-top: 1rem;"/>

        <!-- STATS -->
        <p>
          <b>Click stats</b>
        </p>

        <Loading v-if="paidImageClickStats.fetching" text="Fetching stats"/>

        <span v-else-if="paidImageClickStats.fetched">
          <p v-if="paidImageClickStats.payload.length <= 1" style="margin-top: -8px;">
            No daily click stats yet. Once your ad has been active for two days, a graph will appear here.
          </p>

          <ClickStats v-else-if="!!chartData"
                      :key="isDarkTheme"
                      :chartData="chartData"
                      :fontColor="isDarkTheme ? '#eee' : '#333'"/>
        </span>
        
        <p v-else-if="paidImageClickStats.failed">
          There was an error fetching click stats for this ad.
        </p>
      </span>
    </span>
  </div>
</template>

<script>
import ResponseMessage from '@/components/ResponseMessage.vue'
import TextInput from '@/components/TextInput.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import CheckIcon from 'vue-material-design-icons/CheckCircle.vue'
import ClickStats from './ClickStats.vue'
import { mapGetters } from 'vuex'
import { format } from 'date-fns'
import { doFetch } from '@/utils/statefulFetch'
import Loading from '@/components/LoadingIndicator.vue'

import config from '@/config.json'
import advertisingApi from '@/api/advertisingApi'

export default {
  components: {
    CheckIcon, ResponseMessage, TextInput, LoadingButton, ClickStats, Loading,
  },

  computed: {
    ...mapGetters([
      'myPaidImages', 'paidImagePrices', 'paidImagePayments', 'paidImageClickStats', 'isDarkTheme',
    ]),

    isCancelled () {
      return this.ad && this.ad.status === adStatuses.cancelled
    },

    chartData () {
      if (this.paidImageClickStats.fetched && this.paidImageClickStats.payload.length > 0) {
        let chartDataObj = {
          labels: [],
          datasets: [
            {
              label: 'Clicks',
              backgroundColor: "#9aebe744",
              strokeColor: '#08ccc2',
              borderColor: '#49ded7',
              color: '#08ccc2',
              data: [],
            }
          ]
        }

        this.paidImageClickStats.payload.forEach(clicksAndDate => {
          chartDataObj.datasets[0].data.push(clicksAndDate.clicks)
          chartDataObj.labels.push(clicksAndDate.date)
        })
        
        return chartDataObj
      }

      return null
    },

    isEditingOrDeleting () {
      return this.isEditingAd || this.isDeletingAd
    },

    adPriceTexts () {
      if (!this.paidImagePrices.fetched || !this.ad) { return [] }

      return this.paidImagePrices.payload[this.ad.adType].map(({durationMonths, price, discountedPrice}) => {
        if (discountedPrice !== null) {
          return 'FREE! $0 total. Will automatically be selected as long as we offer this discount, for your first month only.'
        }
        return `${'$'+price/durationMonths}/month for a duration of ${durationMonths} months (${'$'+price} total)`
      })
    },

    isSavable () {
      return this.isEditingAd
        && !(this.isEditedAdCard && this.remainingCharsMainText < 0)
        && !(this.isEditedAdCard && this.remainingCharsSecondaryText < 0)
        && !(this.isEditedAdCard && this.editedAd.mainText.length <= 0)
        && !this.fileErrorMessage
        && this.editedAd.link
        && this.editedAd.adName
    },

    isDeletePermanent () {
      return this.adTypesThatDirectlyDelete.includes(this.ad.status)
    },

    canOnlyDeactivate () {
      return this.isDeletePermanent && this.ad.clicks > 0
    },

    isEditedAdCard () {
      return this.ad.adType === 'card'
    },

    remainingCharsMainText () {
      return 25 - this.editedAd.mainText.length
    },

    remainingCharsSecondaryText () {
      return 60 - this.editedAd.secondaryText.length
    },
  },

  props: {
    ad: Object,
  },

  data () {
    return {
      config,

      fileErrorMessage: '',
      adFile: undefined,

      isEditingAd: false,
      isDeletingAd: false,
      isLoadingRenewal: false,
      isSubmitting: false,
      responseMessage: '',
      responseMessageType: 'success',
      editedAd: {},
      deleteAdConfirmText: '',
      adTypesWithClicks: ['ACTIVE', 'ACTIVE BUT PENDING', 'ACTIVE BUT NEEDS CORR.', 'ENDED'],
      adTypesThatDirectlyDelete: ['PENDING', 'NEEDS CORRECTION', 'AWAITING PAYMENT'],
      adTypesToShowExpiryDates: ['ACTIVE', 'ACTIVE BUT PENDING', 'ACTIVE BUT NEEDS CORR.', 'ENDED'],
      adTypesToShowDaysActive: ['ACTIVE', 'ACTIVE BUT PENDING', 'ACTIVE BUT NEEDS CORR.'],
      adTypesToShowDiscountedPrices: ['PENDING', 'NEEDS CORRECTION', 'AWAITING PAYMENT'],
      adTypesDontPayYet: ['PENDING', 'NEEDS CORRECTION'],
    }
  },

  mounted () {
    this.editedAd = { ...this.ad }
    if (!this.paidImagePrices.fetched) {
      doFetch(this.$store.commit, 'paidImagePrices', advertisingApi.getAdPrices())
    }
    doFetch(this.$store.commit, 'paidImageClickStats', advertisingApi.getAdClickStats(this.ad.id))
  },

  watch: {
    ad () {
      this.resetAllEdits()
      doFetch(this.$store.commit, 'paidImageClickStats', advertisingApi.getAdClickStats(this.ad.id))
      document.getElementById('paidImageDetail').scrollIntoView({behavior: 'smooth'})
    }
  },

  methods: {
    processFileUploadChange (changeEvent) {
      this.adFile = changeEvent.target.files[0]
      this.fileErrorMessage = ''
      if (this.adFile) {
        this.checkFileRequirements()
      }
    },

		async checkFileRequirements () {
			let fileReader = new FileReader()
			fileReader.onload = () => {
				let tempImage = new Image()
				tempImage.src = fileReader.result
				tempImage.onload = () => {
          let isError = false

          if (this.ad.adType === 'card') {
            isError = (tempImage.width !== 200 || tempImage.height !== 283)
          }
          else if (this.ad.adType === 'banner') {
            isError = (tempImage.width !== 728 || tempImage.height !== 90)
          }
          else if (this.ad.adType === 'topSmall') {
            isError = (tempImage.width !== 300 || tempImage.height !== 90)
          }

          if (isError) {
            this.fileErrorMessage = `The file does not match the ${config.adTypeInfos[this.ad.adType].resolution} pixel requirement (is ${tempImage.width}x${tempImage.height}).`
          }
				}
			}

      fileReader.readAsDataURL(this.adFile)
		},

    resetAllEdits () {
      this.editedAd = { ...this.ad }
      this.adFile = null
      this.fileErrorMessage = ''
      this.isLoadingRenewal = false
      this.isSubmitting = false
      this.deleteAdConfirmText = ''
    },

    cancelEdit () {
      this.isEditingAd = false
      this.resetAllEdits()
    },

    async saveEdit () {
      if (!this.isSavable) { return }

      this.responseMessage = ''
      this.isSubmitting = true

      let result = await advertisingApi.updateAd(
        this.ad.id,
        this.editedAd.adName,
        this.editedAd.link,
        this.editedAd.mainText,
        this.editedAd.secondaryText,
        this.adFile,
      )
      this.isSubmitting = false

      if (result.success) {
        this.cancelEdit()
        this.$emit('updateAds', result.ad.id)
        this.responseMessage = 'Update successful'
        this.responseMessageType = 'success'
      }
      else {
        this.responseMessage = result.message
        this.responseMessageType = 'error'
      }
    },

    startDeletingAd () {
      this.isDeletingAd = true
      this.deleteAdConfirmText = ''
    },

    cancelDelete () {
      this.deleteAdConfirmText = ''
      this.isDeletingAd = false
    },

    async deleteAd () {
      if (this.deleteAdConfirmText !== this.ad.id) { return }

      this.responseMessage = ''
      this.isSubmitting = true
      let result = await advertisingApi.deleteOrDeactivateAd(this.ad.id)
      this.isSubmitting = false

      if (result.success) {
        this.cancelDelete()
        if (this.isDeletePermanent && !this.canOnlyDeactivate) {
          this.$emit('updateAds')
        }
        else {
          this.$emit('updateAds', this.ad.id)
        }
      }
      else {
        this.responseMessage = result.message
        this.responseMessageType = 'error'
      }
    },

    formatTimestamp (timestamp) {
      if (!timestamp) { return '' }
      return format(new Date(timestamp), 'MMM do yyyy')
    },

    getAdStatusClass (status) {
      if ([adStatuses.pending, adStatuses.activeButPending].includes(status)) {
        return 'monoInfo'
      }
      else if ([adStatuses.needsCorrection, adStatuses.awaitingPayment, adStatuses.activeNeedsCorrection].includes(status)) {
        return 'monoWarning'
      }
      else if ([adStatuses.ended, adStatuses.cancelled].includes(status)) {
        return 'monoError'
      }
      else {
        return 'monoSuccess'
      }
    },

    generateRandomQueryString () {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopq';
      const charactersLength = characters.length
      let queryString = ''
      for (var i=0; i<4; i++) {
        queryString += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return queryString
    },
  }
}

const adStatuses = {
  pending: 'PENDING',
  needsCorrection: 'NEEDS CORRECTION',
  awaitingPayment: 'AWAITING PAYMENT',
  active: 'ACTIVE',
  activeButPending: 'ACTIVE BUT PENDING',
  activeNeedsCorrection: 'ACTIVE BUT NEEDS CORR.',
  ended: 'ENDED',
  cancelled: 'CANCELLED',
}
</script>

<style lang="scss" scoped>
.cardImagesContainer {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}

.firstAdDashboardBox {
  width: calc(min(95%, 30rem));
}

.paidImageDetail {
  >p, >span>p {
    margin-bottom: 0.5rem;  
  }
}
</style>