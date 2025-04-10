<template>
  <div
    v-if="slides.length > 0"
  >
    <v-row>
      <v-col
        :cols="computedStaticSlide ? 6 : 12"
      >
        <v-carousel
          hide-delimiters
          cycle
          interval="8000"
          class="elevation-6"
          :show-arrows="slides.length > 1"
          :show-arrows-on-hover="slides.length > 1"
        >
          <v-carousel-item
            v-for="slide in computedDynamicSlides"
            :key="slide._id"
          >
            <v-card
              class="d-flex fill-height"
              color="rgba(255,255,255,0.5)"
              elevation="10"
            >
              <v-img
                :src="slide.pic?.url ? s3 + slide.pic.url : ''"
                contain
              >
                <template
                  v-if="slide.pics && slide.pics[0]"
                >
                  <v-card
                    class="fill-height pa-12 mx-12"
                    color="#00ff00"
                  >
                  <v-img
                    height="50%"
                    class="mb-8"
                    :src="s3 + slide.pics[0]?.url"
                  ></v-img>
                  <v-sheet>
                  <v-card-title>
                    {{slide.title?.value}}
                  </v-card-title>
                  <v-card-text
                    class="text-body-1"
                    v-html="slide.text?.value"
                  >
                  </v-card-text>
                  </v-sheet>
                  </v-card>
                </template>
                <template v-else>
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
                </template>
              </v-img>
            </v-card>
          </v-carousel-item>
        </v-carousel>
      </v-col>
      <v-col
        :cols="computedDynamicSlides ? 6 : 12"
        v-if="computedStaticSlide"
      >
        <v-sheet
          v-if="computedStaticSlide.video"
          height="100%"
          color="transparent"
        >
          <v-container
            fluid
            fill-height
            >
            <v-row>
              <v-col
                class="pa-0"
              >
                <div>
                  <template
                    v-if="computedStaticSlide.video.type === 'youtube'"
                  >
                    <youtube
                      :src="computedStaticSlide.video.id"
                      :vars="{ rel: 0, controls: 1 }"
                      nocookie
                    ></youtube>
                    <social-media-buttons></social-media-buttons>
                  </template>
                  <template
                    v-else-if="video.type === 'vimeo'"
                  >
                    <vimeo-player
                      :video-id="video.id"
                      :options="{ byline: false, dnt: true }"
                    >
                    </vimeo-player>
                    <social-media-buttons></social-media-buttons>
                  </template>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-sheet>
        <v-card
          class="fill-height d-flex flex-column"
          color="transparent"
          flat
          v-else-if="computedStaticSlide.pic"
        >
          <v-img
            :src="s3 + computedStaticSlide.pic.url"
            contain
          >
          </v-img>
          <v-sheet
            color="transparent"
            class="d-flex align-items-end align-end justify-center"
          >
            <social-media-buttons></social-media-buttons>
          </v-sheet>
        </v-card>
      </v-col>
    <template
      v-if="!computedStaticSlide"
    >
      <social-media-buttons></social-media-buttons>
    </template>
    </v-row>
    <v-divider
      :class="computedStaticSlide ? 'mt-12' : 'mt-3'"
    ></v-divider>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import SocialMediaButtons from './SocialMediaButtons.vue'

export default {
  name: 'InfoBox',

  components: {
    SocialMediaButtons
  },

  data: () => ({
    slides: [],
    picsCarousel: 0
  }),

  async mounted () {
    const tmpSlides = await this.findSlides({ query: { isActive: true }, $paginate: false })
    this.slides = tmpSlides.sort((a, b) => a.position - b.position)
  },

  methods: {
    ...mapActions('infos', {
      findSlides: 'find'
    })
  },

  computed: {
    ...mapGetters([
      's3'
    ]),
    computedStaticSlide () {
      return this.slides?.filter(slide => slide.type === 'static') ? this.slides?.filter(slide => slide.type === 'static')[0] : undefined
    },
    computedDynamicSlides () {
      return this.slides?.filter(slide => slide.type === 'dynamic') ? this.slides?.filter(slide => slide.type === 'dynamic') : undefined
    }
  }
}
</script>

<style>
</style>
