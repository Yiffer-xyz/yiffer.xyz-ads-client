<template>
  <div style="width: 100%; margin-top: 1rem; overflow-x: hidden;">
    <span :class="{'coloredYifferTitle': isDarkTheme, 'yifferTitle': !isDarkTheme}">
      Advertising
    </span>

    <div class="full-width-text full-width-text-wider">
      <div class="boxContainer">
        <div class="box">
          <h3>
            Advertsing for furry and furry-related creators
          </h3>
          <p>
            No matter your type of creativity or service, as long as it is furry or furry-related, you can advertise it here! Artists, writers, fursuit makers, convention organizers, photographers, Onlyfans models - all are welcome. Suggestive and censored ads are allowed -  more details below.
          </p>
        </div>
        <div class="box">
          <h3>
            40,000+ daily visitors
          </h3>
          <p>
            As of January 2022, about 40,000 people are visiting Yiffer.xyz every day. We record the number of clicks your ads get and display this in a neat little dashboard, so you can see and decide for yourself whether to keep going after your first months.
          </p>
        </div>
        <div class="box">
          <h3>
            Not blocked by adblockers
          </h3>
          <p>
            Because we've crafted this advertising service ourselves, your ads will not be hidden by adblockers.
          </p>
        </div>
        <div class="box">
          <h3 class="themeColorText">
            FREE trial for creators!
          </h3>
          <p>
            We're offering one of two discounts on any ad type <i>for creators only</i>:
          </p>
          <ul>
            <li>
              You can get your first month free without any commitment required, or:
            </li>
            <li>
              You can get a 50% discount on your first four months if you commit to the 4-month ad type straight away.
            </li>
          </ul>
          <p class="mt-12">
            This applies to all content creators, but not things like discord servers. Only one trial/discount per advertiser.
          </p>
        </div>
      </div>

      <div class="upperLoginButton">
        <a v-if="isAuthenticated && userData && !userData.email" href="https://yiffer.xyz/account">
          <button class="y-button">
            Add an email to your account to advertise
          </button> 
        </a>
        <router-link :to="{name: 'apply'}"
                     v-else-if="isAuthenticated"
                     class="underline-link">
          <button class="y-button-big applyButton">
            Apply as an advertiser<RightArrow/>
          </button>
        </router-link>
        <router-link v-else :to="{name: 'login'}">
          <button class="y-button">
            Log in to apply as an advertiser
          </button> 
        </router-link>
      </div>

      <h2 class="mt-48">Ad types</h2>
      <p class="mt-0 mb-8">Click an ad type for more info</p>



      <div class="piSummaryContainer"> 
        <div v-for="adInfo in adInfos"
             class="piSummary box smallerBox"
             :class="{piSummarySelected: adTypeShown === adInfo.adName}"
             @click="adTypeShown = adInfo.adName"
             :key="adInfo.adName">
          <p class="themeColorTextDarker">
            {{adInfo.header}}
          </p>
          <p>
            {{adInfo.dimensions}}
          </p>
          <p>
            {{getPriceString(adInfo.adName)}}
          </p>
        </div>  
      </div>

      <AdTopSmall v-if="adTypeShown === 'topSmall'"/>

      <AdComicCard v-if="adTypeShown === 'card'"/>

      <AdBanner v-if="adTypeShown === 'banner'"/>

      <h2 class="mt-48">Additional information</h2>
      <p>
        All pictures (JPG and PNG) will be converted to WebP with minimal loss, with JPG as fallback. All GIFs will be converted to WebM with minimal loss, with MP4 as backup. This is done to save user data and speed up the page load, as these formats are much more lightweight. If this conversion results in an unacceptable loss in quality for your specific ad, please contact us and we will honor your request to have your ad skip the conversion and be displayed in its original format.
      </p>

      <p>
        The ads may be suggestive, but no excessive lewdness. Genitals are not strictly forbidden, but keep it tasteful. Media including content that is commonly frowned upon will be rejected. Censored pictures are allowed. If you're uncertain, feel free to ask us at advertising@yiffer.xyz in advance.
      </p>

      <p>
        The frequency of your ads showing up entirely depends on how many advertisers there are in total. If there are ten advertisers, every tenth ad (give or take) will be your own. This goes for all types of ads.
      </p>

      <p>
        Each price is for a single ad with a single image/gif. It is perfectly fine to apply several times with different images/gifs. You may also upload the same picture/gif if you want your ad to show up more frequently. These will be treated as separate ads and you will have to pay for each one. If you've paid for two ads and there are ten in total, about two out of every ten ads displayed will be yours.
      </p>

      <p>
        Our prices may change in the future. If you have paid for an X-month commitment, you will not be affected by these changes for the duration of your commitment.
      </p>

      <p>
        Gifs must not have rapidly flashing lights or colors.
      </p>

      <p>
         For the free trials and discounts, we reserve the right to not offer it if the content being advertised seems to be of questionable quality.
      </p>

      <p>
        We will happily answer any questions you may have regarding advertising via email at advertising@yiffer.xyz. If you have suggestions for improvements of our advertising service, feel free to let us know!
      </p>

      

      <div class="mt-32 mb-16">
        <a v-if="isAuthenticated && userData && !userData.email" href="https://yiffer.xyz/account">
          <button class="y-button">
            Add an email to your account to advertise
          </button> 
        </a>
        <router-link :to="{name: 'apply'}"
                     v-else-if="isAuthenticated"
                     class="underline-link">
          <button class="y-button-big applyButton">
            Apply as an advertiser<RightArrow/>
          </button>
        </router-link>  
        <router-link v-else :to="{name: 'login'}">
          <button class="y-button">
            Log in to apply as an advertiser
          </button> 
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import miscApi from '@/api/miscApi'
import adApi from '@/api/advertisingApi'
import { doFetch } from '@/utils/statefulFetch'

