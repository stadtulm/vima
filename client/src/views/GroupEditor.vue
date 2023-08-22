<template>
  <div>
    <v-row
      v-if="selectedGroup || !$route.params.id"
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
                {{$t('group')}} {{ selectedGroup ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
                <v-chip
                  dark
                  class="ml-3"
                  :color="selectedGroup && selectedGroup.accepted && selectedGroup.accepted.isAccepted ? 'success' : 'warning'"
                >
                  <v-icon
                    size="14"
                    class="mr-3"
                  >
                    {{selectedGroup && selectedGroup.accepted && selectedGroup.accepted.isAccepted ? 'fas fa-lock-open' : 'fas fa-lock'}}
                  </v-icon>
                  {{selectedGroup && selectedGroup.accepted && selectedGroup.accepted.isAccepted ? $t('accepted') : $t('notYetAccepted') }}
                </v-chip>
              </v-col>
            </v-row>
            <v-form
              v-model="isValid"
              ref="groupEditorForm"
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
                    :label="$t('groupName')"
                    :color="$settings.modules.groups.color"
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
                    :color="$settings.modules.groups.color"
                    :item-color="$settings.modules.groups.color"
                    background-color="#fff"
                    outlined
                    v-model="visibility"
                    :label="$t('visibility')"
                    :items="computedVisibilityItems"
                    :rules="[rules.required]"
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
                    :color="$settings.modules.groups.color"
                    :item-color="$settings.modules.groups.color"
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
                    :color="$settings.modules.groups.color"
                    :item-color="$settings.modules.groups.color"
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
                    :color="$settings.modules.groups.color"
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
                          v-model="description"
                          width="100%"
                        >
                          <template slot="default">
                            <VuetifyTiptap
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
                <v-col>
                  <v-alert
                    icon="fas fa-info-circle"
                    color="customGrey"
                    dark
                    outlined
                  >
                    {{$t('prominentCategoriesHint')}}
                  </v-alert>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col>
                  <v-select
                    dense
                    multiple
                    :color="$settings.modules.groups.color"
                    :item-color="$settings.modules.groups.color"
                    background-color="#fff"
                    outlined
                    v-model="prominentCategories"
                    item-text="text.value"
                    item-value="_id"
                    :label="$t('prominentCategories')"
                    :items="categories.sort((a, b) => a.text.value.localeCompare(b.text.value))"
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
                        @keypress="$refs.groupUpload.fakeClick()"
                      >
                        <FileUpload
                          ref="groupUpload"
                          v-model="pics"
                          @fileRemove="patchFileRemove"
                          @fileAdd="$nextTick(() => { $refs.groupEditorForm.validate() })"
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
            <v-card-actions
              class="px-0"
            >
              <v-btn
                block
                :dark="isValid"
                :color="$settings.modules.groups.color"
                :loading="isLoading"
                :disabled="!isValid"
                @click="user.role === 'admins' ? saveGroup() : showAcceptDialog = true"
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
              {{$t('group')}} {{$t('acceptWarningHeadline')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="text-body-1 font-weight-bold"
            >
              <div
                v-html="$t('acceptGroupWarningBody', { type: $t('group') })"
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
              @click="prepareSaveGroup()"
              dark
              :color="$settings.modules.groups.color"
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
import FileUpload from '@/components/FileUpload.vue'
import TagProposalDialog from '@/components/TagProposalDialog.vue'

export default {
  name: 'GroupEditor',

  components: {
    FileUpload,
    TagProposalDialog
  },

  data: () => ({
    showTagProposalDialog: false,
    selectedTags: [],
    visibility: undefined,
    showAcceptDialog: false,
    selectedGroup: undefined,
    selectedCategories: [],
    prominentCategories: [],
    type: undefined,
    isLoading: false,
    isValid: false,
    title: undefined,
    description: undefined,
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
    ...mapActions('groups', {
      patchGroup: 'patch',
      createGroup: 'create',
      requestGroup: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    async patchFileRemove (file) {
      this.isLoading = true
      try {
        await this.patchGroup([
          this.selectedGroup._id,
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
    prepareSaveGroup () {
      this.showAcceptDialog = false
      this.saveGroup()
    },
    async adapt () {
      if (this.$route.params.id) {
        let selectedGroup = this.getGroup(this.$route.params.id)
        if (!selectedGroup) {
          selectedGroup = await this.requestGroup([this.$route.params.id])
        }
        this.selectedGroup = selectedGroup
      }
      if (this.selectedGroup) {
        this.title = this.selectedGroup.title.value
        this.description = this.selectedGroup.description.value
        this.selectedCategories = this.selectedGroup.categories
        this.visibility = this.selectedGroup.visibility
        this.selectedTags = this.selectedGroup.tags
        this.prominentCategories = this.selectedGroup.prominentCategories
        if (this.selectedGroup.pics) {
          this.pics = this.selectedGroup.pics
        }
      }
    },
    async saveGroup () {
      this.isLoading = true
      try {
        await this.$refs.groupUpload.upload()
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
        description: [
          {
            value: this.description,
            type: 'default'
          }
        ],
        categories: this.selectedCategories,
        prominentCategories: this.prominentCategories,
        visibility: this.visibility,
        tags: this.selectedTags
      }
      if (this.pics) {
        map.pics = this.pics
      }
      try {
        if (this.$route.params.id) {
          await this.patchGroup([this.$route.params.id, map, {}])
        } else {
          await this.createGroup([map, {}])
        }
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$router.go(-1)
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
    ...mapGetters('groups', {
      getGroup: 'get'
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
    computedVisibilityItems () {
      const tmpItems = [
        { text: this.$t('publicVisibilityTitle') + ' - ' + this.$t('publicVisibilityDescription'), value: 'public' },
        { text: this.$t('privateVisibilityTitle') + ' - ' + this.$t('privateVisibilityDescription'), value: 'private' }
      ]
      if (this.user.role === 'admins') {
        tmpItems.push({ text: this.$t('hiddenVisibilityTitle') + ' - ' + this.$t('hiddenVisibilityDescription'), value: 'hidden' })
      }
      return tmpItems
    }
  },

  watch: {
    description () {
      if (this.description) {
        this.description = this.$sanitize(this.description)
      }
    }
  }
}
</script>
