<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('myInterestGroups')}}
      </v-col>
      <v-col
        class="text-right"
      >
        <v-btn
          dark
          :to="{ name: 'GroupEditor' }"
          color="customPurple"
        >
          {{$t('newGroupButton')}}
          <v-icon
            class="ml-3"
            size="18"
          >
            fas fa-plus
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="searchOwn"
          :label="$t('filterByTitleLabel')"
          outlined
          dense
          hide-details
          color="black"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          :item-class="itemRowBackground"
          item-key="_id"
          single-expand
          :expanded.sync="expanded"
          show-expand
          class="customGreyBg elevation-3"
          :headers="headers"
          :items="computedGroups"
          :loading="loading"
          @update:page="updatePage"
          @update:items-per-page="updateItemsPerPage"
          @update:sort-by="updateSortBy"
          @update:sort-desc="updateSortDesc"
          :server-items-length="total"
          must-sort
          :page.sync="page"
          :items-per-page.sync="itemsPerPage"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :footer-props="{ itemsPerPageText: '' }"
        >
          <template
            v-slot:progress
          >
            <v-progress-linear
              indeterminate
              color="customPurple"
            ></v-progress-linear>
          </template>
          <template
            v-slot:[`item.data-table-expand`]="{ expand, isExpanded, item }"
          >
            <v-btn
              fab
              small
              color="customPurple"
              @click="expand(!isExpanded)"
              :disabled="!isOwnGroup(item._id) || !item.accepted || !item.accepted.isAccepted"
            >
              <v-icon
                color="white"
                size="18"
              >
                {{ isExpanded ? 'fas fa-chevron-up' : 'fas fa-users' }}
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.members`]="{ item }"
          >
            <v-badge
              overlap
              color="customLimeBg"
              :value="
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
              <template slot="badge">
                <span
                  class="customGrey--text font-weight-bold"
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
                fab
                small
                color="customPurple"
                @click="membersDialogItem = item"
                :disabled="
                  (
                    !isOwnGroup(item._id) &&
                    !isModeratorGroup(item._id)
                  ) ||
                  !item.accepted ||
                  !item.accepted.isAccepted
                "
              >
                <v-icon
                  color="white"
                  size="18"
                >
                  fas fa-list
                </v-icon>
              </v-btn>
            </v-badge>
          </template>
          <template
            v-slot:[`item.discussions`]="{ item }"
          >
            <v-badge
              overlap
              color="customLimeBg"
              :value="
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
              <template slot="badge">
                <span
                  class="customGrey--text font-weight-bold"
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
                fab
                small
                color="customPurple"
                @click="discussionsDialogItem = item"
                :disabled="
                  (
                    !isOwnGroup(item._id) &&
                    !isModeratorGroup(item._id)
                  ) ||
                  !item.accepted ||
                  !item.accepted.isAccepted ||
                  !item.isActive
                "
              >
                <v-icon
                  color="white"
                  size="18"
                >
                  fas fa-comments
                </v-icon>
              </v-btn>
            </v-badge>
          </template>
          <template
            v-slot:[`item.violations`]="{ item }"
          >
            <v-badge
              overlap
              color="customLimeBg"
              :value="
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
              <template slot="badge">
                <span
                  class="customGrey--text font-weight-bold"
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
                fab
                small
                color="customPurple"
                @click="violationsDialogItem = item"
                :disabled="
                  (
                    !isOwnGroup(item._id) &&
                    !isModeratorGroup(item._id)
                  ) ||
                  !item.accepted ||
                  !item.accepted.isAccepted
                "
              >
                <v-icon
                  color="white"
                  size="18"
                >
                  fas fa-ban
                </v-icon>
              </v-btn>
            </v-badge>
          </template>
          <template
            v-slot:[`item.files`]="{ item }"
          >
            <v-btn
              fab
              small
              color="customPurple"
              @click="filesDialogItem = item"
              :disabled="
                (
                  !isOwnGroup(item._id) &&
                  !isModeratorGroup(item._id)
                ) ||
                !item.accepted ||
                !item.accepted.isAccepted
              "
            >
              <v-icon
                color="white"
                size="18"
              >
                fas fa-file
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.title`]="{ item }"
          >
            <span
              class="font-weight-bold"
            >
              {{item.title}}
            </span>
          </template>
          <template
            v-slot:[`item.relation`]="{ item }"
          >
            <template
              v-if="computedGroupRelations[item._id].includes('invitation')"
            >
              <v-row>
                <v-col
                  class="align-self-center shrink"
                >
                  {{$t('invitation')}}:
                </v-col>
                <v-col
                  class="text-center"
                >
                  <v-tooltip
                    bottom
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        color="success"
                        small
                        icon
                        @click="acceptInvitation(item)"
                      >
                        <v-icon>
                          fas fa-check
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>
                      {{$t('accept')}}
                    </span>
                  </v-tooltip>
                  <v-tooltip
                    bottom
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        color="error"
                        small
                        icon
                        @click="declineInvitation(item)"
                      >
                        <v-icon>
                          fas fa-times
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>
                      {{$t('decline')}}
                    </span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </template>
            <template
              v-else
            >
              <v-select
                color="customPurple"
                item-color="customPurple"
                multiple
                chips
                deletable-chips
                :items="computedRelationItems[item._id]"
                :value="computedGroupRelations[item._id]"
                @change="changeGroupRelation($event, item)"
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
              icon
              color="customPurple"
              :loading="loaders[item._id + 'isActive'] === true"
              :disabled="!isOwnGroup(item._id)"
              @click="changeGroupProperty(
                item._id,
                'isActive',
                !item.isActive
              )"
            >
              <template
                slot="loader"
              >
                <v-progress-circular
                  color="white"
                  width="3"
                  indeterminate
                ></v-progress-circular>
              </template>
              <v-icon>
                {{item.isActive ? 'fas fa-check-square' : 'far fa-square'}}
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.accepted.isAccepted`]="{ item }"
          >
            <v-btn
              icon
              color="customPurple"
              disabled
              :loading="loaders[item._id + 'accepted'] === true"
              @click="changeGroupProperty(
                item._id,
                'accepted',
                {
                  isAccepted: item.accepted ? !item.accepted.isAccepted : true,
                  dt: new Date(),
                  user: user._id
                }
              )"
            >
              <template
                slot="loader"
              >
                <v-progress-circular
                  color="white"
                  width="3"
                  indeterminate
                ></v-progress-circular>
              </template>
              <v-icon>
                {{item.accepted && item.accepted.isAccepted ? 'fas fa-check-square' : 'far fa-square'}}
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.edit`]="{ item }"
          >
            <v-btn
              fab
              small
              color="customPurple"
              class="my-4"
              :to="{name: 'GroupEditor', params: { id: item._id } }"
              :disabled="!isOwnGroup(item._id)"
            >
              <v-icon
                color="white"
                size="18"
              >
                fa fa-pen
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-btn
              fab
              small
              color="customPurple"
              class="my-4"
              :loading="loaders[item._id + 'delete'] === true"
              :disabled="!isOwnGroup(item._id)"
              @click="deleteGroup(item._id)"
            >
              <template
                slot="loader"
              >
                <v-progress-circular
                  color="white"
                  width="3"
                  indeterminate
                ></v-progress-circular>
              </template>
              <v-icon
                color="white"
                size="18"
              >
                fa fa-trash
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.link`]="{ item }"
          >
            <v-btn
              fab
              small
              color="customPurple"
              :disabled="
                !item.isActive ||
                !item.accepted ||
                !item.accepted.isAccepted
              "
              :to="{name: 'Group', params: { group: item._id } }"
            >
              <v-icon
                color="white"
                size="18"
              >
                fa fa-arrow-right
              </v-icon>
            </v-btn>
          </template>
          <template v-slot:expanded-item="{ headers }">
            <td :colspan="headers.length" class="pa-4">
              <v-row>
                <v-col>
                  <v-card>
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <v-select
                            item-text="userName"
                            item-value="_id"
                            :items="computedPossibleModerators"
                            :value="computedExpandedModerators"
                            @change="changeExpandedModerators"
                            color="customPurple"
                            item-color="customPurple"
                            multiple
                            :label="$t('possibleGroupModeratorsHint')"
                            chips
                            deletable-chips
                          >
                          </v-select>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </td>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <!-- Members dialog -->
    <v-dialog
      v-model="showMembersDialog"
      max-width="1200"
    >
      <v-card
        color="customGreyBg"
        tile
      >
        <v-card-text
          class="pa-8"
        >
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
                color="customGreyBg"
                flat
              >
              <v-tabs
                color="customPurple"
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
              <v-tabs-items v-model="membersTab">
                <v-tab-item>
                  <v-card flat>
                    <v-card-text>
                      <v-list
                        v-if="computedMemberStatusContainers"
                      >
                        <v-list-item
                          v-for="member in computedMemberStatusContainers.filter(obj => obj.relation === 'member' || obj.relation === 'owner').map(obj => getUser(obj.user))"
                          :key="member._id"
                        >
                          <v-list-item-avatar
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
                          </v-list-item-avatar>
                          <v-list-item-content>
                            <v-list-item-title
                              class="pointer"
                              @click="$router.push({name: 'User', params: { user: member._id}})"
                            >
                              {{member.userName}}
                              <span
                                v-for="(relation, i) of computedMemberStatusContainers.filter(obj => obj.user === member._id && obj.relation !== 'member').map(obj => obj.relation)"
                                :key="i"
                              >
                                - {{$t(relationItems[relation].textKey)}}
                              </span>
                            </v-list-item-title>
                          </v-list-item-content>
                          <v-list-item-action
                            v-if="!computedMemberStatusContainers.find(obj => obj.user === member._id && obj.relation === 'owner')"
                          >
                            <v-btn
                              @click="removeMember(member)"
                              fab
                              small
                              dark
                              color="customPurple"
                            >
                              <v-icon
                                size="18"
                              >
                                fas fa-times
                              </v-icon>
                            </v-btn>
                          </v-list-item-action>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card
                    flat
                    color="transparent"
                  >
                    <v-card-text>
                      <UserTable
                        :customActionText="$t('invite')"
                        customActionIcon="fas fa-plus"
                        customColor="customPurple"
                        :customQuery="
                          computedCustomQuery
                        "
                        @customAction="inviteMember"
                      ></UserTable>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card
                    flat
                    color="transparent"
                    v-if="computedMemberStatusContainers"
                  >
                    <v-card-text>
                      <UserTable
                        :customActionText="$t('remove')"
                        customActionIcon="fas fa-times"
                        customColor="customPurple"
                        :customQuery="
                          {
                            _id: { $in: computedMemberStatusContainers.filter(obj => obj.relation === 'invitation').map(obj => obj.user) }
                          }
                        "
                        @customAction="removeMember"
                      ></UserTable>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card flat>
                    <v-card-text>
                      <v-list
                        v-if="computedMemberStatusContainers"
                      >
                        <v-list-item
                          v-for="(member, i) in computedMemberStatusContainers.filter(obj => obj.relation === 'applicant').map(obj => getUser(obj.user))"
                          :key="member._id"
                        >
                          <v-list-item-avatar
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
                          </v-list-item-avatar>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{member.userName}}
                            </v-list-item-title>
                            <v-list-item-title>
                              {{$t('messageToGroup')}} "{{computedMemberStatusContainers.filter(obj => obj.relation === 'applicant')[i].customField}}"
                            </v-list-item-title>
                          </v-list-item-content>
                          <v-list-item-action>
                            <v-btn
                              @click="acceptMember(member)"
                              fab
                              small
                              dark
                              color="customPurple"
                            >
                              <v-icon
                                size="18"
                              >
                                fas fa-check
                              </v-icon>
                            </v-btn>
                          </v-list-item-action>
                          <v-list-item-action>
                            <v-btn
                              @click="removeMember(member)"
                              fab
                              small
                              dark
                              color="customPurple"
                            >
                              <v-icon
                                size="18"
                              >
                                fas fa-times
                              </v-icon>
                            </v-btn>
                          </v-list-item-action>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Files dialog -->
    <v-dialog
      v-model="showFilesDialog"
      max-width="800"
    >
      <v-card
        color="customGreyBg"
        tile
      >
        <v-card-text
          class="pa-8"
        >
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
      max-width="800"
    >
      <v-card
        color="customGreyBg"
        tile
      >
        <v-card-text
          class="pa-8"
        >
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
                :isAcceptList="true"
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
        color="customGreyBg"
        tile
      >
        <v-card-text
          class="pa-8"
        >
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
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'
import UserTable from '@/components/UserTable.vue'
import FileUploadEditor from '@/components/FileUploadEditor.vue'
import DiscussionsList from '@/components/DiscussionsList.vue'
import ViolationsList from '@/components/ViolationsList.vue'

export default {
  name: 'GroupList',

  components: {
    UserTable,
    FileUploadEditor,
    DiscussionsList,
    ViolationsList
  },

  data: () => ({
    triggerReload: 1,
    isUpdating: false,
    membersTrigger: 1,
    membersTab: 0,
    filesDialogItem: undefined,
    showFilesDialog: false,
    membersDialogItem: undefined,
    showMembersDialog: false,
    discussionsDialogItem: undefined,
    showDiscussionsDialog: false,
    violationsDialogItem: undefined,
    showViolationsDialog: false,
    expandedModeratorsTrigger: 1,
    isSending: false,
    expanded: [],
    loaders: {},
    searchOwn: '',
    page: 1,
    loading: true,
    itemsPerPage: 5,
    sortBy: ['createdAt'],
    sortDesc: [true]
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
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
    async deleteGroup (id) {
      this.$set(this.loaders, id + 'delete', true)
      try {
        await this.removeGroup(id)
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.$set(this.loaders, id + 'delete', undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.$set(this.loaders, id + 'delete', undefined)
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
        this.membersTrigger = Date.now()
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
        this.membersTrigger = Date.now()
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
        this.membersTrigger = Date.now()
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
        this.membersTrigger = Date.now()
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
        this.membersTrigger = Date.now()
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
                groupId: this.expanded[0]._id
              }
            )
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
                this.expanded[0]._id,
                {
                  query: {
                    type: 'removeGroupModeration',
                    userId: user
                  }
                }
              ]
            )
            this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          } catch (e) {
            this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
          }
        }
      }
    },
    itemRowBackground (item) {
      if (this.statusContainers.find(
        obj =>
          obj.reference === item._id &&
          obj.user === this.user._id &&
          (
            (obj.relation === 'owner' && obj.customField === 'accepted') ||
            (obj.relation === 'moderator' && obj.customField === 'new') ||
            (obj.relation === 'member' && obj.customField === 'new')
          )
      )
      ) {
        return 'new'
      } else {
        return ''
      }
    },
    async changeGroupProperty (groupId, property, value) {
      this.$set(this.loaders, groupId + property, true)
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchGroup(
          [
            groupId,
            patchObj
          ]
        )
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$set(this.loaders, groupId + property, undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.$set(this.loaders, groupId + property, undefined)
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
    initQuery () {
      // Process query
      if (this.$route.query.i) {
        this.itemsPerPage = parseInt(this.$route.query.i)
      }
      if (this.$route.query.p) {
        this.page = parseInt(this.$route.query.p)
      }
      if (this.$route.query.s) {
        this.sortBy = this.$route.query.s.split(',')
      }
      if (this.$route.query.d) {
        const tmpDesc = this.$route.query.d.split(',')
        for (let i = 0; i < tmpDesc.length; i++) {
          if (tmpDesc[i] === 'true') {
            tmpDesc[i] = true
          } else if (tmpDesc[i] === 'false') {
            tmpDesc[i] = false
          }
        }
        this.sortDesc = tmpDesc
      }
    },
    goToPage (i) {
      this.skip = this.itemsPerPage * (i - 1)
    },
    updatePage (data) {
      if (parseInt(this.$route.query.p) !== data) {
        this.$router.replace(
          {
            query: {
              p: data,
              i: this.itemsPerPage,
              s: this.sortBy.join(','),
              d: this.sortDesc.join(',')
            }
          }
        )
      }
    },
    updateItemsPerPage (data) {
      if (parseInt(this.$route.query.i) !== data) {
        this.$router.replace(
          {
            query: {
              p: this.page,
              i: data,
              s: this.sortBy.join(','),
              d: this.sortDesc.join(',')
            }
          }
        )
      }
    },
    updateSortBy (data) {
      let tmpData
      if (Array.isArray(data)) {
        tmpData = data.join(',')
      } else {
        tmpData = data
      }
      if (data && this.$route.query.s !== tmpData) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: tmpData,
            d: this.sortDesc.join(',')
          }
        })
      } else if (!data) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc.join(',')
          }
        })
      }
    },
    updateSortDesc (data) {
      let tmpData
      if (Array.isArray(data)) {
        tmpData = data.join(',')
      } else {
        tmpData = data
      }
      if (data && this.$route.query.d !== tmpData) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: this.sortBy.join(','),
            d: tmpData
          }
        })
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'relationItems',
      'deepSort'
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
        _id: { $nin: this.computedMemberStatusContainers && this.membersDialogItem ? this.computedMemberStatusContainers.filter(obj => obj.reference === this.membersDialogItem._id).map(obj => obj.user).concat([this.user._id]) : [this.user._id] }
      }
    },
    headers () {
      return [
        { text: this.$t('title'), value: 'title' },
        { text: this.$t('role'), value: 'relation' },
        { text: this.$t('createdAt'), value: 'createdAt' },
        { text: this.$t('accepted'), value: 'accepted.isAccepted', align: 'center' },
        { text: this.$t('active'), value: 'isActive', align: 'center' },
        { text: this.$t('moderators'), value: 'data-table-expand', align: 'center', sortable: false },
        { text: this.$t('manageMembersButton'), value: 'members', align: 'center', sortable: false },
        { text: this.$t('groupDiscussions'), value: 'discussions', align: 'center', sortable: false },
        { text: this.$t('violations'), value: 'violations', align: 'center', sortable: false },
        { text: this.$t('files'), value: 'files', align: 'center', sortable: false },
        { text: this.$t('editButton'), value: 'edit', align: 'center', sortable: false },
        { text: this.$t('deleteButton'), value: 'delete', align: 'center', sortable: false },
        { text: this.$t('viewButton'), value: 'link', align: 'center', sortable: false }
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
            text: this.$t(this.relationItems[key].textKey),
            disabled: key === 'owner'
          })
        }
        tmpRelationItems[group._id] = items
      }
      return tmpRelationItems
    },
    computedExpandedModerators () {
      if (this.computedExpandedStatusContainers) {
        return this.computedExpandedStatusContainers.map(obj => this.getUser(obj.user))
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
        $skip: (this.page - 1) * this.computedSkip,
        $sort: { [this.sortBy]: this.computedSortDesc }
      }
      if (this.searchOwn && this.searchOwn !== '') {
        query.title = { $regex: this.searchOwn, $options: 'i' }
      }
      return query
    },
    computedGroups () {
      if (this.groupsResponse) {
        return this.groupsResponse.data
      } else {
        return []
      }
    },
    total () {
      if (this.groupsResponse) {
        return this.groupsResponse.total
      } else {
        return 0
      }
    },
    computedLimit () {
      if (this.itemsPerPage === -1) {
        return 1000000
      } else {
        return this.itemsPerPage
      }
    },
    computedSkip () {
      if (this.itemsPerPage === -1) {
        return 0
      } else {
        return this.itemsPerPage
      }
    },
    computedSortDesc () {
      if (this.sortDesc[0] === true) {
        return 1
      } else {
        return -1
      }
    }
  },

  asyncComputed: {
    async computedPossibleModerators () {
      if (this.expanded[0]) {
        const statusContainers = await this.findStatusContainers({
          query: {
            user: { $ne: this.user._id },
            reference: this.expanded[0]._id,
            relation: { $in: ['moderator', 'member'] }
          }
        })
        return statusContainers.map(obj => this.getUser(obj.user))
      } else {
        return []
      }
    },
    async computedExpandedStatusContainers () {
      const expandedGroups = this.expanded[0]
      if (expandedGroups && this.expandedModeratorsTrigger) {
        return await this.findStatusContainers({
          query: {
            reference: expandedGroups._id,
            relation: 'moderator'
          }
        })
      } else {
        return []
      }
    },
    async computedMemberStatusContainers () {
      if (this.membersDialogItem && this.membersTrigger) {
        return await this.findStatusContainers({
          query: {
            reference: this.membersDialogItem._id
          }
        })
      } else {
        return []
      }
    },
    async groupsResponse () {
      if (this.triggerReload) {
        this.loading = true
        const groups = await this.findGroups(
          {
            query: this.groupsParams
          }
        )
        this.loading = false
        return groups
      }
    }
  },

  watch: {
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
    showMembersDialog () {
      if (!this.showMembersDialog) {
        this.membersDialogItem = undefined
      }
    },
    async membersDialogItem (newValue, oldValue) {
      if (this.membersDialogItem) {
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
    async showViolationsDialog () {
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
        if (this.expanded[0]) {
          const filteredModeratorNewValue = newValue.filter(obj =>
            obj.reference === this.expanded[0]._id &&
          obj.relation === 'moderator'
          )
          const filteredModeratorOldValue = oldValue.filter(obj =>
            obj.reference === this.expanded[0]._id &&
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
            this.membersTrigger = Date.now()
          }
        }
      }
    }
  }
}
</script>
