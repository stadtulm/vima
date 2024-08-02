<template>
  <v-card
    color="customGreyUltraLight"
    v-if="site"
  >
    <v-card-text>
      <v-row>
        <v-col
          class="word-wrap text-h4 font-weight-bold text-customGrey text-uppercase"
        >
          {{$t(site.type === 'communicationrules' ? 'communicationRules' : site.type)}}
        </v-col>
      </v-row>
      <v-row>
        <v-col
          class="text-body-1 text-customGrey"
        >
          <div
            v-html="$sanitize(newTab(site.text.value))"
          >
          </div>
        </v-col>
      </v-row>
      <v-row
        v-if="site && site.videos && site.videos.length > 0"
      >
        <v-col
          cols="12"
        >
          <v-carousel
            v-model="videosCarousel"
            hide-delimiters
            :show-arrows="site.videos.length > 1"
            :show-arrows-on-hover="site.videos.length > 1"
            :cycle="false"
            height="100%"
          >
            <template
              v-slot:prev="{ props }"
            >
            <v-btn
              icon
              v-bind="props"
            >
              <v-icon>
                fas fa-chevron-left
              </v-icon>
            </v-btn>
            </template>
            <template
              v-slot:next="{ props }"
            >
            <v-btn
              icon
              v-bind="props"
            >
              <v-icon>
                fas fa-chevron-right
              </v-icon>
            </v-btn>
            </template>
            <v-carousel-item
              v-for="video in site.videos"
              :key="video.id"
            >
              <v-sheet
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
                      align="center"
                      justify="center"
                    >
                      <div
                        class="responsive-video"
                      >
                        <template
                          v-if="video.type === 'youtube'"
                        >
                          <youtube
                            :src="video.id"
                            :vars="{ rel: 0, modestbranding: 1, }"
                            nocookie
                          ></youtube>
                        </template>
                        <template
                          v-else-if="video.type === 'vimeo'"
                        >
                          <vimeo-player
                            :video-id="video.id"
                            :options="{ byline: false, dnt: true }"
                          >
                          </vimeo-player>
                        </template>
                      </div>
                    </v-col>
                  </v-row>
                </v-container>
              </v-sheet>
            </v-carousel-item>
          </v-carousel>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Site',

  components: {
  },

  data: () => ({
    videosCarousel: 0,
    site: undefined
  }),

  async mounted () {
    await this.loadSite()
  },

  methods: {
    ...mapActions('sites', {
      fetchSites: 'find'
    }),
    async loadSite () {
      let selectedSite = this.findSites(
        {
          query: {
            type: this.$route.name.toLowerCase()
          }
        }
      )
      if (!selectedSite) {
        selectedSite = await this.fetchSites(
          {
            query: {
              type: this.$route.name.toLowerCase()
            }
          }
        )
        if (!selectedSite.data || !selectedSite.data[0]) {
          this.$router.push({ name: 'NotFound' })
          return
        }
        selectedSite = selectedSite.data[0]
      }
      this.site = selectedSite
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'newTab'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('sites', {
      findSites: 'get'
    })
  },

  watch: {
    async '$route.name' () {
      if (
        [
          'imprint',
          'privacy',
          'contact',
          'ileu',
          'vima',
          'communicationrules',
          'team',
          'faq'
        ].includes(this.$route.name.toLowerCase())
      ) {
        await this.loadSite()
      }
    }
  }
}
</script>
