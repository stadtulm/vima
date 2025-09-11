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
        <v-card
          v-if="computedStaticSlide.video"
          class="d-flex fill-height"
          color="rgba(255,255,255,0.5)"
          elevation="10"
          height="100%"
            >
          <v-container
            fluid
            fill-height
            class="pa-3 pb-0 mb-0"
            ref="info-video-container"
            >
            <v-row>
              <v-col
                class="pa-0"
              >
                <template
                  v-if="computedStaticSlide.video.type === 'youtube'"
                >
                  <youtube
                    :src="computedStaticSlide.video.id"
                    :vars="{ rel: 0, controls: 1 }"
                    nocookie
                    @ready="resizeVideo()"
                  ></youtube>
                  <social-media-buttons></social-media-buttons>
                </template>
                <template
                  v-else-if="computedStaticSlide.video.type === 'vimeo'"
                >
                  <vimeo-player
                    :video-id="computedStaticSlide.video.id"
                    :options="{ byline: false, dnt: true }"
                    @ready="resizeVideo()"
                  >
                  </vimeo-player>
                  <social-media-buttons></social-media-buttons>
                </template>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
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
          <social-media-buttons></social-media-buttons>
        </v-card>
      </v-col>
    <template
      v-if="!computedStaticSlide"
    >
      <social-media-buttons></social-media-buttons>
    </template>
    </v-row>
    <v-row
      v-if="$settings.infoBox?.isActive"
    >
      <v-col>
        <v-alert
          color="info"
          icon="fas fa-info-circle"
        >
          <span
            v-html="$sanitize(newTab(pickLanguage($settings.infoBox.text).replace(/(?:\r\n|\r|\n)/g, '<br />')))"
          ></span>
        </v-alert>
      </v-col>
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
    window.addEventListener('resize', () => {
      this.resizeVideo()
    }, true)
  },

  methods: {
    ...mapActions('infos', {
      findSlides: 'find'
    }),
    resizeVideo () {
      document.querySelector('iframe').style.width = this.$refs['info-video-container'].$el.clientWidth + 'px'
    },
    pickLanguage (text) {
      // Try to use custom text in user language
      const userLanguageText = text.find(language => language.lang === this.$i18n.locale)
      if (userLanguageText) {
        return userLanguageText.value
      } else {
        // Try to use custom text in default language
        const defaultLanguageText = text.find(language => language.type === 'default')
        if (defaultLanguageText) {
          return defaultLanguageText.value
        } else {
          return ''
        }
      }
    },
    getCurrentVideoByWeek (noOfVideos, weeksToShow) {
      // Get the current ISO week number (1-53) using Moment.js
      const currentWeekNumber = this.$moment().isoWeek()

      // Calculate the total number of weeks in a full video cycle
      const totalWeeksInCycle = noOfVideos * weeksToShow

      // Use the modulo operator to find the current "week offset" within the cycle.
      // We subtract 1 to make the week number 0-indexed for array access.
      const weekOffset = (currentWeekNumber - 1) % totalWeeksInCycle

      // Calculate the video index based on the week offset and duration per video.
      const videoIndex = Math.floor(weekOffset / weeksToShow)

      if (videoIndex >= 0 && videoIndex < noOfVideos) {
        return videoIndex
      } else {
        // Return a default video or handle the out-of-bounds case.
        return null
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'newTab'
    ]),
    computedStaticSlide () {
      const slides = this.slides?.filter(slide => slide.type === 'static') ? this.slides?.filter(slide => slide.type === 'static') : undefined
      if (slides) {
        return slides[this.getCurrentVideoByWeek(slides.length, this.$settings.videoRotationInWeeks)]
      } else {
        return undefined
      }
    },
    computedDynamicSlides () {
      return this.slides?.filter(slide => slide.type === 'dynamic') ? this.slides?.filter(slide => slide.type === 'dynamic') : undefined
    }
  }
}
</script>
