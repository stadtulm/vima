<template>
  <div>
    <v-sheet
      class="pointer"
      width="100%"
      min-height="200px"
      @dragover.prevent
      @drop.prevent="addFile($event, 'drop')"
      @dragenter.prevent="isInsideDroparea = true"
      @dragleave.prevent="isInsideDroparea = false"
      :color="isInsideDroparea ? 'success': 'info'"
      @click="$refs.hiddenInput.click()"
    >
    <input
      multiple
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
                :src="file.uri"
                max-height="200"
              >
                <v-tooltip
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
    this.$set(this.files, [])
  },

  computed: {
    ...mapGetters([
      'rules'
    ])
  },

  methods: {
    ...mapActions('uploads', {
      createUpload: 'create'
    }),
    updateFileCredit (e, i) {
      this.$set(this.files, i, { ...this.files[i], credit: e })
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
    removeFile (file) {
      this.files = this.files.filter(f => {
        return f !== file
      })
    }
  },
  watch: {
    files: {
      deep: true,
      handler () {
        this.$emit('input', this.files)
      }
    }
  }
}
</script>
