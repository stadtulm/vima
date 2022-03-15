<template>
  <div>
    <v-row
      dense
    >
      <v-col
        cols="12"
      >
        <v-card
          flat
          :color="bgColor"
        >
          <v-row>
            <v-col
              :class="titleType"
              cols="12"
            >
              {{label}} {{optional ? $t('optionalLabelExtension') : ''}}
            </v-col>
          </v-row>
          <v-row
            dense
          >
            <v-col
              cols="12"
              tabIndex="0"
              @keypress="$refs[_uid + '_vueDropzone'].$el.click()"
            >
              <vue-dropzone
                :id="_uid + '_vueDropzone'"
                :ref="_uid + '_vueDropzone'"
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
      dense
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
          <v-form
            :ref="_uid + '_uploadForm'"
            v-model="isValid"
          >
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
                  :label="$t('copyrightOwner') + (maxFiles > 1 ? ' ' + $t('pic') + ' ' + (i + 1) : '')"
                  outlined
                  :rules="[rules.required]"
                  background-color="#fff"
                >
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          block
          large
          :dark="!(!isValid || dropzoneError || !isQueued)"
          color="customGreyMedium"
          :loading="isLoading"
          :disabled="!isValid || dropzoneError || !isQueued"
          @click="processQueue()"
        >
          {{$t('startUpload')}}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'

const server = process.env.VUE_APP_SERVER_URL

