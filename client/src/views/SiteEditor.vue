<template>
  <div>
    <v-row
      v-if="selectedSite || !$route.params.site"
    >
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
                {{$t('siteEntry')}} {{ selectedSite ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
              </v-col>
            </v-row>
            <v-form
              v-model="isValid"
              ref="siteEditorForm"
            >
              <v-row
                dense
              >
                <v-col>
                  <v-select
                    dense
                    color="customGrey"
                    item-color="customGrey"
                    background-color="#fff"
                    outlined
                    v-model="type"
                    :label="$t('type')"
                    :rules="[rules.required]"
                    :items="[
                      { text: $t('imprint'), value: 'imprint', disabled: !computedTypes || computedTypes.includes('imprint') },
                      { text: $t('privacy'), value: 'privacy', disabled: !computedTypes || computedTypes.includes('privacy')},
                      { text: $t('contact'), value: 'contact', disabled: !computedTypes || computedTypes.includes('contact')},
                      { text: $t('aboutIleu'), value: 'ileu', disabled: !computedTypes || computedTypes.includes('ileu')},
                      { text: $t('aboutVima'), value: 'vima', disabled: !computedTypes || computedTypes.includes('vima')},
                      { text: $t('aboutVives'), value: 'vives', disabled: !computedTypes || computedTypes.includes('vives')},
                      { text: $t('communicationRules'), value: 'communicationrules', disabled: !computedTypes || computedTypes.includes('communicationrules')},
                      { text: $t('teamTitle'), value: 'team', disabled: !computedTypes || computedTypes.includes('team')}
                    ]"
                  >
                  </v-select>
                </v-col>
              </v-row>
              <v-row
                dense
                class="mb-6"
                v-if="text"
              >
                <v-col
                  cols="12"
                >
                  <v-card
                    flat
                    color="customGreyUltraLight"
                  >
                    <v-row>
                      <v-col
                        class="text-subtitle-1"
                        cols="12"
                      >
                        {{$t('text')}}
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                      >
                        <v-input
                          :rules="[v => (text.find(obj => obj.type === 'default').value !== '' && text.find(obj => obj.type === 'default').value !== '<p></p>') || $t('defaultLanguageRequired')]"
                          v-model="text.find(obj => obj.lang === currentLanguage).value"
                          width="100%"
                        >
                          <template v-slot:prepend>
                            <LanguageSelect
                              :currentLanguage="currentLanguage"
                              :languageObjects="text"
                              @setLanguage="(l) => { currentLanguage = l }"
                            ></LanguageSelect>
                          </template>
                          <template slot="default">
                            <VuetifyTiptap
                              :editor-properties="{
                                disableInputRules: true,
                                disablePasteRules: true
                              }"
                              color="customGreyUltraLight"
                              v-model="text.find(obj => obj.lang === currentLanguage).value"
                              :card-props="{ tile: true, flat: true }"
                              style="border: 1px solid #aaa;"
                              :extensions="extensions"
                              :placeholder="$t('enterText')"
                            >
                            </VuetifyTiptap>
                          </template>
                        </v-input>
                      </v-col>
                    </v-row>
                    <v-divider class="my-9 mt-3"></v-divider>
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
                              class="text-subtitle-1"
                            >
                              {{$t('videos')}} {{$t('optionalLabelExtension')}}
                            </v-col>
                          </v-row>
                          <template
                            v-if="selectedSite"
                          >
                            <v-row
                              dense
                              v-for="(video, i) in videos"
                              :key="i"
                            >
                              <v-col
                                cols="5"
                              >
                                <v-text-field
                                  dense
                                  color="customGrey"
                                  v-model="video.id"
                                  outlined
                                  :label="$t('videoIdLabel')"
                                  :rules="[rules.required]"
                                  background-color="#fff"
                                >
                                </v-text-field>
                              </v-col>
                              <v-col
                                cols="5"
                              >
                                <v-select
                                  dense
                                  color="customGrey"
                                  item-color="customGrey"
                                  v-model="video.type"
                                  :label="$t('type')"
                                  outlined
                                  :items="videoTypeItems"
                                  :item-text="(item) => $t(item.textKey)"
                                  :rules="[rules.required]"
                                  background-color="#fff"
                                >
                                </v-select>
                              </v-col>
                              <v-col
                                cols="2"
                                align-self="center"
                                class="text-right"
                              >
                                <v-btn
                                  icon
                                  @click="videos.splice(i, 1)"
                                  class="mb-6"
                                >
                                  <v-icon>
                                    fas fa-times
                                  </v-icon>
                                </v-btn>
                              </v-col>
                            </v-row>
                          </template>
                          <v-row
                            dense
                            v-for="(video, j) in tmpVideos"
                            :key="j + '_tmp'"
                          >
                            <v-col
                              cols="5"
                            >
                              <v-text-field
                                dense
                                color="customGrey"
                                v-model="video.id"
                                outlined
                                :label="$t('videoIdLabel')"
                                :rules="[rules.required]"
                                background-color="#fff"
                              >
                              </v-text-field>
                            </v-col>
                            <v-col
                              cols="5"
                            >
                              <v-select
                                dense
                                color="customGrey"
                                item-color="customGrey"
                                v-model="video.type"
                                :label="$t('type')"
                                outlined
                                :items="videoTypeItems"
                                :item-text="(item) => $t(item.textKey)"
                                :rules="[rules.required]"
                                background-color="#fff"
                              >
                              </v-select>
                            </v-col>
                            <v-col
                              cols="2"
                              align-self="center"
                              class="text-right"
                            >
                              <v-btn
                                icon
                                @click="tmpVideos.splice(j, 1)"
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
                                v-model="videoId"
                                outlined
                                :label="$t('videoIdLabel')"
                                background-color="#fff"
                                :rules="videoId || videoType ? [rules.required] : []"
                              >
                              </v-text-field>
                            </v-col>
                            <v-col
                              cols="5"
                            >
                              <v-select
                                dense
                                color="customGrey"
                                item-color="customGrey"
                                v-model="videoType"
                                :label="$t('type')"
                                outlined
                                :items="videoTypeItems"
                                :item-text="(item) => $t(item.textKey)"
                                :rules="videoId || videoType ? [rules.required] : []"
                                background-color="#fff"
                              >
                              </v-select>
                            </v-col>
                            <v-col
                              cols="2"
                              align-self="center"
                              class="text-right"
                            >
                              <v-btn
                                icon
                                :disabled="!videoId || !videoType"
                                @click="addTmpVideo()"
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
                  </v-card>
                </v-col>
              </v-row>
              <v-divider class="my-9 mt-3"></v-divider>
            </v-form>
            <v-card-actions
              class="px-0"
            >
              <v-btn
                block
                :dark="isValid"
                color="customGrey"
                :loading="isLoading"
                :disabled="!isValid"
                @click="saveSite()"
              >
                {{$t('saveDataButton')}}
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import LanguageSelect from '@/components/LanguageSelect.vue'

