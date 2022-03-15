<template>
  <v-row>
    <v-col
      cols="12"
    >
      <v-card
        color="customGreyUltraLight"
        tile
      >
        <v-card-text>
          <v-row
            class="mb-3"
          >
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('editSettings')}}
            </v-col>
          </v-row>
          <v-form
            v-model="isValid"
            ref="settingsForm"
          >
            <Upload
              :optional="false"
              :label="$t('brand')"
              :parent="settings[0]"
              path="headerLogo"
              :maxFilesize="2"
              :maxFiles="1"
              resolutionString="1400x400"
              :resizeWidth="1080"
              resizeMethod="contain"
              :resizeQuality="0.5"
              :patchParentMethod="patchSettings"
              titleType="title"
              bgColor="customGreyUltraLight"
            ></Upload>
            <v-divider
              :class="headerLogo ? 'mb-9 mt-5' : 'mb-9 mt-12'"
            ></v-divider>
            <v-row>
              <v-col
                class="title"
              >
                {{$t('languages')}}
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-text-field
                  dense
                  outlined
                  :label="$t('defaultLanguage')"
                  color="customGrey"
                  v-model="defaultLanguage"
                  disabled
                  persistent-hint
                  :hint="$t('notEditable')"
                >
                </v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-combobox
                  chips
                  deletable-chips
                  dense
                  multiple
                  color="customGrey"
                  item-color="customGrey"
                  outlined
                  background-color="#fff"
                  v-model="languages"
                  :items="languages"
                  :label="$t('languages')"
                  :disabled="user.role !== 'admins'"
                  :rules="[
                    v => (v.length > 0) || $t('languageRequired'),
                    v => (v.includes(this.defaultLanguage)) || $t('defaultLanguageRequired'),
                    v => (v.filter(lang => lang.length !== 2).length === 0) || $t('languageFormatRule')
                  ]"
                >
                </v-combobox>
              </v-col>
            </v-row>
            <v-row>
              <v-col
                class="title"
              >
                {{$t('socialMedia')}}
              </v-col>
            </v-row>
            <v-row>
              <v-col
                cols="12"
              >
                <v-text-field
                  dense
                  outlined
                  :label="$t('linkTo') + ' facebook'"
                  color="customGrey"
                  background-color="#fff"
                  v-model="fb"
                  :rules="[rules.webLink]"
                >
                </v-text-field>
              </v-col>
              <v-col
                cols="12"
              >
                <v-text-field
                  dense
                  outlined
                  :label="$t('linkTo') + ' instagram'"
                  color="customGrey"
                  background-color="#fff"
                  v-model="instagram"
                  :rules="[rules.webLink]"
                >
                </v-text-field>
              </v-col>
              <v-col
                cols="12"
              >
                <v-text-field
                  dense
                  outlined
                  :label="$t('linkTo') + ' twitter'"
                  color="customGrey"
                  background-color="#fff"
                  v-model="twitter"
                  :rules="[rules.webLink]"
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col
                class="title"
              >
                {{$t('colors')}}
              </v-col>
            </v-row>
            <v-row
              class="mb-4"
            >
              <!-- Header color -->
              <v-col
                cols="12"
                md="6"
              >
                <v-card
                  flat
                >
                  <v-card-text>
                    <v-row>
                      <v-col
                        class="title text-center"
                        cols="12"
                      >
                        {{$t('headerColor')}}
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        cols="12"
                        class="pa-0"
                      >
                        <v-color-picker
                          v-model="headerColor"
                          hide-canvas
                          width="100%"
                          :rules="[rules.required]"
                        >
                        </v-color-picker>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
              <!-- Indicator color -->
              <v-col
                cols="12"
                md="6"
              >
                <v-card
                  flat
                >
                  <v-card-text>
                    <v-row>
                      <v-col
                        class="title text-center"
                        cols="12"
                      >
                        {{$t('indicatorColor')}}
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        cols="12"
                        class="pa-0"
                      >
                        <v-color-picker
                          v-model="indicatorColor"
                          hide-canvas
                          width="100%"
                          :rules="[rules.required]"
                        >
                        </v-color-picker>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-divider
              class="my-9"
            ></v-divider>
            <v-row>
              <v-col
                class="title"
              >
                {{$t('modules')}}
              </v-col>
            </v-row>
            <v-row
              class="mb-4"
            >
              <v-col
                cols="12"
                md="6"
                v-for="(module, key) in modules"
                :key="key"
              >
                <v-card>
                  <v-card-text>
                    <v-row>
                      <v-col
                        class="title"
                      >
                        {{$t(key)}}
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-switch
                          :label="$t('isActiveModule')"
                          v-model="module.isActive"
                          color="customGrey"
                        ></v-switch>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-select
                          dense
                          color="customGrey"
                          item-color="customGrey"
                          outlined
                          v-model="module.position"
                          :label="$t('position')"
                          :items="Array.from({length: Object.keys(modules).length}, (_, i) => i + 1)"
                          :disabled="user.role !== 'admins'"
                          :rules="[rules.required, v => Object.keys(modules).map(k => modules[k].position).filter(p => v === p).length === 1 || $t('uniquePositionError')]"
                        >
                        </v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      v-if="module.color"
                    >
                      <v-col>
                        <v-card
                          flat
                        >
                          <v-card-text>
                            <v-row>
                              <v-col
                                class="subtitle-2"
                                cols="12"
                              >
                                {{$t('color')}}
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col
                                cols="12"
                                class="pa-0"
                              >
                                <v-color-picker
                                  v-model="module.color"
                                  hide-canvas
                                  width="100%"
                                  :rules="[rules.required]"
                                >
                                </v-color-picker>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-row
                      v-if="module.bgColor"
                    >
                      <v-col>
                        <v-card
                          flat
                        >
                          <v-card-text>
                            <v-row>
                              <v-col
                                class="subtitle-2"
                                cols="12"
                              >
                                {{$t('bgColor')}}
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col
                                cols="12"
                                class="pa-0"
                              >
                                <v-color-picker
                                  v-model="module.bgColor"
                                  hide-canvas
                                  width="100%"
                                  :rules="[rules.required]"
                                >
                                </v-color-picker>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-row
                      v-if="module.gradientColor"
                    >
                      <v-col>
                        <v-card
                          flat
                        >
                          <v-card-text>
                            <v-row>
                              <v-col
                                class="subtitle-2"
                                cols="12"
                              >
                                {{$t('gradientColor')}}
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col
                                cols="12"
                                class="pa-0"
                              >
                                <v-color-picker
                                  v-model="module.gradientColor"
                                  hide-canvas
                                  width="100%"
                                  :rules="[rules.required]"
                                >
                                </v-color-picker>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                    <Upload
                      :optional="false"
                      :label="$t('pic')"
                      :parent="settings[0]"
                      :path="'modules.' + key + '.pic'"
                      :maxFilesize="1"
                      :maxFiles="1"
                      resolutionString="1400x400"
                      :resizeWidth="1080"
                      resizeMethod="contain"
                      :resizeQuality="0.5"
                      :patchParentMethod="patchSettings"
                      titleType="subtitle-2"
                      bgColor="white"
                    ></Upload>
                  </v-card-text>
                </v-card>

              </v-col>
            </v-row>

          </v-form>
          <v-card-actions
            class="px-0"
          >
            <v-btn
              block
              large
              :dark="isValid"
              color="customGrey"
              :loading="isLoading"
              :disabled="!isValid"
              @click="saveSettings()"
            >
              {{$t('saveDataButton')}}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import Upload from '@/components/Upload.vue'
