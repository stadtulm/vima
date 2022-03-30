<template>
  <v-card
    color="customGreyBg"
    v-if="computedGroup"
    height="100%"
    :to="groupProp ? { name: 'Group', params: { group: computedGroup._id } } : ''"
  >
    <v-container
      fluid
      class="fill-height"
    >
      <v-row
        class="align-self-start"
      >
        <v-col
          :class="groupProp ? 'pa-0' : ''"
        >
          <v-row>
            <v-col
              cols="12"
              sm="12"
              :md="groupProp ? 12 : 6"
              :order="2"
              :order-md="groupProp ? 2 : 1"
            >
              <!-- Title -->
              <v-card-title
                class="word-wrap"
              >
                {{computedGroup.title}}
                <!-- Membership buttons / icon -->
                <v-tooltip
                  right
                  color="customGrey"
                  v-if="computedGroupStatus"
                  :key="JSON.stringify(computedGroupStatus)"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      v-bind="attrs"
                      v-on="on"
                      v-if="computedGroupStatus.value"
                      color="customGrey"
                      class="ml-3"
                    >
                      {{computedGroupStatus.icon}}
                    </v-icon>
                  </template>
                  <span>
                    {{$t(computedGroupStatus.textKey)}}
                  </span>
                </v-tooltip>
              </v-card-title>
              <v-card-title
                v-if="computedCategory"
                class="pt-0 pb-8"
              >
                {{computedCategory.name}}
              </v-card-title>
              <!-- Subtitle -->
              <v-card-subtitle
                v-if="!computedCategory"
              >
                {{$t('createdAt')}} {{$moment(computedGroup.createdAt).format('DD.MM.YYYY')}} {{$t('by')}}
                <span
                  class="font-weight-bold"
                  :class="computedGroup.owner ? 'pointer': ''"
                  @click="computedGroup.owner ? $router.push({name: 'User', params: { user: computedGroup.owner.user._id }}) : ''"
                >
                  {{computedGroup.owner ? computedGroup.owner.user.userName : ''}}
                </span>
              </v-card-subtitle>
              <v-card-text>
                <!-- Visibility -->
                <v-row
                  v-if="!computedCategory"
                >
                  <v-col>
                    <v-tooltip
                      right
                      color="customGrey"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-chip
                          dark
                          v-bind="attrs"
                          v-on="on"
                        >
                          {{$t(computedGroup.visibility + 'VisibilityTitle')}}
                          <v-icon
                            size="14"
                            class="ml-2 mb-1"
                          >
                            {{visibilityItems[computedGroup.visibility]}}
                          </v-icon>
                        </v-chip>
                      </template>
                      <span>
                        {{$t(computedGroup.visibility + 'VisibilityDescription')}}
                      </span>
                    </v-tooltip>
                  </v-col>
                </v-row>
                <!-- Interaction -->
                <v-row
                  v-if="
                    !computedGroupStatus &&
                    !groupProp &&
                    user &&
                    !computedCategory
                  "
                >
                  <v-col>
                    <v-btn
                      dark
                      color="customPurple"
                      :loading="isLoading"
                      @click="showApplyDialog = true"
                    >
                      {{$t('requestMembership')}}
                      <v-icon
                        size="18"
                        class="ml-3"
                      >
                        fas fa-user-plus
                      </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <!-- Categories -->
                <v-row
                  v-if="
                    !computedCategory &&
                    computedGroup.categories &&
                    computedGroup.categories.length > 0
                  "
                >
                  <v-col>
                    <v-chip
                      outlined
                      v-for="category in getCategories(computedGroup.categories)"
                      :key="category._id"
                      class="mr-1"
                      @click="$emit('selectCategory', category._id)"
                    >
                    {{category.name}}
                    </v-chip>
                  </v-col>
                </v-row>
                <!-- Tags -->
                <v-row
                  v-if="
                    !computedCategory &&
                    computedGroup.tags &&
                    computedGroup.tags.length > 0
                  "
                >
                  <v-col>
                    <v-chip
                      v-for="tag in getTags(computedGroup.tags)"
                      :key="tag._id"
                      class="mr-1"
                      @click="$emit('selectTag', tag._id)"
                    >
                    {{tag.name}}
                    </v-chip>
                  </v-col>
                </v-row>
                <!-- Description -->
                <v-row
                  v-if="!computedCategory"
                >
                  <v-col
                    class="body-1"
                    v-html="groupProp ? truncatedDescription(newTab(computedGroup.description)) : $sanitize(newTab(computedGroup.description))"
                  ></v-col>
                </v-row>
                <v-row
                  v-else
                >
                  <v-col
                    class="body-1"
                  >
                    {{computedCategory.description}}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-col>
            <!-- Carousel -->
            <v-col
              v-if="!computedCategory"
              cols="12"
              sm="12"
              :md="groupProp ? 12 : 6"
              :class="groupProp ? 'py-0': ''"
              :order="1"
              :order-md="groupProp ? 1 : 2"
            >
              <v-card-text
                :class="groupProp ? 'pa-0' : ''"
              >
                <v-carousel
                  v-if="computedPics.length > 0"
                  v-model="picsCarousel"
                  hide-delimiters
                  :show-arrows="computedPics.length > 1"
                  :show-arrows-on-hover="computedPics.length > 1"
                  :cycle="false"
                  :height="groupProp ? 300 : '100%'"
                  class="mb-3 white"
                >
                  <template
                    v-slot:prev="{ on, attrs }"
                  >
                  <v-btn
                    icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>
                      fas fa-chevron-left
                    </v-icon>
                  </v-btn>
                  </template>
                  <template
                    v-slot:next="{ on, attrs }"
                  >
                  <v-btn
                    icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>
                      fas fa-chevron-right
                    </v-icon>
                  </v-btn>
                  </template>
                  <v-carousel-item
                    v-for="pic in computedPics"
                    :key="pic.url"
                  >
                    <v-img
                      :height="groupProp ? 300 : 500"
                      :src="s3 + pic.url"
                      :contain="groupProp ? false : true"
                      :alt="$t('groupTitlePic')"
                      :title="pic.credit ? '© ' + pic.credit : ''"
                    ></v-img>
                  </v-carousel-item>
                </v-carousel>
              </v-card-text>
            </v-col>
          </v-row>
          <!-- If private group - only visible for members -->
          <template
            v-if="
              computedGroup.visibility === 'public' ||
              (
                computedGroupStatus &&
                computedGroupStatus.isMember
              ) ||
              (
                user &&
                user.role === 'admins'
              )"
          >
            <!-- Not visible in preview -->
            <template
              v-if="!groupProp"
            >
              <!-- Group discussions grid -->
              <template
                v-if="
                  !computedCategory &&
                  computedGroup.prominentCategories &&
                  computedGroup.prominentCategories.length > 0
                "
              >
                <v-divider
                  class="mx-4 mt-8 mb-10"
                ></v-divider>
                <v-row>
                  <v-col
                    class="mx-6 title"
                  >
                    {{$t('prominentCategories')}}
                  </v-col>
                </v-row>
                <v-row
                  class="mx-1"
                >
                  <v-col
                    v-for="(cat, i) in getCategories(computedGroup.prominentCategories)"
                    :key="i"
                  >
                    <v-card
                      height="100%"
                      @click="$router.push({ name: 'GroupSelection', params: { group: computedGroup._id, category: cat._id } })"
                    >
                      <v-container
                        fluid
                        class="fill-height"
                      >
                        <v-row
                          class="align-self-start"
                        >
                          <v-img
                            :src="cat.pic ? s3 + cat.pic.url: ''"
                            height="200px"
                            width="100%"
                            :title="cat.pic ? cat.pic.credit : ''"
                          ></v-img>
                          <v-col
                            class="px-0 pb-0"
                          >
                            <v-card-title
                              class="word-wrap"
                            >
                              {{cat.name}}
                            </v-card-title>
                          </v-col>
                          <v-col
                            class="pb-0 shrink right-text align-self-center"
                          >
                            <v-btn
                              class="customPurple--text"
                              @click="$router.push({ name: 'GroupSelection', params: { group: computedGroup._id, category: cat._id } })"
                            >
                              {{$t('viewButton')}}
                              <v-icon
                                class="ml-3"
                                size="18"
                              >
                                fas fa-arrow-right
                              </v-icon>
                            </v-btn>
                          </v-col>
                          <v-col
                            cols="12"
                            class="pb-4 px-4 body-1 black--text"
                          >
                            {{cat.description}}
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card>
                  </v-col>
                </v-row>
              </template>
              <template
                v-if="!computedCategory"
              >
                <v-divider
                  class="mb-9 mt-10 mx-6"
                ></v-divider>
                <v-row>
                  <v-col
                    class="mx-6 title"
                  >
                    {{$t('allDiscussions')}}
                  </v-col>
                </v-row>
              </template>
              <!-- New discussion button -->
              <v-row
                v-if="
                  !computedCategory &&
                  user &&
                  computedGroupStatus &&
                  computedGroupStatus.isMember
                "
                class="mx-1"
              >
                <v-col
                  class="text-right"
                >
                    <v-btn
                      dark
                      :to="{ name: 'GroupDiscussionEditor', params: { group: computedGroup._id } }"
                      color="customPurple"
                    >
                      {{$t('newDiscussion')}}
                      <v-icon
                        class="ml-3"
                        size="18"
                      >
                        fas fa-plus
                      </v-icon>
                    </v-btn>
                </v-col>
              </v-row>
              <!-- Group discussions list -->
              <v-row
                class="mx-1"
              >
                <v-col>
                  <DiscussionsList
                    :group="computedGroup"
                    :category="computedCategory"
                  ></DiscussionsList>
                </v-col>
              </v-row>
            </template>
            <!-- File list only on detail view for groups with files -->
            <template
              v-if="!groupProp && computedGroup && computedGroup.files && computedGroup.files.length > 0"
            >
              <v-divider
                class="mt-8 mb-10"
              ></v-divider>
              <v-row>
                <v-col>
                  <FileDownloadList
                    :groupStatus="computedGroupStatus"
                    :files="computedGroup.files"
                  ></FileDownloadList>
                </v-col>
              </v-row>
            </template>
          </template>
          <!-- Hint for non-members -->
          <template
            v-else-if="!groupProp"
          >
            <v-divider
              class="mt-8 mb-10"
            ></v-divider>
            <v-row>
              <v-col>
                <v-alert
                  dark
                  icon="fas fa-info-circle"
                  color="customPurple"
                >
                  <v-row>
                    <v-col>
                      {{$t('onlyMembers')}}
                    </v-col>
                  </v-row>
                </v-alert>
              </v-col>
            </v-row>
          </template>
        </v-col>
      </v-row>
      <!-- View more button -->
      <v-row
        class="align-self-end"
      >
        <v-col>
          <v-card-actions
            class="pb-4 grow"
            v-if="groupProp"
          >
            <v-btn
              large
              block
              class="customPurple--text"
              :to="{ name: 'Group', params: { group: computedGroup._id }}"
            >
              {{$t('viewButton')}}
              <v-icon
                class="ml-3"
                size="18"
                color="customPurple"
              >
                fas fa-arrow-right
              </v-icon>
            </v-btn>
          </v-card-actions>
        </v-col>
      </v-row>
    </v-container>
    <!-- Apply dialog -->
    <v-dialog
      v-model="showApplyDialog"
      max-width="600"
    >
      <v-card
        color="customGreyBg"
        tile
      >
        <v-card-text
          class="pa-8"
        >
          <template
            v-if="applicantDialogMode === 'message'"
          >
            <v-row>
              <v-col
                class="text-h5 font-weight-bold"
              >
                {{$t('applyMessageDialogTitle')}}
              </v-col>
            </v-row>
            <v-row>
              <v-col
                class="body-1"
              >
                {{$t('applyMessageDialogBody')}}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-textarea
                  :label="$t('writeNewMessage')"
                  v-model="message"
                  outlined
                  filled
                  auto-grow
                  multi-line
                  hide-details
                  background-color="#fff"
                  color="customGrey"
                >
                </v-textarea>
              </v-col>
            </v-row>
            <v-card-actions
              class="mt-8 pa-0"
            >
              <v-btn
                @click="showApplyDialog = false"
              >
                {{$t('cancelButton')}}
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                @click="applyForGroupMembership()"
                :dark="message ? true : false"
                color="customPurple"
                :loading="isLoading"
                :disabled="!message"
              >
                {{$t('sendButton')}}
              </v-btn>
            </v-card-actions>
          </template>
          <template
            v-else-if="applicantDialogMode === 'sent'"
          >
            <v-row>
              <v-col
                class="text-h5 font-weight-bold"
              >
                {{$t('applyDialogTitle')}}
              </v-col>
            </v-row>
            <v-row>
              <v-col
                class="body-1"
              >
                {{$t('applyDialogBody')}}
              </v-col>
            </v-row>
            <v-card-actions
              class="mt-6 pa-0"
            >
              <v-spacer></v-spacer>
              <v-btn
                @click="showApplyDialog = false"
                dark
                color="customPurple"
              >
                {{$t('understoodButton')}}
              </v-btn>
            </v-card-actions>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>

