<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('siteEntry')}} {{ selectedSite ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
      </span>
    </v-row>
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
            <v-form
              v-model="isValid"
              ref="siteEditorForm"
            >
              <v-row
                dense
              >
                <v-col>
                  <v-select
                    density="compact"
                    v-model="type"
                    :label="$t('type')"
                    :rules="[rules.required]"
                    :items="types ? [
                      { title: $t('imprint'), value: 'imprint', props: { disabled: types.includes('imprint') } },
                      { title: $t('privacy'), value: 'privacy', props: { disabled: types.includes('privacy')} },
                      { title: $t('contact'), value: 'contact', props: { disabled: types.includes('contact')} },
                      { title: $t('aboutIleu'), value: 'ileu', props: { disabled: types.includes('ileu')} },
                      { title: $t('aboutVima'), value: 'vima', props: { disabled: types.includes('vima')} },
                      { title: $t('aboutVives'), value: 'vives', props: { disabled: types.includes('vives')} },
                      { title: $t('communicationRules'), value: 'communicationrules', props: { disabled: types.includes('communicationrules')} },
                      { title: $t('teamTitle'), value: 'team', props: { disabled: types.includes('team')} }
                    ] : []"
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
                              @update:setLanguage="(l) => { currentLanguage = l }"
                            ></LanguageSelect>
                          </template>
                          <template v-slot:default>
                            <custom-tiptap
                              v-model="text.find(obj => obj.lang === currentLanguage).value"
                              :extensions="['bold', 'italic', 'underline', 'strikethrough', 'bulletList', 'orderedList', 'h1', 'h2', 'h3', 'link']"
                            >
                            </custom-tiptap>
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
                                  density="compact"
                                  v-model="video.id"
                                  :label="$t('videoIdLabel')"
                                  :rules="[rules.required]"
                                >
                                </v-text-field>
                              </v-col>
                              <v-col
                                cols="5"
                              >
                                <v-select
                                  density="compact"
                                  v-model="video.type"
                                  :label="$t('type')"
                                  :items="videoTypeItems"
                                  :item-text="(item) => $t(item.textKey)"
                                  :rules="[rules.required]"
                                >
                                </v-select>
                              </v-col>
                              <v-col
                                cols="2"
                                align-self="center"
                                class="text-right"
                              >
                                <v-btn
                                  icon="fas fa-times"
                                  @click="videos.splice(i, 1)"
                                  class="mb-6"
                                >
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
                                density="compact"
                                v-model="video.id"
                                :label="$t('videoIdLabel')"
                                :rules="[rules.required]"
                              >
                              </v-text-field>
                            </v-col>
                            <v-col
                              cols="5"
                            >
                              <v-select
                                density="compact"
                                v-model="video.type"
                                :label="$t('type')"
                                :items="videoTypeItems"
                                :item-text="(item) => $t(item.textKey)"
                                :rules="[rules.required]"
                              >
                              </v-select>
                            </v-col>
                            <v-col
                              cols="2"
                              align-self="center"
                              class="text-right"
                            >
                              <v-btn
                                icon="fas fa-times"
                                @click="tmpVideos.splice(j, 1)"
                                class="mb-6"
                              >
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
                                density="compact"
                                v-model="videoId"
                                :label="$t('videoIdLabel')"
                                :rules="videoId || videoType ? [rules.required] : []"
                              >
                              </v-text-field>
                            </v-col>
                            <v-col
                              cols="5"
                            >
                              <v-select
                                density="compact"
                                v-model="videoType"
                                :label="$t('type')"
                                :items="videoTypeItems"
                                :item-text="(item) => $t(item.textKey)"
                                :rules="videoId || videoType ? [rules.required] : []"
                              >
                              </v-select>
                            </v-col>
                            <v-col
                              cols="2"
                              align-self="center"
                              class="text-right"
                            >
                              <v-btn
                                icon="fas fa-plus"
                                :disabled="!videoId || !videoType"
                                @click="addTmpVideo()"
                                class="mb-6"
                              >
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
            <v-divider
              class="mb-6 mt-6"
            ></v-divider>
            <v-toolbar
              class="mt-4"
              color="transparent"
            >
              <v-btn
                block
                size="large"
                dark
                variant="elevated"
                color="customGrey"
                :loading="isLoading"
                :disabled="!isValid"
                @click="saveSite()"
                class="mx-0"
              >
                {{$t('saveDataButton')}}
              </v-btn>
            </v-toolbar>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import LanguageSelect from '@/components/LanguageSelect.vue'
import CustomTiptap from '@/components/CustomTiptap.vue'

export default {
  name: 'SiteEditor',

  components: {
    LanguageSelect,
    CustomTiptap
  },

  data: () => ({
    type: undefined,
    types: undefined,
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
    await this.loadTypes()
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
    async loadTypes () {
      const tmpTypes = await this.findSites(
        [
          {
            query: {
              $select: { type: 1 }
            }
          }
        ]
      )
      this.types = tmpTypes.data.map(obj => obj.type)
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
