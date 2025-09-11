<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('discussion')}} {{ selectedDiscussion ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
        <v-chip
          v-if="(selectedDiscussion && group) || !group"
          variant="flat"
          class="ml-3 mb-1"
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
      </span>
    </v-row>
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
                v-if="(selectedDiscussion && group) || user.role === 'admins'"
              >
                <v-col>
                  <v-autocomplete
                    density="compact"
                    v-model="group"
                    item-title="title"
                    item-value="_id"
                    :label="$t('group')"
                    :items="[{ title: $t('none'), _id: null}].concat(groups.map(group => ({ _id: group._id, title: group.title.value })))"
                    :disabled="user.role !== 'admins'"
                  >
                  </v-autocomplete>
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
                    :color="$settings.modules.discussions.color"
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
                          :rules="[rules.tiptapRequired, rules.longText]"
                          v-model="description"
                          width="100%"
                        >
                          <template v-slot:default>
                            <custom-tiptap
                              v-model="description"
                              :extensions="['bold', 'italic', 'underline', 'strikethrough', 'bulletList', 'orderedList']"
                              :placeholder="$t('rulesMaxLength', { msg: 1000 }) + '..'"
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
                        @keypress="$refs.discussionUpload.fakeClick()"
                      >
                        <FileUpload
                          ref="discussionUpload"
                          v-model="pics"
                          @update:fileRemove="patchFileRemove"
                          @update:fileAdd="$nextTick(() => { $refs.discussionEditorForm.validate() })"
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
                :color="$settings.modules.discussions.color"
                :loading="isLoading"
                :disabled="!isValid"
                @click="saveOrWarn()"
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
              {{$t('discussion')}} {{$t('acceptWarningHeadline')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              v-if="group"
              class="text-body-1 font-weight-bold"
            >
              <div
                v-html="$t('acceptWarningBodyInternal', { type: $t('discussion') })"
              >
              </div>
            </v-col>
            <v-col
              v-else
              class="text-body-1 font-weight-bold"
            >
              <div
                v-html="$t('acceptWarningBody', { type: $t('discussion') })"
              >
              </div>
            </v-col>
          </v-row>
          <v-toolbar
            class="mt-2 pa-3"
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
  name: 'DiscussionEditor',

  components: {
    TagProposalDialog,
    FileUpload,
    CustomTiptap
  },

  data: () => ({
    showTagProposalDialog: false,
    selectedTags: [],
    group: undefined,
    showAcceptDialog: false,
    selectedDiscussion: undefined,
    selectedCategories: [],
    type: undefined,
    isLoading: false,
    isValid: false,
    title: undefined,
    description: undefined,
    pics: [],
    groups: []
  }),

  async mounted () {
    await this.adapt()
    await this.loadGroups()
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
    async loadGroups () {
      let query
      if (this.$route.name === 'DiscussionEditorAdmin') {
        query = {}
      } else {
        query = {
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
        }
      }
      const tmpGroups = await this.findGroups(
        {
          query,
          $paginate: false
        }
      )
      this.groups = tmpGroups || []
    },
    async patchFileRemove (file) {
      this.isLoading = true
      try {
        await this.patchDiscussion([
          this.selectedDiscussion._id,
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
    saveOrWarn () {
      if (this.group) {
        const userRelationContainers = this.statusContainers.filter(obj =>
          obj.user === this.user._id &&
          obj.type === 'groups' &&
          obj.reference === this.group
        ).map(obj => obj.relation)
        if (
          this.user.role === 'admins' ||
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
    prepareSaveDiscussion () {
      this.showAcceptDialog = false
      this.saveDiscussion()
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
      } else if (this.$route.params.group) {
        this.group = this.$route.params.group
      }
    },
    async saveDiscussion () {
      this.isLoading = true
      // Do uploads
      try {
        await this.$refs.discussionUpload.upload()
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
        console.log(e)
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
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
    })
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
