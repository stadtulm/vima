<template>
  <div>
    <v-row
      v-if="selectedDiscussion || !$route.params.id"
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
                {{$t('discussion')}} {{ selectedDiscussion ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
                <v-chip
                  v-if="(selectedDiscussion && group) || !group"
                  dark
                  class="ml-3"
                  :color="selectedDiscussion && selectedDiscussion.accepted && selectedDiscussion.accepted.isAccepted ? 'success' : 'warning'"
                >
                  <v-icon
                    size="14"
                    class="mr-3"
                  >
                    {{selectedDiscussion && selectedDiscussion.accepted && selectedDiscussion.accepted.isAccepted ? 'fas fa-lock-open' : 'fas fa-lock'}}
                  </v-icon>
                  {{selectedDiscussion && selectedDiscussion.accepted && selectedDiscussion.accepted.isAccepted ? $t('accepted') : $t('notYetAccepted') }}
                </v-chip>
              </v-col>
            </v-row>
            <v-form
              v-model="isValid"
              ref="discussionEditorForm"
            >
              <v-row
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    dense
                    outlined
                    :label="$t('headline')"
                    :color="$settings.modules.discussions.color"
                    background-color="#fff"
                    v-model="title"
                    :rules="[rules.required]"
                    ref="tabStart"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                dense
                v-if="(selectedDiscussion && group) || user.role === 'admins'"
              >
                <v-col>
                  <v-select
                    dense
                    :color="$settings.modules.discussions.color"
                    :item-color="$settings.modules.discussions.color"
                    background-color="#fff"
                    outlined
                    v-model="group"
                    item-text="title"
                    item-value="_id"
                    :label="$t('group')"
                    :items="[{ title: $t('none'), _id: null}].concat(computedGroups)"
                    :disabled="user.role !== 'admins'"
                  >
                  </v-select>
                </v-col>
              </v-row>
              <v-row
                dense
                v-if="!group"
              >
                <v-col>
                  <v-select
                    dense
                    multiple
                    :color="$settings.modules.discussions.color"
                    :item-color="$settings.modules.discussions.color"
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
                    :color="$settings.modules.discussions.color"
                    :item-color="$settings.modules.discussions.color"
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
                    :color="$settings.modules.discussions.color"
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
                    color="customGreyUltraLight"
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
                          v-model="description"
                          width="100%"
                        >
                          <template slot="default">
                            <tiptap-vuetify
                              :editor-properties="{
                                disableInputRules: true,
                                disablePasteRules: true
                              }"
                              color="customGreyUltraLight"
                              v-model="description"
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
                          outlined
                          icon="fas fa-info-circle"
                          color="customGrey"
                          dark
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
                            :color="$settings.modules.discussions.color"
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
                :color="$settings.modules.discussions.color"
                :loading="isLoading"
                :disabled="!isValid"
                @click="saveOrWarn()"
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
        color="customGreyUltraLight"
        tile
      >
        <v-card-text
          class="pa-8"
        >
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('discussion')}} {{$t('acceptWarningHeadline')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              v-if="group"
              class="body-1 font-weight-bold"
              v-html="$t('acceptWarningBodyInternal', { type: $t('discussion') })"
            >
            </v-col>
            <v-col
              v-else
              class="body-1 font-weight-bold"
              v-html="$t('acceptWarningBody', { type: $t('discussion') })"
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
              @click="prepareSaveDiscussion()"
              dark
              :color="$settings.modules.discussions.color"
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
  name: 'DiscussionEditor',

  components: {
    vueDropzone: vue2Dropzone,
    TiptapVuetify,
    TagProposalDialog
  },

  data: () => ({
    showTagProposalDialog: false,
    selectedTags: [],
    group: undefined,
    isQueued: false,
    showAcceptDialog: false,
    selectedDiscussion: undefined,
    selectedCategories: [],
    type: undefined,
    isLoading: false,
    isValid: false,
    title: undefined,
    description: undefined,
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
    ...mapMutations('groups', {
      updateGroupItem: 'updateItem'
    }),
    ...mapActions('discussions', {
      patchDiscussion: 'patch',
      createDiscussion: 'create',
      requestDiscussion: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    ...mapActions('groups', {
      findGroups: 'find'
    }),
    saveOrWarn () {
      if (this.group) {
        const userRelationContainers = this.statusContainers.filter(obj =>
          obj.user === this.user._id &&
          obj.type === 'groups' &&
          obj.reference === this.group
        ).map(obj => obj.relation)
        if (
          userRelationContainers.includes('owner') ||
          userRelationContainers.includes('moderator') ||
          userRelationContainers.includes('member')
        ) {
          this.saveDiscussion()
        } else {
          this.showAcceptDialog = true
        }
      } else {
        if (this.user.role === 'admins') {
          this.saveDiscussion()
        } else {
          this.showAcceptDialog = true
        }
      }
    },
    async getAllGroups (existingGroups, skip) {
      const tmpGroups = await this.findGroups(
        {
          query: {
            _id: {
              $in: [...new Set(this.statusContainers.filter(
                obj => obj.type === 'groups' &&
                  obj.user === this.user._id &&
                  (
                    obj.relation === 'owner' ||
                    obj.relation === 'member'
                  )
              ).map(obj => obj.reference))]
            }
          },
          $paginate: false
        }
      )
      for (const group of tmpGroups) {
        this.updateGroupItem(this.reduceTranslations(group, this.$i18n.locale, ['title', 'description']))
      }
    },
    prepareSaveDiscussion () {
      this.showAcceptDialog = false
      this.saveDiscussion()
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
      if (this.selectedDiscussion && this.selectedDiscussion.pics) {
        for (const pic of this.selectedDiscussion.pics) {
          const tmpMockFile = JSON.parse(JSON.stringify(this.mockFile))
          tmpMockFile.name = pic.url
          this.$refs.vueDropzonePics.manuallyAddFile(tmpMockFile, this.s3 + pic.url)
        }
      }
    },
    async adapt () {
      if (this.$route.params.id) {
        let selectedDiscussion = this.getDiscussion(this.$route.params.id)
        if (!selectedDiscussion) {
          selectedDiscussion = await this.requestDiscussion([this.$route.params.id])
        }
        this.selectedDiscussion = selectedDiscussion
      }
      if (this.selectedDiscussion) {
        this.title = this.selectedDiscussion.title.value
        this.description = this.selectedDiscussion.description.value
        this.selectedCategories = this.selectedDiscussion.categories
        this.selectedTags = this.selectedDiscussion.tags
        if (this.selectedDiscussion.pics) {
          this.pics = this.selectedDiscussion.pics
        }
        if (this.selectedDiscussion.group) {
          this.group = this.selectedDiscussion.group
        }
        if (this.selectedDiscussion.group) {
          this.group = this.selectedDiscussion.group
        }
      } else if (this.$route.params.group) {
        this.group = this.$route.params.group
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
          this.saveDiscussion()
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
          if (this.selectedDiscussion) {
            await this.removeUpload([file.name, {}, {}])
            let tmpPictures = []
            if (this.selectedDiscussion && this.selectedDiscussion.pics) {
              tmpPictures = this.selectedDiscussion.pics
            }
            tmpPictures = tmpPictures.filter(obj => obj.url !== file.name)
            await this.patchDiscussion([this.selectedDiscussion._id, { pics: tmpPictures }, {}])
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
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async saveDiscussion () {
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
          description: [
            {
              value: this.description,
              type: 'default'
            }
          ],
          categories: this.selectedCategories,
          group: this.group,
          tags: this.selectedTags
        }
        if (this.pics) {
          map.pics = this.pics
        }
        try {
          if (this.$route.params.id) {
            await this.patchDiscussion([this.$route.params.id, map, {}])
          } else {
            await this.createDiscussion([map, {}])
          }
          this.isLoading = false
          this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          this.$router.go(-1)
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
    ...mapGetters('discussions', {
      getDiscussion: 'get'
    }),
    ...mapGetters('auth', [
      'user'
    ]),
    ...mapGetters('categories', {
      categories: 'list'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
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
        dictDefaultMessage: '<i style="font-size: 40px" class="fas fa-images"></i><br><br><span class="v-label"><span class="font-weight-bold">' + this.$t('dropFilesHeadline', { filesize: '2', maxfiles: 10 }) + '</span><br><br>' + this.$t('dropFilesBody', { resolution: '1400x400' }) + '</span>',
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
    computedGroups () {
      if (this.requestedGroups) {
        return this.requestedGroups
      } else {
        return []
      }
    }
  },

  asyncComputed: {
    async requestedGroups () {
      return await this.getAllGroups([], 0)
    }
  },

  watch: {
    group () {
      if (this.group) {
        this.selectedCategories = []
      }
    },
    pics () {
      if (this.$refs.discussionEditorForm) {
        this.$nextTick(() => {
          this.$refs.discussionEditorForm.validate()
        })
      }
    },
    description () {
      if (this.description) {
        this.description = this.$sanitize(this.description)
      }
    }
  }
}
</script>
