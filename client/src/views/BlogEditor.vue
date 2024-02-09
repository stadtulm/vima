<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('blogEntry')}} {{ selectedBlog ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
      </span>
        <v-row
          v-if="selectedBlog || !$route.params.id"
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
                  ref="blogEditorForm"
                >
                  <v-row
                    v-if="title"
                    dense
                  >
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        ref="tabStart"
                        density="compact"
                        :label="$t('headline')"
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
                  <v-row
                    v-if="subTitle"
                    dense
                  >
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        density="compact"
                        :label="$t('subHeadline') + ' ' + $t('optionalLabelExtension')"
                        v-model="subTitle.find(obj => obj.lang === currentLanguage).value"
                      >
                        <template v-slot:prepend>
                          <LanguageSelect
                            :currentLanguage="currentLanguage"
                            :languageObjects="subTitle"
                            @update:setLanguage="(l) => { currentLanguage = l }"
                          ></LanguageSelect>
                        </template>
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row
                    dense
                  >
                    <v-col>
                      <v-checkbox
                        color="customGrey"
                        v-model="isActive"
                        :label="$t('blogActiveCheckbox')"
                      >
                      </v-checkbox>
                    </v-col>
                  </v-row>
                  <v-row
                    dense
                  >
                    <v-col>
                      <v-checkbox
                        color="customGrey"
                        v-model="isInternal"
                        :label="$t('blogOnlyForMembersCheckbox')"
                      >
                      </v-checkbox>
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
                      class="text-right pt-0"
                    >
                      <v-btn
                        variant="outlined"
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
                  <v-divider class="mt-4 mb-9"></v-divider>
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
                            {{$t('text')}}
                          </v-col>
                        </v-row>
                        <v-row
                          dense
                        >
                          <v-col
                            cols="12"
                          >
                            <v-alert
                              icon="fas fa-info-circle"
                            >
                              <span
                                v-html="$t('noteInsertImage')"
                              >
                              </span>
                            </v-alert>
                          </v-col>
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
                                  @update:setLanguage="(l) => { currentLanguage = l }"
                                ></LanguageSelect>
                              </template>
                              <template v-slot:default>
                                <custom-tiptap
                                  v-model="text.find(obj => obj.lang === currentLanguage).value"
                                  :extensions="['bold', 'italic', 'underline', 'strikethrough', 'bulletList', 'orderedList']"
                                >
                                </custom-tiptap>
                              </template>
                            </v-input>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-col>
                  </v-row>
                  <v-divider class="my-9 mt-3"></v-divider>
                  <v-row>
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
                            class="text-subtitle-1"
                          >
                            {{$t('videos')}} {{$t('optionalLabelExtension')}}
                          </v-col>
                        </v-row>
                        <template
                          v-if="selectedBlog"
                        >
                          <v-row
                            dense
                            v-for="(video, i) in videos"
                            :key="i"
                          >
                            <v-col
                              cols="5"
                            >
                              <v-text-field
                                density="compact"
                                v-model="video.id"
                                :label="$t('videoIdLabel')"
                                :rules="[rules.required]"
                              >
                              </v-text-field>
                            </v-col>
                            <v-col
                              cols="5"
                            >
                              <v-select
                                density="compact"
                                v-model="video.type"
                                :label="$t('type')"
                                :items="videoTypeItems"
                                :item-title="(item) => $t(item.textKey)"
                                :rules="[rules.required]"
                              >
                              </v-select>
                            </v-col>
                            <v-col
                              cols="2"
                              align-self="center"
                              class="text-right"
                            >
                              <v-btn
                                icon
                                @click="videos.splice(i, 1)"
                                class="mb-6"
                              >
                                <v-icon>
                                  fas fa-times
                                </v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                        </template>
                        <v-row
                          dense
                          v-for="(video, j) in tmpVideos"
                          :key="j + '_tmp'"
                        >
                          <v-col
                            cols="5"
                          >
                            <v-text-field
                              density="compact"
                              v-model="video.id"
                              :label="$t('videoIdLabel')"
                              :rules="[rules.required]"
                            >
                            </v-text-field>
                          </v-col>
                          <v-col
                            cols="5"
                          >
                            <v-select
                              density="compact"
                              v-model="video.type"
                              :label="$t('type')"
                              :items="videoTypeItems"
                              :item-title="(item) => $t(item.textKey)"
                              :rules="[rules.required]"
                            >
                            </v-select>
                          </v-col>
                          <v-col
                            cols="2"
                            align-self="center"
                            class="text-right"
                          >
                            <v-btn
                              icon
                              @click="tmpVideos.splice(j, 1)"
                              class="mb-6"
                            >
                              <v-icon>
                                fas fa-times
                              </v-icon>
                            </v-btn>
                          </v-col>
                        </v-row>
                        <v-row
                          dense
                        >
                          <v-col
                            cols="5"
                          >
                            <v-text-field
                              density="compact"
                              v-model="videoId"
                              :label="$t('videoIdLabel')"
                              :rules="videoId || videoType ? [rules.required] : []"
                            >
                            </v-text-field>
                          </v-col>
                          <v-col
                            cols="5"
                          >
                            <v-select
                              density="compact"
                              v-model="videoType"
                              :label="$t('type')"
                              :items="videoTypeItems"
                              :item-title="(item) => $t(item.textKey)"
                              :rules="videoId || videoType ? [rules.required] : []"
                            >
                            </v-select>
                          </v-col>
                          <v-col
                            cols="2"
                            align-self="center"
                            class="text-right"
                          >
                            <v-btn
                              icon
                              :disabled="!videoId || !videoType"
                              @click="addTmpVideo()"
                              class="mb-6"
                            >
                              <v-icon>
                                fas fa-plus
                              </v-icon>
                            </v-btn>
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
                            @keypress="$refs.blogUpload.fakeClick()"
                          >
                            <FileUpload
                              ref="blogUpload"
                              v-model="pics"
                              @update:fileRemove="patchFileRemove"
                              @update:fileAdd="$nextTick(() => { $refs.blogEditorForm.validate() })"
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
                </v-form>
                <v-divider
                  class="my-9"
                ></v-divider>
                <v-card-actions
                  class="px-0"
                >
                  <v-btn
                    block
                    variant="elevated"
                    color="customGrey"
                    :loading="isLoading"
                    :disabled="!isValid"
                    @click="saveBlog()"
                  >
                    {{$t('saveDataButton')}}
                  </v-btn>
                </v-card-actions>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
    </v-row>
    <TagProposalDialog
      :showTagProposalDialog="showTagProposalDialog"
      @update:closeTagProposalDialog="showTagProposalDialog = false"
    ></TagProposalDialog>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import LanguageSelect from '@/components/LanguageSelect.vue'
import TagProposalDialog from '@/components/TagProposalDialog.vue'
import FileUpload from '@/components/FileUpload.vue'
import CustomTiptap from '@/components/CustomTiptap.vue'

export default {
  name: 'BlogEditor',

  components: {
    FileUpload,
    LanguageSelect,
    TagProposalDialog,
    CustomTiptap
  },

  data: () => ({
    showTagProposalDialog: false,
    selectedBlog: undefined,
    isInternal: false,
    isActive: true,
    isLoading: false,
    isValid: false,
    title: undefined,
    subTitle: undefined,
    text: undefined,
    selectedTags: [],
    selectedCategories: [],
    videoId: undefined,
    videoType: undefined,
    videos: [],
    tmpVideos: [],
    pics: [],
    currentLanguage: 'en'
  }),

  async mounted () {
    this.currentLanguage = this.$i18n.locale
    window.load = () => {
      try {
        this.$refs.blogEditorForm.resetValidation()
      } catch (e) {}
    }
    await this.adapt()
    this.$refs.tabStart.focus()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('blog', {
      patchBlog: 'patch',
      createBlog: 'create',
      getBlog: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    async patchFileRemove (file) {
      this.isLoading = true
      try {
        await this.patchBlog([
          this.selectedBlog._id,
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
      if (this.$route.params.id) {
        this.selectedBlog = await this.getBlog([this.$route.params.id, { keepTranslations: true }])
      }
      this.tmpVideos = []
      if (this.selectedBlog) {
        this.title = this.hydrateTranslations(this.selectedBlog.title)
        this.subTitle = this.hydrateTranslations(this.selectedBlog.subTitle)
        this.text = this.hydrateTranslations(this.selectedBlog.text)
        this.isInternal = this.selectedBlog.isInternal
        this.isActive = this.selectedBlog.isActive
        this.selectedCategories = this.selectedBlog.categories
        this.selectedTags = this.selectedBlog.tags
        if (this.selectedBlog.pics) {
          this.pics = this.selectedBlog.pics
        }
        if (this.selectedBlog.videos) {
          this.videos = this.selectedBlog.videos
        }
      } else {
        this.title = this.hydrateTranslations()
        this.subTitle = this.hydrateTranslations()
        this.text = this.hydrateTranslations()
      }
    },
    async saveBlog () {
      this.isLoading = true
      try {
        await this.$refs.blogUpload.upload()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      // Prepare videos
      if (this.videoId && this.videoType) {
        this.addTmpVideo()
      }
      // Prepare map
      const map = {
        title: this.title.filter(language => language.value && language.value !== ''),
        subTitle: this.subTitle.filter(language => language.value && language.value !== ''),
        isInternal: this.isInternal,
        isActive: this.isActive,
        categories: this.selectedCategories,
        tags: this.selectedTags,
        text: this.sanitizedText.filter(language => language.value && language.value !== '' && language.value !== '<p></p>'),
        videos: this.videos.concat(this.tmpVideos),
        author: this.user._id
      }
      if (this.pics) {
        map.pics = this.pics
      }
      try {
        if (this.$route.params.id) {
          await this.patchBlog([this.$route.params.id, map, {}])
        } else {
          await this.createBlog([map, {}])
        }
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$router.go(-1)
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    addTmpVideo () {
      this.tmpVideos.push({ id: this.videoId, type: this.videoType })
      this.videoId = undefined
      this.videoType = undefined
    }
  },

  computed: {
    ...mapGetters([
      'rules',
      's3',
      'videoTypeItems',
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
    sanitizedText () {
      return this.text.map(language => {
        return {
          ...language,
          value: this.$sanitize(language.value)
        }
      })
    }
  },

  watch: {
    videos () {
      if (this.$refs.blogEditorForm) {
        this.$refs.blogEditorForm.validate()
      }
    },
    tmpVideos () {
      if (this.$refs.blogEditorForm) {
        this.$refs.blogEditorForm.validate()
      }
    }
  }
}
</script>
