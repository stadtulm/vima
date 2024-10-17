<template>
    <v-sheet
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
        class="pt-12"
        v-if="files.length < maxFiles"
      >
        <v-col
          cols=12
          class="text-center text-h5 font-weight-light mt-3"
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
        class="mt-6"
      >
        <v-row>
          <v-col
            v-for="(file, i) in files"
            :key="i"
            cols="12"
            sm="6"
            md="4"
            style="cursor: auto !important"
            @click.stop
          >
            <v-card
              :ripple="false"
              style="cursor: auto !important"
              theme="light"
              class="pa-4 elevation-6"
            >
              <v-row>
                <v-col
                  class="mt-4 mb-1 text-subtitle-1 text-center"
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
                  <template v-slot:activator="{ props }">
                    <v-icon
                      class="pointer"
                      v-bind="props"
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
              <v-row>
                <v-col>
                  <v-text-field
                    class="mt-4"
                    v-model="file.credit"
                    :label="$t('copyrightOwner')"
                    :rules="[rules.required]"
                    @click.stop
                    @keypress.stop
                    @input="updateFileCredit($event, i)"
                    :disabled="file.errors.length > 0"
                    :hint="$t('publicHint')"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>
              <template
                v-if="(
                  (file.type && picTypes.map(t => 'image/' + t).includes(file.type.toLowerCase()))) ||
                  (file.state === 'uploaded' && file.url?.split('.')[file.url?.split('.').length - 1].toLowerCase() !== 'svg' && picTypes.includes(file.url?.split('.')[file.url?.split('.').length - 1].toLowerCase()))
                "
              >
                <v-card
                  v-if="file.state === 'pending' || file.state === 'error'"
                >
                  <v-card-text>
                    <v-row
                      class="d-flex align-center"
                    >
                      <v-col
                        cols="12"
                        class="font-weight-bold"
                      >
                        {{$t('rotation')}}
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col
                        cols="6"
                        class="text-center"
                      >
                        <v-btn
                          size="small"
                          @click.stop="updateRotation(file, i, 90)"
                          icon="fas fa-rotate-left"
                        >
                        </v-btn>
                      </v-col>
                      <v-col
                        cols="6"
                        class="text-center"
                      >
                        <v-btn
                          size="small"
                          @click.stop="updateRotation(file, i, -90)"
                          icon="fas fa-rotate-right"
                        >
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row
                      class="d-flex align-center"
                    >
                      <v-col
                        cols="12"
                        class="font-weight-bold"
                      >
                        {{$t('quality')}}
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col
                        cols="6"
                        class="mt-4 text-center"
                      >
                        <v-slider
                          @click.stop
                          :min="10"
                          :max="100"
                          model-value="100"
                          thumb-label="always"
                          density="compact"
                          persistent-hint
                          :hint="file.uri ? '~' + (calcFileSizeInMB(file.uri)) + 'MB' : ''"
                          @end="updateQuality(file, i, $event)"
                        >
                          <template v-slot:thumb-label="{ modelValue }">
                            {{ Math.round(modelValue) }}%
                          </template>
                        </v-slider>
                      </v-col>
                      <v-col
                        cols="6"
                        class="text-center"
                      >
                        <v-btn
                          size="small"
                          icon="fas fa-magnifying-glass"
                          @click.stop="previewImage[i] = true"
                        >
                        </v-btn>
                        <v-overlay
                          v-if="previewImage[i]"
                          class="pointer d-flex align-center justify-center pa-12"
                          v-model="previewImage[i]"
                          width="75%"
                          @click.stop="previewImage[i] = undefined"
                          style="background-color: rgba(0,0,0,0.75)"
                          >
                          <v-img
                            @click.stop="previewImage[i] = undefined"
                            contain
                            max-height="95vh"
                            max-width="95vw"
                            :src="file.uri"
                          ></v-img>
                        </v-overlay>
                      </v-col>
                    </v-row>
                    <v-row
                      class="d-flex align-center"
                      v-if="safetyUris[i]?.scaleToFit"
                    >
                      <v-col
                        cols="12"
                        class="font-weight-bold"
                      >
                        {{$t('scale')}} ({{file.dimensions.width}}px x {{file.dimensions.height}}px)
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        class="text-center"
                      >
                        <v-text-field
                          density="compact"
                          persistent-hint
                          v-model="safetyUris[i].scaleToFit"
                          :hint="$t('longestSide')"
                          @click.stop
                          @keypress.stop
                          @input="updateDimensions(file, i)"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
                <v-row
                  v-else
                >
                  <v-col>
                    <v-btn
                      block
                      color="customGrey"
                      variant="elevated"
                      @click.stop="preparePicEdit(file, i)"
                    >
                      <v-icon>fa fa-edit</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </template>
              <v-btn
                class="mt-4"
                variant="elevated"
                color="error"
                icon="fa fa-trash"
                size="small"
                @click.stop="removeFile(file)"
              >
              </v-btn>
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
</template>

