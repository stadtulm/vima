<template>
  <div>
    <v-row
      v-if="selectedAd || !$route.params.id"
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
                {{$t('ad')}} {{ selectedAd ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
                <v-chip
                  dark
                  class="ml-3"
                  :color="selectedAd && selectedAd.accepted && selectedAd.accepted.isAccepted ? 'success' : 'warning'"
                >
                  <v-icon
                    size="14"
                    class="mr-3"
                  >
                    {{selectedAd && selectedAd.accepted && selectedAd.accepted.isAccepted ? 'fas fa-lock-open' : 'fas fa-lock'}}
                  </v-icon>
                  {{selectedAd && selectedAd.accepted && selectedAd.accepted.isAccepted ? $t('accepted') : $t('notYetAccepted') }}
                </v-chip>
              </v-col>
            </v-row>
            <v-form
              v-model="isValid"
              ref="adEditorForm"
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
                    color="customCyan"
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
                <v-col>
                  <v-select
                    dense
                    color="customCyan"
                    item-color="customCyan"
                    background-color="#fff"
                    outlined
                    v-model="type"
                    :label="$t('type')"
                    :rules="[rules.required]"
                    :items="[{ text: $t('wanted'), value: 'request' }, { text: $t('offer'), value: 'offer'}]"
                  >
                  </v-select>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col>
                  <v-select
                    dense
                    multiple
                    color="customCyan"
                    item-color="customCyan"
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
                    color="customCyan"
                    item-color="customCyan"
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
                    color="customCyan"
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
                        {{$t('description')}}
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
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
                              :extensions="extensions"
                              :placeholder="$t('enterText')"
                              style="border: 1px solid #aaa"
                            >
                            </tiptap-vuetify>
                          </template>
                        </v-input>
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
                            color="customCyan"
                            item-color="customCyan"
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
                color="customCyan"
                :loading="isLoading"
                :disabled="!isValid"
                @click="user.role === 'admins' ? saveAd() : showAcceptDialog = true"
              >
                {{$t('saveDataButton')}}
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- Patch dialog -->
    <v-dialog
      v-model="showAcceptDialog"
      persistent
      max-width="600"
    >
      <v-card
        color="customGreyBg"
        tile
      >
        <v-card-text
          class="pa-8"
        >
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('ad')}} {{$t('acceptWarningHeadline')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="body-1 font-weight-bold"
              v-html="$t('acceptWarningBody', { type: $t('ad') })"
            >
            </v-col>
          </v-row>
          <v-card-actions
            class="mt-4 pa-0"
          >
            <v-btn
              @click="showAcceptDialog = false"
            >
              {{$t('cancelButton')}}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              @click="prepareSaveAd()"
              dark
              color="customCyan"
            >
              {{$t('understoodButton')}}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
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
import { TiptapVuetify, Bold, Italic, Strike, Underline, BulletList, OrderedList, ListItem, Link } from 'tiptap-vuetify'
import TagProposalDialog from '@/components/TagProposalDialog.vue'
const server = process.env.VUE_APP_SERVER_URL

export default {
  name: 'AdEditor',

  components: {
    vueDropzone: vue2Dropzone,
    TiptapVuetify,
    TagProposalDialog
  },

  data: () => ({
    showTagProposalDialog: false,
    selectedTags: [],
    isQueued: false,
    showAcceptDialog: false,
    selectedAd: undefined,
    selectedCategories: [],
    type: undefined,
    isLoading: false,
    isValid: false,
    title: undefined,
    text: undefined,
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
      Link
    ]
  }),

  async mounted () {
    await this.adapt()
    this.$refs.tabStart.focus()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapMutations('ads', {
      updateAdItem: 'updateItem'
    }),
    ...mapActions('ads', {
      patchAd: 'patch',
      createAd: 'create',
      requestAd: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    prepareSaveAd () {
      this.showAcceptDialog = false
      this.saveAd()
    },
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
      if (this.selectedAd && this.selectedAd.pics) {
        for (const pic of this.selectedAd.pics) {
          const tmpMockFile = JSON.parse(JSON.stringify(this.mockFile))
          tmpMockFile.name = pic.url
          this.$refs.vueDropzonePics.manuallyAddFile(tmpMockFile, this.s3 + pic.url)
        }
      }
    },
    async adapt () {
      if (this.$route.params.id) {
        let selectedAd = this.getAd(this.$route.params.id)
        if (!selectedAd) {
          selectedAd = await this.requestAd([this.$route.params.id])
        }
        this.selectedAd = selectedAd
      }
      if (this.selectedAd) {
        this.title = this.selectedAd.title.value
        this.text = this.selectedAd.text.value
        this.type = this.selectedAd.type
        this.selectedCategories = this.selectedAd.categories
        this.selectedTags = this.selectedAd.tags
        if (this.selectedAd.pics) {
          this.pics = this.selectedAd.pics
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
          this.saveAd()
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
          if (this.selectedAd) {
            await this.removeUpload([file.name, {}, {}])
            let tmpPictures = []
            if (this.selectedAd && this.selectedAd.pics) {
              tmpPictures = this.selectedAd.pics
            }
            tmpPictures = tmpPictures.filter(obj => obj.url !== file.name)
            await this.patchAd([this.selectedAd._id, { pics: tmpPictures }, {}])
            this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          }
        } else if (this.loading) {
          throw error
        }
        const index = this.pics.findIndex(obj => obj.url === file.upload?.uuid || obj.url === file.name)
        if (index !== -1) {
          this.pics.splice(index, 1)
        }
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async saveAd () {
      this.isLoading = true
      if (this.isQueued) {
        await this.$refs.vueDropzonePics.processQueue()
      } else {
        const map = {
          title: [
            {
              value: this.title,
              type: 'default'
            }
          ],
          text: [
            {
              value: this.text,
              type: 'default'
            }
          ],
          type: this.type,
          categories: this.selectedCategories,
          tags: this.selectedTags
        }
        if (this.pics) {
          map.pics = this.pics
        }
        try {
          if (this.$route.params.id) {
            await this.patchAd([this.$route.params.id, map, {}])
          } else {
            await this.createAd([map, {}])
          }
          this.isLoading = false
          this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          this.$router.go(-1)
          await this.adapt()
        } catch (e) {
          this.isLoading = false
          this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'rules',
      's3',
      'reduceTranslations'
    ]),
    ...mapGetters('ads', {
      getAd: 'get'
    }),
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
    }
  },

  watch: {
    pics () {
      if (this.$refs.adEditorForm) {
        this.$nextTick(() => {
          this.$refs.adEditorForm.validate()
        })
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
