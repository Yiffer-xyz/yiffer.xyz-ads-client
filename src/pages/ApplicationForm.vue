<template>
  <div style="width: 100%;">
    <h1>Apply as an advertiser</h1>

    <div class="full-width-text full-width-text-wider mb-32">
      <p>
        We're delighted to see a potential advertiser! Below is some info about the process. The status of your applications can always be seen in your ads dashboard.
      </p>

      <img v-if="isDarkTheme" src="https://i.imgur.com/xC4NPCS.png" class="adFlowImg"/>
      <img v-else src="https://i.imgur.com/HZCHqIO.png" class="adFlowImg"/>

      <h3>
        Payment details
      </h3>

      <p>
        When paying initially, or when renewing an ad, you can choose for what duration you wish to pay. We will automatically extend the expiry date according to the amount received. You'll send the money to advertising@yiffer.xyz on PayPal. It is vital that you <b>include your ad's id in the message field</b> when sending the money, so we know which ad to update. You should never pay anything if your ad is in the <span class="monoInfo">PENDING</span> or <span class="monoWarning">NEEDS CORRECTION</span> states.
      </p>

      <p>
        It may take a few days to get your ad approved, as well as for us to register your payment afterwards. In the near future, we aim to automate the payment process by creating a solution where you can pay by credit card instead. This will eliminate the need for manual payment review.
      </p>
    </div>

    <Form :buttonText="'Submit for approval'"
          :canSubmit="isReadyForSubmit"
          :errorText="advertisingApplySubmit.errorMessage"
          :fetchingText="'Submitting...'"
          :fetchState="advertisingApplySubmit"
          :header="'Advertiser application form'"
          :successText="'Success! See your ad dashboard for details.'"
          :hideSubmit="!adType"
          maxWidth="420"
          @submit="submitApplication">
          
      <TextInput :value="adLink"
                 @change="newVal => adLink = newVal"
                 title="Link (where the users end up when clicking your ad)"
                 textAlign="left"
                 classes="width100 mb-48"/>

      <Select :options="adTypeOptions"
              title="Type of ad"
              @change="newAdType => adType = newAdType"
              wrapperStyle="min-width: 13rem;"
              classes="mb-16"/>

      <div class="verticalFlex alignItemsStart mb-32" v-if="adType">
        <p style="font-size: 0.9rem;" class="textAlignLeft">
          You'll choose the pricing you want after approval, but here are the options:
        </p>
        <ul class="textAlignLeft" style="font-size: 0.9rem;">
          <li v-for="priceText in adPriceTexts" :key="priceText">
            {{priceText}}
          </li>
        </ul>
      </div>

      <TextInput :value="adMainText"
                 v-if="isCardAd"
                 @change="newVal => adMainText = newVal"
                 title="Main text"
                 textAlign="left"
                 classes="width100 mb-48"
                 :helperText="adMainText ? `${remainingCharsMainText} characters left` : undefined"
                 :helperTextError="remainingCharsMainText<0"/>

      <TextInput :value="adSecondaryText"
                 v-if="isCardAd"
                 @change="newVal => adSecondaryText = newVal"
                 title="Secondary text (optional)"
                 textAlign="left"
                 classes="width100 mb-48"
                 :helperText="adSecondaryText ? `${remainingCharsSecondaryText} characters left` : undefined"
                 :helperTextError="remainingCharsSecondaryText<0"/>

      <div class="yForm2Field" v-if="adType && adType === 'banner'">
        <label for="bannerAdFile">Image or gif (680x100):</label>
        <div class="horizontalFlexLeft flexWrap mt-4">
          <div class="pretty-input-upload mr-8">
            <input type="file" @change="processFileUploadChangeBanner" id="bannerAdFile" accept="image/x-png,image/gif,image/jpeg" class="input-file"/>
            <p>Select file</p>
          </div>
          <p v-if="fileBanner" class="textAlignLeft">Selected: {{fileBanner.name}}</p>
        </div>

        <p v-if="fileErrorMessageBanner" class="red-color mt-4 textAlignLeft" style="max-width: 24rem;">
          {{fileErrorMessageBanner}}
        </p>
        <p v-else-if="fileBanner" class="mt-4 textAlignLeft">
          <CheckIcon/> File matches size requirements.
        </p>
      </div>

      <div class="yForm2Field" v-if="adType && adType === 'card'">
        <label for="card1AdFile">Image or gif (200x283):</label>
        <div class="horizontalFlexLeft flexWrap mt-4">
          <div class="pretty-input-upload mr-8">
            <input type="file" @change="processFileUploadChangeCard1" id="card1AdFile" accept="image/x-png,image/gif,image/jpeg" class="input-file"/>
            <p>Select file</p>
          </div>
          <p v-if="fileCard1" class="textAlignLeft">Selected: {{fileCard1.name}}</p>
        </div>

        <p v-if="fileErrorMessageCard1" class="red-color mt-4 textAlignLeft" style="max-width: 24rem;">
          {{fileErrorMessageCard1}}
        </p>
        <p v-else-if="fileCard1" class="mt-4 textAlignLeft">
          <CheckIcon/> File matches size requirements.
        </p>
      </div>

      <div class="yForm2Field" v-if="adType && adType === 'card'">
        <label for="card2AdFile">Image or gif (100x141):</label>
        <div class="horizontalFlexLeft flexWrap mt-4">
          <div class="pretty-input-upload mr-8">
            <input type="file" @change="processFileUploadChangeCard2" id="card2AdFile" accept="image/x-png,image/gif,image/jpeg" class="input-file"/>
            <p>Select file</p>
          </div>
          <p v-if="fileCard2" class="textAlignLeft">Selected: {{fileCard2.name}}</p>
        </div>

        <p v-if="fileErrorMessageCard2" class="red-color mt-4 textAlignLeft" style="max-width: 24rem;">
          {{fileErrorMessageCard2}}
        </p>
        <p v-else-if="fileCard2" class="mt-4 textAlignLeft">
          <CheckIcon/> File matches size requirements.
        </p>
      </div>

      <TextInput :value="adName"
                 @change="newVal => adName = newVal"
                 title="Give your ad a name (just for your own sake, not visible to anyone)"
                 textAlign="left"
                 :classes="`width100 mb-48 ${adType ? 'mt-16' : 'mt-48'}`"/>

      <TextInput :value="notes"
                 @change="newVal => notes = newVal"
                 title="Notes or comments for our staff (optional)"
                 textAlign="left"
                 :classes="`width100 mb-32`"/>
    </Form>
  </div>
