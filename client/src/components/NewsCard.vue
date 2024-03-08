<template>
  <v-card
    color="customGreyUltraLight"
    v-if="newsEntry"
    height="100%"
  >
    <v-container
      class="fill-height pa-0 pb-3"
      fluid
    >
      <v-row
        class="align-self-start"
        style="width: 100%"
      >
        <v-col
          cols="12"
        >
          <!-- Carousel -->
          <v-carousel
            v-if="newsEntry.pics.length > 0"
            v-model="picsCarousel"
            hide-delimiters
            :show-arrows="newsEntry.pics.length > 1"
            :show-arrows-on-hover="newsEntry.pics.length > 1"
            :cycle="false"
            :height="newsProp ? 250 : 350"
            class="mb-3"
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
              v-for="pic in newsEntry.pics"
              :key="pic.url"
            >
              <v-img
                :height="newsProp ? 250 : 350"
                :src="s3 + pic.url"
                :contain="newsProp ? false : true"
                :alt="$t('newsPic')"
                :title="pic.credit ? '© ' + pic.credit : ''"
                style="background-color: #fff"
                :class="newsProp ? 'pointer' : ''"
                @click="newsProp ? $router.push({ name: 'NewsEntry', params: { id: newsEntry._id }}) : ''"
              ></v-img>
            </v-carousel-item>
          </v-carousel>
          <!-- Title -->
          <v-card-subtitle
            class="mt-6"
          >
            {{$moment(newsEntry.createdAt).format('DD.MM.YYYY')}}
          </v-card-subtitle>
          <div
            class="ma-4 text-h6 font-weight-bold"
            :class="newsProp ? 'pointer' : ''"
            @click="newsProp ? $router.push({ name: 'NewsEntry', params: { id: newsEntry._id }}) : ''"
          >
            {{newsEntry.title.value}}
          </div>
          <div
            class="ma-4 text-subtitle-2"
            v-if="newsEntry.subTitle"
          >
            {{newsEntry.subTitle.value}}
          </div>
          <!-- Description -->
          <v-row
            class="mx-1"
          >
            <v-col
              class="text-body-1"
            >
              <div
                v-html="newsProp ? truncatedDescription(newTab(newsEntry.text.value.replace(/\{(.+?)\}/g, ''))) : $sanitize(newTab(newsEntry.text.value.replace(/\{(.+?)\}/g, '')))"
              >
              </div>
            </v-col>
          </v-row>
          <!-- Videos -->
          <v-row
            class="mx-1"
            v-if="!newsProp"
          >
            <v-col
              cols="12"
            >
              <v-carousel
                v-if="newsEntry.videos.length > 0"
                v-model="videosCarousel"
                hide-delimiters
                :show-arrows="newsEntry.videos.length > 1"
                :show-arrows-on-hover="newsEntry.videos.length > 1"
                :cycle="false"
                :height="newsProp ? 250 : 350"
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
                  v-for="video in newsEntry.videos"
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
                          <div>
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
        </v-col>
      </v-row>
      <!-- Show more button -->
      <v-row
        class="align-self-end"
        v-if="newsProp"
      >
        <v-col
          cols="12"
        >
          <v-card-actions
            class="px-4"
          >
            <v-btn
              variant="elevated"
              block
              class="text-customGrey"
              :to="{ name: 'NewsEntry', params: { id: newsEntry._id }}"
            >
              {{$t('viewButton')}}
              <v-icon
                class="ml-3"
                size="18"
                color="customGrey"
              >
                fas fa-arrow-right
              </v-icon>
            </v-btn>
          </v-card-actions>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'NewsCard',

  components: {
  },

  props: [
    'newsProp'
  ],

  data: () => ({
    newsEntry: undefined,
    videosCarousel: 0,
    picsCarousel: 0,
    message: undefined
  }),

  async mounted () {
    await this.loadNewsEntry()
  },

  methods: {
    ...mapActions('news', {
      requestNews: 'get'
    }),
    truncatedDescription (text) {
      const len = 200
      text = this.$sanitize(text)
      text = text.replaceAll('<p>', '')
      text = text.replaceAll('</p>', '&nbsp;')
      const div = document.createElement('div')
      div.innerHTML = text
      let tmpStr = div.innerText
      if (tmpStr && tmpStr.length > len) {
        tmpStr = tmpStr.substr(0, len) + ' [...]'
      }
      return tmpStr
    },
    async loadNewsEntry () {
      if (this.newsProp) {
        this.newsEntry = this.newsProp
      } else {
        if (this.$route.params.id && !this.newsProp) {
          let selectedNewsEntry = this.getNews(this.$route.params.id)
          if (!selectedNewsEntry) {
            selectedNewsEntry = await this.requestNews([this.$route.params.id])
          }
          this.newsEntry = selectedNewsEntry
        }
      }
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
    ...mapGetters('news', {
      getNews: 'get'
    })
  }
}
</script>
