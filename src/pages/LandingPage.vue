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
            20,000+ daily visitors
          </h3>
          <p>
            As of the re-launch in May 2021, almost 20,000 people are visiting Yiffer.xyz every day. We record the number of clicks your ads get, so you can see and decide for yourself whether to keep going after your first months.
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
          <h3>
            Get in early - <span class="themeColorText">FREE at first!</span>
          </h3>
          <p>
            To kick advertising off here at Yiffer.xyz, we're offering 100% discounts on all ad types! Not only is it free, you should also keep in mind that the fewer advertisers there are, the more frequently your own ad will be displayed. In other words, getting in early will give you more clicks than waiting!
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
            Apply as an advertiser <RightArrow/>
          </button>
        </router-link>
        <router-link v-else :to="{name: 'login'}">
          <button class="y-button">
            Log in to apply as an advertiser
          </button> 
        </router-link>
      </div>

      <div class="adType mt-32">
        <div style="width: fit-content; padding-right: 1rem;">
          <h2>Ad type: Comic card</h2>
          <p>
            Your ad will appear at random in the same style as comics in the <a href="https://yiffer.xyz/" class="underline-link">main page</a>.
          </p>

          <p class="adMiniHeader">
            Prices
          </p>

          <p v-if="!paidImagePrices.fetched">
            Fetching prices...
          </p>
          <span v-else>
            <p v-for="price in paidImagePrices.payload.card" :key="price.durationMonths">
              {{price.durationMonths}} months: <b>${{price.price/price.durationMonths}} per month</b>
              <b v-if="price.discountedPrice !== null">
                {{`(discounted: $${price.discountedPrice/price.durationMonths} now!)`}}
              </b>
              (${{price.discountedPrice !== null ? price.discountedPrice : price.price}} total)
            </p>
          </span>

          
          <p class="adMiniHeader">
            Details
          </p>
          <p>
            Title: up to 25 characters
          </p>
          <p>
            Secondary text: optional, up to 60 characters
          </p>

          <p class="adMiniHeader">
            Media
          </p>
          <p>
            Format: JPG, PNG, or GIF. Two sizes must be submitted. It is probably wise to submit two different images/gifs, as mobile "cards" are much smaller than desktop ones, and images appropriate for one card size might not be as good for the other. The ratio is the same, so you may submit the same image, only resized, if you wish.
          </p>
          <p class="mt-12">
            Sizes: 200x283 pixels for the big version, and 100x141 pixels for the small one. Both must be submitted.
          </p>
        </div>
        <div class="imgContainer" v-if="$breakpoint.mdAndUp">
          <img src="https://i.imgur.com/ElMTmzs.png" />
          <img src="https://i.imgur.com/5mI8uIl.png" />
        </div>
        <div class="imgContainerSmall" v-else>
          <img v-if="cardAdType === 'mobile'" src="https://i.imgur.com/ElMTmzs.png" class="cardImgSmall"/>
          <img v-if="cardAdType === 'desktop'" src="https://i.imgur.com/5mI8uIl.png" class="cardImgBig"/>
          <p class="link-color cursorPointer underline-link mt-8"
            @click="cardAdType = (cardAdType === 'desktop' ? 'mobile' : 'desktop')">
            Show {{cardAdType === 'desktop' ? 'mobile' : 'desktop'}} version
          </p>
        </div>
      </div>


      <div class="adType mt-32">
        <div style="width: fit-content; padding-right: 1rem;">
          <h2>Ad type: Comic banner</h2>
          <p>
            Your ad will be displayed above comics, between the title/tags and the first page. This placement is very eye-catching, hence the higher price. Every comic will have an ad displayed above it. The dimensions are the same as FurAffinity's banners, so you can reuse your ads from there!
          </p>

          <p class="adMiniHeader">
            Prices
          </p>

          <p v-if="!paidImagePrices.fetched">
            Fetching prices...
          </p>
          <span v-else>
            <p v-for="price in paidImagePrices.payload.banner" :key="price.durationMonths">
              {{price.durationMonths}} months: <b>${{price.price/price.durationMonths}} per month</b>
              <b v-if="price.discountedPrice !== null">
                {{`(discounted: $${price.discountedPrice/price.durationMonths} now!)`}}
              </b>
              (${{price.discountedPrice !== null ? price.discountedPrice : price.price}} total)
            </p>
          </span>
          
          <p class="adMiniHeader">
            Details
          </p>
          <p>
            This ad has no displayed text, but you can place a message in the image itself if so desired.
          </p>

          <p class="adMiniHeader">
            Media
          </p>
          <p>
            Format: JPG, PNG, or GIF. Make sure that the picture is visible when scaled down to the width of a mobile screen (rougly 370px, give or take). The maximum size, which must be submitted, is 728x90 pixels.
          </p>
        </div>

        <div class="bannerImgContainer" v-if="$breakpoint.mdAndUp">
          <img src="https://i.imgur.com/ixYeOYV.png" />
          <img src="https://i.imgur.com/RDipCIf.png" />
        </div>
        <div class="imgContainerSmall" v-else>
          <img v-if="cardAdType === 'mobile'" src="https://i.imgur.com/RDipCIf.png" class="bannerImgSmall"/>
          <img v-if="cardAdType === 'desktop'" src="https://i.imgur.com/ixYeOYV.png" class="bannerImgBig"/>
          <p class="link-color cursorPointer underline-link mt-8"
            @click="cardAdType = (cardAdType === 'desktop' ? 'mobile' : 'desktop')">
            Show {{cardAdType === 'desktop' ? 'mobile' : 'desktop'}} view
          </p>
        </div>
      </div>

      <h2 class="mt-48">Additional information</h2>
      <p>
        The ads may be suggestive, but no genitals should be shown. Media including content that is commonly frowned upon will be rejected. Censored pictures are allowed. If you're uncertain, feel free to ask us at advertising@yiffer.xyz in advance.
      </p>

      <p>
        The frequency of your ads showing up entirely depends on how many advertisers there are in total. If there are ten advertisers, every tenth ad (give or take) will be your own. This goes for all types of ads.
      </p>

      <p>
        Each price is for a single ad with a single image/gif. It is perfectly fine to apply several times with different images/gifs. These will be treated as separate ads and you will have to pay for each one. If you've paid for two ads and there are ten in total, about two out of every ten ads displayed will be yours.
      </p>

      <p>
        As we don't have any experience with advertisers yet, our prices may change in the future. If you have paid for an X-month commitment, you will not be affected by these changes for the duration of your commitment.
      </p>

      <p>
        Gifs must not have rapidly flashing lights or colors.
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
            Apply as an advertiser <RightArrow/>
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

import RightArrow from 'vue-material-design-icons/ArrowRight.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'advertising',
  
  components: {
    RightArrow,
  },

  computed: {
    ...mapGetters([
      'isDarkTheme', 'isAuthenticated', 'paidImagePrices', 'userData',
    ]),
  },

  data () {
    return {
      cardAdType: 'desktop',
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

<style lang="scss" scoped>
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

.dark {
  .box {
    background-color: $themeDark1;
    box-shadow: 0 4px 24px rgba(33, 33, 33, 0.5);
  }
  .themeColorText {
    color: $themeGreen2Dark;
  }
}
</style>