import DiscussionsList from '@/components/DiscussionsList.vue'
import FileDownloadList from '@/components/FileDownloadList.vue'
import { mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  name: 'GroupCard',

  components: {
    DiscussionsList,
    FileDownloadList
  },

  props: [
    'groupProp'
  ],

  data: () => ({
    picsCarousel: 0,
    message: undefined,
    isLoading: false,
    showApplyDialog: false,
    applicantDialogMode: 'message'
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('groups', {
      requestGroup: 'get'
    }),
    ...mapActions('status-container-helper', {
      createGroupApplication: 'create'
    }),
    truncatedDescription (text) {
      const len = 200
      text = this.$sanitize(text)
      text = text.replaceAll('<p>', '')
      text = text.replaceAll('</p>', '&nbsp;')
      var div = document.createElement('div')
      div.innerHTML = text
      let tmpStr = div.innerText
      if (tmpStr && tmpStr.length > len) {
        tmpStr = tmpStr.substr(0, len) + ' [...]'
      }
      return tmpStr
    },
    async applyForGroupMembership () {
      this.isLoading = true
      if (!this.computedStatusContainers || !this.computedStatusContainers.find(obj => obj.relation === 'applicant')) {
        try {
          await this.createGroupApplication(
            {
              type: 'createGroupApplication',
              groupId: this.computedGroup._id,
              message: this.message
            }
          )
          this.isLoading = false
          this.applicantDialogMode = 'sent'
        } catch (e) {
          this.isLoading = false
          this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'visibilityItems',
      'relationItems',
      'newTab',
      'getTags',
      'getCategories'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('groups', {
      getGroup: 'get'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('chat-messages', {
      getChatMessage: 'get'
    }),
    ...mapGetters('categories', {
      categories: 'list'
    }),
    computedCategory () {
      if (this.$route.params.category) {
        return this.getCategories([this.$route.params.category])[0]
      } else {
        return undefined
      }
    },
    computedGroupStatus () {
      if (this.computedStatusContainers) {
        if (this.computedStatusContainers.find(obj => obj.relation === 'owner')) {
          return this.relationItems.owner
        } if (this.computedStatusContainers.find(obj => obj.relation === 'moderator')) {
          return this.relationItems.moderator
        } else if (this.computedStatusContainers.find(obj => obj.relation === 'member')) {
          return this.relationItems.member
        } else if (this.computedStatusContainers.find(obj => obj.relation === 'invitation')) {
          return this.relationItems.invitation
        } else if (this.computedStatusContainers.find(obj => obj.relation === 'applicant')) {
          return this.relationItems.applicant
        } else {
          return undefined
        }
      } else {
        return undefined
      }
    },
    computedStatusContainers () {
      return this.statusContainers.filter(obj => obj.reference === this.computedGroup._id && obj.user === this.user._id)
    },
    computedPics () {
      if (this.computedGroup) {
        if (this.computedGroup.pics && this.computedGroup.pics.length > 0) {
          return this.computedGroup.pics
        } else if (this.computedGroup.categories) {
          return this.categories.filter(obj => this.computedGroup.categories.includes(obj._id) && obj.pic && obj.pic.url).map(obj => obj.pic)
        } else {
          return []
        }
      } else {
        return []
      }
    }
  },

  asyncComputed: {
    async computedGroup () {
      if (this.groupProp) {
        return this.groupProp
      } else {
        if (
          (
            this.$route.name === 'Group' ||
            this.$route.name === 'GroupSelection'
          ) &&
          this.$route.params.group &&
          !this.groupProp
        ) {
          let selectedGroup = this.getGroup(this.$route.params.group)
          if (!selectedGroup) {
            selectedGroup = await this.requestGroup(
              [
                this.$route.params.group
              ]
            )
          }
          return selectedGroup
        }
      }
    }
  },

  watch: {
    showApplyDialog () {
      this.applicantDialogMode = 'message'
      this.message = undefined
    }
  }
}
</script>
