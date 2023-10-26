<template>
  <div class="droparea-container">
    <v-sheet
      outlined
      class="droparea"
      :class="files.length < maxFiles ? 'pointer' : ''"
      width="100%"
      @dragover.prevent
      @drop.prevent="addFile($event, 'drop')"
      @dragenter.prevent="isInsideDroparea = true"
      @dragleave.prevent="isInsideDroparea = false"
      :color="isInsideDroparea ? (files.length < maxFiles ? 'customGreyLight' : 'error'): bgColor"
      @click="$refs.hiddenInput.click()"
    >
    <input
      multiple
      :disabled="files.length >= maxFiles"
      type="file"
      ref="hiddenInput"
      style="display:none"
      @change="addFile($event, 'click')"
    />
      <v-row
        dense
        class="pt-4"
        v-if="files.length < maxFiles"
      >
        <v-col
          cols=12
          class="text-center title"
        >
          {{$t('dropFilesHeadline', { maxfiles: maxFiles, filesize: maxFileSize })}}
        </v-col>
        <v-col
          v-if="acceptedMimeTypes.length > 1"
          cols=12
          class="text-center"
        >
          {{$t('acceptedFileTypes', {filetypes: acceptedMimeTypes.join(', ')})}}
        </v-col>
        <v-col
          cols=12
          class="text-center"
          v-if="acceptedMimeTypes.length > 1"
        >
          {{$t('dropFilesBody', { resolution: scaleToFit.join('x') })}}
        </v-col>
      </v-row>
      <v-container
        fluid
        class="mt-3"
      >
        <v-row>
          <v-col
            v-for="(file, i) in files"
            :key="i"
            cols="12"
            sm="4"
            style="cursor: auto !important"

          >
            <v-card
              :ripple="false"
              @click.stop
              style="cursor: auto !important"
            >
              <v-row>
                <v-col
                  class="mx-3 mb-3 font-weight-bold"
                >
                  {{file.originalname || file.url}}
                </v-col>
              </v-row>
              <v-img
                class="text-center align-center"
                :src="file.state === 'uploaded' ? s3 + file.url : file.uri"
                height="200"
                :gradient="file.errors.length > 0 ? 'to top, red, transparent' : 'to top, lightgrey, transparent'"
              >
                <v-tooltip
                  v-if="file.state"
                  bottom
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      class="pointer"
                      v-bind="attrs"
                      v-on="on"
                      color="white"
                      size="50"
                    >
                      {{fileStates[file.state].icon}}
                    </v-icon>
                  </template>
                  <div>{{$t(fileStates[file.state].tooltip)}}:</div>
                  <div
                    v-for="error in file.errors"
                    :key="error"
                  >
                    {{$t(error, {
                      filesize: (Math.round((file.size / 1024 / 1024) * 100) / 100).toFixed(2),
                      maxFilesize: maxFileSize,
                      filetype: file.type,
                      filetypes: acceptedMimeTypes.join(', ')
                    })}}
                  </div>
                </v-tooltip>
              </v-img>
              <v-card-text>
              <v-text-field
                v-model="file.credit"
                @click.stop
                :label="$t('copyrightOwner')"
                :rules="[rules.required]"
                @keypress.stop
                @input="updateFileCredit($event, i)"
                :disabled="file.errors.length > 0"
                :hint="$t('publicHint')"
                persistent-hint
              ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  color="customGrey"
                  dark
                  block
                  @click.stop="removeFile(file)"
                >
                  {{$t('deleteButton')}}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col
            cols="12"
            sm="4"
          >
            <v-card
              v-if="files.length > 0 || isLoading"
              class="fill-height"
              :flat="!isLoading"
              :color="bgColor"
            >
              <v-img
                min-height="200"
                height="100%"
                class="text-center align-center"
              >
                <v-progress-circular
                  v-if="isLoading"
                  indeterminate
                  :width="5"
                  :size="60"
                  color="customGrey"
                ></v-progress-circular>
              </v-img>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
  </div>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'FileUpload',

  props: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    value: {
    },
    maxFiles: {
      type: Number,
      default: 1
    },
    maxFileSize: {
      type: Number,
      default: 1
    },
    acceptedMimeTypes: {
      type: Array,
      default: () => []
    },
    bgColor: {
      type: String
    },
    scaleToFit: {
      type: Array,
      default: () => [1400, 400]
    },
    resizeQuality: {
      type: Number,
      default: 100
    }
  },

  components: {
  },

  data: () => ({
    isLoading: false,
    isInsideDroparea: false,
    files: [],
    isUploadingFile: false,
    fileStates: {
      uploaded: {
        icon: 'fas fa-check-circle',
        tooltip: 'uploadDone'
      },
      pending: {
        icon: 'fas fa-arrow-circle-up',
        tooltip: 'uploadPending'
      },
      error: {
        icon: 'fas fa-exclamation-circle',
        tooltip: 'uploadError'
      }
    }
  }),

  async mounted () {
    this.adapt()
  },

  computed: {
    ...mapGetters([
      's3',
      'rules'
    ])
  },

  methods: {
    ...mapActions('uploads', {
      createUpload: 'create',
      removeUpload: 'remove'
    }),
    fakeClick () {
      this.$refs.hiddenInput.click()
    },
    async upload () {
      for (const file of this.files.filter(file => file.state === 'pending')) {
        const result = await this.createUpload(file)
        delete file.uri
        file.url = result.id
      }
      if (this.maxFiles > 1) {
        this.$emit('input', this.files)
      } else {
        this.$emit('input', this.files[0])
      }
    },
    adapt () {
      if (!this.value) {
        this.files = []
      } else {
        if (Array.isArray(this.value)) {
          if (this.maxFiles > 1) {
            this.files = this.value.map(file => ({
              ...file,
              state: file.state || 'uploaded',
              errors: file.errors || []
            }))
          } else {
            throw new Error('Max files ist set to 1 or below. Array ist not allowed as value.')
          }
        } else {
          this.files = [{
            ...this.value,
            state: this.value.state || 'uploaded',
            errors: this.value.errors || []
          }]
        }
      }
    },
    updateFileCredit (e, i) {
      this.$set(this.files, i, { ...this.files[i], credit: e })
      if (this.maxFiles > 1) {
        this.$emit('input', this.files)
      } else {
        this.$emit('input', this.files[0])
      }
    },
    async addFile (e, type) {
      this.isInsideDroparea = false
      if (this.files.length >= this.maxFiles) return
      let files
      if (type === 'click') {
        files = this.$refs.hiddenInput.files
      } else if (type === 'drop') {
        files = e.dataTransfer.files
      }
      if (!files || files.length === 0) return
      this.isLoading = true
      const filesWithDataUrl = await this.readAsDataURL([...files])

      // JIMP READ
      // if allowedtypes includes image
      try {
        for (const pic of filesWithDataUrl) {
          if ([
            'image/jpg',
            'image/jpeg',
            'image/png',
            'image/tiff',
            'image/gif',
            'image/bmp'
          ].includes(pic.type.toLowerCase())) {
            // Is globally imported
            // eslint-disable-next-line no-undef
            const jimpPic = await Jimp.read(pic.uri)
            pic.uri = await jimpPic
              .scaleToFit(this.scaleToFit[0], this.scaleToFit[1])
              .quality(this.resizeQuality)
              .getBase64Async(pic.type)
          }
        }
      } catch (e) {
        console.log(e)
      }

      this.files = this.files.concat(filesWithDataUrl)
      this.$refs.hiddenInput.value = null
      if (this.maxFiles > 1) {
        this.$emit('input', this.files)
      } else {
        this.$emit('input', this.files[0])
      }
      this.isInsideDroparea = false
      this.$emit('fileAdd')
      this.isLoading = false
    },
    fileToDataURL (file) {
      const reader = new FileReader()
      return new Promise(function (resolve, reject) {
        reader.onload = function (event) {
          resolve(event.target.result)
        }
        reader.readAsDataURL(file)
      })
    },
    readAsDataURL (files) {
      return Promise.all(files.map(async file => {
        const errors = []
        if (file.size / 1024 / 1024 > this.maxFileSize) {
          errors.push('fileTooBigError')
        }
        if (this.acceptedMimeTypes.length > 1 && !this.acceptedMimeTypes.includes(file.type)) {
          errors.push('fileTypeNotAcceptedError')
        }
        return {
          credit: file.credit,
          originalname: file.name,
          uri: await this.fileToDataURL(file),
          private: this.isPrivate,
          state: errors.length === 0 ? 'pending' : 'error',
          type: file.type,
          size: file.size,
          errors
        }
      }))
    },
    async removeFile (file) {
      if (file.state === 'uploaded') {
        await this.removeUpload([file.url, {}, {}])
        this.$emit('fileRemove', file)
      } else {
        this.files = this.files.filter(f => {
          return f !== file
        })
      }
      // TODO PATCH AND EMIT ODER NUR PATCH
    }
  },
  watch: {
    value: {
      deep: true,
      handler (newValue, oldValue) {
        if (newValue !== oldValue) {
          this.adapt()
        }
      }
    }
  }
}
</script>

<style>
  .droparea-container {
    border-radius: 3px;
    border: thin solid rgba(69, 90, 100, 0.5);
  }
  .droparea * {pointer-events: none;}
  .droparea .v-card * {pointer-events: auto}
</style>
