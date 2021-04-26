<template>
  <div style="width: 100%;">
    <h1>Advertising dashboard</h1>

    <div class="full-width-text">
      <p class="link-color cursorPointer" @click="() => isShowingInstructions = !isShowingInstructions">
        {{isShowingInstructions ? 'Hide instructions' : 'Click to show instructions'}}
      </p>

      <div v-if="isShowingInstructions">
        <h4 class="mt-16">Payment</h4>
        <p>
          To pay: go to <a href="https://paypal.me/yifferadvertising/USD" target="_blank" class="underline-link">paypal.me/yifferadvertising</a>, or pay manually on PayPal by sending money to advertising@yiffer.xyz. You <u>must</u> put your ad's ID in the message field, otherwise we won't know what the payment is for. After you have paid, we review the payment and update your ad's status, which may take up to a few days. In the future, we are planning to make the payment process fully automated.
        </p>

        <h4 class="mt-16">Questions/contact</h4>
        <p>
          If you have any questions regarding advertising, or if something is not working, you can contact us via email at advertising@yiffer.xyz.
        </p>

        <h4 class="mt-16">Ad status flow</h4>
        <ol class="spaced-list" style="margin-top: 4px;">
          <li style="margin-top: 4px;">
            When applying, your application is given an ID and can be found here. Your application gets the status of <span class="monoInfo">PENDING</span>. You are sent an email from advertising@yiffer.xyz to the address connected to your account.
            <br/>
            You may edit the details of your ad at any point until you have paid. If you edit after it has been approved, its state will revert to <span class="monoInfo">PENDING</span> and will need to be approved again.
          </li>
          <li>
            We review your application. If something needs correcting, your application gets the status of <span class="monoWarning">NEEDS CORRECTION</span>. You are sent an email describing the changes needed to have the ad accepted. These requirements can also be found here in the ads dashboard.
          </li>
          <li>
            Your application is accepted. We will send you an email to notify you of this. You may then pay the amount in question via PayPal. Remember to add the ad-ID in the message when paying. Your application gets the status of <span class="monoWarning">AWAITING PAYMENT</span>.
          </li>
          <li>
            We receive the payment and process it manually. This may take at most a few days. The status of your advertisement is updated to <span class="monoInfo">ACTIVE SOON</span>. Your ads will be displayed for the paid for duration of months, <u>starting the first day of the next month</u> (For example, if your payment is processed August 8th, and you paid for two months of ads, your ads will be displayed from September 1st to October 31st). 
          </li>
          <li>
            Finally, your application is shown and the status is set to <span class="monoSuccess">ACTIVE</span>.
          </li>
          <li>
            You may turn on auto-renewal of your ads at any time. You still have to manually pay each time period, within each time period's starting date. The application status is set to <span class="monoSuccess">ACTIVE, AWAITING RENEWAL PAYMENT</span> before you have paid, and <span class="monoSuccess">ACTIVE, RENEWAL PAID</span> after you have paid for the next period.
          </li>
          <li>
            Finally, an ad that expires without being renewed gets the status <span class="monoError">ENDED</span>. You may reactivate an ended ad later. It will still remain in the list below, along with its "clicks" stat. You may also prematurely end an active ad, but we will not refund the money you have paid.
          </li>
        </ol>
      </div>


      <div class="adDashboardBox simpleShadowNoHover firstAdDashboardBox">
        <p v-if="!selectedAd">
          Select an ad from the list below to see its full details
        </p>

        <span v-else class="paidImageDetail">
          <p>
            Id: <strong>{{selectedAd.id}}</strong>
          </p>

          <p :class="getAdStatusClass(selectedAd.status)">
            {{selectedAd.status}}
          </p>

          <p v-if="selectedAd.status === 'NEEDS CORRECTION'" class="correctionNote">
            Correction note: {{selectedAd.correctionNote}}
          </p>

          <p v-if="adTypesWithClicks.includes(selectedAd.status)">
            Clicks: {{selectedAd.clicks}}
          </p>

          <p>
            Type: {{selectedAd.adTypeLong}}
          </p>

          <p>
            Price: {{selectedAd.price}}$
          </p>

          <p v-if="selectedAd.activationDate">
            Activation: {{formatTimestamp(selectedAd.activationDate)}}
          </p>

          <p v-if="selectedAd.deactivationDate && selectedAd.status === 'ACTIVE, RENEWAL PAID'">
            Renews: {{formatTimestamp(selectedAd.deactivationDate)}}
          </p>
          <p v-else-if="selectedAd.deactivationDate">
            Ends: {{formatTimestamp(selectedAd.deactivationDate)}}
          </p>

          <!-- MAIN TEXT -->
          <p v-if="selectedAd.adType.includes('card') && !isEditingAd">
            Main text: <i>{{selectedAd.mainText}}</i>
          </p>
          <TextInput @change="newVal => editedAd.mainText = newVal"
                     :value="editedAd.mainText"
                     v-if="selectedAd.adType.includes('card') && isEditingAd"
                     type="text"
                     :title="`Main text (${remainingCharsMainText} characters left)`"
                     textAlign="left"
                     classes="mb-32"/>

          <!-- SECONDARY TEXT -->
          <p v-if="selectedAd.adType.includes('card') && !isEditingAd">
            Secondary text: <i>{{selectedAd.secondaryText || '-'}}</i>
          </p>
          <TextInput @change="newVal => editedAd.secondaryText = newVal"
                     :value="editedAd.secondaryText"
                     v-if="selectedAd.adType.includes('card') && isEditingAd"
                     type="text"
                     :title="`Secondary text (${remainingCharsSecondaryText} characters left)`"
                     textAlign="left"
                     classes="mb-32"/>

          <!-- LINK -->
          <p v-if="!isEditingAd">
            Link: <a :href="selectedAd.link" target="_blank">
              {{selectedAd.link}}
            </a>
          </p>
          <TextInput @change="newVal => editedAd.link = newVal"
                     :value="editedAd.link"
                     v-if="selectedAd.adType.includes('card') && isEditingAd"
                     type="text"
                     :title="`Link`"
                     textAlign="left"
                     classes="mb-32"/>

          <p style="margin-bottom: 0;">Media:</p>
          <img :src="`${config.paidImagesDirectory}/${selectedAd.id}.${selectedAd.filetype}`"
               style="max-width: 100%;"/>

          <!-- CHANGE MEDIA -->
          <p v-if="isEditingAd">
            Change media? If not, ignore this and the current one will be kept.
          </p>
          <div class="horizontalFlexLeft flexWrap mt-4" v-if="isEditingAd">
            <div class="pretty-input-upload mr-8">
              <input type="file" @change="processFileUploadChange" id="cardAdFile" accept="image/x-png,image/gif,image/jpeg" class="input-file"/>
              <p>Replace file</p>
            </div>
            <p v-if="file" class="alignSelfCenter bold" style="word-break: break-all;">
              Selected: {{file.name}}
            </p>
          </div>

          <p v-if="fileErrorMessage" class="red-color mt-4 bold">
            {{fileErrorMessage}}
          </p>
          <p v-else-if="file" class="mt-4">
            <CheckIcon/> File matches size requirements.
          </p>

          <ResponseMessage :message="responseMessage"
                            :messageType="responseMessageType"
                            v-if="isReactivateError"
                            outsideStyle="margin-bottom: 1rem; margin-top: 1rem; margin-left: 0;"
                            @closeMessage="() => {responseMessage = ''; isReactivateError = false}" />

          <!-- BUTTONS: EDIT, DEACTIVATE, REACTIVATE -->
          <div class="horizontalFlexLeft mt-16" v-if="!isEditingAd && !isDeletingAd">
            <button v-if="adTypesThatCanCorrect.includes(selectedAd.status)"
                    @click="() => isEditingAd = true"
                    class="y-button mr-16">
              Edit ad
            </button>


            <LoadingButton text="Turn on renewal"
                           v-if="selectedAd.status === 'ACTIVE'"
                           :isLoading="isLoadingRenewal"
                           @click="toggleRenewal(true)"
                           styles="margin-right: 1rem;"/>

            <LoadingButton text="Turn off renewal"
                           v-else-if="selectedAd.status === 'ACTIVE, AWAITING RENEWAL PAYMENT'"
                           :isLoading="isLoadingRenewal"
                           @click="toggleRenewal(false)"
                           styles="margin-right: 1rem;"/>

            <button v-if="selectedAd.status !== 'ENDED'"
                    @click="startDeletingAd"
                    class="y-button y-button-red">
              {{isDeletePermanent ? 'Delete ad' : 'Deactivate ad'}}
            </button>

            <button v-if="selectedAd.status === 'ENDED'"
                    @click="reactivateAd"
                    class="y-button y-button-neutral">
              Reactivate
            </button>
          </div>

          <!-- BUTTONS: EDITING: CANCEL, SAVE -->
          <div v-if="isEditingAd" class="mt-16 mb-16">
            <ResponseMessage :message="responseMessage"
                             :messageType="responseMessageType"
                             outsideStyle="margin-bottom: 1rem; margin-left: 0;"
                             @closeMessage="() => responseMessage = ''" />

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
            <p class="bold" v-if="isDeletePermanent">
              Are you sure you want to delete your ad? There is no goig back from this, and the ad will be removed from the list below. To confirm this action, type the ad's ID into the field below and submit.
            </p>
            <p class="bold" v-else>
              Are you sure you want to deactivate your ad? If you have paid money for it, this money will be lost. The ad will immediately be deactivated. It will remain in the list below, so you can reactivate it at any point if you so desire, but you will have to pay anew. To confirm this action, type the ad's ID into the field below and submit.
            </p>
            <input type="text" v-model="deleteAdConfirmText" class="mt-8" />

            <ResponseMessage :message="responseMessage"
                             :messageType="responseMessageType"
                             outsideStyle="margin-top: 1rem; margin-bottom: 1rem; margin-left: 0;"
                             @closeMessage="() => responseMessage = ''" />

            <div class="mt-16 mb-16 horizontalFlex justifyStart">
              <button @click="cancelDelete"
                      class="y-button y-button-neutral mr-16">
                Cancel
              </button>

              <LoadingButton :text="isDeletePermanent ? 'Delete' : 'Deactivate'"
                             :isDisabled="deleteAdConfirmText !== selectedAd.id"
                             :isLoading="isSubmitting"
                             @click="deleteAd"/>
            </div>
          </div>
        </span>
      </div>

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
                <th>Clicks</th>
                <th>Status</th>
                <th>Type</th>
                <th>Ends/renews</th>
              </tr>
            </thead>
            <tr v-for="ad in myPaidImages.payload"
                :key="ad.id"
                @click="() => selectAd(ad)"
                :class="{'selectedAd': selectedAd && selectedAd.id === ad.id}"
                class="paidImageRow">
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
                  {{capitalizeString(ad.adType)}}, {{ad.price}}$
                </p>
              </td>
              <td>
                <p v-if="shouldShowAdActivePeriod(ad.status)">
                  {{
                    ad.status === 'ACTIVE, RENEWAL PAID'
                    ? `${formatShortTimestamp(ad.deactivationDate)}`
                    : `${formatShortTimestamp(ad.deactivationDate)}`
                  }}
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
import ResponseMessage from '@/components/ResponseMessage.vue'
import Loading from '@/components/LoadingIndicator.vue'
import miscApi from '@/api/miscApi'
import advertisingApi from '../api/advertisingApi'
import { doFetch } from '../utils/statefulFetch'
import config from '@/config.json'
import { mapGetters } from 'vuex'
import { format } from 'date-fns'
import TextInput from '@/components/TextInput.vue'
import LoadingButton from '@/components/LoadingButton.vue'

