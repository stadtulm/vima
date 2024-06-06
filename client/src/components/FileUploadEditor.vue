<template>
  <div
    v-if="group"
  >
    <v-card
      flat
      outlined
      class="mb-6 collection"
    >
      <v-card-text>
        <v-row
          v-for="(file, i) in group.files"
          :key="i"
        >
          <v-col
            cols="5"
          >
            <v-text-field
              disabled
              color="custom"
              v-model="file.url"
              :label="$t('file')"
              hide-details
            >
            </v-text-field>
          </v-col>
          <v-col
            cols="5"
          >
            <v-text-field
              disabled
              color="custom"
              v-model="file.name"
              :label="$t('shownName')"
              hide-details
            >
            </v-text-field>
          </v-col>
          <v-col
            cols="2"
            align-self="center"
            class="text-right"
          >
            <v-btn
              icon
              @click="removeDownloadableFile(i)"
            >
              <v-icon>
                fas fa-trash
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="5"
          >
            <v-file-input
              color="custom"
              :label="$t('chooseFile')"
              show-size
              @change="storeFile"
              ref="fileInput"
              prepend-icon="fas fa-file"
              hide-details
            ></v-file-input>
          </v-col>
          <v-col
            cols="5"
          >
            <v-text-field
              color="custom"
              :label="$t('shownName')"
              v-model="fileName"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col
            cols="2"
            align-self="center"
            class="text-right"
          >
            <v-btn
              icon
              :loading="isUploadingFile"
              :disabled="!file || !fileName"
              @click="addDownloadableFile()"
            >
              <v-icon>
                fas fa-plus
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'FileUploadEditor',

  components: {
  },

  props: [
    'group'
  ],

  data: () => ({
    isUploadingFile: false,
    file: undefined,
    fileName: undefined
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('groups', {
      patchGroup: 'patch',
      createGroup: 'create'
    }),
    ...mapActions('uploads', {
      createUpload: 'create',
      removeUpload: 'remove'
    }),
    prepareSaveGroup () {
      this.showAcceptDialog = false
      this.saveGroup()
    },
    async removeDownloadableFile (i) {
      try {
        this.removeUpload([this.group.files[i].url, {}, {}])
        await this.patchGroup(
          [
            this.group._id,
            {
              $pull: {
                files: {
                  url: this.group.files[i].url
                }
              }
            }
          ]
        )
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async addDownloadableFile (hideSnackbar) {
      this.isUploadingFile = true
      const reader = new FileReader()
      reader.readAsDataURL(this.file)
      reader.addEventListener('load', async () => {
        try {
          // Upload
          const result = await this.createUpload({ originalname: this.file.name, uri: reader.result, private: true })
          // Patch group
          await this.patchGroup(
            [
              this.group._id,
              {
                $push: {
                  files: { name: this.fileName, url: result.id }
                }
              }
            ]
          )
          // Reset
          this.file = undefined
          this.fileName = undefined
          this.$refs.fileInput.reset()
          // Feedback
          if (hideSnackbar) {
            this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          }
        } catch (e) {
          this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        }
        this.isUploadingFile = false
      }, false)
    },
    storeFile (event) {
      this.file = event.target.files[0]
    }
  },

  computed: {
    ...mapGetters([
      'rules',
      's3'
    ]),
    ...mapGetters('auth', [
      'user'
    ])
  }
}
</script>
