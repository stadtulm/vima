<template>
  <div>
    <v-row
      v-if="selectedBlog || !$route.params.id"
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
                {{$t('blogEntry')}} {{ selectedBlog ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
              </v-col>
            </v-row>
            <v-form
              v-model="isValid"
              ref="blogEditorForm"
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
                v-if="subTitle"
                dense
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
                    :label="$t('blogActiveCheckbox')"
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
                    :label="$t('blogOnlyForMembersCheckbox')"
                  >
                  </v-checkbox>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col>
                  <v-select
                    dense
                    multiple
                    color="customGrey"
                    item-color="customGrey"
                    background-color="#fff"
                    outlined
                    v-model="selectedCategories"
                    item-text="text.value"
                    item-value="_id"
                    :label="$t('categories')"
                    :items="categories.sort((a, b) => a.text.value.localeCompare(b.text.value))"
                    :rules="[rules.minOneCategory, rules.maxThreeCategories]"
                  >
                  </v-select>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-autocomplete
                    dense
                    multiple
                    chips
                    deletable-chips
                    auto-select-first
                    hide-details
                    color="customGrey"
                    item-color="customGrey"
                    background-color="#fff"
                    outlined
                    v-model="selectedTags"
                    item-text="text.value"
                    item-value="_id"
                    :label="$t('tags') + ' ' + $t('optionalLabelExtension')"
                    :items="computedTags.sort((a, b) => a.text.value.localeCompare(b.text.value))"
                  >
                  </v-autocomplete>
                </v-col>
                <v-col
                  cols="12"
                  class="text-right"
                >
                  <v-btn
                    text
                    color="customGrey"
                    @click="showTagProposalDialog = true"
                  >
                    {{$t('proposeNewTags')}}
                    <v-icon
                      size="18"
                      class="ml-3 pb-1"
                    >
                      fas fa-lightbulb
                    </v-icon>
                  </v-btn>
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
                      v-if="selectedBlog"
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
                        @keypress="$refs.vueDropzonePics.$el.click()"
                      >
                        <vue-dropzone
                          id="vueDropzonePics"
                          ref="vueDropzonePics"
                          :options="dropzoneOptionsPics"
                          :headers="dropzoneOptionsPics.headers"
                          @vdropzone-success="uploadSuccessPics"
                          @vdropzone-removed-file="removeFilePics"
                          @vdropzone-mounted="dropzoneMountedPics"
                          @vdropzone-queue-complete="queueComplete"
                          @vdropzone-files-added="updateQueuedFiles"
                          @vdropzone-sending="addUuid"
                          :destroyDropzone="false"
                        >
                        </vue-dropzone>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
              <v-row
                v-if="pics && pics.length > 0"
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
                        cols="12"
                        class="subtitle-1"
                      >
                        {{$t('copyrightOwner')}}
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col>
                        <v-alert
                          icon="fas fa-info-circle"
                          color="customGrey"
                          dark
                          outlined
                        >
                          {{$t('publicHint')}}
                        </v-alert>
                      </v-col>
                    </v-row>
                      <v-row
                        dense
                        v-for="(pic, i) in pics"
                        :key="i"
                        class="align-center"
                      >
                        <v-col
                          cols="12"
                        >
                          <v-text-field
                            dense
                            color="customGrey"
                            item-color="customGrey"
                            v-model="pic.credit"
                            :label="$t('copyrightOwner') + ' ' + $t('pic') + ' ' + (i + 1)"
                            outlined
                            :rules="[rules.required]"
                            background-color="#fff"
                          >
                          </v-text-field>
                        </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
              <v-divider
                :class="isQueued ? 'mb-9 mt-3' : 'my-9'"
              ></v-divider>
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
                @click="saveBlog()"
              >
                {{$t('saveDataButton')}}
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <TagProposalDialog
      :showTagProposalDialog="showTagProposalDialog"
      @closeTagProposalDialog="showTagProposalDialog = false"
    ></TagProposalDialog>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { TiptapVuetify, Bold, Italic, Strike, Underline, BulletList, OrderedList, ListItem, Link, Heading } from 'tiptap-vuetify'
import LanguageSelect from '@/components/LanguageSelect.vue'
import TagProposalDialog from '@/components/TagProposalDialog.vue'

const server = process.env.VUE_APP_SERVER_URL

export default {
  name: 'BlogEditor',

  components: {
    vueDropzone: vue2Dropzone,
    TiptapVuetify,
    LanguageSelect,
    TagProposalDialog
  },

  data: () => ({
    showTagProposalDialog: false,
    isQueued: false,
    selectedBlog: undefined,
    isInternal: false,
    isActive: true,
    isLoading: false,
    isValid: false,
    title: undefined,
    subTitle: undefined,
    text: undefined,
    selectedTags: [],
    selectedCategories: [],
    videoId: undefined,
    videoType: undefined,
    videos: [],
    tmpVideos: [],
    pics: [],
    mockFile: {
      name: '',
      size: '',
      type: ''
    },
    currentLanguage: 'de',
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
    window.load = () => {
      try {
        this.$refs.blogEditorForm.resetValidation()
      } catch (e) {}
    }
    await this.adapt()
    this.$refs.tabStart.focus()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('blog', {
      patchBlog: 'patch',
      createBlog: 'create',
      getBlog: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    addUuid (file, xhr, formData) {
      formData.append('uuid', file.upload.uuid)
    },
    updateQueuedFiles (files) {
      this.isQueued = true
      this.$nextTick(() => {
        for (const file of files) {
          if (file.status !== 'error') {
            this.pics.push(
              {
                credit: undefined,
                url: file.upload.uuid
              }
            )
          }
        }
      })
    },
    dropzoneMountedPics () {
      if (this.selectedBlog && this.selectedBlog.pics) {
        for (const pic of this.selectedBlog.pics) {
          const tmpMockFile = JSON.parse(JSON.stringify(this.mockFile))
          tmpMockFile.name = pic.url
          this.$refs.vueDropzonePics.manuallyAddFile(tmpMockFile, this.s3 + pic.url)
        }
      }
    },
    async adapt () {
      if (this.$route.params.id) {
        this.selectedBlog = await this.getBlog([this.$route.params.id, { keepTranslations: true }])
      }
      this.tmpVideos = []
      if (this.selectedBlog) {
        this.title = this.hydrateTranslations(this.selectedBlog.title)
        this.subTitle = this.hydrateTranslations(this.selectedBlog.subTitle)
        this.text = this.hydrateTranslations(this.selectedBlog.text)
        this.isInternal = this.selectedBlog.isInternal
        this.isActive = this.selectedBlog.isActive
        this.selectedCategories = this.selectedBlog.categories
        this.selectedTags = this.selectedBlog.tags
        if (this.selectedBlog.pics) {
          this.pics = this.selectedBlog.pics
        }
        if (this.selectedBlog.videos) {
          this.videos = this.selectedBlog.videos
        }
      } else {
        this.title = this.hydrateTranslations()
        this.subTitle = this.hydrateTranslations()
        this.text = this.hydrateTranslations()
      }
    },
    async uploadSuccessPics (file, response) {
      if (file.status === 'success') {
        this.$set(this.pics.find(obj => obj.url === response.uuid), 'uuid', response.uuid)
        this.$set(this.pics.find(obj => obj.url === response.uuid), 'url', response.id)
      }
    },
    queueComplete () {
      if (this.isQueued) {
        let hasErrors = false
        for (const file of this.$refs.vueDropzonePics.getAcceptedFiles()) {
          const newPic = this.pics.find(obj => obj.uuid === file.upload.uuid)
          if (!newPic) {
            file.previewElement.querySelector('.dz-error-message > span').innerHTML = this.$t('uploadFailed')
            hasErrors = true
            if (this.isLoading) {
              this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
            }
          }
          if (hasErrors) {
            this.isLoading = false
            return
          }
          this.$refs.vueDropzonePics.removeFile(file)
          const tmpMockFile = JSON.parse(JSON.stringify(this.mockFile))
          tmpMockFile.name = newPic.url
          this.$refs.vueDropzonePics.manuallyAddFile(tmpMockFile, this.s3 + newPic.url)
        }
        this.isQueued = false
        if (this.isLoading) {
          this.saveBlog()
        }
      }
    },
    async removeFilePics (file, error, xhr) {
      try {
        if (file.status === 'queued') {
          if (this.$refs.vueDropzonePics.getQueuedFiles().length === 0) {
            this.isQueued = false
          }
        } else if (file.status !== 'error') {
          if (this.selectedBlog) {
            await this.removeUpload([file.name, {}, {}])
            let tmpPictures = []
            if (this.selectedBlog && this.selectedBlog.pics) {
              tmpPictures = this.selectedBlog.pics
            }
            tmpPictures = tmpPictures.filter(obj => obj.url !== file.name)
            await this.patchBlog([this.selectedBlog._id, { pics: tmpPictures }, {}])
            this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          }
        } else if (this.isLoading) {
          throw error
        }
        const index = this.pics.findIndex(obj => obj.url === file.upload?.uuid || obj.url === file.name)
        if (index !== -1) {
          this.pics.splice(index, 1)
        }
      } catch (e) {
        if (this.isLoading) {
          this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        }
      }
    },
    async saveBlog () {
      this.isLoading = true
      if (this.isQueued) {
        await this.$refs.vueDropzonePics.processQueue()
      } else {
        if (this.videoId && this.videoType) {
          this.addTmpVideo()
        }
        const map = {
          title: this.title.filter(language => language.value && language.value !== ''),
          subTitle: this.subTitle.filter(language => language.value && language.value !== ''),
          isInternal: this.isInternal,
          isActive: this.isActive,
          categories: this.selectedCategories,
          tags: this.selectedTags,
          text: this.sanitizedText.filter(language => language.value && language.value !== '' && language.value !== '<p></p>'),
          videos: this.videos.concat(this.tmpVideos),
          author: this.user._id
        }
        if (this.pics) {
          map.pics = this.pics
        }
        try {
          if (this.$route.params.id) {
            await this.patchBlog([this.$route.params.id, map, {}])
          } else {
            await this.createBlog([map, {}])
          }
          this.isLoading = false
          this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          this.$router.go(-1)
        } catch (e) {
          this.isLoading = false
          this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        }
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
    ...mapGetters('categories', {
      categories: 'list'
    }),
    ...mapGetters('tags', {
      tags: 'list'
    }),
    computedTags () {
      return this.tags
        .filter(obj => obj.isActive && obj.isAccepted)
    },
    dropzoneOptionsPics () {
      return {
        url: server + 'uploads',
        maxFilesize: 2,
        maxFiles: 10,
        paramName: 'uri',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('feathers-jwt')
        },
        autoProcessQueue: false,
        addRemoveLinks: true,
        dictDefaultMessage: '<i style="font-size: 40px" class="fas fa-images"></i><br><br><span class="v-label"><span class="font-weight-bold">' + this.$t('dropFilesHeadline', { filesize: '2' }) + '</span><br><br>' + this.$t('dropFilesBody', { resolution: '1400x400' }) + '</span>',
        dictRemoveFile: '<i style="font-size: 40px" class="fas fa-times"></i>',
        dictCancelUpload: '<i style="font-size: 40px" class="fas fa-times"></i>',
        dictFileTooBig: this.$t('fileTooBigError'),
        dictInvalidFileType: this.$t('fileTypeNotAcceptedError'),
        dictMaxFilesExceeded: this.$t('noMorePicsError'),
        acceptedMimeTypes: 'image/png, image/jpeg',
        resizeWidth: 1080,
        resizeMethod: 'contain',
        resizeQuality: 0.5
      }
    },
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
    pics () {
      if (this.$refs.blogEditorForm) {
        this.$nextTick(() => {
          this.$refs.blogEditorForm.validate()
        })
      }
    },
    videos () {
      if (this.$refs.blogEditorForm) {
        this.$refs.blogEditorForm.validate()
      }
    },
    tmpVideos () {
      if (this.$refs.blogEditorForm) {
        this.$refs.blogEditorForm.validate()
      }
    }
  }
}
</script>
