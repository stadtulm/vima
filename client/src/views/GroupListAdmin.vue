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
          :item-class="itemRowBackground"
        >
          <template
            v-slot:[`item.title.value`]="{ item }"
          >
            <div
              class="font-weight-bold"
            >
              {{item.raw.title.value}}
            </div>
          </template>
          <template
            v-slot:[`item.owner`]="{ item }"
          >
            {{item.raw.owner?.user?.userName || ''}}
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{ $moment(item.raw.createdAt).format('DD.MM.YYYY, HH:mm') }} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.visibility`]="{ item }"
          >
            <v-chip
              color="black"
            >
              {{$t(item.raw.visibility + 'VisibilityTitle')}}
            </v-chip>
          </template>
          <template
            v-slot:[`item.categories`]="{ item }"
          >
            <v-chip
              variant="outlined"
              v-for="category in getCategories(item.raw.categories)"
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
              v-for="tag in getTags(item.raw.tags)"
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
            <v-btn
              variant="text"
              :icon="item.raw.isActive ? 'fas fa-check-square' : 'far fa-square'"
              :color="$settings.modules.groups.color"
              :loading="loaders[item.raw._id + 'isActive'] === true"
              disabled
              @click="changeGroupsProperty(
                item.raw,
                'isActive',
                !item.raw.isActive
              )"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.accepted.isAccepted`]="{ item }"
          >
            <v-btn
              variant="text"
              :icon="item.raw.accepted?.isAccepted ? 'fas fa-check-square' : 'far fa-square'"
              :color="$settings.modules.groups.color"
              :disabled="user.role !== 'admins'"
              :loading="loaders[item.raw._id + 'accepted'] === true"
              @click="changeGroupsProperty(
                item.raw,
                'accepted',
                {
                  isAccepted: item.raw.accepted?.isAccepted ? false : true,
                  dt: new Date(),
                  user: user._id
                }
              )"
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
              :loading="loaders[item.raw._id + 'delete'] === true"
              @click="deleteGroup(item.raw._id)"
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
              class="my-4"
              :disabled="!item.raw.isActive"
              :to="{name: 'Group', params: { group: item.raw._id } }"
            >
            </v-btn>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'GroupListAdmin',

  components: {
  },

  data: () => ({
    initialView: true,
    loaders: {},
    loading: true,
    isUpdating: false,
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
    ...mapActions('status-container-helper', {
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
      this.loading = false
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
    itemRowBackground (item) {
      if (
        this.adminGroupStatusContainer &&
        this.adminGroupStatusContainer.unread &&
        this.adminGroupStatusContainer.unread.map(unread => unread.id).includes(item._id)
      ) {
        return 'new'
      } else {
        return ''
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
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value' },
        { title: this.$t('author'), key: 'owner' },
        { title: this.$t('createdAt'), key: 'createdAt' },
        { title: this.$t('visibility'), key: 'visibility' },
        { title: this.$t('categories'), key: 'categories', sortable: false },
        { title: this.$t('tags'), key: 'tags', sortable: false },
        { title: this.$t('accepted'), key: 'accepted.isAccepted', align: 'center' },
        { title: this.$t('active'), key: 'isActive', align: 'center' },
        { title: this.$t('deleteButton'), key: 'delete', align: 'center', sortable: false },
        { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false }
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
    }
  }
}
</script>