export default {
  name: 'Upload',

  props: {
    optional: {
      type: Boolean
    },
    label: {
      type: String
    },
    parent: {
      type: Object
    },
    path: {
      type: String // dot notation possible
    },
    maxFilesize: {
      type: Number // in mb
    },
    maxFiles: {
      type: Number
    },
    resolutionString: {
      type: String
    },
    resizeWidth: {
      type: Number // pixels
    },
    resizeMethod: {
      type: String // e.g. contain
    },
    resizeQuality: {
      type: Number // 0-1
    },
    patchParentMethod: {
      type: Function
    },
    titleType: {
      type: String // class name
    },
    bgColor: {
      type: String // class name
    },
    acceptedMimeTypes: {
      type: String,
      default: 'image/png, image/jpeg'
    }
  },

  components: {
    vueDropzone: vue2Dropzone
  },

  data: () => ({
    isValid: false,
    isQueued: false,
    isLoading: false,
    pics: [],
    dropzoneError: false,
    mockFile: {
      name: '',
      size: '',
      type: ''
    }
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    addUuid (file, xhr, formData) {
      formData.append('uuid', file.upload.uuid)
    },
    dropzoneMountedPics () {
      // Since this is loaded before anything else, do adapt stuff here
      const picProperty = this.resolveProperty(this.path, this.parent)
      if (this.parent && picProperty) {
        if (Array.isArray(picProperty)) {
          this.pics = picProperty
        } else {
          this.pics = [picProperty]
        }
      } else {
        this.pics = []
      }
      if (this.$refs[this._uid + '_uploadForm']) {
        this.$nextTick(() => {
          this.$refs[this._uid + '_uploadForm'].validate()
        })
      }
      // Add dummies for already uploaded files to dropzone
      for (const pic of this.pics) {
        const tmpMockFile = JSON.parse(JSON.stringify(this.mockFile))
        tmpMockFile.name = pic.url
        this.$refs[this._uid + '_vueDropzone'].manuallyAddFile(tmpMockFile, this.s3 + pic.url)
      }
    },
    updateQueuedFiles (files) {
      // Update pics array or error
      this.$nextTick(() => {
        for (const file of files) {
          if (file.status !== 'error') {
            this.isQueued = true
            this.pics.push(
              {
                credit: undefined,
                url: file.upload.uuid
              }
            )
          } else {
            this.dropzoneError = true
          }
        }
      })
    },
    async removeFilePics (file, error, xhr) {
      try {
        // Reset queued status
        if (file.status === 'queued') {
          if (this.$refs[this._uid + '_vueDropzone'].getQueuedFiles().length === 0) {
            this.isQueued = false
          }
        // Remove file from s3
        } else if (file.status !== 'error') {
          // Return if file will be replaced
          if (file.toReplace) {
            return
          }
          await this.removeUpload([file.name, {}, {}])
          let tmpPictures = []
          const picProperty = this.resolveProperty(this.path, this.parent)
          if (this.parent && picProperty) {
            if (Array.isArray(picProperty)) {
              tmpPictures = picProperty
            } else {
              tmpPictures = [picProperty]
            }
          }
          tmpPictures = tmpPictures.filter(obj => obj.url !== file.name)
          if (this.parent && picProperty) {
            if (this.maxFiles > 1) {
              tmpPictures = picProperty
            } else {
              tmpPictures = null
            }
          }
          await this.patchParentMethod([this.parent._id, { [this.path]: tmpPictures }, {}])
          this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        // Something went wrong
        } else if (this.isLoading) {
          throw error
        // Reset error state if no more errors exist
        } else if (file.status === 'error' && this.$refs[this._uid + '_vueDropzone'].getRejectedFiles().length === 0) {
          this.dropzoneError = false
        }
        // Remove pic from pics array is existant
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
    async processQueue () {
      this.isLoading = true
      await this.$refs[this._uid + '_vueDropzone'].processQueue()
    },
    uploadSuccessPics (file, response) {
      if (file.status === 'success') {
        this.$set(this.pics.find(obj => obj.url === response.uuid), 'uuid', response.uuid)
        this.$set(this.pics.find(obj => obj.url === response.uuid), 'url', response.id)
      }
    },
    async queueComplete (a, b, c) {
      if (this.isQueued) {
        this.isQueued = false
        let hasErrors = false
        for (const file of this.$refs[this._uid + '_vueDropzone'].getAcceptedFiles()) {
          // Check response for corresponding element in pics
          const newPic = this.pics.find(obj => obj.uuid === file.upload.uuid)
          // Create error if not existant and return
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
          // Replace real pic with mockfile pointing to s3
          file.toReplace = true
          this.$refs[this._uid + '_vueDropzone'].removeFile(file)
          const tmpMockFile = JSON.parse(JSON.stringify(this.mockFile))
          tmpMockFile.name = newPic.url
          this.$refs[this._uid + '_vueDropzone'].manuallyAddFile(tmpMockFile, this.s3 + newPic.url)
        }
        if (this.isLoading) {
          // Now update parent object
          if (this.maxFiles > 1) {
            await this.patchParentMethod([this.parent._id, { [this.path]: this.pics }, {}])
          } else {
            const result = await this.patchParentMethod([this.parent._id, { [this.path]: this.pics[0] }, {}])
            const picProperty = this.resolveProperty(this.path, result)
            if (Array.isArray(picProperty)) {
              this.pics = picProperty
            } else {
              this.pics = [picProperty]
            }
          }
          this.isLoading = false
          this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'rules',
      's3',
      'resolveProperty'
    ]),
    ...mapGetters('auth', [
      'user'
    ]),
    dropzoneOptionsPics () {
      return {
        url: server + 'uploads',
        maxFilesize: this.maxFilesize,
        maxFiles: this.maxFiles,
        paramName: 'uri',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('feathers-jwt')
        },
        autoProcessQueue: false,
        addRemoveLinks: true,
        dictDefaultMessage: '<i style="font-size: 40px" class="fas fa-images"></i><br><br><span class="v-label"><span class="font-weight-bold">' + this.$t('dropFilesHeadline', { filesize: this.maxFilesize }) + '</span><br><br>' + this.$t('dropFilesBody', { resolution: this.resolutionString }) + '</span>',
        dictRemoveFile: '<i style="font-size: 40px" class="fas fa-times"></i>',
        dictCancelUpload: '<i style="font-size: 40px" class="fas fa-times"></i>',
        dictFileTooBig: this.$t('fileTooBigError'),
        dictInvalidFileType: this.$t('fileTypeNotAcceptedError'),
        dictMaxFilesExceeded: this.$t('noMorePicsError'),
        acceptedMimeTypes: this.acceptedMimeTypes,
        resizeWidth: this.resizeWidth,
        resizeMethod: this.resizeMethod,
        resizeQuality: this.resizeQuality
      }
    }
  },

  watch: {
    pics () {
      this.$nextTick(() => {
        if (this.$refs[this._uid + '_uploadForm']) {
          this.$refs[this._uid + '_uploadForm'].validate()
        }
      })
    }
  }
}
</script>
