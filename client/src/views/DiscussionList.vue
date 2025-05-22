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
            {{$t('myDiscussionsDetail')}}
          </span>
          <span
            v-if="user?.role === 'admin'"
            class="my-3 mr-3"
          >
            <v-btn
              :to="{ name: 'DiscussionEditor' }"
              :color="computedColor"
              class="text-white"
            >
              {{$t('newDiscussion')}}
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
      <v-col
        cols="12"
        sm="3"
      >
        <v-text-field
          v-model="queryObject.query"
          :label="$t('filterByTitleLabel')"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-select
          v-model="queryObject.type"
          :label="$t('discussionType')"
          density="compact"
          hide-details
          :items="discussionTypes"
        ></v-select>
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-checkbox
          :label="$t('bookmarksOnly')"
          density="compact"
          hide-details
          v-model="queryObject.role"
        ></v-checkbox>
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-checkbox
          :label="$t('newDiscussionMessages')"
          density="compact"
          hide-details
          v-model="queryObject.checkbox"
        ></v-checkbox>
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
          :items="computedDiscussions"
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
            <span
              class="font-weight-bold"
            >
              {{item.title.value}}
            </span>
          </template>
          <template
            v-slot:[`item.bookmark`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    variant="text"
                    :icon="statusContainers.find(obj =>
                      obj.reference === item._id &&
                      obj.user === user._id &&
                      obj.type === 'discussions' &&
                      obj.customField === 'bookmark') ? 'fas fa-bookmark' : 'far fa-bookmark'
                    "
                    :color="computedColor"
                    :loading="loaders[item._id + 'bookmark'] === true"
                    @click="changeDiscussionBookmark(item._id)"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('bookmark')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.relation`]="{ item }"
          >
            <v-select
              density="compact"
              multiple
              chips
              closable-chips
              :items="computedRelationItems[item._id]"
              :model-value="computedDiscussionRelations[item._id]"
              @update:modelValue="changeDiscussionRelation($event, item)"
            >
            </v-select>
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{ $moment(item.createdAt).format('DD.MM.YYYY, HH:mm') }} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.group`]="{ item }"
          >
            <div>
              {{getGroup(item.group) ? getGroup(item.group).title.value : '-'}}
            </div>
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
                    :color="computedColor"
                    :loading="loaders[item._id + 'isActive'] === true"
                    :disabled="
                      !isOwnDiscussion(item._id) ||
                      (
                        item.group &&
                        !statusContainers.find(obj =>
                          obj.type === 'groups' &&
                          obj.reference === item.group &&
                          (
                            obj.relation === 'owner' ||
                            obj.relation === 'member'
                          )
                        )
                      )
                    "
                    @click="changeDiscussionProperty(
                      item._id,
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
                    :color="computedColor"
                    disabled
                    :loading="loaders[item._id + 'accepted'] === true"
                    @click="changeDiscussionProperty(
                      item._id,
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
                    :color="computedColor"
                    class="my-4"
                    :to="
                      item.group ?
                        { name: 'GroupDiscussionEditor', params: { group: item.group, id: item._id } } :
                        { name: 'DiscussionEditor', params: { id: item._id } }
                      "
                    :disabled="
                      !isOwnDiscussion(item._id) ||
                      (
                        item.group &&
                        !statusContainers.find(obj =>
                          obj.type === 'groups' &&
                          obj.reference === item.group &&
                          (
                            obj.relation === 'owner' ||
                            obj.relation === 'member'
                          )
                        )
                      )
                    "
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
                    :color="computedColor"
                    class="my-4"
                    :disabled="!isOwnDiscussion(item._id)"
                    :loading="loaders[item._id + 'delete'] === true"
                    @click="deleteDiscussion(item._id)"
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
                  <span class="d-flex align-center">
                    <v-btn
                      icon="fa fa-arrow-right"
                      size="small"
                      class="mr-1"
                      :color="computedColor"
                      :disabled="
                        !item.isActive ||
                        !item.accepted ||
                        item.accepted.isAccepted !== true ||
                        (
                          getGroup(item.group) &&
                          (
                            !getGroup(item.group).isActive ||
                            !getGroup(item.group).accepted ||
                            !getGroup(item.group).accepted.isAccepted
                          )
                        )
                      "
                      :to="
                        item.group ?
                          { name: 'GroupDiscussion', params: { group: item.group, id: item._id } } :
                          { name: 'Discussion', params: { id: item._id } }
                        "
                    >
                    </v-btn>
                    <v-chip
                      :color="$settings.indicatorColor"
                      size="small"
                      variant="flat"
                      v-if="getOwnStatusContainersOfDiscussion(item._id).find(obj => obj.relation === 'subscriber')?.unread?.length > 0"
                    >
                      <div class="text-customGrey">
                        <v-icon class="mr-1">fas fa-comment-dots</v-icon>
                        {{getOwnStatusContainersOfDiscussion(item._id).find(obj => obj.relation === 'subscriber').unread.length}}
                      </div>
                    </v-chip>
                    <v-chip
                      :color="$settings.indicatorColor"
                      size="small"
                      variant="flat"
                      v-if="getOwnStatusContainersOfDiscussion(item._id).find(obj => obj.relation === 'mentions')?.unread?.length > 0"
                    >
                      <div class="text-customGrey">
                        <v-icon class="mr-1">fas fa-at</v-icon>
                        {{getOwnStatusContainersOfDiscussion(item._id).find(obj => obj.relation === 'mentions').unread.length}}
                      </div>
                    </v-chip>
                  </span>
                </span>
              </template>
              {{$t('viewButton')}}
            </v-tooltip>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'DiscussionList',

  components: {
  },

  data: () => ({
    isUpdating: false,
    loaders: {},
    loading: true,
    discussionTypes: [],
    initialView: true,
    discussionsResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'createdAt', order: 'desc' }],
      type: 'all',
      role: true,
      checkbox: false
    }
  }),

  async mounted () {
    this.discussionTypes = this.getDiscussionTypes()
    await this.adaptQuery()
    setTimeout(async () => {
      await this.checkAcceptedDiscussions()
    }, 1000)
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('discussions', {
      patchDiscussion: 'patch',
      removeDiscussion: 'remove',
      findDiscussions: 'find'
    }),
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    ...mapActions('status-container-helper', {
      createDiscussionSubscription: 'create',
      removeDiscussionSubscription: 'remove',
      patchDiscussionNotifications: 'patch'
    }),
    async updateDataTableParams (e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query,
          type: this.queryObject.type,
          role: this.queryObject.role,
          checkbox: this.queryObject.checkbox
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
      this.discussionsResponse = await this.findDiscussions(
        this.discussionsParams
      )
      this.loading = false
      setTimeout(async () => {
        await this.checkAcceptedDiscussions()
      }, 1000)
    },
    async deleteDiscussion (id) {
      this.loaders[id + 'delete'] = true
      try {
        await this.removeDiscussion(id)
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.loaders[id + 'delete'] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.loaders[id + 'delete'] = undefined
      }
    },
    async changeDiscussionRelation (newRelations, discussion) {
      const oldRelations = this.computedDiscussionRelations[discussion._id]
      // Add new relation
      if (newRelations.length > oldRelations.length) {
        const relation = newRelations.filter(e => !oldRelations.includes(e))[0]
        if (relation) {
          try {
            await this.createDiscussionSubscription(
              {
                type: 'createDiscussionSubscription',
                discussionId: discussion._id
              }
            )
            this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          } catch (e) {
            this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
          }
        }
      } else if (newRelations.length < oldRelations.length) {
        const relation = oldRelations.filter(e => !newRelations.includes(e))[0]
        if (relation) {
          try {
            await this.removeDiscussionSubscription(
              [
                discussion._id,
                {
                  query: {
                    type: 'removeDiscussionSubscription'
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
    itemRowBackground (props) {
      if (this.statusContainers.find(
        obj =>
          obj.reference === props.item._id &&
          obj.user === this.user._id &&
          (
            (obj.relation === 'owner' && obj.customField === 'accepted')
          )
      )
      ) {
        return { class: 'new' }
      } else {
        if (this.queryObject.type === 'all') {
          if (props.item.group) {
            return { class: this.$settings.modules.groups.bgColor }
          } else {
            return { class: this.$settings.modules.discussions.bgColor }
          }
        } else {
          return {}
        }
      }
    },
    async changeDiscussionBookmark (discussionId) {
      this.loaders[discussionId + 'bookmark'] = true
      const statusContainer = this.statusContainers.find(obj =>
        obj.reference === discussionId &&
        obj.user === this.user._id &&
        obj.type === 'discussions'
      )
      try {
        await this.patchDiscussionNotifications([
          'setCustomField',
          {
            containerId: statusContainer._id,
            customField: statusContainer.customField === 'bookmark' ? undefined : 'bookmark'
          }
        ])
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[discussionId + 'bookmark'] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[discussionId + 'bookmark'] = undefined
      }
    },
    async changeDiscussionProperty (discussionId, property, value) {
      this.loaders[discussionId + property] = true
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchDiscussion(
          [
            discussionId,
            patchObj
          ]
        )
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[discussionId + property] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[discussionId + property] = undefined
      }
    },
    getOwnStatusContainersOfDiscussion (discussionId) {
      return this.statusContainers.filter(obj => obj.reference === discussionId && obj.user === this.user._id)
    },
    isOwnDiscussion (discussionId) {
      return this.getOwnStatusContainersOfDiscussion(discussionId).map(obj => obj.relation).includes('owner')
    },
    async checkAcceptedDiscussions () {
      const visibleDiscussions = this.computedDiscussions.map(obj => obj._id)
      const acceptedStatusContainers = this.statusContainers.filter(obj =>
        obj.user === this.user._id &&
        obj.type === 'discussions' &&
        (
          (obj.relation === 'owner' && obj.customField === 'accepted')
        )
      ).map(obj => obj.reference)
      const discussionIds = visibleDiscussions.filter(e => acceptedStatusContainers.indexOf(e) !== -1)
      if (discussionIds.length > 0 && !this.isUpdating) {
        this.isUpdating = true
        await this.patchDiscussionNotifications(
          [
            'resetCustomField',
            {
              type: 'discussions',
              relation: 'owner',
              customField: 'accepted',
              references: discussionIds
            }
          ]
        )
        this.isUpdating = false
      }
    },
    getDiscussionTypes () {
      const tmpTypes = []
      if (this.$settings.modules.discussions.isActive) {
        tmpTypes.push({ title: this.$t('discussionForums'), value: 'discussions' })
      }
      if (this.$settings.modules.groups.isActive) {
        tmpTypes.push({ title: this.$t('groupDiscussions'), value: 'groups' })
      }
      if (tmpTypes.length > 1) {
        tmpTypes.unshift({ title: this.$t('allDiscussions'), value: 'all' })
      }
      return tmpTypes
    }
  },

  computed: {
    ...mapGetters([
      'relationItems',
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder',
      'updateQueryType',
      'updateQueryRole',
      'updateQueryCheckbox'
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
      getGroup: 'get'
    }),
    computedColor () {
      if (
        this.$settings.modules[this.queryObject.type] &&
        this.$settings.modules[this.queryObject.type].color
      ) {
        return this.$settings.modules[this.queryObject.type].color
      } else {
        return 'customGrey'
      }
    },
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value' },
        { title: this.$t('bookmark'), key: 'bookmark', sortable: false },
        { title: this.$t('role'), key: 'relation', minWidth: 200 },
        { title: this.$t('createdAt'), key: 'createdAt' },
        { title: this.$t('group'), key: 'group', sortable: false },
        { title: this.$t('accepted'), key: 'accepted.isAccepted', align: 'center' },
        { title: this.$t('active'), key: 'isActive', align: 'center' },
        { title: this.$t('editButton'), key: 'edit', align: 'center', sortable: false },
        { title: this.$t('deleteButton'), key: 'delete', align: 'center', sortable: false },
        { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false }
      ]
    },
    computedRelationItems () {
      const tmpRelationItems = {}
      for (const discussion of this.computedDiscussions) {
        const items = []
        const tmpItems = JSON.parse(JSON.stringify(this.relationItems))
        delete tmpItems.applicant
        delete tmpItems.member
        delete tmpItems.apply
        delete tmpItems.mentions
        delete tmpItems.subscribe
        delete tmpItems.moderator
        delete tmpItems.invitation
        if (!this.isOwnDiscussion(discussion._id)) {
          delete tmpItems.owner
        }
        for (const key of Object.keys(tmpItems)) {
          items.push({
            value: key,
            title: this.$t(this.relationItems[key].textKey),
            props: { disabled: key === 'owner' }
          })
        }
        tmpRelationItems[discussion._id] = items
      }
      return tmpRelationItems
    },
    computedDiscussionRelations () {
      const tmpDiscussionRelations = {}
      for (const discussion of this.computedDiscussions) {
        tmpDiscussionRelations[discussion._id] = this.statusContainers
          .filter(obj => obj.user === this.user._id && obj.reference === discussion._id).map(obj => obj.relation)
          .filter(obj => obj !== 'mentions')
      }
      return tmpDiscussionRelations
    },
    discussionsParams () {
      let ids = this.statusContainers.filter(
        obj =>
          obj.user === this.user._id &&
              obj.type === 'discussions'
      ).map(obj => obj.reference)

      if (this.queryObject.role) {
        const discussionIdsWithBookmarks = this.statusContainers.filter(
          obj =>
            obj.user === this.user._id &&
          obj.type === 'discussions' &&
          obj.customField === 'bookmark'
        ).map(obj => obj.reference)

        ids = ids.filter(id => discussionIdsWithBookmarks.includes(id))
      }

      if (this.queryObject.checkbox) {
        const discussionIdsWithNewMessages = this.statusContainers?.filter(item =>
          item.user === this.user._id &&
        item.type === 'discussions' &&
        item.relation === 'subscriber' &&
        item.unread.length > 0
        ).map(item => item.reference)

        ids = ids.filter(id => discussionIdsWithNewMessages.includes(id))
      }

      const query = {
        _id: {
          $in: ids
        },
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      if (this.queryObject.type === 'discussions') {
        query.group = null
      } else if (this.queryObject.type === 'groups') {
        query.group = { $exists: true, $ne: null }
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
      // Adapt query to show discussions if active and accepted and group active and accepted if user is member of hidden group
      return {
        query
      }
    },
    computedDiscussions () {
      if (this.discussionsResponse && this.discussionsResponse.data) {
        return this.discussionsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.discussionsResponse) {
        return this.discussionsResponse.total
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
    async 'queryObject.type' () {
      this.updateQueryType(this.queryObject.type)
      await this.loadDataTableEntities()
    },
    async 'queryObject.role' () {
      this.updateQueryRole(this.queryObject.role)
      await this.loadDataTableEntities()
    },
    async 'queryObject.checkbox' () {
      this.updateQueryCheckbox(this.queryObject.checkbox)
      await this.loadDataTableEntities()
    },
    computedDiscussionTypes () {
      this.queryObject.type = this.computedDiscussionTypes[0].value
    },
    discussionsParams: {
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
        await this.checkAcceptedDiscussions()
      }
    }
  }
}
</script>