</template>

<script>
import Form from '@/components/Form.vue'
import TextInput from '@/components/TextInput.vue'
import Select from '@/components/Select.vue'

import miscApi from '@/api/miscApi'
import adApi from '../api/advertisingApi'

import CheckIcon from 'vue-material-design-icons/CheckCircle.vue'
import { mapGetters } from 'vuex'
import { doFetch, fetchClear } from '../utils/statefulFetch'

export default {
  name: 'advertisingApply',
  
  components: {
    CheckIcon, Form, TextInput, Select,
  },

  computed: {
    ...mapGetters([
      'advertisingApplySubmit', 'isDarkTheme', 'paidImagePrices',
    ]),

    isCardAd () {
      return this.adType === 'card'
    },

    isBannerAd () {
      return this.adType === 'banner'
    },

    remainingCharsMainText () {
      return 25 - this.adMainText.length
    },

    remainingCharsSecondaryText () {
      return 60 - this.adSecondaryText.length
    },

    adTypeOptions () {
      if (!this.paidImagePrices.fetched) { return [] }
      return Object.keys(this.paidImagePrices.payload).map(adType => ({
        text: adType[0].toUpperCase() + adType.substr(1),
        value: adType,
      }))
    },

    adPriceTexts () {
      if (!this.paidImagePrices.fetched || !this.adType) { return [] }
      return this.paidImagePrices.payload[this.adType].map(({durationMonths, price, discountedPrice}) => {
        if (discountedPrice) {
          return `Discounted: ${'$'+discountedPrice/durationMonths}/month for a duration of ${durationMonths} months (${'$'+discountedPrice} total)`
        }
        return `${'$'+price/durationMonths}/month for a duration of ${durationMonths} months (${'$'+price} total)`
      })
    },

    isReadyForSubmit () {
      if (!this.adType || !this.adLink || this.isAwaitingResponse || !this.adName) {
        return false
      }
      if (this.isCardAd) {
        if (!this.adMainText || this.remainingCharsMainText<0 || this.remainingCharsSecondaryText<0
          || !this.fileCard1 || !this.fileCard2 || this.fileErrorMessageCard1 
          || this.fileErrorMessageCard2) {
          return false
        }
      }
      else {
        if (!this.fileBanner || this.fileErrorMessageBanner) {
          return false
        }
      }

      return true
    },
  },

  mounted () {
    miscApi.logRoute('advertising apply')

    doFetch(this.$store.commit, 'paidImagePrices', adApi.getAdPrices())
  },

  beforeDestroy () {
    fetchClear(this.$store.commit, 'advertisingApplySubmit')
  },

  data () {
    return {
      adType: undefined,
      adLink: '',
      adMainText: '',
      adSecondaryText: '',
      fileBanner: undefined,
      fileCard1: undefined,
      fileCard2: undefined,
      notes: '',
      adName: '',
      fileErrorMessageBanner: '',
      fileErrorMessageCard1: '',
      fileErrorMessageCard2: '',
      isAwaitingResponse: false,
      success: false,
      responseMessage: '',
    }
  },

  watch: {
    adType () {
      this.checkFileRequirements()
    }
  },

  methods: {
    async submitApplication () {
      if (!this.isReadyForSubmit) { return }
      
      let file1 = null
      let file2 = null

      if (this.isCardAd) {
        file1 = this.fileCard1
        file2 = this.fileCard2
      }
      else {
        file1 = this.fileBanner
      }

      doFetch(this.$store.commit, 'advertisingApplySubmit', 
        adApi.submitAdvertisingApplication(
          file1, file2, this.adType, this.adName, this.adLink, this.adMainText, this.adSecondaryText, this.notes))
    },

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
  },

  metaInfo () {
    let title = `Advertising - Yiffer.xyz`
    return {
      title: title,
      meta: [
        {vmid: 'twitterTitle', name: 'twitter:title', content: title},
        {vmid: 'ogTitle', property: 'og:title', content: title},
        {vmid: 'twitterDesc', name: 'twitter:description', content: "The internet's best collection of high quality furry porn comics, easily readable and free!"},
        {vmid: 'ogDesc', property: 'og:description', content: "The internet's best collection of high quality furry porn comics, easily readable and free!"}
      ]
    }
  },
}
</script>

<style lang="scss">
.adFlowImg {
  margin: 1rem auto;
  max-height: 700px;
  max-width: 98%;
}
</style>