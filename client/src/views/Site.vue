<template>
  <v-card
    color="customGreyUltraLight"
    v-if="site"
  >
    <v-card-text>
      <v-row>
        <v-col
          class="word-wrap text-h5 font-weight-bold customGrey--text text-uppercase"
        >
          {{$t(site.type === 'communicationrules' ? 'communicationRules' : site.type)}}
        </v-col>
      </v-row>
      <v-row>
        <v-col
          class="text-body-1 customGrey--text"
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
              v-slot:prev="{ on, attrs }"
            >
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>
                fas fa-chevron-left
              </v-icon>
            </v-btn>
            </template>
            <template
              v-slot:next="{ on, attrs }"
            >
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
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
                color="secondaryCustom"
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
                          <YouTube
                            width="100%"
                            :video-id="video.id"
                            nocookie
                          ></YouTube>
                        </template>
                        <template
                          v-else-if="video.type === 'vimeo'"
                        >
                          <vimeo-player
                            width="100%"
                            :video-id="video.id"
                            :byline="false"
                            :dnt="true"
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
          'vives',
          'communicationrules',
          'team'
        ].includes(this.$route.name.toLowerCase())
      ) {
        await this.loadSite()
      }
    }
  }
}
</script>