<script>

import { mapActions, mapGetters } from 'vuex'
import 'jimp/browser/lib/jimp'

export default {
  name: 'FileUpload',

  props: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    modelValue: {
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
    reset: {
      type: Number,
      default: 0
    }
  },

  emits: [
    'update:modelValue',
    'update:fileAdd',
    'update:fileRemove'
  ],

  components: {
  },

  data: () => ({
    safetyUris: {},
    previewImage: {},
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
      'rules',
      'picTypes'
    ])
  },

  methods: {
    ...mapActions('uploads', {
      createUpload: 'create',
      removeUpload: 'remove',
      getUpload: 'get'
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
        this.$emit('update:modelValue', this.files)
      } else {
        this.$emit('update:modelValue', this.files[0])
      }
    },
    adapt () {
      if (!this.modelValue) {
        this.files = []
      } else {
        if (Array.isArray(this.modelValue)) {
          if (this.maxFiles > 1) {
            this.files = this.modelValue.map(file => ({
              ...file,
              state: file.state || 'uploaded',
              errors: file.errors || []
            }))
          } else {
            throw new Error('Max files ist set to 1 or below. Array ist not allowed as value.')
          }
        } else {
          this.files = [{
            ...this.modelValue,
            state: this.modelValue.state || 'uploaded',
            errors: this.modelValue.errors || []
          }]
        }
      }
    },
    updateFileCredit (e, i) {
      if (this.maxFiles > 1) {
        this.$emit('update:modelValue', this.files)
      } else {
        this.$emit('update:modelValue', this.files[0])
      }
    },
    async preparePicEdit (pic, i) {
      const upload = await this.getUpload(pic.url)
      const f = await this.readAsDataURL([{
        ...upload,
        state: pic.state,
        credit: pic.credit,
        _id: pic._id,
        url: pic.url
      }], true)
      this.safetyUris[i] = {
        uri: f[0].uri,
        rotation: 0,
        quality: 100,
        scaleToFit: Math.max(f[0].dimensions.width, f[0].dimensions.height)
      }
      this.files[this.files.findIndex(f => f._id === pic._id)] = f[0]
      if (this.maxFiles > 1) {
        this.$emit('update:modelValue', this.files)
      } else {
        this.$emit('update:modelValue', this.files[0])
      }
    },
    calcFileSizeInMB (dataURI) {
      const byteString = atob(dataURI.split(',')[1])
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      const blob = new Blob([ab], { type: mimeString })
      return Math.round((blob.size / 1024 / 1024) * 1000) / 1000
    },
    async updateRotation (pic, i, rotation) {
      // eslint-disable-next-line no-undef
      const jimpPic = await Jimp.read(pic.uri)
      pic.uri = await jimpPic
        .scaleToFit(
          parseFloat(this.safetyUris[i].scaleToFit),
          parseFloat(this.safetyUris[i].scaleToFit)
        ).quality(this.safetyUris[i].quality)
        .rotate(rotation)
        .getBase64Async(pic.type)
      this.safetyUris[i].rotation += rotation
      const tmpDimensions = await this.calcImageDimensions(pic.uri)
      pic.dimensions = tmpDimensions
      this.safetyUris[i].scaleToFit = Math.max(tmpDimensions.height, tmpDimensions.width)
    },
    async updateQuality (pic, i, quality) {
      // eslint-disable-next-line no-undef
      const jimpPic = await Jimp.read(this.safetyUris[i].uri)
      pic.uri = await jimpPic
        .scaleToFit(
          parseFloat(this.safetyUris[i].scaleToFit),
          parseFloat(this.safetyUris[i].scaleToFit)
        )
        .quality(quality)
        .rotate(this.safetyUris[i].rotation)
        .getBase64Async(pic.type)
      this.safetyUris[i].quality = quality
      this.updateError(pic)
    },
    async updateDimensions (pic, i) {
      // eslint-disable-next-line no-undef
      const jimpPic = await Jimp.read(this.safetyUris[i].uri)
      pic.uri = await jimpPic
        .scaleToFit(
          parseFloat(this.safetyUris[i].scaleToFit),
          parseFloat(this.safetyUris[i].scaleToFit)
        )
        .quality(this.safetyUris[i].quality)
        .rotate(this.safetyUris[i].rotation)
        .getBase64Async(pic.type)
      const tmpDimensions = await this.calcImageDimensions(pic.uri)
      pic.dimensions = tmpDimensions
      this.safetyUris[i].scaleToFit = Math.max(tmpDimensions.height, tmpDimensions.width)
      this.updateError(pic)
    },
    updateError (pic) {
      const currentSize = this.calcFileSizeInMB(pic.uri)
      pic.errors = pic.errors.filter(e => e !== 'fileTooBigError')
      pic.state = 'pending'
      if (currentSize > this.maxFileSize) {
        pic.errors.push('fileTooBigError')
        pic.state = 'error'
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
        let i = 0
        for (const pic of filesWithDataUrl) {
          if (this.picTypes.map(t => 'image/' + t).includes(pic.type.toLowerCase())) {
            // Is globally imported
            // eslint-disable-next-line no-undef
            const jimpPic = await Jimp.read(pic.uri)
            pic.uri = await jimpPic
              .getBase64Async(pic.type)

            // Add to safetyUris
            this.safetyUris[this.files.length + i] = {
              uri: pic.uri,
              rotation: 0,
              quality: 100,
              scaleToFit: Math.max(pic.dimensions.width, pic.dimensions.height)
            }
            i++
          }
        }
      } catch (e) {
        // TODO: Handle error
        // console.log(e)
      }

      // TODO:
      // FIX UPDATE OF DISCUSSION REPLIES
      // CHECK ALL FILEUPLOADS (UODATE AFTER EDIT)

      this.files = this.files.concat(filesWithDataUrl)
      this.$refs.hiddenInput.value = null
      if (this.maxFiles > 1) {
        this.$emit('update:modelValue', this.files)
      } else {
        this.$emit('update:modelValue', this.files[0])
      }
      this.isInsideDroparea = false
      this.$emit('update:fileAdd')
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
    readAsDataURL (files, isEdit) {
      return Promise.all(files.map(async file => {
        const fileType = isEdit ? file.contentType : file.type
        const dataUrl = isEdit ? file.uri : await this.fileToDataURL(file)

        const errors = []
        if (file.size / 1024 / 1024 > this.maxFileSize) {
          errors.push('fileTooBigError')
        }
        if (this.acceptedMimeTypes.length > 1 && !this.acceptedMimeTypes.includes(fileType)) {
          errors.push('fileTypeNotAcceptedError')
        }

        let dimensions
        if (
          (fileType && this.picTypes.map(t => 'image/' + t).includes(fileType.toLowerCase())) ||
          (file.state === 'uploaded' && this.picTypes.includes(file.url?.split('.')[file.url?.split('.').length - 1].toLowerCase()))
        ) {
          dimensions = await this.calcImageDimensions(dataUrl)
        }

        return {
          credit: file.credit,
          originalname: isEdit ? file.id : file.name,
          isEdit: isEdit,
          uri: dataUrl,
          private: this.isPrivate,
          state: errors.length === 0 ? 'pending' : 'error',
          type: fileType,
          size: file.size,
          dimensions,
          errors
        }
      }))
    },
    async calcImageDimensions (dataUrl) {
      return new Promise((resolve, reject) => {
        try {
          const img = new Image()
          img.onload = () => {
            resolve({ width: parseFloat(img.width), height: parseFloat(img.height) })
          }
          img.src = dataUrl
        } catch (e) {
          reject(e)
        }
      })
    },
    async removeFile (file) {
      if (file.state === 'uploaded' || file.isEdit) {
        await this.removeUpload([file.isEdit ? file.originalname : file.url, {}, {}])
        this.$emit('update:fileRemove', file)
      } else {
        this.files = this.files.filter(f => {
          return f !== file
        })
      }
    }
  },
  watch: {
    modelValue: {
      deep: true,
      handler (newValue, oldValue) {
        if (newValue !== oldValue) {
          this.adapt()
        }
      }
    },
    reset () {
      this.safetyUris = {}
    }
  }
}
</script>

<style>
  .droparea {
    border-radius: 3px;
    border: thin solid rgba(69, 90, 100, 0.5);
  }
  .droparea * {pointer-events: none;}
  .droparea .v-card * {pointer-events: auto}
</style>
