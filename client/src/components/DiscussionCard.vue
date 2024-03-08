<template>
  <div
    v-if="discussion"
  >
    <v-card
      color="customGreyUltraLight"
    >
      <v-card-text>
        <v-row>
          <v-col
            :class="discussionProp ? 'pa-0' : ''"
          >
            <v-row>
              <v-col
                cols="12"
                sm="12"
                :md="discussionProp ? 12 : 8"
                :order="2"
                :order-md="discussionProp ? 2 : 1"
              >
                <!-- Title -->
                <div
                  class="ma-4 mb-0 text-h6 font-weight-bold"
                >
                  <TranslatableText
                    ownField="title"
                    :allFields="['title', 'description']"
                    type="discussions"
                    :textParent="discussion"
                  >
                  </TranslatableText>
                </div>
                <!-- Info -->
                <v-card-subtitle
                  class="mb-5"
                >
                  {{$t('createdAt')}} {{$moment(discussion.createdAt).format('DD.MM.YYYY')}} {{$t('by')}}
                  <v-btn
                    class="ml-1"
                    variant="outlined"
                    size="x-small"
                    @click="discussion.author ? $router.push({name: 'User', params: { user: discussion.author.user._id }}) : ''"
                  >
                    {{discussion.author ? discussion.author.user.userName : '- (' + $t('deletedAccount') + ')'}}
                  </v-btn>
                </v-card-subtitle>
                <v-card-text>
                  <!-- Latest message -->
                  <v-row
                    v-if="discussion.latestMessage"
                  >
                    <v-col>
                      <v-chip
                        variant="flat"
                        :color="$moment().diff($moment(discussion.latestMessage), 'days') <= 5 ? $settings.indicatorColor : 'customGreyMedium'"
                        :class="$moment().diff($moment(discussion.latestMessage), 'days') <= 5 ? 'elevation-8 font-weight-bold' : ''"
                        disabled
                      >
                        {{$t('latestPost')}}: {{$moment(discussion.latestMessage).format("DD.MM.YYYY, HH:mm")}} {{$t('oClock')}}
                      </v-chip>
                    </v-col>
                  </v-row>
                  <!-- Categories -->
                  <v-row
                    v-if="discussion.categories?.length > 0"
                  >
                    <v-col>
                      <v-chip
                        variant="outlined"
                        v-for="category in getCategories(discussion.categories)"
                        :key="category._id"
                        class="mr-1 mb-1"
                        :disabled="!discussionProp"
                        @click.prevent="$emit('update:selectCategory', category._id)"
                      >
                        {{category.text.value}}
                      </v-chip>
                    </v-col>
                  </v-row>
                  <!-- Tags -->
                  <v-row
                    v-if="discussion.tags && discussion.tags.length > 0"
                  >
                    <v-col>
                      <v-chip
                        v-for="tag in getTags(discussion.tags)"
                        :key="tag._id"
                        class="mr-1 mb-1"
                        :disabled="!discussionProp"
                        @click.prevent="$emit('update:selectTag', tag._id)"
                      >
                        {{tag.text}}
                      </v-chip>
                    </v-col>
                  </v-row>
                  <!-- Subscription buttons -->
                  <v-row
                    v-if="!discussionProp"
                  >
                    <v-col>
                    <v-tooltip
                      right
                      color="customGrey"
                      v-if="computedStatusContainers"
                    >
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon
                          size="small"
                          :color="$settings.modules.discussions.color"
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
                    </v-col>
                  </v-row>
                  <!-- Owner or moderator icon -->
                  <v-row
                    v-if="
                      computedStatusContainers.map(obj => obj.relation).includes('owner') ||
                      computedStatusContainers.map(obj => obj.relation).includes('moderator')
                    "
                  >
                    <v-col>
                      <v-tooltip
                        right
                        color="customGrey"
                        v-if="computedStatusContainers.map(obj => obj.relation).includes('owner')"
                      >
                        <template v-slot:activator="{ props }">
                          <v-btn
                            variant="outlined"
                            icon
                            size="small"
                            v-bind="props"
                            :title="$t(relationItems.owner.textKey)"
                            style="cursor:default"
                          >
                            <v-icon
                              color="customGrey"
                            >
                              {{relationItems.owner.icon}}
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>
                          {{$t(relationItems.owner.textKey)}}
                        </span>
                      </v-tooltip>
                      <v-tooltip
                        right
                        color="customGrey"
                        v-if="computedStatusContainers.map(obj => obj.relation).includes('moderator')"
                      >
                        <template v-slot:activator="{ props }">
                          <v-btn
                            variant="outlined"
                            icon
                            size="small"
                            v-bind="props"
                            :title="$t(relationItems.moderator.textKey)"
                          >
                            <v-icon
                              class="mr-1"
                              color="customGrey"
                            >
                              {{relationItems.moderator.icon}}
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>
                          {{$t(relationItems.moderator.textKey)}}
                        </span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                  <!-- Description -->
                  <v-row>
                    <TranslatableText
                      ownField="description"
                      :allFields="['title', 'description']"
                      type="discussions"
                      :textParent="discussion"
                    >
                      <template
                        v-slot:defaultLang="{ computedText, translateText }"
                      >
                        <v-col
                          class="text-body-1"
                        >
                          <span
                            v-html="discussionProp ? truncatedDescription(newTab(computedText.value)) : $sanitize(newTab(computedText.value))"
                          ></span>
                          <TranslatableTextInfo
                            :canTranslate="true"
                            :canShowOriginal="false"
                            @update:translateText="(data) => { translateText(data) }"
                          ></TranslatableTextInfo>
                        </v-col>
                      </template>
                      <template
                        v-slot:translatedLang="{ computedText, showOriginal, translateText }"
                      >
                        <v-col
                          class="pb-0"
                        >
                          <v-sheet
                            class="pa-1 px-3"
                          >
                            <span
                              class="text-body-1"
                              v-html="discussionProp ?
                                truncatedDescription(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />'))) :
                                $sanitize(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />')))
                              "
                            ></span>
                            <TranslatableTextInfo
                              :canTranslate="false"
                              :canShowOriginal="true"
                              :needsUpdate="discussion.translationSum !== computedText.translationSum"
                              @update:showOriginal="(data) => { showOriginal(data) }"
                              @update:translateText="(data) => { translateText(data) }"
                            ></TranslatableTextInfo>
                          </v-sheet>
                        </v-col>
                      </template>
                    </TranslatableText>
                  </v-row>
                </v-card-text>
              </v-col>
              <v-col
                v-if="computedPics.length > 0"
                cols="12"
                sm="12"
                :md="discussionProp ? 12 : 4"
                :class="discussionProp ? 'py-0': ''"
                :order="1"
                :order-md="discussionProp ? 1 : 2"
              >
                <!-- Carousel -->
                <v-carousel
                  v-model="picsCarousel"
                  hide-delimiters
                  :show-arrows="computedPics.length > 1"
                  :show-arrows-on-hover="computedPics.length > 1"
                  :cycle="false"
                  :height="discussionProp ? 250 : '100%'"
                  class="white"
                >
                  <template
                    v-slot:prev="{ props }"
                  >
                    <v-btn
                      icon="fas fa-chevron-left"
                      v-bind="props"
                    >
                    </v-btn>
                  </template>
                  <template
                    v-slot:next="{ props }"
                  >
                  <v-btn
                    icon="fas fa-chevron-right"
                    v-bind="props"
                  >
                  </v-btn>
                  </template>
                  <v-carousel-item
                    v-for="pic in computedPics"
                    :key="pic.url"
                  >
                    <v-img
                      :height="discussionProp ? 250 : 350"
                      :src="s3 + pic.url"
                      :contain="discussionProp ? false : true"
                      :alt="$t('discussionTitlePic')"
                      :title="pic.credit ? '© ' + pic.credit : ''"
                    ></v-img>
                  </v-carousel-item>
                </v-carousel>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <!-- If not preview discussions -->
    <template
      v-if="!discussionProp"
    >
      <v-divider
        class="mx-4 mt-8 mb-10"
      ></v-divider>
      <v-row>
        <v-col>
          <DiscussionCore
            :discussion="discussion"
          ></DiscussionCore>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>

import DiscussionCore from '@/components/DiscussionCore.vue'
import TranslatableText from '@/components/TranslatableText.vue'
import TranslatableTextInfo from '@/components/TranslatableTextInfo.vue'
import { mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  name: 'DiscussionCard',

  components: {
    DiscussionCore,
    TranslatableText,
    TranslatableTextInfo
  },

  props: [
    'discussionProp'
  ],

  emits: [
    'update:selectCategory',
    'update:selectTag'
  ],

  data: () => ({
    picsCarousel: 0,
    message: undefined,
    isSending: false,
    discussion: undefined
  }),

  async mounted () {
    await this.loadDiscussion()
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
    async loadDiscussion () {
      if (this.discussionProp) {
        this.discussion = this.discussionProp
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
          this.discussion = selectedDiscussion
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
    },
    async toggleDiscussionSubscription () {
      if (this.computedStatusContainers && this.computedStatusContainers.find(obj => obj.relation === 'subscriber')) {
        try {
          await this.removeDiscussionSubscription(
            [
              this.discussion._id,
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
              discussionId: this.discussion._id
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
      return this.statusContainers.filter(obj => obj.reference === this.discussion._id && obj.user === this.user._id)
    },
    computedPics () {
      if (this.discussion) {
        if (this.discussion.pics && this.discussion.pics.length > 0) {
          return this.discussion.pics
        } else {
          return this.categories.filter(obj => this.discussion.categories.includes(obj._id) && obj.pic && obj.pic.url).map(obj => obj.pic)
        }
      } else {
        return []
      }
    }
  }
}
</script>
