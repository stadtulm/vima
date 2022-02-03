<template>
  <div>
    <v-row
      v-if="selectedNews || !$route.params.id"
    >
      <v-col
        cols="12"
      >
        <v-card
          color="customGreyBg"
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
                    v-model="title"
                    :rules="[rules.required]"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
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
                    v-model="subTitle"
                  >
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
                dense
                class="mb-6"
              >
                <v-col
                  cols="12"
                >
                  <v-card
                    flat
                    color="customGreyBg"
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
                          {{$t('noteInsertImage')}}
                        </v-alert>
                      </v-col>
                      <v-col
                        cols="12"
                      >
                        <v-input
                          :rules="[rules.tiptapRequired]"
                          v-model="text"
                          width="100%"
                        >
                          <template slot="default">
                            <tiptap-vuetify
                              :editor-properties="{
                                disableInputRules: true,
                                disablePasteRules: true
                              }"
                              color="customGreyBg"
                              v-model="text"
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
                    color="customGreyBg"
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
                    color="customGreyBg"
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
                    color="customGreyBg"
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
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { TiptapVuetify, Bold, Italic, Strike, Underline, BulletList, OrderedList, ListItem, Link, Heading } from 'tiptap-vuetify'

const server = process.env.VUE_APP_SERVER_URL

export default {
  name: 'NewsEditor',

  components: {
    vueDropzone: vue2Dropzone,
    TiptapVuetify
  },

  data: () => ({
    isQueued: false,
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
    mockFile: {
      name: '',
      size: '',
      type: ''
    },
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
      requestNews: 'get'
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
      if (this.selectedNews && this.selectedNews.pics) {
        for (const pic of this.selectedNews.pics) {
          const tmpMockFile = JSON.parse(JSON.stringify(this.mockFile))
          tmpMockFile.name = pic.url
          this.$refs.vueDropzonePics.manuallyAddFile(tmpMockFile, this.s3 + pic.url)
        }
      }
    },
    async adapt () {
      if (this.$route.params.id) {
        let selectedNews = this.getNews(this.$route.params.id)
        if (!selectedNews) {
          selectedNews = await this.requestNews([this.$route.params.id])
        }
        this.selectedNews = selectedNews
      }
      this.tmpVideos = []
      if (this.selectedNews) {
        this.title = this.selectedNews.title
        this.subTitle = this.selectedNews.subTitle
        this.isInternal = this.selectedNews.isInternal
        this.isActive = this.selectedNews.isActive
        this.text = this.selectedNews.text
        if (this.selectedNews.pics) {
          this.pics = this.selectedNews.pics
        }
        if (this.selectedNews.videos) {
          this.videos = this.selectedNews.videos
        }
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
          this.saveNews()
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
          if (this.selectedNews) {
            await this.removeUpload([file.name, {}, {}])
            let tmpPictures = []
            if (this.selectedNews && this.selectedNews.pics) {
              tmpPictures = this.selectedNews.pics
            }
            tmpPictures = tmpPictures.filter(obj => obj.url !== file.name)
            await this.patchNews([this.selectedNews._id, { pics: tmpPictures }, {}])
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
    async saveNews () {
      this.isLoading = true
      if (this.isQueued) {
        await this.$refs.vueDropzonePics.processQueue()
      } else {
        if (this.videoId && this.videoType) {
          this.addTmpVideo()
        }
        const map = {
          title: this.title,
          subTitle: this.subTitle,
          isInternal: this.isInternal,
          isActive: this.isActive,
          text: this.text,
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
      'videoTypeItems'
    ]),
    ...mapGetters('news', {
      getNews: 'get'
    }),
    ...mapGetters('auth', [
      'user'
    ]),
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
    }
  },

  watch: {
    pics () {
      if (this.$refs.newsEditorForm) {
        this.$nextTick(() => {
          this.$refs.newsEditorForm.validate()
        })
      }
    },
    videos () {
      if (this.$refs.newsEditorForm) {
        this.$refs.newsEditorForm.validate()
      }
    },
    tmpVideos () {
      if (this.$refs.newsEditorForm) {
        this.$refs.newsEditorForm.validate()
      }
    },
    text () {
      if (this.text) {
        this.text = this.$sanitize(this.text)
      }
    }
  }
}
</script>