import AdBanner from './AdBanner.vue'
import AdComicCard from './AdComicCard.vue'
import AdTopSmall from './AdTopSmall.vue'

import RightArrow from 'vue-material-design-icons/ArrowRight.vue'
import { mapGetters } from 'vuex'

const adInfos = [
  {
    header: 'Ad at the top of page',
    dimensions: '300x90 px (same as FA)',
    adName: 'topSmall'
  },
  {
    header: 'Banner above comics',
    dimensions: '728x90 px (same as FA/e621)',
    adName: 'banner'
  },
  {
    header: 'Ad as comic card',
    dimensions: '200x283 px',
    adName: 'card'
  },
]

export default {
  name: 'advertising',
  
  components: {
    AdBanner, AdComicCard, AdTopSmall,
    RightArrow,
  },

  computed: {
    ...mapGetters([
      'isDarkTheme', 'isAuthenticated', 'paidImagePrices', 'userData',
    ]),
  },

  data () {
    return {
      adTypeShown: null,
      adInfos,
    }
  },

  mounted () {
    miscApi.logRoute('advertising')
    if (!this.paidImagePrices.fetched) {
      doFetch(this.$store.commit, 'paidImagePrices', adApi.getAdPrices())
    }
  },

  methods: {
    showLoginModal () {
      this.$store.commit('setLoginModalVisibility', true)
    },

    getPriceString (adType) {
      if (!this.paidImagePrices.fetched) { return '' }

      let highestPrice = 0
      let lowestPrice = 99999
      this.paidImagePrices.payload[adType].forEach(adPrice => {
        let price = adPrice.price / adPrice.durationMonths
        if (price > highestPrice) { highestPrice = price }
        if (price < lowestPrice) { lowestPrice = price }
      })

      return `$${highestPrice}-$${lowestPrice} / month`
    }
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
@import "@/scss/shadows.scss";
.upperLoginButton {
  margin-top: 1rem;
  @media (max-width: 900px) {
    margin-top: 2rem;
  }
}

.applyButton {
  min-width: 24rem;
  @media (max-width: 500px) {
  min-width: 0;
    width: 100%;
  }
}

.boxContainer {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
  gap: 2rem;
  @media (max-width: 900px) {
    grid-template-columns: auto;
    gap: 1.5rem;
  }
}

.box {
  padding: 1.25rem 1.5rem;
  display: inline-flex;
  flex-direction: column;
  height: fit-content;
  border-radius: 8px;
  border-width: 2px;
  box-shadow: 0 4px 24px #68686826;

  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
  }
}

.adType {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 900px) {
    flex-direction: column;
  }
}

