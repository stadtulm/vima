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
            <v-row>
              <v-col
                class="title"
              >
                {{$t('brand')}}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <FileUpload
                  ref="headerLogoFileUpload"
                  v-model="headerLogo"
                  @fileRemove="patchFileRemove($event, 'headerLogo', false)"
                  @fileAdd="$nextTick(() => { $refs.settingsForm.validate() })"
                  :acceptedMimeTypes="['image/png', 'image/svg+xml']"
                  :maxFileSize="0.25"
                  :maxFiles="1"
                  bgColor="white"
                  :scaleToFit="[100, 100]"
                  :resizeQuality="100"
                ></FileUpload>
              </v-col>
            </v-row>
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
                  :label="$t('languages') + ' (ISO 3166-1)'"
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
                cols="12"
              >
                <v-card
                  flat
                  color="customGreyUltraLight"
                >
                  <v-row>
                    <v-col
                      cols="12"
                      class="subtitle-1"
                    >
                      {{$t('links')}} {{$t('optionalLabelExtension')}}
                    </v-col>
                  </v-row>
                  <v-row
                    dense
                    v-for="(link, i) in otherVimaLinks"
                    :key="i"
                  >
                    <v-col
                      cols="5"
                    >
                      <v-text-field
                        dense
                        color="customGrey"
                        v-model="link.name"
                        outlined
                        :label="$t('name')"
                        :rules="[rules.required]"
                        background-color="#fff"
                      >
                      </v-text-field>
                    </v-col>
                    <v-col
                      cols="5"
                    >
                      <v-text-field
                        dense
                        color="customGrey"
                        v-model="link.url"
                        outlined
                        :label="$t('url')"
                        :rules="[rules.required]"
                        background-color="#fff"
                      >
                      </v-text-field>
                    </v-col>
                    <v-col
                      cols="2"
                      align-self="center"
                      class="text-right"
                    >
                      <v-btn
                        icon
                        @click="otherVimaLinks.splice(i, 1)"
                        class="mb-6"
                      >
                        <v-icon>
                          fas fa-times
                        </v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row
                    dense
                    v-for="(link, j) in tmpOtherVimaLinks"
                    :key="j + '_tmp'"
                  >
                    <v-col
                      cols="5"
                    >
                      <v-text-field
                        dense
                        color="customGrey"
                        v-model="link.name"
                        outlined
                        :label="$t('name')"
                        :rules="[rules.required]"
                        background-color="#fff"
                      >
                      </v-text-field>
                    </v-col>
                    <v-col
                      cols="5"
                    >
                      <v-text-field
                        dense
                        color="customGrey"
                        v-model="link.url"
                        outlined
                        :label="$t('url')"
                        :rules="[rules.required]"
                        background-color="#fff"
                      >
                      </v-text-field>
                    </v-col>
                    <v-col
                      cols="2"
                      align-self="center"
                      class="text-right"
                    >
                      <v-btn
                        icon
                        @click="tmpOtherVimaLinks.splice(j, 1)"
                        class="mb-6"
                      >
                        <v-icon>
                          fas fa-times
                        </v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row
                    dense
                  >
                    <v-col
                      cols="5"
                    >
                      <v-text-field
                        dense
                        color="customGrey"
                        v-model="linkName"
                        outlined
                        :label="$t('name')"
                        background-color="#fff"
                        :rules="linkName || linkUrl ? [rules.required] : []"
                      >
                      </v-text-field>
                    </v-col>
                    <v-col
                      cols="5"
                    >
                      <v-text-field
                        dense
                        color="customGrey"
                        v-model="linkUrl"
                        outlined
                        :label="$t('url')"
                        background-color="#fff"
                        :rules="linkName || linkUrl ? [rules.required] : []"
                      >
                      </v-text-field>
                    </v-col>
                    <v-col
                      cols="2"
                      align-self="center"
                      class="text-right"
                    >
                      <v-btn
                        icon
                        :disabled="!linkName || !linkUrl"
                        @click="addTmpOtherVimaLink()"
                        class="mb-6"
                      >
                        <v-icon>
                          fas fa-plus
                        </v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
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
                          :rules="[rules.required, v => Object.keys(modules).map(k => modules[k].position).filter(p => v === p).length === 1 || $t('uniquePositionError')]"
                        >
                        </v-select>
                      </v-col>
                    </v-row>
                     <v-row>
                      <v-col>
                        <v-select
                          dense
                          color="customGrey"
                          item-color="customGrey"
                          outlined
                          multiple
                          v-model="module.dependents"
                          :label="$t('dependentsOfThisModule')"
                          :items="Object.keys($settings.modules).map(key => ({value: key, text: $t(key)}))"
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
                    <v-row>
                      <v-col>
                        <FileUpload
                          :ref="key + 'Upload'"
                          v-model="modules[key].pic"
                          @fileRemove="patchFileRemove($event, 'modules.' + key + '.pic', false)"
                          @fileAdd="$nextTick(() => { $refs.settingsForm.validate() })"
                          :acceptedMimeTypes="['image/png', 'image/jpg', 'image/jpeg']"
                          :maxFileSize="0.5"
                          :maxFiles="1"
                          bgColor="customGreyUltraLight"
                          :scaleToFit="[1000, 1000]"
                          :resizeQuality="75"
                        ></FileUpload>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        class="subtitle-1"
                        cols="12"
                      >
                        {{$t('description')}}
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                      >
                        <v-input
                          v-model="modules[key].text.find(obj => obj.lang === currentLanguage).value"
                          width="100%"
                        >
                          <template v-slot:prepend>
                            <LanguageSelect
                              :currentLanguage="currentLanguage"
                              :languageObjects="modules[key].text"
                              @setLanguage="(l) => { currentLanguage = l }"
                            ></LanguageSelect>
                          </template>
                          <template slot="default">
                            <tiptap-vuetify
                              :editor-properties="{
                                disableInputRules: true,
                                disablePasteRules: true
                              }"
                              color="customGreyUltraLight"
                              v-model="modules[key].text.find(obj => obj.lang === currentLanguage).value"
                              :card-props="{ tile: true, flat: true }"
                              style="border: 1px solid #aaa"
                              :extensions="extensions"
                              :placeholder="$t('enterText')"
                            >
                            </tiptap-vuetify>
                          </template>
                        </v-input>
                      </v-col>
                    </v-row>
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

