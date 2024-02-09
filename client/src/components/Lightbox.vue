<template>
  <div>
    <v-img
      :src="s3 + pic.url"
      :title="'© ' + pic.credit"
      max-height="200px"
      contain
      class="pointer"
      @click="showLightbox = true"
    >
    </v-img>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-btn
          size="x-small"
          class="ml-1 my-1 d-flex justify-center align-center"
          icon="fas fa-download"
          color="customGrey"
          :loading="loaders[pic.url] === true"
          @click.prevent="prepareGetUpload(pic.url)"
        >
        </v-btn>
      </v-col>
    </v-row>
    <v-overlay
      class="pointer d-flex align-center justify-center"
      v-model="showLightbox"
      width="75%"
      style="background-color: rgba(0,0,0,0.75)"
      @click="showLightbox = false"
      >
      <v-img
        @click="showLightbox = false"
        contain
        max-height="95vh"
        max-width="95vw"
        :src="s3 + pic.url"
      ></v-img>
    </v-overlay>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Lightbox',

  props: [
    'pic'
  ],

  components: {
  },

  data: () => ({
    loaders: {},
    showLightbox: false
  }),

  async mounted () {
  },

  methods: {
    ...mapActions('uploads', {
      getUpload: 'get'
    })
  },

  computed: {
    ...mapGetters([
      's3',
      'prepareGetUpload'
    ])
  }
}
</script>

<style>
  .lightbox {
    max-height: "100vh"
  }
</style>
