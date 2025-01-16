<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('adminView')}} {{$t('discussionForums')}}
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
            <div
              class="font-weight-bold"
            >
              {{item.title.value}}
            </div>
          </template>
          <template
            v-slot:[`item.group`]="{ item }"
          >
            <div>
              {{getGroup(item.group) ? getGroup(item.group).title?.find(t => t.type === 'default')?.value : '-'}}
            </div>
          </template>
          <template
            v-slot:[`item.author`]="{ item }"
          >
            {{item.author && item.author.user ? item.author.user.userName : ''}}
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{ $moment(item.createdAt).format('DD.MM.YYYY, HH:mm') }} {{$t('oClock')}}
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
                    :color="$settings.modules.discussions.color"
                    :loading="loaders[item._id + 'isActive'] === true"
                    disabled
                    @click="changeDiscussionProperty(
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
                    :icon="item.accepted.isAccepted ? 'fas fa-check-square' : 'far fa-square'"
                    :color="$settings.modules.discussions.color"
                    :disabled="user.role !== 'admins' && user.role !== 'volunteers'"
                    :loading="loaders[item._id + 'accepted'] === true"
                    @click="changeDiscussionProperty(
                      item,
                      'accepted',
                      {
                        isAccepted: !item.accepted.isAccepted,
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
                    :color="$settings.modules.discussions.color"
                    class="my-4"
                    :to="{name: 'DiscussionEditorAdmin', params: { id: item._id } }"
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
                    :color="$settings.modules.discussions.color"
                    class="my-4"
                    :loading="loaders[item._id + 'delete'] ===  true"
                    @click="deleteDiscussion(item._id)"
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
                    :color="$settings.modules.discussions.color"
                    class="my-4"
                    :disabled="!item.isActive"
                    :to="{name: 'Discussion', params: { id: item._id } }"
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
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'DiscussionLisAdmin',

  components: {
  },

  data: () => ({
    initialView: true,
    isUpdating: false,
    loaders: {},
    loading: true,
    discussionsResponse: undefined,
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
    ...mapActions('status-container-helper', {
      patchDiscussionNotifications: 'patch'
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
    itemRowBackground (props) {
      if (
        this.adminDiscussionStatusContainer &&
        this.adminDiscussionStatusContainer.unread &&
        this.adminDiscussionStatusContainer.unread.map(unread => unread.id).includes(props.item._id)
      ) {
        return { class: 'new' }
      } else {
        return {}
      }
    },
    async checkAcceptedDiscussions () {
      const visibleDiscussions = this.computedDiscussions.map(obj => obj._id)
      let adminDiscussions = []
      if (this.adminDiscussionStatusContainer && this.adminDiscussionStatusContainer.unread) {
        adminDiscussions = this.adminDiscussionStatusContainer.unread.map(unread => unread.id)
      }
      const discussionIds = visibleDiscussions.filter(e => adminDiscussions.indexOf(e) !== -1)
      if (discussionIds.length > 0 && !this.isUpdating) {
        this.isUpdating = true
        await this.patchDiscussionNotifications(
          [
            'pullUnreadById',
            {
              containerId: this.adminDiscussionStatusContainer,
              ids: discussionIds
            }
          ]
        )
        this.isUpdating = false
      }
    },
    async changeDiscussionProperty (discussion, property, value) {
      this.loaders[discussion._id + property] = true
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchDiscussion(
          [
            discussion._id,
            patchObj
          ]
        )
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[discussion._id + property] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[discussion._id + property] = undefined
      }
    }
  },

  computed: {
    ...mapGetters([
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
      getGroup: 'get'
    }),
    ...mapGetters('discussions', {
      discussions: 'list'
    }),
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value' },
        { title: this.$t('accepted'), key: 'accepted.isAccepted', align: 'center' },
        { title: this.$t('active'), key: 'isActive', align: 'center' },
        { title: this.$t('editButton'), key: 'edit', align: 'center', sortable: false },
        { title: this.$t('deleteButton'), key: 'delete', align: 'center', sortable: false },
        { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false },
        { title: this.$t('author'), key: 'author', sortable: false },
        { title: this.$t('group'), key: 'group', sortable: false },
        { title: this.$t('createdAt'), key: 'createdAt' }
      ]
    },
    discussionsParams () {
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
    adminDiscussionStatusContainer () {
      return this.statusContainers.find(obj => obj.user === this.user._id && obj.type === 'discussions' && obj.relation === 'admin')
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
