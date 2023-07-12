<template>
  <v-card
    color="customGreyUltraLight"
    v-if="computedBlogEntry"
  >
    <v-card-text
      :class="blogProp ? 'pa-0' : ''"
    >
      <v-carousel
        v-if="computedBlogEntry.pics.length > 0"
        v-model="picsCarousel"
        hide-delimiters
        :show-arrows="computedBlogEntry.pics.length > 1"
        :show-arrows-on-hover="computedBlogEntry.pics.length > 1"
        :cycle="false"
        :height="blogProp ? 250 : '100%'"
        class="mb-3 white"
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
          v-for="pic in computedBlogEntry.pics"
          :key="pic.url"
        >
          <v-img
            :height="blogProp ? 250 : 350"
            :src="s3 + pic.url"
            :contain="blogProp ? false : true"
            :alt="$t('blogPic')"
            :title="pic.credit ? '© ' + pic.credit : ''"
          ></v-img>
        </v-carousel-item>
      </v-carousel>
    </v-card-text>
    <v-card-subtitle
      class="pb-0"
    >
      {{$moment(computedBlogEntry.createdAt).format('DD.MM.YYYY')}}
    </v-card-subtitle>
    <v-card-title
      class="word-wrap"
    >
      {{computedBlogEntry.title.value}}
    </v-card-title>
    <v-card-subtitle>
      {{computedBlogEntry.subTitle.value}}
    </v-card-subtitle>
      <v-card-text>
      <v-row>
        <v-col
          class="body-1"
        >
          <div
            v-html="blogProp ? truncatedDescription(newTab(computedBlogEntry.text.value.replace(/\{(.+?)\}/g, ''))) : $sanitize(newTab(computedBlogEntry.text.value.replace(/\{(.+?)\}/g, '')))"
          >
          </div>
        </v-col>
      </v-row>
      <v-row
        v-if="!blogProp"
      >
        <v-col
          cols="12"
        >
          <v-carousel
            v-if="computedBlogEntry.videos.length > 0"
            v-model="videosCarousel"
            hide-delimiters
            :show-arrows="computedBlogEntry.videos.length > 1"
            :show-arrows-on-hover="computedBlogEntry.videos.length > 1"
            :cycle="false"
            :height="blogProp ? 250 : '100%'"
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
              v-for="video in computedBlogEntry.videos"
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
                          <youtube
                            width="100%"
                            :video-id="video.id"
                            nocookie
                          ></youtube>
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
    <v-card-actions
      class="mx-2 pb-4"
      v-if="blogProp"
    >
      <v-btn
        large
        block
        class="customGrey--text"
        :to="{ name: 'BlogEntry', params: { id: computedBlogEntry._id } }"
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
  </v-card>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'BlogCard',

  components: {
  },

  props: [
    'blogProp'
  ],

  data: () => ({
    videosCarousel: 0,
    picsCarousel: 0,
    message: undefined
  }),

  async mounted () {
  },

  methods: {
    ...mapActions('blog', {
      requestBlog: 'get'
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
    ...mapGetters('blog', {
      getBlog: 'get'
    })
  },

  asyncComputed: {
    async computedBlogEntry () {
      if (this.blogProp) {
        return this.blogProp
      } else {
        if (this.$route.params.id && !this.blogProp) {
          let selectedBlogEntry = this.getBlog(this.$route.params.id)
          if (!selectedBlogEntry) {
            selectedBlogEntry = await this.requestBlog([this.$route.params.id])
          }
          return selectedBlogEntry
        }
      }
    }
  }
}
</script>
