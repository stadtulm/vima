<template>
  <v-card
    color="customGreyUltraLight"
    v-if="computedAd"
    :to="adProp ? { name: 'Ad', params: { id: computedAd._id }} : ''"
  >
    <v-row>
      <v-col
        cols="12"
        sm="12"
        :md="adProp ? 8 : 6"
        :order="2"
        :order-md="1"
      >
        <v-row>
          <v-col>
            <!-- Title -->
            <v-card-title
              class="word-wrap mb-3"
            >
              <TranslatableText
                ownField="title"
                :allFields="['title', 'text']"
                type="ads"
                :allIds="allAdIds"
                :textParent="computedAd"
              >
              </TranslatableText>
              <v-tooltip
                right
                color="customGrey"
                :key="computedAdStatus.value"
              >
                <template v-slot:activator="{ on, attrs }">
                  <!-- Subscription buttons -->
                  <v-btn
                    v-if="computedAdStatus.value === 'subscriber' || computedAdStatus.value === 'subscribe'"
                    v-bind="attrs"
                    v-on="on"
                    color="#fff"
                    class="ml-3"
                    :style="'color:' + $settings.modules.ads.bgColor"
                    icon
                    :disabled="user ? false : true"
                    @click="toggleAdSubscription()"
                    :title="$t(computedAdStatus.textKey)"
                  >
                    <v-icon
                      :color="$settings.modules.ads.color"
                    >
                      {{computedAdStatus.value === 'subscriber' ? 'fas fa-star' : 'far fa-star'}}
                    </v-icon>
                  </v-btn>
                  <!-- Owner or applicant icons -->
                  <v-btn
                    icon
                    v-bind="attrs"
                    v-on="on"
                    v-else-if="computedAdStatus.value === 'owner' || computedAdStatus.value === 'applicant'"
                    :title="$t(computedAdStatus.textKey)"
                    class="ml-3"
                  >
                    <v-icon
                      color="customGrey"
                    >
                      {{computedAdStatus.icon}}
                    </v-icon>
                  </v-btn>
                </template>
                <span>
                  {{$t(computedAdStatus.textKey)}}
                </span>
              </v-tooltip>
            </v-card-title>
            <!-- Info -->
            <v-card-subtitle
              class="pb-1"
            >
              {{computedAd.type === 'offer' ? $t('offerNoun') : $t('wantedNoun')}}
              {{$t('from')}} {{$moment(computedAd.createdAt).format('DD.MM.YYYY')}}
              <template
                v-if="user"
              >
                {{$t('by')}}
                <v-btn
                  text
                  class="px-1"
                  @click="$router.push({name: 'User', params: { user: computedAd.author.user._id} })"
                >
                {{computedAd.author.user.userName}}
                </v-btn>
              </template>
            </v-card-subtitle>
          </v-col>
          <v-col
            v-if="adProp"
            class="shrink align-self-center"
            :class="$vuetify.breakpoint.smAndUp ? 'text-right' : ''"
            cols="12"
            sm="6"
          >
            <!-- View more button -->
            <v-btn
              :style="'color:' + $settings.modules.ads.color"
              :class="$vuetify.breakpoint.mdAndUp ? '' : 'mx-4 mb-4'"
              :to="{ name: 'Ad', params: { id: computedAd._id } }"
            >
              {{$t('viewButton')}}
              <v-icon
                class="ml-3"
                size="18"
                :color="$settings.modules.ads.color"
              >
                fas fa-arrow-right
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <!-- Categories -->
        <v-row
          dense
          v-if="computedAd.categories && computedAd.categories.length > 0"
        >
          <v-col
            class="mx-4 mt-2"
          >
            <v-chip
              outlined
              v-for="category in getCategories(computedAd.categories)"
              :key="category._id"
              class="mr-1"
              :disabled="!adProp"
              @click.prevent="$emit('selectCategory', category._id)"
            >
            {{category.text.value}}
            </v-chip>
          </v-col>
        </v-row>
        <!-- Tags -->
        <v-row
          dense
          v-if="computedAd.tags && computedAd.tags.length > 0"
        >
          <v-col
            class="mx-4"
          >
            <v-chip
              v-for="tag in getTags(computedAd.tags)"
              :key="tag._id"
              class="mr-1"
              :disabled="!adProp"
              @click.prevent="$emit('selectTag', tag._id)"
            >
            {{tag.text.value}}
            </v-chip>
          </v-col>
        </v-row>
        <!-- Description -->
        <v-row>
          <TranslatableText
            ownField="text"
            :allFields="['title', 'text']"
            type="ads"
            :allIds="allAdIds"
            :textParent="computedAd"
          >
            <template
              v-slot:defaultLang="{ computedText, translateText }"
            >
              <v-col
                class="body-1 mx-4"
              >
                <span
                  v-html="adProp ? truncatedDescription(newTab(computedText.value)) : $sanitize(newTab(computedText.value))"
                ></span>
                <TranslatableTextInfo
                  :canTranslate="true"
                  :canShowOriginal="false"
                  @translateText="(data) => { translateText(data) }"
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
                  class="ma-4 pa-1 px-3"
                >
                  <TranslatableTextInfo
                    :canTranslate="false"
                    :canShowOriginal="true"
                    :needsUpdate="computedAd.translationSum !== computedText.translationSum"
                    @showOriginal="(data) => { showOriginal(data) }"
                    @translateText="(data) => { translateText(data) }"
                  ></TranslatableTextInfo>
                  <span
                    v-html="adProp ?
                      $sanitize(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />'))) :
                      truncatedDescription(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />')))
                    "
                  ></span>
                </v-sheet>
              </v-col>
            </template>
          </TranslatableText>
        </v-row>
      </v-col>
      <v-col
        cols="12"
        sm="12"
        :md="adProp ? 4 : 6"
        :order="1"
        :order-md="2"
        :class="adProp ? 'py-0' : $vuetify.breakpoint.mdAndUp ? 'pr-6' : 'pt-0'"
      >
        <!-- Carousel -->
        <v-carousel
          v-if="computedPics.length > 0"
          v-model="picsCarousel"
          hide-delimiters
          :show-arrows="computedPics.length > 1"
          :show-arrows-on-hover="computedPics.length > 1"
          :cycle="false"
          height="100%"
          max-height="200px"
          class="white"
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
            <v-container
              class="fill-height"
              fluid
              justify="center"
              align="center"
              :style="'min-height: 200px; background-image: url(' + s3 + pic.url + ');background-size: ' + (adProp ? 'cover' : 'contain') + ';background-position: center;'"
            >
            </v-container>
          </v-carousel-item>
        </v-carousel>
      </v-col>
    </v-row>
    <!-- If not preview -->
    <template
      v-if="!adProp"
    >
      <v-row>
        <!-- If non-user -->
        <v-col
          v-if="!user"
        >
          <v-alert
            class="mx-4 mb-2"
            dark
            icon="fas fa-info-circle"
            :color="$settings.modules.ads.color"
          >
            <v-row>
              <v-col>
                {{$t('loginForAds')}}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn
                  class="elevation-1 customGrey--text"
                  color="white"
                  :to="{ name: 'Signup' }"
                >
                  {{$t('createProfileButton')}}
                  <v-icon
                    class="ml-3"
                    size="18"
                  >
                    fa fa-user-plus
                  </v-icon>
                </v-btn>
                <v-btn
                  class="elevation-1 ml-3 customGrey--text"
                  color="white"
                  :to="{ name: 'Login' }"
                >
                  {{$t('login')}}
                  <v-icon
                    class="ml-3"
                    size="18"
                  >
                    fa fa-sign-in-alt
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-alert>
        </v-col>
        <!-- If answered -->
        <v-col
          v-else-if="
            computedAd &&
            computedAdStatus.value === 'applicant'
          "
        >
          <v-alert
            class="mx-4 mb-2"
            dark
            icon="fas fa-info-circle"
            :color="$settings.modules.ads.color"
          >
            <v-row>
              <v-col>
                {{$t('adApplicantAnswer')}}
              </v-col>
            </v-row>
          </v-alert>
        </v-col>
        <!-- Answer section -->
        <v-col
          v-else-if="computedAdStatus.value === 'subscribe' || computedAdStatus.value === 'subscriber'"
          cols="12"
        >
          <v-card
            class="mx-4 mb-2"
            tile
            color="customGreyLight"
          >
            <v-card-title>
              {{$t('answerAdButton')}}
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col>
                  <v-textarea
                    :label="$t('answerAdLabel')"
                    v-model="message"
                    outlined
                    filled
                    auto-grow
                    multi-line
                    :rows="1"
                    hide-details
                    background-color="#fff"
                    color="customGrey"
                  >
                    <template
                      slot="append-outer"
                      >
                      <v-row>
                        <v-col
                          class="py-0 px-3"
                        >
                          <v-btn
                            fab
                            :loading="isSending"
                            :disabled="!message || message.replace(/(\r\n|\n|\r)/gm, '').replaceAll('<p>', '').replaceAll('</p>', '').replaceAll(' ', '') === ''"
                            @click="sendMessage()"
                            :color="$settings.modules.ads.color"
                            class="mx-1"
                            style="margin-top: -5px;"
                          >
                            <template
                              slot="loader"
                            >
                              <v-progress-circular
                                color="white"
                                width="3"
                                indeterminate
                              ></v-progress-circular>
                            </template>
                            <v-icon
                              size="18"
                              color="white"
                            >
                              fas fa-paper-plane
                            </v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </template>
                  </v-textarea>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-card>
</template>

<script>

import { mapGetters, mapActions, mapMutations } from 'vuex'
import TranslatableText from '@/components/TranslatableText.vue'
import TranslatableTextInfo from '@/components/TranslatableTextInfo.vue'

export default {
  name: 'AdCard',

  components: {
    TranslatableText,
    TranslatableTextInfo
  },

  props: [
    'adProp',
    'allAdIds'
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
    ...mapActions('ads', {
      requestAd: 'get'
    }),
    ...mapActions('status-container-helper', {
      createAdSubscription: 'create',
      removeAdSubscription: 'remove'
    }),
    ...mapActions('ad-messages', {
      createAdMessage: 'create'
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
    async toggleAdSubscription () {
      if (this.computedAdStatus.value === 'subscriber') {
        try {
          await this.removeAdSubscription(
            [
              this.computedAd._id,
              {
                query: {
                  type: 'removeAdSubscription'
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
          await this.createAdSubscription(
            {
              type: 'createAdSubscription',
              adId: this.computedAd._id
            }
          )
          this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        } catch (e) {
          this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        }
      }
    },
    async sendMessage () {
      this.isSending = true
      try {
        await this.createAdMessage(
          {
            ad: this.computedAd._id,
            author: this.user._id,
            text: [{
              value: this.message,
              type: 'default'
            }]
          }
        )
        this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
        this.isSending = false
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
        this.isSending = false
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'relationItems',
      'newTab',
      'getCategories',
      'getTags'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('ads', {
      getAd: 'get'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('categories', {
      categories: 'list',
      getCategory: 'get'
    }),
    ...mapGetters('tags', {
      getTag: 'get'
    }),
    computedAdStatus () {
      if (this.computedStatusContainers) {
        if (this.computedStatusContainers.find(obj => obj.relation === 'owner')) {
          return this.relationItems.owner
        } if (this.computedStatusContainers.find(obj => obj.relation === 'moderator')) {
          return this.relationItems.moderator
        } else if (this.computedStatusContainers.find(obj => obj.relation === 'member')) {
          return this.relationItems.member
        } else if (this.computedStatusContainers.find(obj => obj.relation === 'applicant')) {
          return this.relationItems.applicant
        } else if (this.computedStatusContainers.find(obj => obj.relation === 'subscriber')) {
          return this.relationItems.subscriber
        } else {
          return this.relationItems.subscribe
        }
      } else {
        return this.relationItems.subscribe
      }
    },
    computedStatusContainers () {
      return this.statusContainers.filter(
        obj =>
          obj.reference === this.computedAd._id &&
          obj.user === this.user._id &&
          obj.type === 'ads'
      )
    },
    computedPics () {
      if (this.computedAd) {
        if (this.computedAd.pics && this.computedAd.pics.length > 0) {
          return this.computedAd.pics
        } else {
          return this.categories.filter(obj => this.computedAd.categories.includes(obj._id) && obj.pic && obj.pic.url).map(obj => obj.pic)
        }
      } else {
        return []
      }
    }
  },

  asyncComputed: {
    async computedAd () {
      if (this.adProp) {
        return this.adProp
      } else {
        if (this.$route.name === 'Ad' && this.$route.params.id && !this.adProp) {
          let selectedAd = this.getAd(this.$route.params.id)
          if (!selectedAd) {
            try {
              selectedAd = await this.requestAd(
                this.$route.params.id
              )
            } catch (e) {
              if (e.code === 403) {
                this.$router.push({ name: 'Forbidden' })
              }
            }
          }
          return selectedAd
        }
      }
    }
  }
}
</script>
