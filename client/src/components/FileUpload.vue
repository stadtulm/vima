<template>
  <div>
    <v-sheet
      outlined
      class="droparea"
      :class="files.length < maxFiles ? 'pointer' : ''"
      width="100%"
      @dragover.prevent
      @drop.prevent="files.length < maxFiles ? addFile($event, 'drop')  : null"
      @dragenter.prevent="isInsideDroparea = true"
      @dragleave.prevent="isInsideDroparea = false"
      :color="isInsideDroparea ? (files.length < maxFiles ? 'success' : 'error'): bgColor"
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
          cols=12
          class="text-center"
        >
          {{$t('acceptedFileTypes', {filetypes: acceptedMimeTypes.join(', ')})}}
        </v-col>
        <v-col
          cols=12
          class="text-center"
        >
          {{$t('dropFilesBody', { resolution })}}
        </v-col>
      </v-row>
      <v-container
        fluid
      >
        <v-row>
          <v-col
            v-for="(file, i) in files"
            :key="i"
            cols="12"
            sm="6"
          >
            <v-card>
              <v-img
                class="text-center align-center"
                :src="file.state === 'uploaded' ? s3 + file.url : file.uri"
                height="200"
                :gradient="file.errors.length > 0 ? 'to top, red, transparent' : ''"
              >
                <v-tooltip
                  v-if="file.state"
                  bottom
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
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
                <v-text-field
                  v-model="file.credit"
                  class="mx-3 mt-3"
                  @click.stop
                  :label="$t('copyrightOwner')"
                  :rules="[rules.required]"
                  @input="updateFileCredit($event, i)"
                  :disabled="file.errors.length > 0"
                ></v-text-field>
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
    resolution: {
      type: String
    },
    bgColor: {
      type: String
    }
  },

  components: {
  },

  data: () => ({
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
              state: file.state || 'uploaded'
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
      let files
      if (type === 'click') {
        files = this.$refs.hiddenInput.files
      } else if (type === 'drop') {
        files = e.dataTransfer.files
      }
      if (!files || files.length === 0) return
      const filesWithDataUrl = await this.readAsDataURL([...files])
      this.files = this.files.concat(filesWithDataUrl)
      this.$refs.hiddenInput.value = null
      if (this.maxFiles > 1) {
        this.$emit('input', this.files)
      } else {
        this.$emit('input', this.files[0])
      }
      this.isInsideDroparea = false
      this.$emit('fileAdd')
    },
    fileToDataURL (file) {
      var reader = new FileReader()
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
        if (!this.acceptedMimeTypes.includes(file.type)) {
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
          errors: errors
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
  .droparea * {pointer-events: none;}
  .droparea .v-card * {pointer-events: auto}
</style>
