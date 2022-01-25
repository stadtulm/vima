<template>
  <v-card
    color="customGreyBg"
    v-if="computedDiscussion"
    height="100%"
  >
    <v-container
      fluid
      class="fill-height"
    >
      <v-row
        class="align-self-start"
      >
        <v-col
          :class="discussionProp ? 'pa-0' : ''"
        >
          <v-row>
            <v-col
              cols="12"
              sm="12"
              :md="discussionProp ? 12 : 6"
              :order="2"
              :order-md="discussionProp ? 2 : 1"
            >
          <!-- Title -->
          <v-card-title
            class="word-wrap"
          >
            {{computedDiscussion.title}}
            <!-- Owner or moderator icon -->
            <v-tooltip
              right
              color="customGrey"
              v-if="computedStatusContainers.map(obj => obj.relation).includes('owner') || computedStatusContainers.map(obj => obj.relation).includes('moderator')"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                  :title="relationItems.owner.text"
                  class="ml-3"
                  v-if="computedStatusContainers.map(obj => obj.relation).includes('owner')"
                >
                  <v-icon
                    color="customGrey"
                  >
                    {{relationItems.owner.icon}}
                  </v-icon>
                </v-btn>
              </template>
              <span>
                {{relationItems.owner.text}}
              </span>
            </v-tooltip>
            <!-- Subscription buttons -->
            <v-tooltip
              right
              color="customGrey"
              v-if="computedStatusContainers"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-if="!discussionProp"
                  icon
                  class="ml-3"
                  color="customTeal"
                  :disabled="user ? false : true"
                  @click="toggleDiscussionSubscription()"
                  :title="computedStatusContainers.map(obj => obj.relation).includes('subscriber') ? $t('unsubscribeDiscussion') : $t('subscribeDiscussion')"
                >
                  <v-icon>
                    {{computedStatusContainers.map(obj => obj.relation).includes('subscriber') ? 'fas fa-star' : 'far fa-star'}}
                  </v-icon>
                </v-btn>
              </template>
              {{computedStatusContainers.map(obj => obj.relation).includes('subscriber') ? $t('unsubscribeDiscussion') : $t('subscribeDiscussion')}}
            </v-tooltip>
          </v-card-title>
          <!-- Subtitle -->
          <v-card-subtitle>
            {{$t('createdAt')}} {{$moment(computedDiscussion.createdAt).format('DD.MM.YYYY')}} {{$t('by')}}
            <span
              class="font-weight-bold"
              :class="computedDiscussion.author ? 'pointer': ''"
              @click="computedDiscussion.author ? $router.push({name: 'User', params: { user: computedDiscussion.author.user._id }}) : ''"
            >
              {{computedDiscussion.author ? computedDiscussion.author.user.userName : '- (' + $t('deletedAccount') + ')'}}
            </span>
          </v-card-subtitle>
          <v-card-text>
            <!-- Categories -->
            <v-row
              v-if="computedDiscussion.categories && computedDiscussion.categories.length > 0"
            >
              <v-col>
                <v-chip
                  outlined
                  v-for="category in getCategories(computedDiscussion.categories)"
                  :key="category._id"
                  class="mr-1"
                  @click="$emit('selectCategory', category._id)"
                >
                {{category.name}}
                </v-chip>
              </v-col>
            </v-row>
            <!-- Tags -->
            <v-row
              v-if="computedDiscussion.tags && computedDiscussion.tags.length > 0"
            >
              <v-col>
                <v-chip
                  v-for="tag in getTags(computedDiscussion.tags)"
                  :key="tag._id"
                  class="mr-1"
                  @click="$emit('selectTag', tag._id)"
                >
                {{tag.name}}
                </v-chip>
              </v-col>
            </v-row>
            <!-- Description -->
            <v-row>
              <v-col
                class="body-1"
                v-html="discussionProp ? truncatedDescription(newTab(computedDiscussion.description)) : $sanitize(newTab(computedDiscussion.description))"
              ></v-col>
            </v-row>
          </v-card-text>
            </v-col>
            <v-col
              cols="12"
              sm="12"
              :md="discussionProp ? 12 : 6"
              :class="discussionProp ? 'py-0': ''"
              :order="1"
              :order-md="discussionProp ? 1 : 2"
            >
            <v-card-text
                :class="discussionProp ? 'pa-0' : ''"
              >
            <!-- Carousel -->
            <v-carousel
              v-if="computedPics.length > 0"
              v-model="picsCarousel"
              hide-delimiters
              :show-arrows="computedPics.length > 1"
              :show-arrows-on-hover="computedPics.length > 1"
              :cycle="false"
              :height="discussionProp ? 300 : '100%'"
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
                v-for="pic in computedPics"
                :key="pic.url"
              >
                <v-img
                  :height="discussionProp ? 300 : 500"
                  :src="s3 + pic.url"
                  :contain="discussionProp ? false : true"
                  :alt="$t('discussionTitlePic')"
                  :title="pic.credit ? '© ' + pic.credit : ''"
                ></v-img>
              </v-carousel-item>
            </v-carousel>
          </v-card-text>
            </v-col>
          </v-row>
            <!-- If not preview discussions -->
            <template
              v-if="!discussionProp"
            >
              <v-divider
                class="mx-4 mt-8 mb-10"
              ></v-divider>
              <v-row
                class="mx-1"
              >
                <v-col>
                  <DiscussionCore
                    :discussion="computedDiscussion"
                  ></DiscussionCore>
                </v-col>
              </v-row>
            </template>
        </v-col>
      </v-row>
      <!-- Show more button -->
      <v-row
        class="align-self-end"
      >
        <v-col>
          <v-card-actions
            class="mx-2 pb-4 grow"
            v-if="discussionProp"
          >
            <v-btn
              large
              block
              class="customTeal--text"
              :to="{ name: 'Discussion', params: { id: computedDiscussion._id }}"
            >
              {{$t('viewButton')}}
              <v-icon
                class="ml-3"
                size="18"
                color="customTeal"
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