import CheckIcon from 'vue-material-design-icons/CheckCircle.vue'

export default {
  name: 'advertisingDashboard',
  
  components: {
    Loading, CheckIcon, ResponseMessage, TextInput, LoadingButton,
  },

  mounted () {
    miscApi.logRoute('ads dashboard')
    doFetch(this.$store.commit, 'myPaidImages', advertisingApi.getMyAds())
  },

  computed: {
    ...mapGetters(['myPaidImages']),

    isSavable () {
      return this.isEditingAd
        && (this.isEditedAdBanner || this.remainingCharsMainText >= 0)
        && (this.isEditedAdBanner || this.remainingCharsSecondaryText >= 0)
        && (this.isEditedAdBanner || this.editedAd.mainText.length > 0)
        && !this.fileErrorMessage
        && this.editedAd.link
    },

    isDeletePermanent () {
      return this.adTypesThatDirectlyDelete.includes(this.selectedAd.status)
    },

    isEditedAdBanner () {
      return this.selectedAd.adType.includes('banner')
    },

    remainingCharsMainText () {
      return 25 - this.editedAd.mainText.length
    },

    remainingCharsSecondaryText () {
      return 60 - this.editedAd.secondaryText.length
    },
  },

  data: function () {
    return {
      config,
      isShowingInstructions: false,
      selectedAd: null,
      adTypesWithClicks: ['ACTIVE, RENEWAL PAID', 'ACTIVE', 'ACTIVE, AWAITING RENEWAL PAYMENT', 'ENDED'],
      adTypesThatCanCorrect: ['PENDING', 'NEEDS CORRECTION', 'AWAITING PAYMENT'],
      adTypesThatDirectlyDelete: ['PENDING', 'NEEDS CORRECTION', 'AWAITING PAYMENT'],
      isEditingAd: false,
      isDeletingAd: false,
      editedAd: {},
      deleteAdConfirmText: '',
      fileErrorMessage: '',
      file: null,
      isLoadingRenewal: false,
      isSubmitting: false,
      responseMessage: '',
      responseMessageType: 'success',
      isReactivateError: false,
    }
  },

  methods: {
    selectAd (ad) {
      this.editedAd = {
        ...ad
      }
      
      this.isEditingAd = false
      this.isDeletingAd = false
      this.selectedAd = ad
      this.deleteAdConfirmText = ''
    },

    async toggleRenewal (shouldRenew) {
      this.responseMessageAds = ''
      this.isLoadingRenewal = true
      let result = await advertisingApi.toggleRenewal(this.selectedAd.id, shouldRenew)
      this.isLoadingRenewal = false

      if (result.success) {
        await this.fetchAndUpdateAds()
        this.selectedAd = this.myPaidImages.payload.find(paidImg => paidImg.id === this.selectedAd.id)
      }
    },

    cancelEdit () {
      this.isEditingAd = false
      this.editedAd = {...this.selectedAd}
      this.fileErrorMessage = ''
      this.file = null
    },

    async saveEdit () {
      if (this.fileErrorMessage) { return; }

      this.responseMessage = ''
      this.isSubmitting = true
      let result = await advertisingApi.updateAdNeedingCorrection(
        this.selectedAd.id,
        this.editedAd.link,
        this.editedAd.mainText,
        this.editedAd.secondaryText,
        this.file,
      )
      this.isSubmitting = false

      if (result.success) {
        this.cancelEdit()
        await this.fetchAndUpdateAds()
        this.selectedAd = this.myPaidImages.payload.find(paidImg => paidImg.id === this.selectedAd.id)
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
      if (this.deleteAdConfirmText !== this.selectedAd.id) { return }

      this.responseMessage = ''
      this.isSubmitting = true
      let result = await advertisingApi.deleteOrDeactivateAd(this.selectedAd.id)
      this.isSubmitting = false

      if (result.success) {
        this.cancelDelete()
        await this.fetchAndUpdateAds()
        if (this.isDeletePermanent) {
          this.selectedAd = null
        }
        else {
          this.selectedAd = this.myPaidImages.payload.find(paidImg => paidImg.id === this.selectedAd.id)
        }
      }
      else {
        this.responseMessage = result.message
        this.responseMessageType = 'error'
      }
    },

    async reactivateAd () {
      this.isReactivateError = false
      this.responseMessage = ''

      this.isSubmitting = true
      let result = await advertisingApi.reactivateAd(this.selectedAd.id)
      this.isSubmitting = false

      if (result.success) {
        await this.fetchAndUpdateAds()
        this.selectedAd = this.myPaidImages.payload.find(paidImg => paidImg.id === this.selectedAd.id)
      }
      else {
        this.isReactivateError = true
        this.responseMessage = result.message
        this.responseMessageType = 'error'
      }
    },

    async fetchAndUpdateAds () {
      try {
        let newAdsResult = await advertisingApi.getMyAds()
        this.$store.commit('set_myPaidImages_fetched', newAdsResult)
      }
      catch (err) {
        this.$store.commit('set_myPaidImages_error')
      }
    },

    processFileUploadChange (changeEvent) {
      this.file = changeEvent.target.files[0]
      this.checkFileRequirements()
    },

		async checkFileRequirements () {
      if (!this.file) { return }
      this.fileErrorMessage = ''

			let fileReader = new FileReader()
			fileReader.onload = () => {
				let tempImage = new Image()
				tempImage.src = fileReader.result
				tempImage.onload = () => {
          if (this.isEditedAdBanner) {
            if (tempImage.width !== 680 || tempImage.height !== 100) {
              this.fileErrorMessage = `The file does not match the 680x100 pixel requirement (is ${tempImage.width}x${tempImage.height}).`
            }
          }
          else {
            if (tempImage.width !== 200 || tempImage.height !== 283) {
              this.fileErrorMessage = `The file does not match the 200x283 pixel requirement (is ${tempImage.width}x${tempImage.height}).`
            }
          }
				}
			}
			fileReader.readAsDataURL(this.file)
		},

    getAdStatusClass (status) {
      if (['PENDING', 'ACTIVE SOON'].includes(status)) {
        return 'mono monoInfo'
      }
      else if (['NEEDS CORRECTION', 'AWAITING PAYMENT', 'ACTIVE, AWAITING RENEWAL PAYMENT '].includes(status)) {
        return 'mono monoWarning'
      }
      else if (status === 'ENDED') {
        return 'mono monoError'
      }
      else {
        return 'mono monoSuccess'
      }
    },

    shouldShowAdActivePeriod (status) {
      return ['ACTIVE SOON', 'ACTIVE', 'ACTIVE, AWAITING RENEWAL PAYMENT', 'ACTIVE, RENEWAL PAID', 'ENDED'].includes(status)
    },

    formatTimestamp (timestamp) {
      if (!timestamp) { return '' }
      return format(new Date(timestamp), 'MMM do yyyy')
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
.firstAdDashboardBox {
  width: calc(min(95%, 30rem));
}

.paidImageDetail {
  >p {
    margin-bottom: 0.5rem;  
  }
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
