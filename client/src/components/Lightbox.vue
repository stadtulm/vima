<template>
  <div>
  <v-img
    :src="s3 + pic.url"
    :title="'© ' + pic.credit"
    max-height="200px"
    contain
    class="pointer"
    @click="showLightbox = true"
  ></v-img>
  <v-overlay
    class="pointer"
    v-model="showLightbox"
    opacity=0.9
    width="95%"
    @click="showLightbox = false"
    >
    <v-img
      @click="showLightbox = false"
      contain
      max-height="95vh"
      :src="s3 + pic.url"
    ></v-img>
  </v-overlay>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'Lightbox',

  props: [
    'pic'
  ],

  components: {
  },

  data: () => ({
    showLightbox: false
  }),

  async mounted () {
  },

  methods: {
  },

  computed: {
    ...mapGetters([
      's3'
    ])
  }
}
</script>

<style>
  .lightbox {
    max-height: "100vh"
  }
</style>
