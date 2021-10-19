<template>
  <div>
    <v-row
      v-if="selectedEvent || !$route.params.event"
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
                {{$t('event')}} {{ selectedEvent ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
              </v-col>
            </v-row>
            <v-form
              v-model="isValid"
              ref="eventEditorForm"
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
                    :label="$t('title')"
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
                <v-col>
                  <v-select
                    dense
                    color="customGrey"
                    item-color="customGrey"
                    background-color="#fff"
                    outlined
                    v-model="organisation"
                    item-text="name"
                    item-value="_id"
                    :label="$t('organisation')"
                    :items="computedUserOrganisationItems"
                    :rules="[rules.required]"
                  >
                  </v-select>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-input
                    :rules="[rules.required]"
                    v-model="durationStart"
                    width="100%"
                  >
                    <template slot="default">
                      <DatetimePicker
                        label="Beginn"
                        v-model="durationStart"
                        clearText="Reset"
                        okText="Speichern"
                        dateFormat="dd.MM.yyyy,"
                        timeFormat="HH:mm 'Uhr'"
                        color="error"
                        :datePickerProps="{ 'header-color': 'rgba(0, 0, 0, 0.54)' }"
                        :timePickerProps="{ 'header-color': 'rgba(0, 0, 0, 0.54)', 'format': '24hr' }"
                      >
                        <template slot="dateIcon">
                          <v-icon>
                            fas fa-calendar-day
                          </v-icon>
                        </template>
                        <template slot="timeIcon">
                          <v-icon>
                            fas fa-clock
                          </v-icon>
                        </template>
                      </DatetimePicker>
                    </template>
                  </v-input>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-input
                    :rules="[rules.required, v => $moment(v).isSameOrAfter($moment(durationStart)) === true || this.$t('endBeforeStart')]"
                    v-model="durationEnd"
                    width="100%"
                  >
                    <DatetimePicker
                      :error="durationEnd && durationStart && $moment(durationEnd).isBefore(durationStart) ? this.$t('endBeforeStart'): undefined"
                      label="Ende"
                      v-model="durationEnd"
                      clearText="Reset"
                      okText="Speichern"
                      dateFormat="dd.MM.yyyy,"
                      timeFormat="HH:mm 'Uhr'"
                      color="error"
                      :datePickerProps="{ 'header-color': 'rgba(0, 0, 0, 0.54)' }"
                      :timePickerProps="{ 'header-color': 'rgba(0, 0, 0, 0.54)', 'format': '24hr' }"
                    >
                      <template slot="dateIcon">
                        <v-icon>
                          fas fa-calendar-day
                        </v-icon>
                      </template>
                      <template slot="timeIcon">
                        <v-icon>
                          fas fa-clock
                        </v-icon>
                      </template>
                    </DatetimePicker>
                  </v-input>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col>
                  <v-select
                    dense
                    multiple
                    color="customGrey"
                    item-color="customGrey"
                    background-color="#fff"
                    outlined
                    v-model="selectedCategories"
                    item-text="name"
                    item-value="_id"
                    :label="$t('categories')"
                    :items="categories.sort((a, b) => a.name.localeCompare(b.name))"
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
                    color="customGrey"
                    item-color="customGrey"
                    background-color="#fff"
                    outlined
                    v-model="selectedTags"
                    item-text="name"
                    item-value="_id"
                    :label="$t('tags') + ' ' + $t('optionalLabelExtension')"
                    :items="computedTags.sort((a, b) => a.name.localeCompare(b.name))"
                  >
                  </v-autocomplete>
                </v-col>
                <v-col
                  cols="12"
                  class="text-right"
                >
                  <v-btn
                    text
                    color="customGrey"
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
              <v-row>
                <v-col>
                  <v-checkbox
                    color="customGrey"
                    v-model="isActive"
                    :label="$t('eventActiveCheckbox')"
                  >
                  </v-checkbox>
                </v-col>
              </v-row>
              <v-divider class="mt-6 mb-9"></v-divider>
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
                @click="saveEvent()"
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
              {{$t('event')}} {{$t('acceptWarningHeadline')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="body-1 font-weight-bold"
              v-html="$t('acceptGroupWarningBody', { type: $t('event') })"
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
              @click="prepareSaveEvent()"
              dark
              color="customGrey"
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
import DatetimePicker from '../components/DatetimePicker.vue'
const server = process.env.VUE_APP_SERVER_URL

export default {
  name: 'EventEditor',

  components: {
    vueDropzone: vue2Dropzone,
    TiptapVuetify,
    TagProposalDialog,
    DatetimePicker
  },

  data: () => ({
    durationStart: undefined,
    durationEnd: undefined,
    showTagProposalDialog: false,
    showAcceptDialog: false,
    isQueued: false,
    selectedEvent: undefined,
    selectedTags: [],
    selectedCategories: [],
    isLoading: false,
    isValid: false,
    title: undefined,
    text: undefined,
    organisation: undefined,
    pics: [],
    isActive: true,
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
    ...mapActions('events', {
      patchEvent: 'patch',
      createEvent: 'create',
      requestEvent: 'get'
    }),
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    prepareSaveEvent () {
      this.showAcceptDialog = false
      this.saveEvent()
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
      if (this.selectedEvent && this.selectedEvent.pics) {
        for (const pic of this.selectedEvent.pics) {
          const tmpMockFile = JSON.parse(JSON.stringify(this.mockFile))
          tmpMockFile.name = pic.url
          this.$refs.vueDropzonePics.manuallyAddFile(tmpMockFile, this.s3 + pic.url)
        }
      }
    },
    async adapt () {
      if (this.$route.params.event) {
        let selectedEvent = this.getEvent(this.$route.params.event)
        if (!selectedEvent) {
          selectedEvent = await this.requestEvent([this.$route.params.event])
        }
        this.selectedEvent = selectedEvent
      }
      if (this.selectedEvent) {
        this.title = this.selectedEvent.title
        this.text = this.selectedEvent.text
        this.isActive = this.selectedEvent.isActive
        this.selectedCategories = this.selectedEvent.categories
        this.selectedTags = this.selectedEvent.tags
        this.organisation = this.selectedEvent.organisation
        if (this.selectedEvent.duration) {
          this.durationStart = new Date(this.selectedEvent.duration.start)
          this.durationEnd = new Date(this.selectedEvent.duration.end)
        }
        if (this.selectedEvent.pics) {
          this.pics = this.selectedEvent.pics
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
          this.saveEvent()
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
          if (this.selectedEvent) {
            await this.removeUpload([file.name, {}, {}])
            let tmpPictures = []
            if (this.selectedEvent && this.selectedEvent.pics) {
              tmpPictures = this.selectedEvent.pics
            }
            tmpPictures = tmpPictures.filter(obj => obj.url !== file.name)
            await this.patchEvent([this.selectedEvent._id, { pics: tmpPictures }, {}])
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
    async saveEvent () {
      this.isLoading = true
      if (this.isQueued) {
        await this.$refs.vueDropzonePics.processQueue()
      } else {
        const map = {
          title: this.title,
          text: this.text,
          isActive: this.isActive,
          organisation: this.organisation,
          categories: this.selectedCategories,
          tags: this.selectedTags,
          duration: {
            start: this.durationStart,
            end: this.durationEnd
          }
        }
        if (this.pics) {
          map.pics = this.pics
        }
        try {
          if (this.$route.params.event) {
            await this.patchEvent([this.$route.params.event, map, {}])
          } else {
            await this.createEvent([map, {}])
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
      's3'
    ]),
    ...mapGetters('events', {
      getEvent: 'get'
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
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('organisations', {
      organisations: 'list',
      getOrganisation: 'get'
    }),
    computedUserOrganisationItems () {
      if (this.computedUserOrganisations) {
        return this.computedUserOrganisations
      } else {
        return []
      }
    },
    computedTags () {
      return this.tags.filter(obj => obj.isActive && obj.isAccepted)
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

  asyncComputed: {
    async computedUserOrganisations () {
      let ids
      if (this.user.role === 'admins') {
        const tmpContainers = await this.findStatusContainers(
          {
            query: {
              type: 'organisations',
              tmpPopulateReference: true
            }
          }
        )
        return [...new Set(tmpContainers)].map(obj => this.getOrganisation(obj.reference))
      } else {
        ids = this.statusContainers.filter(obj =>
          obj.user === this.user._id &&
          obj.type === 'organisations' &&
          (obj.relation === 'member' || obj.relation === 'owner')
        ).map(obj => obj._id)
        const tmpContainers = await this.findStatusContainers(
          {
            query: {
              _id: {
                $in: ids
              },
              user: this.user._id,
              tmpPopulateReference: true
            }
          }
        )
        return [...new Set(tmpContainers)].map(obj => this.getOrganisation(obj.reference))
      }
    }
  },

  watch: {
    pics () {
      if (this.$refs.eventEditorForm) {
        this.$nextTick(() => {
          this.$refs.eventEditorForm.validate()
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
