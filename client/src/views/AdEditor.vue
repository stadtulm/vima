<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('ad')}} {{ selectedAd ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
        <v-chip
          variant="flat"
          class="ml-3 mb-1"
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
      </span>
    </v-row>
    <v-row
      v-if="selectedAd || !$route.params.id"
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
                    density="compact"
                    :label="$t('headline')"
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
                    density="compact"
                    v-model="type"
                    :label="$t('type')"
                    :rules="[rules.required]"
                    :items="[{ title: $t('wanted'), value: 'request' }, { title: $t('offer'), value: 'offer'}]"
                  >
                  </v-select>
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
                    :color="$settings.modules.ads.color"
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
                          :rules="[rules.tiptapRequired]"
                          v-model="text"
                          width="100%"
                        >
                          <template v-slot:default>
                            <custom-tiptap
                              v-model="text"
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
                        @keypress="$refs.adUpload.fakeClick()"
                      >
                        <FileUpload
                          ref="adUpload"
                          v-model="pics"
                          @update:fileRemove="patchFileRemove"
                          @update:fileAdd="$nextTick(() => { $refs.adEditorForm.validate() })"
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
            </v-form>
            <v-divider
              class="mb-6 mt-9"
            ></v-divider>
            <v-toolbar
              class="mt-4"
              color="transparent"
            >
              <v-btn
                block
                size="large"
                dark
                variant="elevated"
                :color="$settings.modules.ads.color"
                :loading="isLoading"
                :disabled="!isValid"
                @click="user.role === 'admins' ? saveAd() : showAcceptDialog = true"
                class="mx-0 text-white"
              >
                {{$t('saveDataButton')}}
              </v-btn>
            </v-toolbar>
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
              class="text-body-1"
            >
              <div
                v-html="$t('acceptWarningBody', { type: $t('ad') })"
              >
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-toolbar
          class="mt-2 pa-3"
        >
          <v-btn
            variant="elevated"
            @click="showAcceptDialog = false"
          >
            {{$t('cancelButton')}}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            variant="elevated"
            @click="prepareSaveAd()"
            color="customGrey"
          >
            {{$t('understoodButton')}}
          </v-btn>
        </v-toolbar>
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
import FileUpload from '@/components/FileUpload.vue'
import CustomTiptap from '@/components/CustomTiptap.vue'

export default {
  name: 'AdEditor',

  components: {
    TagProposalDialog,
    FileUpload,
    CustomTiptap
  },

  data: () => ({
    showTagProposalDialog: false,
    selectedTags: [],
    showAcceptDialog: false,
    selectedAd: undefined,
    selectedCategories: [],
    type: undefined,
    isLoading: false,
    isValid: false,
    title: undefined,
    text: undefined,
    pics: []
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
    async patchFileRemove (file) {
      this.isLoading = true
      try {
        await this.patchAd([
          this.selectedAd._id,
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
    prepareSaveAd () {
      this.showAcceptDialog = false
      this.saveAd()
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
    async saveAd () {
      this.isLoading = true
      // Do uploads
      try {
        await this.$refs.adUpload.upload()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      // Prepare map
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
  },

  computed: {
    ...mapGetters([
      'rules',
      's3'
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
    })
  },

  watch: {
    text () {
      if (this.text) {
        this.text = this.$sanitize(this.text)
      }
    }
  }
}
</script>