import DiscussionCore from '@/components/DiscussionCore.vue'
import { mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  name: 'DiscussionCard',

  components: {
    DiscussionCore
  },

  props: [
    'discussionProp'
  ],

  data: () => ({
    picsCarousel: 0,
    message: undefined,
    isSending: false
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('discussions', {
      requestDiscussion: 'get'
    }),
    ...mapActions('status-container-helper', {
      createDiscussionSubscription: 'create',
      removeDiscussionSubscription: 'remove'
    }),
    truncatedDescription (text) {
      const len = 200
      text = this.$sanitize(text)
      text = text.replaceAll('<p>', '')
      text = text.replaceAll('</p>', '&nbsp;')
      var div = document.createElement('div')
      div.innerHTML = text
      let tmpStr = div.innerText
      if (tmpStr && tmpStr.length > len) {
        tmpStr = tmpStr.substr(0, len) + ' [...]'
      }
      return tmpStr
    },
    async toggleDiscussionSubscription () {
      if (this.computedStatusContainers && this.computedStatusContainers.find(obj => obj.relation === 'subscriber')) {
        try {
          await this.removeDiscussionSubscription(
            [
              this.computedDiscussion._id,
              {
                query: {
                  type: 'removeDiscussionSubscription'
                }
              }
            ]
          )
          this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        } catch (e) {
          this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        }
      } else {
        try {
          await this.createDiscussionSubscription(
            {
              type: 'createDiscussionSubscription',
              discussionId: this.computedDiscussion._id
            }
          )
          this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        } catch (e) {
          this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'relationItems',
      'newTab',
      'getTags',
      'getCategories'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('discussions', {
      getDiscussion: 'get'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('chat-messages', {
      getChatMessage: 'get'
    }),
    ...mapGetters('categories', {
      categories: 'list'
    }),
    computedStatusContainers () {
      return this.statusContainers.filter(obj => obj.reference === this.computedDiscussion._id && obj.user === this.user._id)
    },
    computedPics () {
      if (this.computedDiscussion) {
        if (this.computedDiscussion.pics && this.computedDiscussion.pics.length > 0) {
          return this.computedDiscussion.pics
        } else {
          return this.categories.filter(obj => this.computedDiscussion.categories.includes(obj._id) && obj.pic && obj.pic.url).map(obj => obj.pic)
        }
      } else {
        return []
      }
    }
  },

  asyncComputed: {
    async computedDiscussion () {
      if (this.discussionProp) {
        return this.discussionProp
      } else {
        if (
          (
            this.$route.name === 'Discussion' ||
            this.$route.name === 'GroupDiscussion'
          ) &&
          this.$route.params.id &&
          !this.discussionProp
        ) {
          let selectedDiscussion = this.getDiscussion(this.$route.params.id)
          if (!selectedDiscussion) {
            selectedDiscussion = await this.requestDiscussion(
              [
                this.$route.params.id
              ]
            )
          }
          return selectedDiscussion
        }
      }
    }
  }
}
</script>
