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

      <p>
        <b>
          If you are eligible for a free discount, we'll skip the "awaiting payment" step. This means that we'll activate your ad as soon as it looks good. You'll receive an email when your ad has been activated.
        </b>
          If you are not eligible for a free discount, your ad will go directly to the "awaiting payment" stage after being approved. Note that the requirements for getting a free discount have changed lately - see the fourth box on the previous page for more details.
      </p>
    </div>

    <Form :buttonText="'Submit for approval'"
          :canSubmit="!disableSubmit"
          :errorText="submitMissingFieldsMsg"
          :fetchingText="'Submitting...'"
          :fetchState="advertisingApplySubmit"
          :header="'Advertiser application form'"
          :successText="'Success! See your ad dashboard for details.'"
          :hideSubmit="!adType"
          maxWidth="420"
          @submit="submitApplication"
          @closeMessage="submitMissingFieldsMsg = null">

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
        <p style="font-size: 0.9rem;" class="textLeft">
          You'll choose the pricing you want after approval, but here are the options (see above for notes on free discount):
        </p>
        <ul class="textLeft" style="font-size: 0.9rem;">
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

      <div class="yForm2Field" v-if="adType">
        <label for="piFile">
          Image or gif ({{adTypeInfos[adType].resolution}} px):
        </label>
        <div class="horizontalFlexLeft flexWrap mt-4">
          <div class="pretty-input-upload mr-8">
            <input type="file"
                   @change="processFileUploadChange"
                   id="piFile"
                   accept="image/png,image/gif,image/jpeg"
                   class="input-file"/>
            <p>Select file</p>
          </div>
          <p v-if="adFile" class="textLeft">
            Selected: {{adFile.name}}
          </p>
        </div>

        <p v-if="fileErrorMessage" class="red-color mt-4 textLeft" style="max-width: 24rem;">
          {{fileErrorMessage}}
        </p>
        <p v-else-if="adFile" class="mt-4 textLeft">
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
import { doFetch, fetchClear } from '@/utils/statefulFetch'

const adTypeInfos = {
  card: { displayName: 'Comic card', resolution: '200x283' },
  banner: { displayName: 'Comic banner', resolution: '728x90' },
  topSmall: { displayName: 'Top of page', resolution: '300x90' },
}

export default {
  name: 'advertisingApply',
  
  components: {
    CheckIcon, Form, TextInput, Select,
  },

  computed: {
    ...mapGetters([
      'advertisingApplySubmit', 'isDarkTheme', 'paidImagePrices',
    ]),

    disableSubmit () {
      let shouldDisable = this.remainingCharsMainText<0 || this.remainingCharsSecondaryText<0 || this.fileErrorMessage
      return shouldDisable
    },

    isCardAd () {
      return this.adType === 'card'
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
        text: adTypeInfos[adType].displayName,
        value: adType,
      }))
    },

    adPriceTexts () {
      if (!this.paidImagePrices.fetched || !this.adType) { return [] }
      return this.paidImagePrices.payload[this.adType].map(({durationMonths, price, discountedPrice}) => {
        if (discountedPrice !== null) {
          return `Discounted: ${'$'+discountedPrice/durationMonths}/month for a duration of ${durationMonths} months (${'$'+discountedPrice} total)`
        }
        return `${'$'+price/durationMonths}/month for a duration of ${durationMonths} months (${'$'+price} total)`
      })
    },
  },

  mounted () {
    miscApi.logRoute('advertising apply')

    if (!this.paidImagePrices.fetched) {
      doFetch(this.$store.commit, 'paidImagePrices', adApi.getAdPrices())
    }
  },

  beforeDestroy () {
    fetchClear(this.$store.commit, 'advertisingApplySubmit')
  },

  data () {
    return {
      adTypeInfos,
      adFile: undefined,
      fileErrorMessage: '',
      adType: undefined,
      adLink: '',
      adMainText: '',
      adSecondaryText: '',
      notes: '',
      adName: '',
      isAwaitingResponse: false,
      success: false,
      responseMessage: '',
      submitMissingFieldsMsg: '',
    }
  },

  watch: {
    adType () {
      this.adFile = undefined
      this.adMainText = ''
      this.adSecondaryText = ''
      this.fileErrorMessage = ''
    }
  },

  methods: {
    async submitApplication () {
      if (this.isAwaitingResponse) { return }

      let missingFieldsMsg = this.getSubmitFieldsErrorMessage()
      if (missingFieldsMsg) {
        this.submitMissingFieldsMsg = missingFieldsMsg
        return
      }
      this.submitMissingFieldsMsg = null
      
      let file1 = this.adFile

      doFetch(this.$store.commit, 'advertisingApplySubmit', 
        adApi.submitAdvertisingApplication(
          file1, this.adType, this.adName, this.adLink, this.adMainText, this.adSecondaryText, this.notes))
    },

    getSubmitFieldsErrorMessage () {
      let errorMessage = 'Missing fields: '
      let isMissing = false

      if (!this.adType) {
        errorMessage += 'ad type, '
        isMissing = true
      }
      if (!this.adLink) {
        errorMessage += 'link, '
        isMissing = true
      }
      if (!this.adName) {
        errorMessage += 'ad name, '
        isMissing = true
      }
      if (!this.adFile) {
        errorMessage += 'image, '
        isMissing = true
      }
      if (this.isCardAd) {
        if (!this.adMainText) {
          errorMessage += 'main text, '
          isMissing = true
        }
      }

      if (!isMissing) {
        return null
      }
      return errorMessage.substring(0, errorMessage.length-2)
    },

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

          if (this.adType === 'card') {
            isError = (tempImage.width !== 200 || tempImage.height !== 283)
          }
          else if (this.adType === 'banner') {
            isError = (tempImage.width !== 728 || tempImage.height !== 90)
          }
          else if (this.adType === 'topSmall') {
            isError = (tempImage.width !== 300 || tempImage.height !== 90)
          }

          if (isError) {
            this.fileErrorMessage = `The file does not match the ${adTypeInfos[this.adType].resolution} pixel requirement (is ${tempImage.width}x${tempImage.height}).`
          }
				}
			}

      fileReader.readAsDataURL(this.adFile)
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