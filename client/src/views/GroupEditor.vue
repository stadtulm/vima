<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('group')}} {{ selectedGroup ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
        <v-chip
          variant="flat"
          class="ml-3 mb-1"
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
      </span>
    </v-row>
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
                    density="compact"
                    :label="$t('groupName')"
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
                    v-model="visibility"
                    :label="$t('visibility')"
                    :rules="[rules.required]"
                    :items="computedVisibilityItems"
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
                          <template v-slot:default>
                            <custom-tiptap
                              v-model="description"
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
                <v-col>
                  <v-alert
                    icon="fas fa-info-circle"
                    color="customGrey"
                    variant="outlined"
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
                    density="compact"
                    multiple
                    v-model="prominentCategories"
                    item-title="text.value"
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
                          @update:fileRemove="patchFileRemove"
                          @update:fileAdd="$nextTick(() => { $refs.groupEditorForm.validate() })"
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
                :color="$settings.modules.groups.color"
                :loading="isLoading"
                :disabled="!isValid"
                @click="user.role === 'admins' ? saveGroup() : showAcceptDialog = true"
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
              {{$t('group')}} {{$t('acceptWarningHeadline')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="text-body-1"
            >
              <div
                v-html="$t('acceptGroupWarningBody', { type: $t('group') })"
              >
              </div>
            </v-col>
          </v-row>
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
              @click="prepareSaveGroup()"
              color="customGrey"
            >
              {{$t('understoodButton')}}
            </v-btn>
          </v-toolbar>
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
import FileUpload from '@/components/FileUpload.vue'
import TagProposalDialog from '@/components/TagProposalDialog.vue'
import CustomTiptap from '@/components/CustomTiptap.vue'

export default {
  name: 'GroupEditor',

  components: {
    FileUpload,
    TagProposalDialog,
    CustomTiptap
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
      // Do uploads
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
        { title: this.$t('publicVisibilityTitle') + ' - ' + this.$t('publicVisibilityDescription'), value: 'public' },
        { title: this.$t('privateVisibilityTitle') + ' - ' + this.$t('privateVisibilityDescription'), value: 'private' }
      ]
      if (this.user.role === 'admins') {
        tmpItems.push({ title: this.$t('hiddenVisibilityTitle') + ' - ' + this.$t('hiddenVisibilityDescription'), value: 'hidden' })
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
