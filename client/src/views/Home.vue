<template>
  <div>
    <v-dialog
      :value="true"
      fullscreen
      no-click-animation
      persistent
      :transition="false"
    >
      <div style="position:fixed">
      <v-row
        no-gutters
      >
        <v-col
          v-for="(i, j) in computedPics"
          :key="j"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <v-img
            :src="'/pics/people/' + i + '.jpeg'"
            :alt="$t('welcomePic')"
            title="© ILEU e.V."
          >
          </v-img>
        </v-col>
      </v-row>
      </div>
      <v-container
          fluid
        >
          <v-row>
            <v-col
              cols="12"
              sm="6"
              md="5"
            >
              <v-card
                class="fill-height"
                tile
                flat
                color="rgba(255,255,255,0.94)"
              >
                <v-card-text>
                  <v-row>
                    <v-col>
                      <v-row>
                        <v-col
                          cols="12"
                        >
                          <LanguageSelect
                            :isMainSwitch="true"
                            :currentLanguage="$i18n.locale"
                            @setLanguage="setLanguageAtHome"
                          ></LanguageSelect>
                        </v-col>
                      </v-row>
                      <v-alert
                        dismissible
                        class="my-3"
                        color="customGreyMedium"
                      >
                      <span>
                        How to change the language on ViMA
                        <br><br>
                        <a href="/downloads/ViMA-Danube_Anleitung Übersetzungen_DE.pdf" target="_blank">
                          <v-icon
                            class="mr-2 mb-1"
                          >
                            fas fa-file-pdf
                          </v-icon>
                          DE
                        </a>
                        <br>
                        <a href="/downloads/ViMA-Danube_How to translate_Tekste_UKR.pdf" target="_blank">
                          <v-icon
                            class="mr-2 mb-1"
                          >
                            fas fa-file-pdf
                          </v-icon>
                          UKR
                        </a>
                      </span>
                      </v-alert>
                      <v-row>
                        <v-col
                          cols="12"
                          class="text-h4 font-weight-bold mt-4 customGrey--text"
                        >
                          {{$t('welcomeHeadline')}}
                          <img
                            :src="$settings && $settings.headerLogo ? s3 + $settings.headerLogo.url : '/pics/vima.svg'"
                            height="35px"
                            style="margin-bottom: -1px"
                            alt="Vima Logo"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          class="title customGrey--text font-weight-bold"
                        >
                          {{$t('sloganHome')}}
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row
                    class="align-self-end"
                  >
                    <v-col>
                      <v-row>
                        <v-col
                          class="subtitle-1 customGrey--text"
                        >
                          <p>
                            <span
                              class="pointer font-weight-bold"
                              @click="$router.push({ name: 'Vima' })"
                            >
                              {{$t('vima')}}
                            </span>
                            <span v-html="$t('homeWelcomeAbout')"></span>
                          </p>
                          <p
                            v-html="$t('homeWelcomePartners')"
                          >
                          </p>
                          <p
                            v-html="$t('homeWelcomeBeta')"
                          >
                          </p>
                        </v-col>
                      </v-row>
                      <v-alert
                        v-if="isDisconnected"
                        color="customGreyUltraLight"
                      >
                        <template v-slot:prepend>
                          <v-progress-circular
                            size="18"
                            width="2"
                            indeterminate
                            class="mr-4"
                          ></v-progress-circular>
                        </template>
                        {{$t('connectingToServer')}}
                      </v-alert>
                      <v-row>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <v-btn
                            v-if="!isDisconnected"
                            color="customGrey"
                            dark
                            large
                            class="mr-3 mb-3"
                            :to="{name: 'Participate'}"
                          >
                            {{$t('participate')}}
                          </v-btn>
                          <v-btn
                            color="customGrey"
                            dark
                            large
                            class="mr-3 mb-3"
                            target="_blank"
                            href="https://youtu.be/eaCl-0GBje0"
                          >
                            {{$t('introductionVideo')}}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row
                        v-if="!isDisconnected && computedShowHelpButton"
                      >
                        <v-col
                          cols="12"
                        >
                          <v-sheet
                            color="yellow"
                            class="pa-5"
                          >
                            <v-btn
                              color="blue"
                              dark
                              x-large
                              block
                              class="mr-3"
                              :to="{ name: 'Group', params: { group: '622094013b8ba8046b7ab23c' } }"
                            >
                              {{$t("help_title")}}
                            </v-btn>
                          </v-sheet>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-btn
                            color="customGrey"
                            dark
                            text
                            class="mr-1 px-1"
                            :to="{name: 'Signup'}"
                          >
                            {{$t('createProfileButton')}}
                          </v-btn>
                          /
                          <v-btn
                            color="customGrey"
                            dark
                            text
                            class="px-1"
                            :to="{name: 'Login'}"
                          >
                            {{$t('login')}}
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
    </v-dialog>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import LanguageSelect from '@/components/LanguageSelect.vue'

const showHelpButtons = process.env.VUE_APP_SHOW_HELP_BUTTON

export default {
  name: 'Home',

  components: {
    LanguageSelect
  },

  data: () => ({
  }),

  mounted () {
  },

  methods: {
    getImageSrc (src) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    },
    setLanguageAtHome (languageKey) {
      localStorage.removeItem('skipWelcome')
      this.setLanguage(languageKey)
    },
    shuffle () {
      const array = []
      for (let i = 0; i < this.computedPicLength; ++i) {
        array[i] = i + 1
      }
      let tmp
      let current
      let top = array.length
      if (top) {
        while (--top) {
          current = Math.floor(Math.random() * (top + 1))
          tmp = array[current]
          array[current] = array[top]
          array[top] = tmp
        }
      }
      return array
    },
    arrayHasConsecitiveRepetition (arrayIn) {
      return arrayIn.every(function (element, index) {
        return !index || element !== arrayIn[index - 1]
      })
    }
  },

  computed: {
    ...mapGetters([
      'isDisconnected',
      's3',
      'setLanguage'
    ]),
    computedShowHelpButton () {
      return showHelpButtons
    },
    computedPics () {
      const picSet = this.shuffle()
      let pics = []
      for (let i = 0; i < this.computedPicLength; ++i) {
        pics = pics.concat(picSet)
      }
      return pics
    },
    computedPicLength () {
      return this.asyncComputedPicLength || 0
    }
  },
  asyncComputed: {
    async asyncComputedPicLength () {
      let i = 0
      await (async () => {
        while (i < 100) {
          i++
          try {
            await this.getImageSrc('/pics/people/' + i + '.jpeg')
          } catch (e) {
            break
          }
        }
      })()
      return i - 1
    }
  }
}
</script>