export default {
  name: 'SiteEditor',

  components: {
    LanguageSelect
  },

  data: () => ({
    type: undefined,
    selectedSite: undefined,
    isLoading: false,
    isValid: false,
    text: undefined,
    currentLanguage: 'en',
    videoId: undefined,
    videoType: undefined,
    videos: [],
    tmpVideos: []
  }),

  async mounted () {
    this.currentLanguage = this.$i18n.locale
    await this.adapt()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('sites', {
      patchSite: 'patch',
      createSite: 'create',
      requestSite: 'get',
      findSites: 'find'
    }),
    async adapt () {
      if (this.$route.params.site) {
        this.selectedSite = await this.requestSite([this.$route.params.site, { keepTranslations: true }])
      }
      this.tmpVideos = []
      if (this.selectedSite) {
        if (this.selectedSite.videos) {
          this.videos = this.selectedSite.videos
        }
        this.type = this.selectedSite.type
        this.text = this.hydrateTranslations(this.selectedSite.text)
      } else {
        this.text = this.hydrateTranslations()
      }
    },
    async saveSite () {
      this.isLoading = true
      // Prepare videos
      if (this.videoId && this.videoType) {
        this.addTmpVideo()
      }
      const map = {
        type: this.type,
        text: this.sanitizedText.filter(language => language.value && language.value !== '' && language.value !== '<p></p>'),
        videos: this.videos.concat(this.tmpVideos)
      }
      try {
        if (this.$route.params.site) {
          await this.patchSite([this.$route.params.site, map, {}])
        } else {
          await this.createSite([map, {}])
        }
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$router.go(-1)
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    addTmpVideo () {
      this.tmpVideos.push({ id: this.videoId, type: this.videoType })
      this.videoId = undefined
      this.videoType = undefined
    }
  },

  computed: {
    ...mapGetters([
      'rules',
      's3',
      'videoTypeItems',
      'hydrateTranslations'
    ]),
    ...mapGetters('sites', {
      getSite: 'get'
    }),
    ...mapGetters('auth', [
      'user'
    ]),
    sanitizedText () {
      return this.text.map(language => {
        return {
          ...language,
          value: this.$sanitize(language.value)
        }
      })
    }
  },

  asyncComputed: {
    async computedTypes () {
      const types = await this.findSites(
        [
          {
            query: {
              $select: { type: 1 }
            }
          }
        ]
      )
      return types.data.map(obj => obj.type)
    }
  },

  watch: {
    videos () {
      if (this.$refs.newsEditorForm) {
        this.$refs.newsEditorForm.validate()
      }
    },
    tmpVideos () {
      if (this.$refs.newsEditorForm) {
        this.$refs.newsEditorForm.validate()
      }
    }
  }
}
</script>
