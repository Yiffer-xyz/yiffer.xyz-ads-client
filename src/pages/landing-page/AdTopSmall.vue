<template>
<div class="adType mt-32">
  <div style="width: fit-content; padding-right: 1rem;">
    <h2>Ad type: Top of home page</h2>
    <p>
      Your ad will appear at the very top of the <a href="https://yiffer.xyz/" class="underline-link">main page</a>.
    </p>

    <p class="adMiniHeader">
      Prices
    </p>

    <p v-if="!paidImagePrices.fetched">
      Fetching prices...
    </p>
    <span v-else>
      <p v-for="price in paidImagePrices.payload.topSmall" :key="price.durationMonths">
        {{price.durationMonths}} month{{price.durationMonths !== 1 ? 's' : ''}}: <b v-if="price.discountedPrice === null">${{price.price/price.durationMonths}} per month</b>
        <b v-else>FREE!</b>
        (${{price.discountedPrice !== null ? price.discountedPrice : price.price}} total)
      </p>
    </span>

    
    <p class="adMiniHeader">
      Details
    </p>
    <p>
      Size: <u>300x90 pixels</u>. Format: JPG, PNG, or GIF. This media is always displayed in this resolution - no downscaling on phones.
    </p>
  </div>
  <div class="imgContainer" v-if="$breakpoint.mdAndUp">
    <img src="https://i.imgur.com/ElMTmzs.png" />
    <img src="https://i.imgur.com/5mI8uIl.png" />
  </div>
  <div class="imgContainerSmall" v-else>
    <img v-if="adType === 'mobile'" src="https://i.imgur.com/ElMTmzs.png" class="cardImgSmall"/>
    <img v-if="adType === 'desktop'" src="https://i.imgur.com/5mI8uIl.png" class="cardImgBig"/>
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
  name: 'adTopSmall',

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