<template>
  <div>
    <v-row>
      <v-col
        class="d-flex mx-3 mb-4"
      >
        <v-row>
          <span
            class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
          >
            {{$t('myInterestGroups')}}
          </span>
          <span
            v-if="user"
            class="my-3 mr-1"
          >
            <v-btn
              :to="{ name: 'GroupEditor' }"
              :color="$settings.modules.groups.color"
              class="text-white"
            >
              {{$t('newGroupButton')}}
              <v-icon
                class="ml-3"
                size="18"
                color="white"
              >
                fas fa-plus
              </v-icon>
            </v-btn>
          </span>
        </v-row>
      </v-col>
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
          :loading="isLoading"
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
            v-slot:[`item.moderators`]="{ item }"
          >
            <v-btn
              icon="fas fa-users"
              size="small"
              class="pr-1"
              :color="$settings.modules.groups.color"
              @click="moderatorsDialogItem = item"
              :disabled="
                !isOwnGroup(item._id) ||
                !item.accepted?.isAccepted
              "
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.members`]="{ item }"
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
                  (
                    !isOwnGroup(item._id) &&
                    !isModeratorGroup(item._id)
                  ) ||
                  !item.accepted?.isAccepted
                "
              >
              </v-btn>
            </v-badge>
          </template>
          <template
            v-slot:[`item.discussions`]="{ item }"
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
                :disabled="
                  (
                    !isOwnGroup(item._id) &&
                    !isModeratorGroup(item._id)
                  ) ||
                  !item.accepted?.isAccepted ||
                  !item.isActive
                "
              >
              </v-btn>
            </v-badge>
          </template>
          <template
            v-slot:[`item.violations`]="{ item }"
          >
            <v-badge
              :color="$settings.indicatorColor"
              :model-value="
                statusContainers.find(obj =>
                  obj.user === user._id &&
                  obj.type === 'groups' &&
                  obj.reference === item._id &&
                  obj.relation !== 'applicant' &&
                  obj.relation !== 'member'
                ) &&
                statusContainers.find(obj =>
                  obj.user === user._id &&
                  obj.type === 'groups' &&
                  obj.reference === item._id &&
                  obj.relation !== 'applicant' &&
                  obj.relation !== 'member'
                ).unread.filter(obj => obj.type === 'violations').length > 0
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
                      obj.type === 'groups' &&
                      obj.reference === item._id &&
                      obj.relation !== 'applicant' &&
                      obj.relation !== 'member'
                    ) ?
                    statusContainers.find(obj =>
                      obj.user === user._id &&
                      obj.type === 'groups' &&
                      obj.reference === item._id &&
                      obj.relation !== 'applicant' &&
                      obj.relation !== 'member'
                    ).unread.filter(obj => obj.type === 'violations').length
                    :
                    ''
                  }}
                </span>
              </template>
              <v-btn
                icon="fas fa-ban"
                size="small"
                :color="$settings.modules.groups.color"
                @click="violationsDialogItem = item"
                :disabled="
                  (
                    !isOwnGroup(item._id) &&
                    !isModeratorGroup(item._id)
                  ) ||
                  !item.accepted?.isAccepted
                "
              >
              </v-btn>
            </v-badge>
          </template>
          <template
            v-slot:[`item.files`]="{ item }"
          >
            <v-btn
              icon="fas fa-file"
              size="small"
              :color="$settings.modules.groups.color"
              @click="filesDialogItem = item"
              :disabled="
                (
                  !isOwnGroup(item._id) &&
                  !isModeratorGroup(item._id)
                ) ||
                !item.accepted?.isAccepted
              "
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.title.value`]="{ item }"
          >
            <TranslatableText
              ownField="title"
              :allFields="['title']"
              type="groups"
              :textParent="item"
              :allIds="
                computedGroups.map(
                  obj => ({
                    id: obj._id,
                    translationSum: obj.translationSum
                  })
                )
              "
            >
              <template
                v-slot:defaultLangText="{ computedText }"
              >
                <span
                  class="font-weight-bold"
                  v-html="$sanitize(computedText.value)"
                >
                </span>
              </template>
              <template
                v-slot:translatedLangText="{ computedText }"
              >
                <span
                  v-html="$sanitize(computedText.value)"
                >
                </span>
              </template>
            </TranslatableText>
          </template>
          <template
            v-slot:[`item.relation`]="{ item }"
          >
            <template
              v-if="computedGroupRelations[item._id].includes('invitation')"
            >
              <v-row>
                <v-col
                  class="text-center"
                >
                  <v-toolbar
                    color="transparent"
                  >
                  {{$t('invitation')}}:
                  <v-tooltip
                    bottom
                  >
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="success"
                        size="small"
                        icon="fas fa-check"
                        @click="acceptInvitation(item)"
                      >
                      </v-btn>
                    </template>
                    <span>
                      {{$t('accept')}}
                    </span>
                  </v-tooltip>
                  <v-tooltip
                    bottom
                  >
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="error"
                        size="small"
                        icon="fas fa-times"
                        @click="declineInvitation(item)"
                      >
                      </v-btn>
                    </template>
                    <span>
                      {{$t('decline')}}
                    </span>
                  </v-tooltip>
                  </v-toolbar>
                </v-col>
              </v-row>
            </template>
            <template
              v-else
            >
              <v-select
                density="compact"
                multiple
                chips
                closable-chips
                :items="computedRelationItems[item._id]"
                :model-value="computedGroupRelations[item._id]"
                @update:modelValue="changeGroupRelation($event, item)"
              >
              </v-select>
            </template>
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{ $moment(item.createdAt).format('DD.MM.YYYY, HH:mm') }} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.isActive`]="{ item }"
          >
            <v-btn
              variant="text"
              :icon="item.isActive ? 'fas fa-check-square' : 'far fa-square'"
              :color="$settings.modules.groups.color"
              :loading="loaders[item._id + 'isActive'] === true"
              :disabled="!isOwnGroup(item._id)"
              @click="changeGroupProperty(
                item._id,
                'isActive',
                !item.isActive
              )"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.accepted.isAccepted`]="{ item }"
          >
            <v-btn
              variant="text"
              :icon="item.accepted?.isAccepted ? 'fas fa-check-square' : 'far fa-square'"
              :color="$settings.modules.groups.color"
              disabled
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.edit`]="{ item }"
          >
            <v-btn
              icon="fa fa-pen"
              size="small"
              :color="$settings.modules.groups.color"
              class="my-4"
              :to="{name: 'GroupEditor', params: { id: item._id } }"
              :disabled="!isOwnGroup(item._id) && !isModeratorGroup(item._id)"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-btn
              icon="fa fa-trash"
              size="small"
              :color="$settings.modules.groups.color"
              class="my-4"
              :loading="loaders[item._id + 'delete'] === true"
              :disabled="!isOwnGroup(item._id)"
              @click="deleteGroup(item._id)"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.link`]="{ item }"
          >
            <v-btn
              icon="fa fa-arrow-right"
              size="small"
              :color="$settings.modules.groups.color"
              :disabled="
                !item.isActive ||
                !item.accepted?.isAccepted
              "
              :to="{name: 'Group', params: { group: item._id } }"
            >
            </v-btn>
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
                          <v-list-item-title
                            class="pointer"
                            @click="$router.push({name: 'User', params: { user: member._id}})"
                          >
                            {{member.userName}}
                            <span
                              v-for="(relation, i) of memberStatusContainers.filter(obj => obj.user === member._id && obj.relation !== 'member').map(obj => obj.relation)"
                              :key="i"
                            >
                              - {{$t(relationItems[relation].textKey)}}
                            </span>
                          </v-list-item-title>
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
                          <v-list-item-title
                            class="font-weight-bold"
                          >
                            {{member.userName}}
                          </v-list-item-title>
                          <v-list-item-title>
                            <i>{{$t('messageToGroup')}}</i> "{{memberStatusContainers.filter(obj => obj.relation === 'applicant')[i].customField}}"
                          </v-list-item-title>
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
                :group="discussionsDialogItem"
              ></DiscussionsList>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Violations dialog -->
    <v-dialog
      v-model="showViolationsDialog"
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
              {{$t('violations')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <ViolationsList
                :group="violationsDialogItem"
                :types="['groups']"
              ></ViolationsList>
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
import UserTable from '@/components/UserTable.vue'
import FileUploadEditor from '@/components/FileUploadEditor.vue'
import DiscussionsList from '@/components/DiscussionsList.vue'
import ViolationsList from '@/components/ViolationsList.vue'
import TranslatableText from '@/components/TranslatableText.vue'

export default {
  name: 'GroupList',

  components: {
    UserTable,
    FileUploadEditor,
    DiscussionsList,
    ViolationsList,
    TranslatableText
  },

  data: () => ({
    triggerReload: 1,
    isUpdating: false,
    membersTab: 0,
    filesDialogItem: undefined,
    showFilesDialog: false,
    membersDialogItem: undefined,
    showMembersDialog: false,
    discussionsDialogItem: undefined,
    showDiscussionsDialog: false,
    violationsDialogItem: undefined,
    showViolationsDialog: false,
    showModeratorsDialog: false,
    moderatorsDialogItem: undefined,
    possibleModerators: [],
    expandedStatusContainers: [],
    memberStatusContainers: [],
    loaders: {},
    initialView: true,
    groupsResponse: undefined,
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
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    ...mapActions('status-container-helper', {
      createGroupRelation: 'create',
      removeGroupRelation: 'remove',
      patchGroupNotifications: 'patch'
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
      this.isLoading = false
      setTimeout(async () => {
        await this.checkAcceptedGroups()
      }, 1000)
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
    itemRowBackground (props) {
      if (this.statusContainers.find(
        obj =>
          obj.reference === props.item._id &&
          obj.user === this.user._id &&
          (
            (obj.relation === 'owner' && obj.customField === 'accepted') ||
            (obj.relation === 'moderator' && obj.customField === 'new') ||
            (obj.relation === 'member' && obj.customField === 'new')
          )
      )
      ) {
        return { class: 'new' }
      } else {
        return {}
      }
    },
    async changeGroupProperty (groupId, property, value) {
      this.loaders[groupId + property] = true
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchGroup(
          [
            groupId,
            patchObj
          ]
        )
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[groupId + property] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[groupId + property] = undefined
      }
    },
    getOwnStatusContainersOfGroup (groupId) {
      return this.statusContainers.filter(obj => obj.reference === groupId && obj.user === this.user._id)
    },
    isOwnGroup (groupId) {
      return this.getOwnStatusContainersOfGroup(groupId).map(obj => obj.relation).includes('owner')
    },
    isModeratorGroup (groupId) {
      return this.getOwnStatusContainersOfGroup(groupId).map(obj => obj.relation).includes('moderator')
    },
    async checkAcceptedGroups () {
      const visibleGroups = this.computedGroups.map(obj => obj._id)
      const acceptedStatusContainers = this.statusContainers.filter(obj =>
        obj.user === this.user._id &&
        obj.type === 'groups' &&
        (
          (obj.relation === 'owner' && obj.customField === 'accepted') ||
          (obj.relation === 'moderator' && obj.customField === 'new') ||
          (obj.relation === 'member' && obj.customField === 'new') ||
          (obj.relation === 'invitation' && obj.customField === 'new')
        )
      ).map(obj => obj.reference)
      const groupIds = visibleGroups.filter(e => acceptedStatusContainers.indexOf(e) !== -1)
      if (groupIds.length > 0 && !this.isUpdating) {
        this.isUpdating = true
        await this.patchGroupNotifications(
          [
            'resetCustomField',
            {
              type: 'groups',
              relation: 'owner',
              customField: 'accepted',
              references: groupIds
            }
          ]
        )
        await this.patchGroupNotifications(
          [
            'resetCustomField',
            {
              type: 'groups',
              relation: 'moderator',
              customField: 'new',
              references: groupIds
            }
          ]
        )
        await this.patchGroupNotifications(
          [
            'resetCustomField',
            {
              type: 'groups',
              relation: 'member',
              customField: 'new',
              references: groupIds
            }
          ]
        )
        await this.patchGroupNotifications(
          [
            'resetCustomField',
            {
              type: 'groups',
              relation: 'invitation',
              customField: 'new',
              references: groupIds
            }
          ]
        )
        this.isUpdating = false
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
            user: { $ne: this.user._id },
            reference: this.moderatorsDialogItem._id,
            relation: { $in: ['member'] }
          }
        })
        this.possibleModerators = statusContainers.map(obj => this.getUser(obj.user))
      } else {
        this.possibleModerators = []
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'relationItems',
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder'
    ]),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('groups', {
      groups: 'list'
    }),
    computedCustomQuery () {
      return {
        _id: {
          $nin:
            this.memberStatusContainers.length > 0 && this.membersDialogItem
              ? this.memberStatusContainers.filter(obj => obj.reference === this.membersDialogItem._id).map(obj => obj.user).concat([this.user._id])
              : [this.user._id]
        }
      }
    },
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value' },
        { title: this.$t('role'), key: 'relation', minWidth: 200 },
        { title: this.$t('createdAt'), key: 'createdAt' },
        { title: this.$t('accepted'), key: 'accepted.isAccepted', align: 'center' },
        { title: this.$t('active'), key: 'isActive', align: 'center' },
        { title: this.$t('moderators'), key: 'moderators', align: 'center', sortable: false },
        { title: this.$t('manageMembersButton'), key: 'members', align: 'center', sortable: false },
        { title: this.$t('groupDiscussions'), key: 'discussions', align: 'center', sortable: false },
        { title: this.$t('violations'), key: 'violations', align: 'center', sortable: false },
        { title: this.$t('files'), key: 'files', align: 'center', sortable: false },
        { title: this.$t('editButton'), key: 'edit', align: 'center', sortable: false },
        { title: this.$t('deleteButton'), key: 'delete', align: 'center', sortable: false },
        { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false }
      ]
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
    computedExpandedModerators () {
      if (this.expandedStatusContainers) {
        return this.expandedStatusContainers.map(obj => this.getUser(obj.user))
      } else {
        return []
      }
    },
    computedGroupRelations () {
      const tmpGroupRelations = {}
      for (const group of this.computedGroups) {
        tmpGroupRelations[group._id] = this.statusContainers.filter(obj => obj.user === this.user._id && obj.reference === group._id).map(obj => obj.relation)
      }
      return tmpGroupRelations
    },
    groupsParams () {
      const query = {
        _id: { $in: this.statusContainers.filter(obj => obj.user === this.user._id && obj.type === 'groups').map(obj => obj.reference) },
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
    async membersTab () {
      if (
        this.membersTab === 3 &&
        this.membersDialogItem &&
        this.statusContainers.find(obj =>
          obj.reference === this.membersDialogItem._id &&
          obj.user === this.user._id &&
          obj.relation !== 'applicant' &&
          obj.relation !== 'member'
        ).unread.filter(obj => obj.type === 'users').length > 0
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
          ).unread.filter(obj => obj.type === 'discussions').length > 0
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
    },
    showViolationsDialog () {
      if (!this.showViolationsDialog) {
        this.violationsDialogItem = undefined
      }
    },
    violationsDialogItem () {
      if (this.violationsDialogItem) {
        this.showViolationsDialog = true
      } else {
        this.showViolationsDialog = false
      }
    },
    async groups () {
      await this.checkAcceptedGroups()
      this.triggerReload = Date.now()
    },
    statusContainers: {
      deep: true,
      async handler (newValue, oldValue) {
        await this.checkAcceptedGroups()
        if (this.moderatorsDialogItem) {
          const filteredModeratorNewValue = newValue.filter(obj =>
            obj.reference === this.moderatorsDialogItem._id &&
          obj.relation === 'moderator'
          )
          const filteredModeratorOldValue = oldValue.filter(obj =>
            obj.reference === this.moderatorsDialogItem._id &&
          obj.relation === 'moderator'
          )
          if (JSON.stringify(filteredModeratorNewValue) !== JSON.stringify(filteredModeratorOldValue)) {
            this.expandedModeratorsTrigger = Date.now()
          }
        }
        if (this.membersDialogItem) {
          const filteredMembershipNewValue = newValue.filter(obj =>
            obj.reference === this.membersDialogItem._id &&
            (
              obj.relation === 'member' ||
              obj.relation === 'applicant' ||
              obj.relation === 'owner' ||
              obj.relation === 'invitation'
            )
          )
          const filteredMembershipOldValue = oldValue.filter(obj =>
            obj.reference === this.membersDialogItem._id &&
            (
              obj.relation === 'member' ||
              obj.relation === 'applicant' ||
              obj.relation === 'owner' ||
              obj.relation === 'invitation'
            )
          )
          if (JSON.stringify(filteredMembershipNewValue) !== JSON.stringify(filteredMembershipOldValue)) {
            await this.loadMemberStatusContainers()
          }
        }
      }
    }
  }
}
</script>
