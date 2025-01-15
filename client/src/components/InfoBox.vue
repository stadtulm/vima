<template>
  <div
    v-if="slides.length > 0"
  >
    <v-carousel
      hide-delimiters
      class="elevation-6"
      :show-arrows="slides.length > 1"
      :show-arrows-on-hover="slides.length > 1"
    >
      <v-carousel-item
        v-for="slide in slides"
        :key="slide._id"
      >
         <v-card
          class="d-flex fill-height"
          color="rgba(255,255,255,0.5)"
          elevation="10"
        >
          <v-img
            :src="slide.pic?.url ? s3 + slide.pic.url : ''"
            cover
          >
            <v-card
              color="transparent"
              class="d-flex fill-height px-8 mx-8"
              flat
              tile
            >
              <v-card
                class="ma-6 pa-3"
                :class="slide.pic?.url ? 'align-self-end' : 'align-self-center'"
                :color="slide.color + 'BB'"
                tile
              >
                <v-card-title>
                  {{slide.title?.value}}
                </v-card-title>
                <v-card-text
                  class="text-body-1"
                  v-html="slide.text?.value"
                >
                </v-card-text>
              </v-card>
            </v-card>
          </v-img>
        </v-card>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'InfoBox',

  components: {
  },

  data: () => ({
    slides: []
  }),

  async mounted () {
    this.slides = await this.findSlides({ query: { isActive: true }, $paginate: false })
    console.log(this.slides)
  },

  methods: {
    ...mapActions('infos', {
      findSlides: 'find'
    })
  },

  computed: {
    ...mapGetters([
      's3'
    ])
  }
}
</script>

<style>
</style>
