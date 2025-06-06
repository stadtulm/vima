<template>
  <div>
    <v-dialog
      v-model="showHome"
      fullscreen
      no-click-animation
      persistent
      :transition="false"
    >
      <div style="position:absolute;width:100%">
      <v-row>
        <v-col
          class="pa-0"
          v-for="(i, j) in pics"
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
            class="bordered fill-height"
            cover
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
                        class="pl-0 pt-8"
                          cols="12"
                        >
                          <span
                            class="mr-4 pointer text-body-2"
                            @click="$router.push({name: 'Faq'})"
                          >
                            <v-icon
                              class="ml-3 mr-1 mb-1"
                              size="18"
                            >
                              fas fa-info-circle
                            </v-icon>
                            {{$t('howToSwitchLanguage')}}
                            <v-icon
                              class="ml-2"
                              size="18"
                            >
                              fas fa-arrow-right
                            </v-icon>
                          </span>
                          <LanguageSelect
                            :isMainSwitch="true"
                            :currentLanguage="$i18n.locale"
                            @update:setLanguage="setLanguageAtHome"
                          ></LanguageSelect>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col
                          cols="12"
                          class="text-h4 font-weight-bold mt-4 text-customGrey"
                        >
                          {{$t('welcomeHeadline')}}
                          <img
                            :src="$settings && $settings.headerLogo ? s3 + $settings.headerLogo.url : '/pics/vima.svg'"
                            height="35"
                            style="margin-bottom: -1px"
                            alt="Vima Logo"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          class="text-h6 text-customGrey font-weight-bold"
                        >
                          {{pickLanguage('sloganText')}}
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
                          class="text-subtitle-1 text-customGrey"
                        >
                          <p>
                            <span
                              class="pointer font-weight-bold"
                              @click="$router.push({ name: 'Vima' })"
                            >
                              {{$t('vima')}}
                            </span>
                            <span v-html="pickLanguage('welcomeText')"></span>
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
                        >
                          <v-btn
                            v-if="!isDisconnected"
                            color="customGrey"
                            dark
                            size="x-large"
                            block
                            :to="{name: 'Participate'}"
                          >
                            {{$t('participate')}}
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
                            variant="text"
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
                            variant="text"
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

const showHelpButton = import.meta.env.VITE_SHOW_HELP_BUTTON

export default {
  name: 'Home',

  components: {
    LanguageSelect
  },

  data: () => ({
    showHome: true,
    picLength: 0,
    pics: []
  }),

  async mounted () {
    this.picLength = await this.calculatePicLength()
    const picSet = this.shuffle()
    let tmpPics = []
    for (let i = 0; i < this.picLength; ++i) {
      tmpPics = tmpPics.concat(picSet)
    }
    this.pics = tmpPics
  },

  methods: {
    pickLanguage (textId) {
      // Try to use custom text in user language
      const userLanguageText = this.$settings[textId].find(language => language.lang === this.$i18n.locale)
      if (userLanguageText) {
        return userLanguageText.value
      } else {
        // Try to use custom text in default language
        const defaultLanguageText = this.$settings[textId].find(language => language.type === 'default')
        if (defaultLanguageText) {
          return defaultLanguageText.value
        } else {
          return ''
        }
      }
    },
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
      for (let i = 0; i < this.picLength; ++i) {
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
    },
    async calculatePicLength () {
      let i = 0
      while (i < 100) {
        i++
        try {
          await this.getImageSrc('/pics/people/' + i + '.jpeg')
        } catch (e) {
          break
        }
      }
      return i - 1
    }
  },

  computed: {
    ...mapGetters([
      'isDisconnected',
      's3',
      'setLanguage'
    ]),
    computedShowHelpButton () {
      return parseInt(showHelpButton)
    }
  }
}
</script>

<style>
.bordered {
  border: 1px solid black;
}
</style>
