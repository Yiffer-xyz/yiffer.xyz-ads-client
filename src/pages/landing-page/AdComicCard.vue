<template>
<div class="adType mt-32">
  <div style="width: fit-content; padding-right: 1rem;">
    <h2>Ad type: Comic card</h2>
    <p>
      Your ad will appear at random in the same style as comics in the <a href="https://yiffer.xyz/" class="underline-link">main page</a>. Many ads are loaded per page of comics, giving your ad a higher chance of showing up per page load compared to the other ad types.
    </p>

    <p class="adMiniHeader">
      Prices
    </p>

    <p v-if="!paidImagePrices.fetched">
      Fetching prices...
    </p>
    <span v-else>
      <p v-for="price in paidImagePrices.payload.card" :key="price.durationMonths">
        {{price.durationMonths}} month{{price.durationMonths !== 1 ? 's' : ''}}: <b v-if="price.discountedPrice === null">${{price.price/price.durationMonths}} per month</b>
        <b v-else>FREE!</b>
        (${{price.discountedPrice !== null ? price.discountedPrice : price.price}} total)
      </p>
    </span>

    
    <p class="adMiniHeader">
      Details
    </p>
    <p>
      Title: up to <u>25 characters</u>
    </p>
    <p>
      Secondary text: optional, up to <u>60 characters</u>
    </p>
    <p>
      Size: <u>200x283 pixels</u>. Format: JPG, PNG, or GIF. Keep in mind that on phones, the media will be scaled down to half of this, so make sure the content is visible at half size.
    </p>
  </div>
  <div class="imgContainer" v-if="$breakpoint.mdAndUp">
    <img src="pi-images/card-mobile.jpg" />
    <img src="pi-images/card-desktop.jpg" />
  </div>
  <div class="imgContainerSmall" v-else>
    <img v-if="adType === 'mobile'" src="pi-images/card-mobile.jpg" class="cardImgSmall"/>
    <img v-if="adType === 'desktop'" src="pi-images/card-desktop.jpg" class="cardImgBig"/>
    <p class="link-color cursorPointer underline-link mt-8"
      @click="adType = (adType === 'desktop' ? 'mobile' : 'desktop')">
      Show {{adType === 'desktop' ? 'mobile' : 'desktop'}} version
    </p>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'adComicCard',

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