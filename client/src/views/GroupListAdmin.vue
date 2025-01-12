<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
        v-html="$t('adminView') + ' ' + $t('interestGroups')"
      >
      </span>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="queryObject.query"
          :label="$t('filterByTitleLabel')"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table-server
          v-if="!initialView"
          v-model:items-per-page="queryObject.itemsPerPage"
          v-model:page="queryObject.page"
          :sort-by="queryObject.sortBy"
          :headers="headers"
          :items-length="computedTotal"
          :items="computedGroups"
          :loading="loading"
          class="customGreyUltraLight pb-3 elevation-3"
          item-value="_id"
          @update:options="updateDataTableParams"
          sort-asc-icon="fas fa-caret-up"
          sort-desc-icon="fas fa-caret-down"
          :show-current-page="true"
          :must-sort="true"
          :row-props="itemRowBackground"
        >
          <template
            v-slot:[`item.title.value`]="{ item }"
          >
            <div
              class="font-weight-bold"
            >
              {{item.title.value}}
            </div>
          </template>
          <template
            v-slot:[`item.owner`]="{ item }"
          >
            {{item.owner?.user?.userName || ''}}
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{ $moment(item.createdAt).format('DD.MM.YYYY, HH:mm') }} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.visibility`]="{ item }"
          >
            <v-chip
              color="black"
            >
              {{$t(item.visibility + 'VisibilityTitle')}}
            </v-chip>
          </template>
          <template
            v-slot:[`item.categories`]="{ item }"
          >
            <v-chip
              variant="outlined"
              v-for="category in getCategories(item.categories)"
              :key="category._id"
              class="mr-1 mb-1"
              disabled
            >
            {{category.text.value}}
            </v-chip>
          </template>
          <template
            v-slot:[`item.tags`]="{ item }"
          >
            <v-chip
              v-for="tag in getTags(item.tags)"
              :key="tag._id"
              class="mr-1 mb-1"
              disabled
            >
            {{tag.text}}
            </v-chip>
          </template>
          <template
            v-slot:[`item.isActive`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    variant="text"
                    :icon="item.isActive ? 'fas fa-check-square' : 'far fa-square'"
                    :color="$settings.modules.groups.color"
                    :loading="loaders[item._id + 'isActive'] === true"
                    :disabled="user.role !== 'admins'"
                    @click="changeGroupsProperty(
                      item,
                      'isActive',
                      !item.isActive
                    )"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('active')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.accepted.isAccepted`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    variant="text"
                    :icon="item.accepted?.isAccepted ? 'fas fa-check-square' : 'far fa-square'"
                    :color="$settings.modules.groups.color"
                    :disabled="user.role !== 'admins' && user.role !== 'volunteers'"
                    :loading="loaders[item._id + 'accepted'] === true"
                    @click="changeGroupsProperty(
                      item,
                      'accepted',
                      {
                        isAccepted: item.accepted?.isAccepted ? false : true,
                        dt: new Date(),
                        user: user._id
                      }
                    )"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('accepted')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.moderators`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fas fa-users"
                    size="small"
                    class="pr-1"
                    :color="$settings.modules.groups.color"
                    @click="moderatorsDialogItem = item"
                    :disabled="
                      user.role !== 'admins' ||
                      !item.accepted?.isAccepted
                    "
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('moderators')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.members`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-badge
                    :color="$settings.indicatorColor"
                    :model-value="
                      statusContainers.find(obj =>
                        obj.user === user._id &&
                        obj.reference === item._id &&
                        obj.relation !== 'applicant' &&
                        obj.relation !== 'member'
                      ) &&
                      statusContainers.find(obj =>
                        obj.user === user._id &&
                        obj.reference === item._id &&
                        obj.relation !== 'applicant' &&
                        obj.relation !== 'member'
                      ).unread.filter(obj => obj.type === 'users').length > 0
                      ? true : false
                    "
                  >
                    <template v-slot:badge>
                      <span
                        class="text-customGrey font-weight-bold"
                      >
                        {{
                          statusContainers.find(
                            obj => obj.user === user._id &&
                            obj.reference === item._id &&
                            obj.relation !== 'applicant' &&
                            obj.relation !== 'member'
                          ) ?
                          statusContainers.find(
                            obj => obj.user === user._id &&
                            obj.reference === item._id &&
                            obj.relation !== 'applicant' &&
                            obj.relation !== 'member'
                          ).unread.filter(obj => obj.type === 'users').length
                          :
                          ''
                        }}
                      </span>
                    </template>
                    <v-btn
                      icon="fas fa-list"
                      size="small"
                      :color="$settings.modules.groups.color"
                      @click="membersDialogItem = item"
                      :disabled="
                        user.role !== 'admins' ||
                        !item.accepted?.isAccepted
                      "
                    >
                    </v-btn>
                  </v-badge>
                </span>
              </template>
              {{$t('manageMembersButton')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.discussions`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-badge
                    :color="$settings.indicatorColor"
                    :model-value="
                      statusContainers.find(obj =>
                        obj.user === user._id &&
                        obj.reference === item._id &&
                        obj.relation !== 'applicant' &&
                        obj.relation !== 'member'
                      ) &&
                      statusContainers.find(obj =>
                        obj.user === user._id &&
                        obj.reference === item._id &&
                        obj.relation !== 'applicant' &&
                        obj.relation !== 'member'
                      ).unread.filter(obj => obj.type === 'discussions').length > 0
                      ? true : false
                    "
                  >
                    <template v-slot:badge>
                      <span
                        class="text-customGrey font-weight-bold"
                      >
                        {{
                          statusContainers.find(obj =>
                            obj.user === user._id &&
                            obj.reference === item._id &&
                            obj.relation !== 'applicant' &&
                            obj.relation !== 'member'
                          ) ?
                          statusContainers.find(obj =>
                            obj.user === user._id &&
                            obj.reference === item._id &&
                            obj.relation !== 'applicant' &&
                            obj.relation !== 'member'
                          ).unread.filter(obj => obj.type === 'discussions').length
                          :
                          ''
                        }}
                      </span>
                    </template>
                    <v-btn
                      icon="fas fa-comments"
                      size="small"
                      class="pr-1"
                      :color="$settings.modules.groups.color"
                      @click="discussionsDialogItem = item"
                      :disabled="user.role !== 'admins'"
                    >
                    </v-btn>
                  </v-badge>
                </span>
              </template>
              {{$t('groupDiscussions')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.files`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fas fa-file"
                    size="small"
                    :color="$settings.modules.groups.color"
                    @click="filesDialogItem = item"
                    :disabled="user.role !== 'admins'"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('files')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.edit`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fa fa-pen"
                    size="small"
                    :color="$settings.modules.groups.color"
                    class="my-4"
                    :to="{name: 'GroupEditor', params: { id: item._id } }"
                    :disabled="user.role !== 'admins'"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('editButton')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fa fa-trash"
                    size="small"
                    :color="$settings.modules.groups.color"
                    class="my-4"
                    :loading="loaders[item._id + 'delete'] === true"
                    @click="deleteGroup(item._id)"
                    :disabled="user.role !== 'admins'"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('deleteButton')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.link`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fa fa-arrow-right"
                    size="small"
                    :color="$settings.modules.groups.color"
                    class="my-4"
                    :to="{name: 'Group', params: { group: item._id } }"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('viewButton')}}
            </v-tooltip>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
    <!-- Members dialog -->
    <v-dialog
      v-model="showMembersDialog"
      max-width="1200"
    >
      <v-card
        tile
      >
        <v-card-text>
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('manageGroupMembers')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-toolbar
                color="customGreyUltraLight"
                flat
              >
              <v-tabs
                :color="$settings.modules.groups.color"
                v-model="membersTab"
              >
                <v-tab>{{$t('currentGroupMembers')}}</v-tab>
                <v-tab>
                  {{$t('inviteGroupMembers')}}
                </v-tab>
                <v-tab>
                  {{$t('invited')}}
                </v-tab>
                <v-tab>
                  {{$t('openGroupApplicants')}}
                  <span
                    v-if="membersDialogItem && statusContainers.filter(obj => obj.reference === membersDialogItem._id && obj.relation === 'applicant').length > 0"
                    class="ml-1"
                  >
                    ({{membersDialogItem ? statusContainers.filter(obj => obj.reference === membersDialogItem._id && obj.relation === 'applicant').length : ''}})
                  </span>
                </v-tab>
              </v-tabs>
              </v-toolbar>
              <v-window
                v-model="membersTab"
              >
                <v-window-item>
                  <v-card flat>
                    <v-card-text>
                      <v-list
                        v-if="memberStatusContainers.length > 0"
                      >
                        <v-list-item
                          v-for="member in memberStatusContainers.filter(obj => obj.relation === 'member' || obj.relation === 'owner').map(obj => getUser(obj.user))"
                          :key="member._id"
                        >
                          <template v-slot:prepend>
                            <v-avatar
                              class="my-2"
                              color="customGreyLight"
                              size="40"
                            >
                              <v-img
                                v-if="member.pic"
                                :src="s3 + member.pic.url"
                                :alt="$t('userPic')"
                                :title="member.pic.credit ? '© ' + member.pic.credit : ''"
                              >
                              </v-img>
                              <v-icon
                                v-else
                                color="white"
                                size="18"
                              >
                                fas fa-user
                              </v-icon>
                            </v-avatar>
                          </template>
                          <div
                            class="pointer font-weight-bold"
                            @click="$router.push({name: 'User', params: { user: member._id}})"
                          >
                            {{member.userName}}
                            <span
                              v-for="(relation, i) of memberStatusContainers.filter(obj => obj.user === member._id && obj.relation !== 'member').map(obj => obj.relation)"
                              :key="i"
                            >
                              - {{$t(relationItems[relation].textKey)}}
                            </span>
                          </div>
                          <template v-slot:append
                            v-if="!memberStatusContainers.find(obj => obj.user === member._id && obj.relation === 'owner')"
                          >
                            <v-btn
                              @click="removeMember(member)"
                              icon="fas fa-times"
                              soze="small"
                              :color="$settings.modules.groups.color"
                            >
                            </v-btn>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-window-item>
                <v-window-item>
                  <v-card
                    flat
                    color="transparent"
                  >
                    <v-card-text>
                      <UserTable
                        :customActionText="$t('invite')"
                        customActionIcon="fas fa-plus"
                        :customColor="$settings.modules.groups.color"
                        :customQuery="
                          computedCustomQuery
                        "
                        @update:customAction="inviteMember"
                      ></UserTable>
                    </v-card-text>
                  </v-card>
                </v-window-item>
                <v-window-item>
                  <v-card
                    flat
                    color="transparent"
                    v-if="memberStatusContainers.length > 0"
                  >
                    <v-card-text>
                      <UserTable
                        :customActionText="$t('remove')"
                        customActionIcon="fas fa-times"
                        :customColor="$settings.modules.groups.color"
                        :customQuery="
                          {
                            _id: { $in: memberStatusContainers.filter(obj => obj.relation === 'invitation').map(obj => obj.user) }
                          }
                        "
                        @update:customAction="removeMember"
                      ></UserTable>
                    </v-card-text>
                  </v-card>
                </v-window-item>
                <v-window-item>
                  <v-card flat>
                    <v-card-text>
                      <v-list
                        v-if="memberStatusContainers.length > 0"
                      >
                        <v-list-item
                          v-for="(member, i) in memberStatusContainers.filter(obj => obj.relation === 'applicant').map(obj => getUser(obj.user))"
                          :key="member._id"
                        >
                          <template v-slot:prepend>
                            <v-avatar
                              class="my-2"
                              color="customGreyLight"
                              size="40"
                            >
                              <v-img
                                v-if="member.pic"
                                :src="s3 + member.pic.url"
                                :alt="$t('userPic')"
                                :title="member.pic.credit ? '© ' + member.pic.credit : ''"
                              >
                              </v-img>
                              <v-icon
                                v-else
                                color="white"
                                size="18"
                              >
                                fas fa-user
                              </v-icon>
                            </v-avatar>
                          </template>
                          <div
                            class="font-weight-bold"
                          >
                            {{member.userName}}
                          </div>
                          <div>
                            <i>{{$t('messageToGroup')}}</i> "{{memberStatusContainers.filter(obj => obj.relation === 'applicant')[i].customField}}"
                          </div>
                          <v-list-item-action
                            class="py-3"
                          >
                            <v-btn
                              @click="acceptMember(member)"
                              class="mr-3"
                              icon="fas fa-check"
                              size="x-small"
                              :color="$settings.modules.groups.color"
                            >
                            </v-btn>
                            <v-btn
                              @click="removeMember(member)"
                              icon="fas fa-times"
                              size="x-small"
                              :color="$settings.modules.groups.color"
                            >
                            </v-btn>
                          </v-list-item-action>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-window-item>
              </v-window>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Files dialog -->
    <v-dialog
      v-model="showFilesDialog"
      max-width="600"
    >
      <v-card
        tile
      >
        <v-card-text>
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('manageGroupFiles')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <FileUploadEditor
                :group="filesDialogItem"
              >
              </FileUploadEditor>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Discussions dialog -->
    <v-dialog
      v-model="showDiscussionsDialog"
      max-width="1200"
    >
      <v-card
        tile
      >
        <v-card-text>
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('manageGroupDiscussions')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <DiscussionsList
                :preventFilters="true"
                :isAcceptList="false"
                :group="discussionsDialogItem"
              ></DiscussionsList>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Moderators dialog -->
    <v-dialog
      v-model="showModeratorsDialog"
    >
      <v-card>
        <v-card-text>
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('moderators')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                item-title="userName"
                item-value="_id"
                :items="possibleModerators"
                :model-value="computedExpandedModerators"
                @update:modelValue="changeExpandedModerators"
                multiple
                :label="$t('possibleGroupModeratorsHint')"
                chips
                closable-chips
              >
              </v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'
import DiscussionsList from '@/components/DiscussionsList.vue'
import FileUploadEditor from '@/components/FileUploadEditor.vue'
import UserTable from '@/components/UserTable.vue'

export default {
  name: 'GroupListAdmin',

  components: {
    UserTable,
    DiscussionsList,
    FileUploadEditor
  },

  data: () => ({
    initialView: true,
    loaders: {},
    loading: true,
    isUpdating: false,
    groupsResponse: undefined,
    membersTab: 0,
    filesDialogItem: undefined,
    showFilesDialog: false,
    membersDialogItem: undefined,
    showMembersDialog: false,
    discussionsDialogItem: undefined,
    showDiscussionsDialog: false,
    showModeratorsDialog: false,
    moderatorsDialogItem: undefined,
    possibleModerators: [],
    expandedStatusContainers: [],
    memberStatusContainers: [],
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'createdAt', order: 'desc' }]
    }
  }),

  async mounted () {
    await this.adaptQuery()
    setTimeout(async () => {
      await this.checkAcceptedGroups()
    }, 1000)
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('groups', {
      patchGroup: 'patch',
      removeGroup: 'remove',
      findGroups: 'find'
    }),
    ...mapActions('status-container-helper', {
      createGroupRelation: 'create',
      removeGroupRelation: 'remove',
      patchGroupNotifications: 'patch'
    }),
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    async updateDataTableParams (e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query
        }
        this.updateQueryQuery(this.queryObject.query)
        this.updateQueryPage(this.queryObject.page)
        this.updateQueryItemsPerPage(e.itemsPerPage)
        if (e.sortBy[0]) {
          this.updateQuerySortBy(e.sortBy[0].key)
          this.updateQuerySortOrder(e.sortBy[0].order)
        }
      }
    },
    async loadDataTableEntities () {
      this.loading = true
      this.groupsResponse = await this.findGroups(
        this.groupsParams
      )
      this.loading = false
      setTimeout(async () => {
        await this.checkAcceptedGroups()
      }, 1000)
    },
    async changeExpandedModerators (newExpandedModerators) {
      const oldExpandedModerators = JSON.parse(JSON.stringify(this.computedExpandedModerators))
      const newExpandedModeratorIds = newExpandedModerators.map(obj => { return (typeof obj === 'object' ? obj._id : obj) })
      const oldExpandedModeratorIds = oldExpandedModerators.map(obj => { return (typeof obj === 'object' ? obj._id : obj) })
      if (newExpandedModeratorIds.length > oldExpandedModeratorIds.length) {
        let user = newExpandedModeratorIds.filter(e => !oldExpandedModeratorIds.includes(e))[0]
        if (user) {
          if (typeof user === 'object') {
            user = user._id
          }
          try {
            await this.createGroupRelation(
              {
                type: 'createGroupModeration',
                userId: user,
                groupId: this.moderatorsDialogItem._id
              }
            )
            await this.loadExpandedStatusContainers()
            this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          } catch (e) {
            this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
          }
        }
      } else if (newExpandedModeratorIds.length < oldExpandedModeratorIds.length) {
        let user = oldExpandedModeratorIds.filter(e => !newExpandedModeratorIds.includes(e))[0]
        if (user) {
          if (typeof user === 'object') {
            user = user._id
          }
          try {
            await this.removeGroupRelation(
              [
                this.moderatorsDialogItem._id,
                {
                  query: {
                    type: 'removeGroupModeration',
                    userId: user
                  }
                }
              ]
            )
            await this.loadExpandedStatusContainers()
            this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          } catch (e) {
            this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
          }
        }
      }
    },
    async loadMemberStatusContainers () {
      if (this.membersDialogItem) {
        this.memberStatusContainers = await this.findStatusContainers({
          query: {
            reference: this.membersDialogItem._id
          }
        })
      } else {
        this.memberStatusContainers = []
      }
    },
    async loadExpandedStatusContainers () {
      if (this.moderatorsDialogItem) {
        this.expandedStatusContainers = await this.findStatusContainers({
          query: {
            reference: this.moderatorsDialogItem._id,
            relation: 'moderator'
          }
        })
      } else {
        this.expandedStatusContainers = []
      }
    },
    async loadPossibleModerators () {
      if (this.moderatorsDialogItem) {
        const statusContainers = await this.findStatusContainers({
          query: {
            reference: this.moderatorsDialogItem._id,
            relation: { $in: ['member'] }
          }
        })
        this.possibleModerators = statusContainers.map(obj => this.getUser(obj.user))
      } else {
        this.possibleModerators = []
      }
    },
    async removeMember (user) {
      try {
        await this.removeGroupRelation(
          [
            this.membersDialogItem._id,
            {
              query: {
                type: 'removeGroupMembership',
                userId: user._id
              }
            }
          ]
        )
        await this.loadMemberStatusContainers()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async inviteMember (user) {
      try {
        await this.createGroupRelation(
          {
            type: 'createGroupInvitation',
            userId: user._id,
            groupId: this.membersDialogItem._id
          }
        )
        await this.loadMemberStatusContainers()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async declineInvitation (group) {
      try {
        await this.removeGroupRelation(
          [
            group._id,
            {
              query: {
                type: 'removeGroupMembership',
                userId: this.user._id
              }
            }
          ]
        )
        await this.loadMemberStatusContainers()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async acceptInvitation (group) {
      try {
        await this.createGroupRelation(
          {
            type: 'acceptGroupInvitation',
            groupId: group._id
          }
        )
        await this.loadMemberStatusContainers()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async acceptMember (user) {
      try {
        await this.createGroupRelation(
          {
            type: 'acceptGroupApplication',
            userId: user._id,
            groupId: this.membersDialogItem._id
          }
        )
        await this.loadMemberStatusContainers()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async changeGroupRelation (newRelations, group) {
      const oldRelations = this.computedGroupRelations[group._id]
      if (newRelations.length < oldRelations.length) {
        const relation = oldRelations.filter(e => !newRelations.includes(e))[0]
        if (relation) {
          try {
            if (relation === 'member' || relation === 'applicant') {
              await this.removeGroupRelation(
                [
                  group._id,
                  {
                    query: {
                      type: 'removeGroupMembership',
                      userId: this.user._id
                    }
                  }
                ]
              )
              this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
            } else if (relation === 'moderator') {
              await this.removeGroupRelation(
                [
                  group._id,
                  {
                    query: {
                      type: 'removeGroupModeration',
                      userId: this.user._id
                    }
                  }
                ]
              )
            }
          } catch (e) {
            this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
          }
        }
      }
    },
    async deleteGroup (id) {
      this.loaders[id + 'delete'] = true
      try {
        await this.removeGroup(id)
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.loaders[id + 'delete'] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.loaders[id + 'delete'] = undefined
      }
    },
    itemRowBackground (props) {
      if (
        this.adminGroupStatusContainer &&
        this.adminGroupStatusContainer.unread &&
        this.adminGroupStatusContainer.unread.map(unread => unread.id).includes(props.item._id)
      ) {
        return { class: 'new' }
      } else {
        return {}
      }
    },
    async checkAcceptedGroups () {
      const visibleGroups = this.computedGroups.map(obj => obj._id)
      let adminGroups = []
      if (this.adminGroupStatusContainer && this.adminGroupStatusContainer.unread) {
        adminGroups = this.adminGroupStatusContainer.unread.map(unread => unread.id)
      }
      const groupIds = visibleGroups.filter(e => adminGroups.indexOf(e) !== -1)
      if (groupIds.length > 0 && !this.isUpdating) {
        this.isUpdating = true
        await this.patchGroupNotifications(
          [
            'pullUnreadById',
            {
              containerId: this.adminGroupStatusContainer._id,
              ids: groupIds
            }
          ]
        )
        this.isUpdating = false
      }
    },
    async changeGroupsProperty (group, property, value) {
      this.loaders[group._id + property] = true
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchGroup(
          [
            group._id,
            patchObj
          ]
        )
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[group._id + property] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[group._id + property] = undefined
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'relationItems',
      'getTags',
      'getCategories',
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('groups', {
      groups: 'list'
    }),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value' },
        { title: this.$t('accepted'), key: 'accepted.isAccepted', align: 'center' },
        { title: this.$t('active'), key: 'isActive', align: 'center' },
        { title: this.$t('moderators'), key: 'moderators', align: 'center', sortable: false },
        { title: this.$t('manageMembersButton'), key: 'members', align: 'center', sortable: false },
        { title: this.$t('groupDiscussions'), key: 'discussions', align: 'center', sortable: false },
        { title: this.$t('files'), key: 'files', align: 'center', sortable: false },
        { title: this.$t('editButton'), key: 'edit', align: 'center', sortable: false },
        { title: this.$t('deleteButton'), key: 'delete', align: 'center', sortable: false },
        { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false },
        { title: this.$t('author'), key: 'owner' },
        { title: this.$t('visibility'), key: 'visibility' },
        { title: this.$t('createdAt'), key: 'createdAt' }
      ]
    },
    groupsParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      if (this.queryObject.query) {
        query.title = {
          $elemMatch: {
            $and: [
              { value: { $regex: this.queryObject.query, $options: 'i' } },
              { type: 'default' }
            ]
          }
        }
      }
      return {
        query
      }
    },
    adminGroupStatusContainer () {
      return this.statusContainers.find(obj => obj.user === this.user._id && obj.type === 'groups' && obj.relation === 'admin')
    },
    computedExpandedModerators () {
      if (this.expandedStatusContainers) {
        return this.expandedStatusContainers.map(obj => this.getUser(obj.user))
      } else {
        return []
      }
    },
    computedRelationItems () {
      const tmpRelationItems = {}
      for (const group of this.computedGroups) {
        const items = []
        const tmpItems = JSON.parse(JSON.stringify(this.relationItems))
        delete tmpItems.subscribe
        delete tmpItems.subscriber
        delete tmpItems.apply
        if (this.isOwnGroup(group._id)) {
          delete tmpItems.moderator
          delete tmpItems.member
        } else {
          delete tmpItems.owner
        }
        if (this.getOwnStatusContainersOfGroup(group._id).map(obj => obj.relation).includes('applicant')) {
          delete tmpItems.member
        } else {
          delete tmpItems.applicant
        }
        if (!this.getOwnStatusContainersOfGroup(group._id).map(obj => obj.relation).includes('moderator')) {
          delete tmpItems.moderator
        }
        if (!this.getOwnStatusContainersOfGroup(group._id).map(obj => obj.relation).includes('invitation')) {
          delete tmpItems.invitation
        }
        for (const key of Object.keys(tmpItems)) {
          items.push({
            value: key,
            title: this.$t(this.relationItems[key].textKey),
            props: { disabled: key === 'owner' }
          })
        }
        tmpRelationItems[group._id] = items
      }
      return tmpRelationItems
    },
    computedCustomQuery () {
      return {
        _id: {
          $nin:
            this.memberStatusContainers.length > 0 && this.membersDialogItem
              ? this.memberStatusContainers.filter(obj => obj.reference === this.membersDialogItem._id).map(obj => obj.user)
              : []
        }
      }
    },
    computedGroups () {
      if (this.groupsResponse && this.groupsResponse.data) {
        return this.groupsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.groupsResponse) {
        return this.groupsResponse.total
      } else {
        return 0
      }
    },
    computedLimit () {
      if (this.queryObject.itemsPerPage === -1) {
        return 1000000
      } else {
        return this.queryObject.itemsPerPage
      }
    },
    computedSkip () {
      let tmpSkip = 0
      if (this.queryObject.itemsPerPage !== -1) {
        tmpSkip = this.queryObject.itemsPerPage
      }
      return (this.queryObject.page - 1) * tmpSkip
    },
    computedSortOrder () {
      if (this.queryObject.sortBy[0].order === 'desc') {
        return 1
      } else {
        return -1
      }
    }
  },

  watch: {
    'queryObject.query' () {
      this.updateQueryQuery(this.queryObject.query)
    },
    groupsParams: {
      deep: true,
      async handler (newValue, oldValue) {
        if (
          !this.initialView &&
          JSON.stringify(newValue) !== JSON.stringify(oldValue)
        ) {
          await this.loadDataTableEntities()
        }
      }
    },
    statusContainers: {
      deep: true,
      async handler () {
        await this.checkAcceptedGroups()
      }
    },
    async membersTab () {
      if (
        this.membersTab === 3 &&
        this.membersDialogItem &&
        this.statusContainers.find(obj =>
          obj.reference === this.membersDialogItem._id &&
          obj.user === this.user._id &&
          obj.relation !== 'applicant' &&
          obj.relation !== 'member'
        )?.unread.filter(obj => obj.type === 'users').length > 0
      ) {
        const containerId = this.statusContainers
          .find(obj =>
            obj.type === 'groups' &&
            obj.reference === this.membersDialogItem._id &&
            obj.user === this.user._id &&
            obj.relation !== 'applicant' &&
            obj.relation !== 'member'
          )._id
        await this.patchGroupNotifications(
          [
            'pullUnreadByType',
            {
              containerId,
              type: 'users'
            }
          ]
        )
      }
    },
    showModeratorsDialog () {
      if (!this.showModeratorsDialog) {
        this.moderatorsDialogItem = undefined
      }
    },
    async moderatorsDialogItem () {
      if (this.moderatorsDialogItem) {
        this.showModeratorsDialog = true
        await this.loadExpandedStatusContainers()
        await this.loadPossibleModerators()
      } else {
        this.showModeratorsDialog = false
      }
    },
    showMembersDialog () {
      if (!this.showMembersDialog) {
        this.membersDialogItem = undefined
      }
    },
    async membersDialogItem (newValue, oldValue) {
      if (this.membersDialogItem) {
        await this.loadMemberStatusContainers()
        this.showMembersDialog = true
      } else {
        this.showMembersDialog = false
        // Pull member notification
        if (
          this.membersTab === 3 &&
          this.statusContainers.find(obj =>
            obj.reference === oldValue._id &&
            obj.user === this.user._id &&
            obj.relation !== 'applicant' &&
            obj.relation !== 'member'
          ).unread.filter(obj => obj.type === 'users').length > 0
        ) {
          const containerId = this.statusContainers
            .find(obj =>
              obj.type === 'groups' &&
              obj.reference === oldValue._id &&
              obj.user === this.user._id &&
              obj.relation !== 'applicant' &&
              obj.relation !== 'member'
            )._id
          await this.patchGroupNotifications(
            [
              'pullUnreadByType',
              {
                containerId,
                type: 'users'
              }
            ]
          )
        }
      }
    },
    showFilesDialog () {
      if (!this.showFilesDialog) {
        this.filesDialogItem = undefined
      }
    },
    filesDialogItem () {
      if (this.filesDialogItem) {
        this.showFilesDialog = true
      } else {
        this.showFilesDialog = false
      }
    },
    async showDiscussionsDialog () {
      if (!this.showDiscussionsDialog) {
        this.discussionsDialogItem = undefined
      } else {
        // Pull discussion notification
        if (
          this.statusContainers.find(obj =>
            obj.reference === this.discussionsDialogItem._id &&
            obj.user === this.user._id &&
            obj.relation !== 'applicant' &&
            obj.relation !== 'member'
          )?.unread.filter(obj => obj.type === 'discussions').length > 0
        ) {
          const containerId = this.statusContainers
            .find(obj =>
              obj.type === 'groups' &&
              obj.reference === this.discussionsDialogItem._id &&
              obj.user === this.user._id &&
              obj.relation !== 'applicant' &&
              obj.relation !== 'member'
            )._id
          await this.patchGroupNotifications(
            [
              'pullUnreadByType',
              {
                containerId,
                type: 'discussions'
              }
            ]
          )
        }
      }
    },
    discussionsDialogItem () {
      if (this.discussionsDialogItem) {
        this.showDiscussionsDialog = true
      } else {
        this.showDiscussionsDialog = false
      }
    }
  }
}
</script>
