<template>
  <div>
    <v-sheet
      :class="files.length < maxFiles ? 'pointer' : ''"
      width="100%"
      min-height="200px"
      @dragover.prevent
      @drop.prevent="files.length < maxFiles ? addFile($event, 'drop')  : null"
      @dragenter.prevent="isInsideDroparea = true"
      @dragleave.prevent="isInsideDroparea = false"
      :color="isInsideDroparea ? (files.length < maxFiles ? 'success' : 'error'): 'info'"
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
      <v-container
        fluid
      >
        <v-row>
          <v-col
            v-for="(file, i) in files"
            :key="i"
            cols="3"
          >
            <v-card>
              <v-img
                class="text-center align-center"
                :src="file.state === 'uploaded' ? s3 + file.url : file.uri"
                max-height="200"
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
                  <span>{{fileStates[file.state].tooltip}}</span>
                </v-tooltip>
              </v-img>
                <v-text-field
                  v-model="file.credit"
                  class="mx-3 mt-3"
                  @click.stop
                  :label="$t('copyrightOwner')"
                  :rules="[rules.required]"
                  @input="updateFileCredit($event, i)"
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
        tooltip: 'Uploaded'
      },
      pending: {
        icon: 'fas fa-arrow-circle-up',
        tooltip: 'Pending'
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
            state: this.value.state || 'uploaded'
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
      return Promise.all(files.map(async file => ({
        credit: file.credit,
        originalname: file.name,
        uri: await this.fileToDataURL(file),
        private: this.isPrivate,
        state: 'pending'
      })))
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
