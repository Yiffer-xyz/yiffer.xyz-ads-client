<template>
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
        {{price.durationMonths}} month{{price.durationMonths !== 1 ? 's' : ''}}: <b v-if="price.discountedPrice === null">${{price.price/price.durationMonths}} per month</b>
        <b v-else>FREE!</b>
        (${{price.discountedPrice !== null ? price.discountedPrice : price.price}} total)
      </p>
    </span>
    
    <p class="adMiniHeader">
      Details
    </p>
    <p>
      Size: <u>728x90 pixels</u>. This is the same resolution used on both FurAffinity and e621. Format: JPG, PNG, or GIF. Keep in mind that on phones, the media will be scaled down to fit the screen - roughly half of its original size, give or take.
    </p>
  </div>

  <div class="bannerImgContainer" v-if="$breakpoint.mdAndUp">
    <img src="pi-images/banner-desktop.jpg" />
    <img src="pi-images/banner-mobile.jpg" />
  </div>
  <div class="imgContainerSmall" v-else>
    <img v-if="adType === 'mobile'" src="pi-images/banner-mobile.jpg" class="bannerImgSmall"/>
    <img v-if="adType === 'desktop'" src="pi-images/banner-desktop.jpg" class="bannerImgBig"/>
    <p class="link-color cursorPointer underline-link mt-8"
      @click="adType = (adType === 'desktop' ? 'mobile' : 'desktop')">
      Show {{adType === 'desktop' ? 'mobile' : 'desktop'}} view
    </p>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'adBanner',

  computed: {
    ...mapGetters([
      'paidImagePrices',
    ]),
  },

  data () {
    return {
      adType: 'desktop',
    }
  }
}
</script>