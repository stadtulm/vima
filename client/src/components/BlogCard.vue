<template>
  <v-card
    color="customGreyUltraLight"
    v-if="blog"
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
            v-if="blog.pics.length > 0"
            v-model="picsCarousel"
            hide-delimiters
            :show-arrows="blog.pics.length > 1"
            :show-arrows-on-hover="blog.pics.length > 1"
            :cycle="false"
            :height="blogProp ? 250 : 350"
            class="mb-3 white"
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
              v-for="pic in blog.pics"
              :key="pic.url"
            >
              <v-img
                :height="blogProp ? 250 : 350"
                :src="s3 + pic.url"
                :contain="blogProp ? false : true"
                :alt="$t('blogPic')"
                :title="pic.credit ? '© ' + pic.credit : ''"
                style="background-color: #fff"
                :class="blogProp ? 'pointer' : ''"
                @click="blogProp ? $router.push({ name: 'BlogEntry', params: { id: blog._id } }) : ''"
              ></v-img>
            </v-carousel-item>
          </v-carousel>
          <!-- Title -->
          <v-card-subtitle
            class="mt-6"
          >
            {{$moment(blog.createdAt).format('DD.MM.YYYY')}}
          </v-card-subtitle>
          <div
            class="mx-4 my-3 text-h6 font-weight-bold"
            :class="blogProp ? 'pointer' : ''"
            @click="blogProp ? $router.push({ name: 'BlogEntry', params: { id: blog._id } }) : ''"
          >
            {{blog.title.value}}
          </div>
          <v-card-subtitle
            v-if="blog.subTitle?.value"
          >
            {{blog.subTitle.value}}
          </v-card-subtitle>
          <!-- Description -->
          <v-row
            class="ma-1"
          >
            <v-col
              class="text-body-1"
            >
              <div
                v-html="blogProp ? truncatedDescription(newTab(blog.text.value.replace(/\{(.+?)\}/g, ''))) : $sanitize(newTab(blog.text.value.replace(/\{(.+?)\}/g, '')))"
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
                v-if="blog.videos.length > 0"
                v-model="videosCarousel"
                hide-delimiters
                :show-arrows="blog.videos.length > 1"
                :show-arrows-on-hover="blog.videos.length > 1"
                :cycle="false"
                :height="blogProp ? 250 : 350"
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
                  v-for="video in blog.videos"
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
        v-if="blogProp"
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
              :to="{ name: 'BlogEntry', params: { id: blog._id } }"
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
  name: 'BlogCard',

  components: {
  },

  props: [
    'blogProp'
  ],

  data: () => ({
    videosCarousel: 0,
    picsCarousel: 0,
    message: undefined,
    blog: undefined
  }),

  async mounted () {
    await this.loadBlog()
  },

  methods: {
    ...mapActions('blog', {
      requestBlog: 'get'
    }),
    async loadBlog () {
      if (this.blogProp) {
        this.blog = this.blogProp
      } else {
        if (this.$route.name === 'BlogEntry' && this.$route.params.id && !this.blogProp) {
          let selectedBlog = this.getBlog(this.$route.params.id)
          if (!selectedBlog) {
            try {
              selectedBlog = await this.requestBlog(
                this.$route.params.id
              )
            } catch (e) {
              if (e.code === 403) {
                this.$router.push({ name: 'Forbidden' })
              }
            }
          }
          this.blog = selectedBlog
        }
      }
    },
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
  }
}
</script>