const appName = process.env.VUE_APP_NAME

export default {
  name: 'SettingsEditor',

  components: {
    Upload
  },

  data: () => ({
    headerColor: undefined,
    indicatorColor: undefined,
    modules: undefined,
    isQueued: false,
    isLoading: false,
    isValid: false,
    headerLogo: undefined,
    fb: undefined,
    instagram: undefined,
    twitter: undefined,
    languages: [],
    defaultLanguage: undefined
  }),

  async mounted () {
    await this.adapt()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('settings', {
      patchSettings: 'patch'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    async adapt () {
      if (this.settings) {
        const tmpSettings = JSON.parse(JSON.stringify(this.settings[0]))
        this.headerColor = this.parseRgbString(tmpSettings.headerColor)
        this.indicatorColor = this.parseRgbString(tmpSettings.indicatorColor)
        this.defaultLanguage = tmpSettings.defaultLanguage
        this.languages = tmpSettings.languages
        if (tmpSettings.socialMediaUrls) {
          this.fb = tmpSettings.socialMediaUrls.fb
          this.instagram = tmpSettings.socialMediaUrls.instagram
          this.twitter = tmpSettings.socialMediaUrls.twitter
        }
        for (const key of Object.keys(tmpSettings.modules)) {
          if (tmpSettings.modules[key].color) {
            tmpSettings.modules[key].color = this.parseRgbString(tmpSettings.modules[key].color)
          }
          if (tmpSettings.modules[key].bgColor) {
            tmpSettings.modules[key].bgColor = this.parseRgbString(tmpSettings.modules[key].bgColor)
          }
        }
        this.modules = tmpSettings.modules
        this.$nextTick(() => {
          this.$refs.settingsForm.validate()
        })
      }
    },
    async saveSettings () {
      this.isLoading = true
      const tmpModules = JSON.parse(JSON.stringify(this.modules))
      for (const key of Object.keys(tmpModules)) {
        if (tmpModules[key].color) {
          tmpModules[key].color = `rgba(${tmpModules[key].color.r}, ${tmpModules[key].color.g}, ${tmpModules[key].color.b}, 1)`
        }
        if (tmpModules[key].bgColor) {
          tmpModules[key].bgColor = `rgba(${tmpModules[key].bgColor.r}, ${tmpModules[key].bgColor.g}, ${tmpModules[key].bgColor.b}, 1)`
        }
      }
      // Sort default language to start
      this.languages.unshift(this.languages.splice(this.languages.indexOf(this.defaultLanguage), 1)[0])
      const map = {
        name: appName,
        languages: this.languages,
        headerColor: `rgba(${this.headerColor.r}, ${this.headerColor.g}, ${this.headerColor.b}, 1)`,
        indicatorColor: `rgba(${this.indicatorColor.r}, ${this.indicatorColor.g}, ${this.indicatorColor.b}, 1)`,
        socialMediaUrls: {
          fb: this.fb,
          instagram: this.instagram,
          twitter: this.twitter
        },
        modules: tmpModules
      }
      try {
        await this.patchSettings([this.settings[0]._id, map, {}])
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$router.go(-1)
      } catch (e) {
        console.log(e)
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    }
  },

  computed: {
    ...mapGetters([
      'rules',
      's3',
      'parseRgbString'
    ]),
    ...mapGetters('auth', [
      'user'
    ]),
    ...mapGetters('organisations', {
      getOrganisation: 'get'
    }),
    ...mapGetters('settings', {
      settings: 'list'
    })
  },

  watch: {
    modules: {
      deep: true,
      handler () {
        this.$refs.settingsForm.validate()
      }
    }
  }
}
</script>
