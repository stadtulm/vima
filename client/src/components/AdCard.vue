<template>
  <v-card
    color="customGreyUltraLight"
    v-if="ad"
    :to="adProp ? { name: 'Ad', params: { id: ad._id }} : ''"
  >
    <v-card-text>
    <v-row>
      <v-col
        cols="12"
        sm="12"
        md="8"
        :order="2"
        :order-md="1"
      >
        <v-row>
          <v-col>
            <!-- Title -->
            <div
              class="ma-4 mb-0 text-h6 font-weight-bold"
            >
              <TranslatableText
                ownField="title"
                :allFields="['title', 'text']"
                type="ads"
                :allIds="allAdIds"
                :textParent="ad"
              >
              </TranslatableText>
            </div>
            <!-- Info -->
            <v-card-subtitle
              class="mb-5"
            >
              {{ad.type === 'offer' ? $t('offerNoun') : $t('wantedNoun')}}
              {{$t('from')}} {{$moment(ad.createdAt).format('DD.MM.YYYY')}}
              <template
                v-if="user"
              >
                {{$t('by')}}
                <v-btn
                  class="ml-1"
                  variant="outlined"
                  size="x-small"
                  @click="$router.push({name: 'User', params: { user: ad.author.user._id} })"
                >
                {{ad.author.user.userName}}
                </v-btn>
              </template>
            </v-card-subtitle>
          </v-col>
        </v-row>
        <v-card-text>
          <!-- Categories -->
          <v-row
            dense
            v-if="ad.categories && ad.categories.length > 0"
          >
            <v-col>
              <v-chip
                variant="outlined"
                v-for="category in getCategories(ad.categories)"
                :key="category._id"
                class="mr-1 mb-1"
                :disabled="!adProp"
                @click.prevent="$emit('update:selectCategory', category._id)"
              >
              {{category.text.value}}
              </v-chip>
            </v-col>
          </v-row>
          <!-- Tags -->
          <v-row
            dense
            v-if="ad.tags && ad.tags.length > 0"
          >
            <v-col>
              <v-chip
                v-for="tag in getTags(ad.tags)"
                :key="tag._id"
                class="mr-1 mb-1"
                :disabled="!adProp"
                @click.prevent="$emit('update:selectTag', tag._id)"
              >
              {{tag.text}}
              </v-chip>
            </v-col>
          </v-row>
          <!-- Indicators -->
          <v-row
            v-if="!adProp"
          >
            <v-col
              cols="12"
            >
              <v-tooltip
                right
                color="customGrey"
                :key="computedAdStatus.value"
              >
                <template v-slot:activator="{ props }">
                  <!-- Subscription buttons -->
                  <v-btn
                    icon
                    v-if="computedAdStatus.value === 'subscriber' || computedAdStatus.value === 'subscribe'"
                    v-bind="props"
                    :color="$settings.modules.ads.color"
                    size="small"
                    :disabled="user ? false : true"
                    @click="toggleAdSubscription()"
                    :title="$t(computedAdStatus.textKey)"
                  >
                    <v-icon
                      color="white"
                    >
                      {{computedAdStatus.value === 'subscriber' ? 'fas fa-star' : 'far fa-star'}}
                    </v-icon>
                  </v-btn>
                  <!-- Owner or applicant icons -->
                  <v-btn
                    icon
                    variant="outlined"
                    size="small"
                    v-bind="props"
                    v-else-if="computedAdStatus.value === 'owner' || computedAdStatus.value === 'applicant'"
                    :title="$t(computedAdStatus.textKey)"
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
            </v-col>
          </v-row>
          <!-- Description -->
          <v-row>
            <TranslatableText
              ownField="text"
              :allFields="['title', 'text']"
              type="ads"
              :allIds="allAdIds"
              :textParent="ad"
            >
              <template
                v-slot:defaultLang="{ computedText, translateText }"
              >
                <v-col
                  class="text-body-1"
                >
                  <span
                    v-html="adProp ? truncatedDescription(newTab(computedText.value)) : $sanitize(newTab(computedText.value))"
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
                      v-html="adProp ?
                        $sanitize(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />'))) :
                        truncatedDescription(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />')))
                      "
                    ></span>
                    <TranslatableTextInfo
                      :canTranslate="false"
                      :canShowOriginal="true"
                      :needsUpdate="ad.translationSum !== computedText.translationSum"
                      @update:showOriginal="(data) => { showOriginal(data) }"
                      @update:translateText="(data) => { translateText(data) }"
                    ></TranslatableTextInfo>
                  </v-sheet>
                </v-col>
              </template>
            </TranslatableText>
          </v-row>
          <!-- View more button -->
          <v-row>
            <v-col
              v-if="adProp"
              cols="12"
            >
              <v-btn
                :style="'color:' + $settings.modules.ads.color"
                :to="{ name: 'Ad', params: { id: ad._id } }"
                block
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
        </v-card-text>
      </v-col>
      <!-- Carousel -->
      <v-col
        v-if="computedPics.length > 0"
        cols="12"
        sm="12"
        md="4"
        :order="1"
        :order-md="2"
        :class="adProp ? 'py-3' : $vuetify.display.mdAndUp ? 'pr-6' : 'pt-0'"
      >
        <v-carousel
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
            class="mx-4 mb-2 text-white"
            icon="fas fa-info-circle"
            :color="$settings.modules.ads.color"
          >
            <v-row>
              <v-col
                class="text-body-1 pt-3"
              >
                {{$t('loginForAds')}}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn
                  class="elevation-1 text-customGrey"
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
                  class="elevation-1 ml-3 text-customGrey"
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
            ad &&
            computedAdStatus.value === 'applicant'
          "
        >
          <v-alert
            class="mx-4 mb-2 text-white"
            icon="fas fa-info-circle"
            :color="$settings.modules.ads.color"
          >
            <v-row>
              <v-col
                class="text-body-1 pt-3"
              >
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
              {{$t('answerAdButton')}}:
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col>
                  <v-textarea
                    :label="$t('answerAdLabel')"
                    v-model="message"
                    auto-grow
                    multi-line
                    :rows="1"
                    hide-details
                  >
                    <template
                      v-slot:append
                      >
                      <v-row>
                        <v-col
                          class="py-0 px-3"
                        >
                          <v-btn
                            icon
                            :loading="isSending"
                            :color="!message || message.replace(/(\r\n|\n|\r)/gm, '').replaceAll('<p>', '').replaceAll('</p>', '').replaceAll(' ', '') === '' ? 'customGreyMedium' : $settings.modules.ads.color"
                            :disabled="!message || message.replace(/(\r\n|\n|\r)/gm, '').replaceAll('<p>', '').replaceAll('</p>', '').replaceAll(' ', '') === ''"
                            @click="sendMessage()"
                            class="mx-1"
                          >
                            <template
                              v-slot:loader
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
    </v-card-text>
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

  emits: [
    'update:selectCategory',
    'update:selectTag'
  ],

  data: () => ({
    picsCarousel: 0,
    message: undefined,
    isSending: false,
    ad: undefined
  }),

  async mounted () {
    await this.loadAd()
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
      const div = document.createElement('div')
      div.innerHTML = text
      let tmpStr = div.innerText
      if (tmpStr && tmpStr.length > len) {
        tmpStr = tmpStr.substr(0, len) + ' [...]'
      }
      return tmpStr
    },
    async loadAd () {
      if (this.adProp) {
        this.ad = this.adProp
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
          this.ad = selectedAd
        }
      }
    },
    async toggleAdSubscription () {
      if (this.computedAdStatus.value === 'subscriber') {
        try {
          await this.removeAdSubscription(
            [
              this.ad._id,
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
              adId: this.ad._id
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
            ad: this.ad._id,
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
      categories: 'list'
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
          obj.reference === this.ad._id &&
          obj.user === this.user._id &&
          obj.type === 'ads'
      )
    },
    computedPics () {
      if (this.ad) {
        if (this.ad.pics && this.ad.pics.length > 0) {
          return this.ad.pics
        } else {
          return this.categories.filter(obj => this.ad.categories.includes(obj._id) && obj.pic && obj.pic.url).map(obj => obj.pic)
        }
      } else {
        return []
      }
    }
  }
}
</script>
