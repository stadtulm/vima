<template>
  <div>
    <v-carousel
      hide-delimiters
      class="elevation-6"
    >
      <v-carousel-item
        v-for="(slide, i) in slides"
        :key=i
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
    infos: [],
    slides: [
      {
        position: 1,
        img: 'https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg',
        title: 'Title 1',
        text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
        color: { r: 255, g: 255, b: 255 }
      },
      {
        position: 2,
        img: '',
        title: 'Title 2',
        text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. <a href="http://google.de">CLICK</a>',
        color: { r: 255, g: 255, b: 255 }
      }
    ]
  }),

  async mounted () {
    this.slides = await this.findInfos()
  },

  methods: {
    ...mapActions('infos', {
      findInfos: 'find'
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