import { TiptapVuetify, Bold, Italic, Strike, Underline, BulletList, OrderedList, ListItem, Link } from 'tiptap-vuetify'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import FileUpload from '@/components/FileUpload.vue'
import LanguageSelect from '@/components/LanguageSelect.vue'

const appName = process.env.VUE_APP_NAME

export default {
  name: 'SettingsEditor',

  components: {
    FileUpload,
    TiptapVuetify,
    LanguageSelect
  },

  data: () => ({
    headerColor: undefined,
    indicatorColor: undefined,
    modules: undefined,
    isLoading: false,
    isValid: false,
    headerLogo: undefined,
    fb: undefined,
    instagram: undefined,
    twitter: undefined,
    languages: [],
    defaultLanguage: undefined,
    otherVimaLinks: [],
    tmpOtherVimaLinks: [],
    linkName: undefined,
    linkUrl: undefined,
    currentLanguage: 'en',
    extensions: [
      Bold,
      Italic,
      Underline,
      Strike,
      ListItem,
      BulletList,
      OrderedList,
      Link
    ]
  }),

  async mounted () {
    this.currentLanguage = this.$i18n.locale
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
      createUpload: 'create',
      removeUpload: 'remove'
    }),
    async adapt () {
      if (this.$settings) {
        const tmpSettings = JSON.parse(JSON.stringify(this.$settings))
        this.headerColor = this.parseRgbString(tmpSettings.headerColor)
        this.indicatorColor = this.parseRgbString(tmpSettings.indicatorColor)
        this.defaultLanguage = tmpSettings.defaultLanguage
        this.languages = tmpSettings.languages
        this.headerLogo = tmpSettings.headerLogo
        if (tmpSettings.socialMediaUrls) {
          this.fb = tmpSettings.socialMediaUrls.fb
          this.instagram = tmpSettings.socialMediaUrls.instagram
          this.twitter = tmpSettings.socialMediaUrls.twitter
        }
        if (tmpSettings.otherVimaLinks) {
          this.otherVimaLinks = tmpSettings.otherVimaLinks
        }
        for (const key of Object.keys(tmpSettings.modules)) {
          if (tmpSettings.modules[key].color) {
            tmpSettings.modules[key].color = this.parseRgbString(tmpSettings.modules[key].color)
          }
          if (tmpSettings.modules[key].bgColor) {
            tmpSettings.modules[key].bgColor = this.parseRgbString(tmpSettings.modules[key].bgColor)
          }
          if (tmpSettings.modules[key].text) {
            tmpSettings.modules[key].text = this.hydrateTranslations(tmpSettings.modules[key].text)
          } else {
            tmpSettings.modules[key].text = this.hydrateTranslations()
          }
        }
        this.modules = tmpSettings.modules
        this.$nextTick(() => {
          this.$refs.settingsForm.validate()
        })
      }
    },
    addTmpOtherVimaLink () {
      this.tmpOtherVimaLinks.push({ name: this.linkName, url: this.linkUrl })
      this.linkName = undefined
      this.linkUrl = undefined
    },
    async patchFileRemove (file, path, multiple) {
      this.isLoading = true
      try {
        if (multiple) {
          await this.patchSettings([
            this.$settings._id,
            {
              $pull: {
                [path]: {
                  _id: file._id
                }
              }
            }
          ])
        } else {
          await this.patchSettings([
            this.$settings._id,
            {
              [path]: null
            }
          ])
        }
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.adapt()
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.adapt()
      }
    },
    async saveSettings () {
      this.isLoading = true
      // Do uploads
      try {
        await this.$refs.headerLogoFileUpload.upload()
        for (const key of Object.keys(this.modules)) {
          await this.$refs[key + 'Upload'][0].upload()
        }
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      // Parse colors
      const tmpModules = JSON.parse(JSON.stringify(this.modules))
      for (const key of Object.keys(tmpModules)) {
        if (tmpModules[key].color) {
          tmpModules[key].color = `rgba(${tmpModules[key].color.r}, ${tmpModules[key].color.g}, ${tmpModules[key].color.b}, 1)`
        }
        if (tmpModules[key].bgColor) {
          tmpModules[key].bgColor = `rgba(${tmpModules[key].bgColor.r}, ${tmpModules[key].bgColor.g}, ${tmpModules[key].bgColor.b}, 1)`
        }
        if (tmpModules[key].text) {
          tmpModules[key].text = tmpModules[key].text.map(language => {
            return {
              ...language,
              value: this.$sanitize(language.value)
            }
          }).filter(language => language.value && language.value !== '' && language.value !== '<p></p>')
        }
      }
      // Sort default language to start
      this.languages.unshift(this.languages.splice(this.languages.indexOf(this.defaultLanguage), 1)[0])
      // Prepare links
      if (this.linkName && this.linkUrl) {
        this.addTmpOtherVimaLink()
      }
      // Prepare map
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
        otherVimaLinks: this.otherVimaLinks.concat(this.tmpOtherVimaLinks),
        modules: tmpModules,
        headerLogo: this.headerLogo
      }
      try {
        await this.patchSettings([this.$settings._id, map, {}])
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
      'parseRgbString',
      'hydrateTranslations'
    ])
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