.themeColorText {
  color: $themeGreen2Darker;
}
.themeColorTextDarker {
  color: $themeGreen2Darker2;
}

.adMiniHeader {
  font-weight: 600;
  margin-top: 0.75rem;
}

.imgContainerSmall {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  .cardImgBig {
    max-height: 380px;
    max-width: 100%;
  }
  .cardImgSmall {
    max-height: 360px;
    max-width: 80%;
  }
  .cardImgBig, .cardImgSmall {
    border-radius: 3px;
    margin: 0.5rem 0;
  }

  
  .bannerImgBig {
    max-height: 390px;
    max-width: 120%;
  }
  .bannerImgSmall {
    max-height: 580px;
    max-width: 90%;
  }
  .bannerImgBig, .bannerImgSmall {
    border-radius: 3px;
    margin: 0.5rem 0;
  }
}

.bannerImgContainer {  position: relative;
  right: 0;
  width: 800px;
  height: 340px;
  @media (max-width: 1200px) {
    height: 240px;
  }
  @media (max-width: 900px) {
    position: relative;
    right: auto;
    height: auto;
  }
  img {
    width: 400px;
    @include simpleshadow;
    border-radius: 4px;
  }
  :first-child {
    width: 440px;
    @media (max-width: 1200px) {
      width: 350px;
    }
    position: absolute;
    left: 0;
    top: 0px;
    transform: rotate(-3deg);
    z-index: 1;
    &:hover {
      z-index: 3;
    }
  }
  :last-child {
    width: 200px;
    position: absolute;
    right: -100px;
    top: 10px;
    transform: rotate(11deg);
    z-index: 2;
    @media (max-width: 1200px) {
      width: 170px;
      top: -10px;
      right: -40px;
    }
  }
}

.imgContainer {
  position: relative;
  right: 0;
  width: 800px;
  height: 340px;
  @media (max-width: 1200px) {
    height: 240px;
  }
  @media (max-width: 900px) {
    position: relative;
    right: auto;
    height: auto;
  }
  img {
    width: 400px;
    @include simpleshadow;
    border-radius: 4px;
  }
  :first-child {
    width: 270px;
    @media (max-width: 1200px) {
      width: 220px;
    }
    position: absolute;
    left: 0;
    top: 10px;
    transform: rotate(-6deg);
    z-index: 1;
    &:hover {
      z-index: 3;
    }
  }
  :last-child {
    width: 440px;
    @media (max-width: 1200px) {
      width: 370px;
    }
    position: absolute;
    left: 140px;
    top: 0;
    transform: rotate(9deg);
    z-index: 2;
  }
}

.piSummaryContainer {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  @media (max-width: 900px) {
    gap: 1rem;
  }
}

.smallerBox {
  padding: 0.5rem 0.75rem;
  @media (max-width: 900px) {
    padding: 0.3rem 0.5rem;
  }
}

.piSummary {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  border: 4px solid transparent;
  p:first-child {
    font-size: 1.15rem;
    font-weight: 400;
  }
  &:hover {
    cursor: pointer;
  }
}

.piSummarySelected {
  border: 4px solid $themeGreen2Darker;
}

.dark {
  .box {
    background-color: $themeDark1;
    box-shadow: 0 4px 24px rgba(33, 33, 33, 0.5);
  }
  .themeColorText, .themeColorTextDarker {
    color: $themeGreen2Dark;
  }
  .piSummarySelected {
    border-color: $themeGreen2Darker;
  }
}
</style>