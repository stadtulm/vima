<template>
  <div>
    <v-row
      v-if="selectedEvent || !$route.params.event"
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
                {{$t('event')}} {{ selectedEvent ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
              </v-col>
            </v-row>
            <v-form
              v-model="isValid"
              ref="eventEditorForm"
            >
              <v-row
                dense
                v-if="title"
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
                    v-model="title.find(obj => obj.lang === currentLanguage).value"
                    :rules="[v => title.find(obj => obj.type === 'default').value !== '' || $t('defaultLanguageRequired')]"
                  >
                    <template v-slot:prepend>
                      <LanguageSelect
                        :currentLanguage="currentLanguage"
                        :languageObjects="title"
                        @setLanguage="(l) => { currentLanguage = l }"
                      ></LanguageSelect>
                    </template>
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
                >
                  <v-text-field
                    dense
                    outlined
                    :label="$t('location')"
                    color="customGrey"
                    background-color="#fff"
                    v-model="location"
                    :rules="[rules.shortText]"
                  >
                  </v-text-field>
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
                        :label="$t('start')"
                        v-model="durationStart"
                        :clearText="$t('reset')"
                        :okText="$t('save')"
                        dateFormat="dd.MM.yyyy,"
                        :timeFormat="'HH:mm \'' + $t('oClock') + '\''"
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
                      :label="$t('end')"
                      v-model="durationEnd"
                      :clearText="$t('reset')"
                        :okText="$t('save')"
                      dateFormat="dd.MM.yyyy,"
                      :timeFormat="'HH:mm \'' + $t('oClock') + '\''"
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
                    color="customGrey"
                    item-color="customGrey"
                    background-color="#fff"
                    outlined
                    v-model="selectedTags"
                    item-text="text"
                    item-value="_id"
                    :label="$t('tags') + ' ' + $t('optionalLabelExtension')"
                    :items="tags.sort((a, b) => a.text.localeCompare(b.text))"
                    :rules="[rules.maxThreeCategories]"
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
                    {{$t('newTagButton')}}
                    <v-icon
                      size="18"
                      class="ml-3 pb-1"
                    >
                      fas fa-plus
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row
                v-if="text"
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
                        class="text-subtitle-1"
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
                          :rules="[v => (text.find(obj => obj.type === 'default').value !== '' && text.find(obj => obj.type === 'default').value !== '<p></p>') || $t('defaultLanguageRequired')]"
                          v-model="text.find(obj => obj.lang === currentLanguage).value"
                          width="100%"
                        >
                          <template v-slot:prepend>
                            <LanguageSelect
                              :currentLanguage="currentLanguage"
                              :languageObjects="text"
                              @setLanguage="(l) => { currentLanguage = l }"
                            ></LanguageSelect>
                          </template>
                          <template slot="default">
                            <VuetifyTiptap
                              :editor-properties="{
                                disableInputRules: true,
                                disablePasteRules: true
                              }"
                              color="customGreyUltraLight"
                              v-model="text.find(obj => obj.lang === currentLanguage).value"
                              :card-props="{ tile: true, flat: true }"
                              style="border: 1px solid #aaa"
                              :extensions="extensions"
                              :placeholder="$t('enterText')"
                            >
                            </VuetifyTiptap>
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
                        class="text-subtitle-1"
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
                        @keypress="$refs.eventUpload.fakeClick()"
                      >
                        <FileUpload
                          ref="eventUpload"
                          v-model="pics"
                          @fileRemove="patchFileRemove"
                          @fileAdd="$nextTick(() => { $refs.eventEditorForm.validate() })"
                          :acceptedMimeTypes="['image/png', 'image/jpg', 'image/jpeg']"
                          :maxFileSize="2"
                          :maxFiles="10"
                          bgColor="white"
                          :scaleToFit="[1080, 1080]"
                          :resizeQuality="50"
                        ></FileUpload>
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
              {{$t('event')}} {{$t('acceptWarningHeadline')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="text-body-1 font-weight-bold"
            >
              <div
                v-html="$t('acceptGroupWarningBody', { type: $t('event') })"
              >
              </div>
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
import TagProposalDialog from '@/components/TagProposalDialog.vue'
import DatetimePicker from '@/components/DatetimePicker.vue'
import LanguageSelect from '@/components/LanguageSelect.vue'
import FileUpload from '@/components/FileUpload.vue'

export default {
  name: 'EventEditor',

  components: {
    FileUpload,
    TagProposalDialog,
    DatetimePicker,
    LanguageSelect
  },

  data: () => ({
    durationStart: undefined,
    durationEnd: undefined,
    showTagProposalDialog: false,
    showAcceptDialog: false,
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
    currentLanguage: 'en'
  }),

  async mounted () {
    this.currentLanguage = this.$i18n.locale
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
      getEvent: 'get'
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
    async patchFileRemove (file) {
      this.isLoading = true
      try {
        await this.patchEvent([
          this.selectedEvent._id,
          {
            $pull: {
              pics: {
                _id: file._id
              }
            }
          }
        ])
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.adapt()
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.adapt()
      }
    },
    async adapt () {
      if (this.$route.params.event) {
        this.selectedEvent = await this.getEvent([this.$route.params.event, { keepTranslations: true }])
      }
      if (this.selectedEvent) {
        this.title = this.hydrateTranslations(this.selectedEvent.title)
        this.text = this.hydrateTranslations(this.selectedEvent.text)
        this.isActive = this.selectedEvent.isActive
        this.selectedCategories = this.selectedEvent.categories
        this.selectedTags = this.selectedEvent.tags
        this.organisation = this.selectedEvent.organisation
        this.location = this.selectedEvent.location
        if (this.selectedEvent.duration) {
          this.durationStart = new Date(this.selectedEvent.duration.start)
          this.durationEnd = new Date(this.selectedEvent.duration.end)
        }
        if (this.selectedEvent.pics) {
          this.pics = this.selectedEvent.pics
        }
      } else {
        this.title = this.hydrateTranslations()
        this.text = this.hydrateTranslations()
      }
    },
    async saveEvent () {
      this.isLoading = true
      // Do uploads
      try {
        await this.$refs.eventUpload.upload()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      // Prepare map
      const map = {
        title: this.title.filter(language => language.value && language.value !== ''),
        text: this.sanitizedText.filter(language => language.value && language.value !== '' && language.value !== '<p></p>'),
        isActive: this.isActive,
        organisation: this.organisation,
        location: this.location,
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
  },

  computed: {
    ...mapGetters([
      'rules',
      's3',
      'hydrateTranslations'
    ]),
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
    sanitizedText () {
      return this.text.map(language => {
        return {
          ...language,
          value: this.$sanitize(language.value)
        }
      })
    },
    computedUserOrganisationItems () {
      if (this.computedUserOrganisations) {
        return this.computedUserOrganisations
      } else {
        return []
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
  }
}
</script>
