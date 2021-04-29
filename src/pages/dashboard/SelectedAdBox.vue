<template>
  <div class="adDashboardBox simpleShadowNoHover firstAdDashboardBox">
    <p v-if="!ad">
      Select an ad from the list below to see its full details
    </p>

    <span v-else class="paidImageDetail">
      <p v-if="!isEditingAd">
        <strong>{{ad.adName}}</strong> - {{ad.adType}} ad
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
      <img v-if="ad.adType === 'banner'"
           :src="`${config.paidImagesDirectory}/${ad.id}.${ad.filetype}?${generateRandomQueryString()}`"
           style="max-width: 100%;"/>

      <div v-if="ad.adType === 'card'" class="cardImagesContainer">
        <img :src="`${config.paidImagesDirectory}/${ad.id}-big.${ad.filetype}?${generateRandomQueryString()}`"
            style="max-width: 100%; margin-right: 1rem;"/>
        <img :src="`${config.paidImagesDirectory}/${ad.id}-small.${ad.filetype}?${generateRandomQueryString()}`"
            style="max-width: 100%;"/>
      </div>


      <!-- CHANGE MEDIA -->
      <span v-if="isEditingAd">
        <p>
          Change media? If not, ignore this and the current one will be kept.
        </p>

        <!-- CARD 1 -->
        <div class="horizontalFlexLeft flexWrap mt-4" v-if="ad.adType === 'card'">
          <div class="pretty-input-upload mr-8">
            <input type="file" @change="processFileUploadChangeCard1" id="cardAdFile" accept="image/x-png,image/gif,image/jpeg" class="input-file"/>
            <p>Replace big file</p>
          </div>
          <p v-if="fileCard1" class="alignSelfCenter bold" style="word-break: break-all;">
            Selected: {{fileCard1.name}}
          </p>
        </div>

        <p v-if="fileErrorMessageCard1" class="red-color mt-4 bold" style="margin-bottom: 1rem;">
          {{fileErrorMessageCard1}}
        </p>
        <p v-else-if="fileCard1" class="mt-4" style="margin-bottom: 1rem;">
          <CheckIcon/> File matches size requirements.
        </p>

        <!-- CARD 2 -->
        <div class="horizontalFlexLeft flexWrap mt-4" v-if="ad.adType === 'card'">
          <div class="pretty-input-upload mr-8">
            <input type="file" @change="processFileUploadChangeCard2" id="cardAdFile" accept="image/x-png,image/gif,image/jpeg" class="input-file"/>
            <p>Replace small file</p>
          </div>
          <p v-if="fileCard2" class="alignSelfCenter bold" style="word-break: break-all;">
            Selected: {{fileCard2.name}}
          </p>
        </div>

        <p v-if="fileErrorMessageCard2" class="red-color mt-4 bold">
          {{fileErrorMessageCard2}}
        </p>
        <p v-else-if="fileCard2" class="mt-4">
          <CheckIcon/> File matches size requirements.
        </p>

        <!-- BANNER -->
        <div class="horizontalFlexLeft flexWrap mt-4" v-if="ad.adType === 'banner'">
          <div class="pretty-input-upload mr-8">
            <input type="file" @change="processFileUploadChangeBanner" id="cardAdFile" accept="image/x-png,image/gif,image/jpeg" class="input-file"/>
            <p>Replace file</p>
          </div>
          <p v-if="fileBanner" class="alignSelfCenter bold" style="word-break: break-all;">
            Selected: {{fileBanner.name}}
          </p>
        </div>

        <p v-if="fileErrorMessageBanner" class="red-color mt-4 bold">
          {{fileErrorMessageBanner}}
        </p>
        <p v-else-if="fileBanner" class="mt-4">
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
      <div class="horizontalFlexLeft mt-16" v-if="!isEditingOrDeleting">
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
      <div v-if="isEditingAd" class="mt-16 mb-16">
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

        <ul class="textAlignLeft" style="font-size: 0.9rem;">
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
            No daily click stats yet. Click stats are calculated at midnight, GMT +0. When your ad has been active for two days, a graph will appear here.
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
      let shouldShowDiscount = this.adTypesToShowDiscountedPrices.includes(this.ad.status)

      return this.paidImagePrices.payload[this.ad.adType].map(({durationMonths, price, discountedPrice}) => {
        if (discountedPrice && shouldShowDiscount) {
          return `Discounted: ${'$'+discountedPrice/durationMonths}/month for a duration of ${durationMonths} months (${'$'+discountedPrice} total)`
        }
        return `${'$'+price/durationMonths}/month for a duration of ${durationMonths} months (${'$'+price} total)`
      })
    },

    isSavable () {
      return this.isEditingAd
        && (this.isEditedAdBanner || this.remainingCharsMainText >= 0)
        && (this.isEditedAdBanner || this.remainingCharsSecondaryText >= 0)
        && (this.isEditedAdBanner || this.editedAd.mainText.length > 0)
        && !this.fileErrorMessageCard1
        && !this.fileErrorMessageCard2
        && !this.fileErrorMessageBanner
        && this.editedAd.link
        && this.editedAd.adName
    },

    isDeletePermanent () {
      return this.adTypesThatDirectlyDelete.includes(this.ad.status)
    },

    canOnlyDeactivate () {
      return this.isDeletePermanent && this.ad.clicks > 0
    },

    isEditedAdBanner () {
      return this.ad.adType.includes('banner')
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

  data() {
    return {
      config,
      isEditingAd: false,
      isDeletingAd: false,
      fileErrorMessage: '',
      fileBanner: undefined,
      fileCard1: undefined,
      fileCard2: undefined,
      fileErrorMessageBanner: '',
      fileErrorMessageCard1: '',
      fileErrorMessageCard2: '',
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
    }
  },

  methods: {
    processFileUploadChangeBanner (changeEvent) {
      this.fileBanner = changeEvent.target.files[0]
      this.fileErrorMessageBanner = ''
      if (this.fileBanner) {
        this.checkFileRequirements('banner')
      }
    },

    processFileUploadChangeCard1 (changeEvent) {
      this.fileCard1 = changeEvent.target.files[0]
      this.fileErrorMessageCard1 = ''
      if (this.fileCard1) {
        this.checkFileRequirements('card1')
      }
    },

    processFileUploadChangeCard2 (changeEvent) {
      this.fileCard2 = changeEvent.target.files[0]
      this.fileErrorMessageCard2 = ''
      if (this.fileCard2) {
        this.checkFileRequirements('card2')
      }
    },

		async checkFileRequirements (adFileType) {
			let fileReader = new FileReader()
			fileReader.onload = () => {
				let tempImage = new Image()
				tempImage.src = fileReader.result
				tempImage.onload = () => {
          if (adFileType === 'card1') {
            if (tempImage.width !== 200 || tempImage.height !== 283) {
              this.fileErrorMessageCard1 = `The file does not match the 200x283 pixel requirement (is ${tempImage.width}x${tempImage.height}).`
            }
          }
          else if (adFileType === 'card2') {
            if (tempImage.width !== 100 || tempImage.height !== 141) {
              this.fileErrorMessageCard2 = `The file does not match the 100x141 pixel requirement (is ${tempImage.width}x${tempImage.height}).`
            }
          }
          else if (adFileType === 'banner') {
            if (tempImage.width !== 680 || tempImage.height !== 100) {
              this.fileErrorMessageBanner = `The file does not match the 680x100 pixel requirement (is ${tempImage.width}x${tempImage.height}).`
            }
          }
				}
			}

      if (adFileType === 'card1') { fileReader.readAsDataURL(this.fileCard1) }
      else if (adFileType === 'card2') { fileReader.readAsDataURL(this.fileCard2) }
      else if (adFileType === 'banner') { fileReader.readAsDataURL(this.fileBanner) }
		},

    resetAllEdits () {
      this.editedAd = { ...this.ad }
      this.fileBanner = null
      this.fileCard1 = null
      this.fileCard2 = null
      this.fileErrorMessageBanner = ''
      this.fileErrorMessageCard1 = ''
      this.fileErrorMessageCard2 = ''
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

      let file1 = null
      let file2 = null
      if (this.fileCard1) { file1 = this.fileCard1 }
      if (this.fileCard2) { file2 = this.fileCard2 }
      if (this.fileBanner) { file1 = this.fileBanner }

      let result = await advertisingApi.updateAd(
        this.ad.id,
        this.editedAd.adName,
        this.editedAd.link,
        this.editedAd.mainText,
        this.editedAd.secondaryText,
        file1,
        file2,
      )
      this.isSubmitting = false

      if (result.success) {
        this.cancelEdit()
        this.$emit('updateAds', this.ad.id)
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