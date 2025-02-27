<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('event')}} {{ selectedEvent ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
      </span>
    </v-row>
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
            <v-form
              v-model="isValid"
              ref="eventEditorForm"
            >
              <v-card
                class="mt-6 mb-8"
                color="rgb(228,230,232)"
              >
                <v-card-text>
                  <v-row
                    dense
                    v-if="title"
                  >
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        ref="tabStart"
                        density="compact"
                        :label="$t('title')"
                        v-model="title.find(obj => obj.lang === currentLanguage).value"
                        :rules="[v => title.find(obj => obj.type === 'default').value !== '' || $t('defaultLanguageRequired')]"
                      >
                        <template v-slot:prepend>
                          <LanguageSelect
                            :currentLanguage="currentLanguage"
                            :languageObjects="title"
                            @update:setLanguage="(l) => { currentLanguage = l }"
                          ></LanguageSelect>
                        </template>
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
              <v-row
                v-if="text"
                dense
                class="mb-6"
              >
                <v-col
                  cols="12"
                >
                  <v-card
                    color="rgb(228,230,232)"
                  >
                    <v-card-text>
                      <v-row>
                          <v-col
                            class="text-subtitle-1"
                            cols="12"
                          >
                            {{$t('description')}} ({{$t('rulesMaxLength', { msg: 1000 })}})
                          </v-col>
                        </v-row>
                        <v-row
                          dense
                        >
                          <v-col
                            cols="12"
                          >
                            <v-input
                              :rules="[
                                v => (text.find(obj => obj.type === 'default').value !== '' && text.find(obj => obj.type === 'default').value !== '<p></p>') || $t('defaultLanguageRequired'),
                                rules.longText
                              ]"
                              v-model="text.find(obj => obj.lang === currentLanguage).value"
                              width="100%"
                            >
                              <template v-slot:prepend>
                                <LanguageSelect
                                  :currentLanguage="currentLanguage"
                                  :languageObjects="text"
                                  @update:setLanguage="(l) => { currentLanguage = l }"
                                ></LanguageSelect>
                              </template>
                              <template v-slot:default>
                                <custom-tiptap
                                  v-model="text.find(obj => obj.lang === currentLanguage).value"
                                  :extensions="['bold', 'italic', 'underline', 'strikethrough', 'bulletList', 'orderedList']"
                                  :placeholder="$t('rulesMaxLength', { msg: 1000 }) + '..'"
                                >
                                </custom-tiptap>
                              </template>
                            </v-input>
                          </v-col>
                        </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-card
                class="mt-6 mb-8"
                color="rgb(228,230,232)"
              >
                <v-card-text>
                  <v-row>
                    <v-col
                      class="text-subtitle-1 pb-0 mb-0"
                      cols="12"
                    >
                      {{$t('start') + ' & ' + $t('end')}}
                    </v-col>
                    <v-col>
                      <DatePicker
                        :teleport="true"
                        v-model="eventDate"
                        range
                        time-picker-inline
                        :locale="$i18n.locale"
                        :select-text="$t('done')"
                        :cancel-text="$t('cancelButton')"
                        format="dd/MM/yyyy HH:mm"
                      >
                          <template #trigger>
                            <v-sheet
                              class="pa-3 pointer"
                              color="customGreyUltraLight"
                              style="border-bottom: 1px solid rgba(118,118,118);"
                            >
                              {{ $moment(eventDate[0]).format('DD.MM.YYYY, HH:mm') + ' --> ' + $moment(eventDate[1]).format('DD.MM.YYYY, HH:mm') }}
                            </v-sheet>
                          </template>
                      </DatePicker>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
              <v-row
                dense
              >
                <v-col>
                  <v-select
                    density="compact"
                    v-model="organisation"
                    item-title="name"
                    item-value="_id"
                    :label="$t('organisation')"
                    :items="userOrganisations"
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
                    density="compact"
                    :label="$t('location')"
                    v-model="location"
                    :rules="[rules.shortText]"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col>
                  <v-select
                    density="compact"
                    multiple
                    v-model="selectedCategories"
                    item-title="text.value"
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
                    density="compact"
                    multiple
                    chips
                    closable-chips
                    auto-select-first
                    v-model="selectedTags"
                    item-title="text"
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
                          @update:fileRemove="patchFileRemove"
                          @update:fileAdd="$nextTick(() => { $refs.eventEditorForm.validate() })"
                          :acceptedMimeTypes="['image/png', 'image/jpg', 'image/jpeg']"
                          :maxFileSize="2"
                          :maxFiles="10"
                          bgColor="white"
                          :scaleToFit="[1080, 1080]"
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
              <v-divider class="mb-6"></v-divider>
              <v-toolbar
                class="mt-4"
                color="transparent"
              >
                <v-btn
                  block
                  variant="elevated"
                  color="customGrey"
                  :loading="isLoading"
                  :disabled="!isValid"
                  @click="saveEvent()"
                  class="mx-0"
                >
                  {{$t('saveDataButton')}}
                </v-btn>
              </v-toolbar>
            </v-form>
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
      @update:closeTagProposalDialog="showTagProposalDialog = false"
    ></TagProposalDialog>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import TagProposalDialog from '@/components/TagProposalDialog.vue'
import LanguageSelect from '@/components/LanguageSelect.vue'
import FileUpload from '@/components/FileUpload.vue'
import CustomTiptap from '@/components/CustomTiptap.vue'

export default {
  name: 'EventEditor',

  components: {
    FileUpload,
    TagProposalDialog,
    LanguageSelect,
    CustomTiptap
  },

  data: () => ({
    eventDate: [],
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
    currentLanguage: 'en',
    userOrganisations: [],
    location: undefined
  }),

  async mounted () {
    this.currentLanguage = this.$i18n.locale
    await this.adapt()
    this.$refs.tabStart.focus()
    this.loadUserOrganisations()
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
    async loadUserOrganisations () {
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
        this.userOrganisations = tmpContainers
          .filter((v, i, a) => a.findLastIndex(v2 => (v2.reference === v.reference)) === i)
          .filter(v => !!v)
          .map(obj => this.getOrganisation(obj.reference))
          .filter(v => !!v)
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
        this.userOrganisations = tmpContainers
          .filter((v, i, a) => a.findLastIndex(v2 => (v2.reference === v.reference)) === i)
          .filter(v => !!v)
          .map(obj => this.getOrganisation(obj.reference))
          .filter(v => !!v)
      }
    },
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
          this.eventDate = [new Date(this.selectedEvent.duration.start), new Date(this.selectedEvent.duration.end)]
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
          start: this.eventDate[0],
          end: this.eventDate[1]
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
    }
  }
}
</script>
