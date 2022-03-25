<template>
  <div>
    <v-row
      v-if="selectedNews || !$route.params.id"
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
                {{$t('newsEntry')}} {{ selectedNews ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
              </v-col>
            </v-row>
            <v-form
              v-model="isValid"
              ref="newsEditorForm"
            >
              <v-row
                v-if="title"
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    ref="tabStart"
                    dense
                    outlined
                    :label="$t('headline')"
                    color="customGrey"
                    background-color="#fff"
                    v-model="title.find(obj => obj.lang === currentLanguage).value"
                    :rules="[v => title.find(obj => obj.type === 'default').value !== '' || $t('defaultLanguageRequired')]"
                  >
                    <template v-slot:prepend>
                      <LanguageSelect
                        :currentLanguage="currentLanguage"
                        :languageObjects="title"
                        @setLanguage="(l) => { currentLanguage = l }"
                      ></LanguageSelect>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                dense
                v-if="subTitle"
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    dense
                    outlined
                    color="customGrey"
                    background-color="#fff"
                    :label="$t('subHeadline') + ' ' + $t('optionalLabelExtension')"
                    v-model="subTitle.find(obj => obj.lang === currentLanguage).value"
                  >
                    <template v-slot:prepend>
                      <LanguageSelect
                        :currentLanguage="currentLanguage"
                        :languageObjects="subTitle"
                        @setLanguage="(l) => { currentLanguage = l }"
                      ></LanguageSelect>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col>
                  <v-checkbox
                    color="customGrey"
                    v-model="isActive"
                    :label="$t('newsActiveCheckbox')"
                  >
                  </v-checkbox>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col>
                  <v-checkbox
                    color="customGrey"
                    v-model="isInternal"
                    :label="$t('newsOnlyForMembersCheckbox')"
                  >
                  </v-checkbox>
                </v-col>
              </v-row>
              <v-divider class="mt-4 mb-9"></v-divider>
              <v-row
                v-if="text"
                dense
                class="mb-6"
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
                        class="subtitle-1"
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
                        <v-alert
                          icon="fas fa-info-circle"
                        >
                          <span
                            v-html="$t('noteInsertImage')"
                          >
                          </span>
                        </v-alert>
                      </v-col>
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
                            <tiptap-vuetify
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
                            </tiptap-vuetify>
                          </template>
                        </v-input>
                      </v-col>
                    </v-row>
                  </v-card>
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
                        class="subtitle-1"
                      >
                        {{$t('videos')}} {{$t('optionalLabelExtension')}}
                      </v-col>
                    </v-row>
                    <template
                      v-if="selectedNews"
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
              <v-row
                dense
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
                        class="subtitle-1"
                        cols="12"
                      >
                        {{$t('pics')}} {{$t('optionalLabelExtension')}}
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        tabIndex="0"
                        @keypress="$refs.newsUpload.fakeClick()"
                      >
                        <FileUpload
                          ref="newsUpload"
                          v-model="pics"
                          @fileRemove="patchFileRemove"
                          @fileAdd="$nextTick(() => { $refs.newsEditorForm.validate() })"
                          :acceptedMimeTypes="['image/png', 'image/jpg', 'image/jpeg']"
                          :maxFileSize="2"
                          :maxFiles="10"
                          bgColor="white"
                          :scaleToFit="[1080, 1080]"
                          :resizeQuality="50"
                        ></FileUpload>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
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
                @click="saveNews()"
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
import { TiptapVuetify, Bold, Italic, Strike, Underline, BulletList, OrderedList, ListItem, Link, Heading } from 'tiptap-vuetify'
import LanguageSelect from '@/components/LanguageSelect.vue'
import FileUpload from '@/components/FileUpload.vue'

export default {
  name: 'NewsEditor',

  components: {
    FileUpload,
    TiptapVuetify,
    LanguageSelect
  },

  data: () => ({
    selectedNews: undefined,
    isInternal: false,
    isActive: true,
    isLoading: false,
    isValid: false,
    title: undefined,
    subTitle: undefined,
    text: undefined,
    videoId: undefined,
    videoType: undefined,
    videos: [],
    tmpVideos: [],
    pics: [],
    currentLanguage: 'en',
    extensions: [
      Bold,
      Italic,
      Underline,
      Strike,
      ListItem,
      BulletList,
      OrderedList,
      Link,
      [Heading, {
        options: {
          levels: [1, 2, 3]
        }
      }]
    ]
  }),

  async mounted () {
    this.currentLanguage = this.$i18n.locale
    window.load = () => {
      try {
        this.$refs.newsEditorForm.resetValidation()
      } catch (e) {}
    }
    await this.adapt()
    this.$refs.tabStart.focus()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('news', {
      patchNews: 'patch',
      createNews: 'create',
      getNews: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    async patchFileRemove (file) {
      this.isLoading = true
      try {
        await this.patchNews([
          this.selectedNews._id,
          {
            $pull: {
              pics: {
                _id: file._id
              }
            }
          }
        ])
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.adapt()
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.adapt()
      }
    },
    async adapt () {
      if (this.$route.params.id) {
        this.selectedNews = await this.getNews([this.$route.params.id, { keepTranslations: true }])
      }
      this.tmpVideos = []
      if (this.selectedNews) {
        this.title = this.hydrateTranslations(this.selectedNews.title)
        this.subTitle = this.hydrateTranslations(this.selectedNews.subTitle)
        this.text = this.hydrateTranslations(this.selectedNews.text)
        this.isInternal = this.selectedNews.isInternal
        this.isActive = this.selectedNews.isActive
        if (this.selectedNews.pics) {
          this.pics = this.selectedNews.pics
        }
        if (this.selectedNews.videos) {
          this.videos = this.selectedNews.videos
        }
      } else {
        this.title = this.hydrateTranslations()
        this.subTitle = this.hydrateTranslations()
        this.text = this.hydrateTranslations()
      }
    },
    async saveNews () {
      this.isLoading = true
      // Do uploads
      try {
        await this.$refs.newsUpload.upload()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      // Prepare videos
      if (this.videoId && this.videoType) {
        this.addTmpVideo()
      }
      // Prepare map
      const map = {
        title: this.title.filter(language => language.value && language.value !== ''),
        subTitle: this.subTitle.filter(language => language.value && language.value !== ''),
        isInternal: this.isInternal,
        isActive: this.isActive,
        text: this.sanitizedText.filter(language => language.value && language.value !== '' && language.value !== '<p></p>'),
        videos: this.videos.concat(this.tmpVideos),
        author: this.user._id
      }
      if (this.pics) {
        map.pics = this.pics
      }
      try {
        if (this.$route.params.id) {
          await this.patchNews([this.$route.params.id, map, {}])
        } else {
          await this.createNews([map, {}])
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
