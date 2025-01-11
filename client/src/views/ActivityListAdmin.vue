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
            <div
              v-html="$t('adminView') + ' ' + $t('activitiesTitle')"
            >
            </div>
          </span>
          <span
            class="my-3 mr-3"
          >
            <v-btn
              v-if="computedFiltersDirty"
              variant="text"
              color="customGrey"
              @click="resetFilters()"
            >
              {{$t('resetFilters')}}
            </v-btn>
          </span>
          <span
            class="my-3 mr-6"
          >
            <v-badge
              v-model="computedFiltersDirty"
              :color="$settings.modules.ads.color"
            >
              <v-btn
                variant="outlined"
                color="customGrey"
                @click="showFilters = !showFilters"
              >
                {{ showFilters ? $t('hideFiltersButton') : $t('showFiltersButton') }}
                <v-icon
                  size="18"
                  class="ml-3"
                >
                  {{showFilters ? 'fas fa-chevron-up': 'fas fa-chevron-down'}}
                </v-icon>
              </v-btn>
            </v-badge>
          </span>
        </v-row>
      </v-col>
    </v-row>
    <v-expand-transition
      mode="in-out"
    >
      <v-row
        v-if="showFilters"
      >
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="queryObject.query"
            color="black"
            :label="$t('filterByUserNameLabel')"
            hide-details
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-select
            v-model="queryObject.categories"
            :label="$t('type')"
            density="compact"
            multiple
            chips
            closable-chips
            hide-details
            :items="activityTypeItems.map(i => ({ title: $t(i), value: i }))"
          ></v-select>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-select
            v-model="queryObject.tags"
            :label="$t('activity')"
            density="compact"
            multiple
            chips
            closable-chips
            hide-details
            :items="activityVerbItems.map(i => ({ title: $t(i), value: i }))"
          ></v-select>
        </v-col>
      </v-row>
    </v-expand-transition>
    <v-row>
      <v-col>
        <v-data-table-server
          v-if="!initialView"
          v-model:items-per-page="queryObject.itemsPerPage"
          v-model:page="queryObject.page"
          :sort-by="queryObject.sortBy"
          :headers="headers"
          :items-length="computedTotal"
          :items="computedActivities"
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
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{ $moment(item.createdAt).format('DD.MM.YYYY, HH:mm') }} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.content`]="{ item }"
          >
            <div
              class="font-weight-bold"
            >
              {{item}}
            </div>
          </template>
          <template
            v-slot:[`item.author`]="{ item }"
          >
            {{item.author || ''}}
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
                    icon
                    size="small"
                    color="customGrey"
                    class="my-4"
                    :disabled="!item.isActive"
                    :to="{name: 'Ad', params: { id: item._id } }"
                  >
                    <v-icon
                      color="white"
                    >
                      fa fa-arrow-right
                    </v-icon>
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
  name: 'ActivityListAdmin',

  components: {
  },

  data: () => ({
    showFilters: true,
    initialView: true,
    loading: true,
    isUpdating: false,
    loaders: {},
    activitiesResponse: undefined,
    searchDefault: '',
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'createdAt', order: 'asc' }],
      categories: [],
      tags: []
    }
  }),

  async mounted () {
    this.queryObject.categories = this.activityTypeItems
    this.queryObject.tags = this.activityVerbItems
    await this.adaptQuery()
    setTimeout(async () => {
      await this.checkReadActivities()
    }, 1000)
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('activities', {
      patchAd: 'patch',
      removeAd: 'remove',
      findActivities: 'find'
    }),
    ...mapActions('status-container-helper', {
      patchAdNotifications: 'patch'
    }),
    resetFilters () {
      this.queryObject.categories = this.activityTypeItems
      this.queryObject.tags = this.activityVerbItems
      this.queryObject.query = this.searchDefault
    },
    async updateDataTableParams (e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query,
          categories: this.queryObject.categories,
          tags: this.queryObject.tags
        }
        this.updateQueryQuery(this.queryObject.query)
        this.updateQueryPage(this.queryObject.page)
        this.updateQueryItemsPerPage(e.itemsPerPage)
        this.updateQueryCategories(this.queryObject.categories)
        this.updateQueryTags(this.queryObject.tags)
        if (e.sortBy[0]) {
          this.updateQuerySortBy(e.sortBy[0].key)
          this.updateQuerySortOrder(e.sortBy[0].order)
        }
      }
    },
    async loadDataTableEntities () {
      this.loading = true
      this.activitiesResponse = await this.findActivities(
        this.activitiesParams
      )
      this.loading = false
      setTimeout(async () => {
        await this.checkReadActivities()
      }, 1000)
    },
    itemRowBackground (props) {
      if (
        this.adminActivitiesStatusContainer &&
        this.adminActivitiesStatusContainer.unread &&
        this.adminActivitiesStatusContainer.unread.map(unread => unread.id).includes(props.item._id)
      ) {
        return { class: 'new' }
      } else {
        return {}
      }
    },
    async checkReadActivities () {
      const visibleActivities = this.activities.map(obj => obj._id)
      let adminActivities = []
      if (this.adminActivitiesStatusContainer && this.adminActivitiesStatusContainer.unread) {
        adminActivities = this.adminActivitiesStatusContainer.unread.map(unread => unread.id)
      }
      const adIds = visibleActivities.filter(e => adminActivities.indexOf(e) !== -1)
      if (adIds.length > 0 && !this.isUpdating) {
        this.isUpdating = true
        await this.patchAdNotifications(
          [
            'pullUnreadById',
            {
              containerId: this.adminActivitiesStatusContainer,
              ids: adIds
            }
          ]
        )
        this.isUpdating = false
      }
    }
  },

  computed: {
    ...mapGetters([
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder',
      'updateQueryCategories',
      'updateQueryTags',
      'activityTypeItems',
      'activityVerbItems',
      'areArraysEqual'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('activities', {
      activities: 'list'
    }),
    headers () {
      return [
        { title: this.$t('createdAt'), key: 'createdAt' },
        { title: this.$t('author') + ' ID', key: 'author.id' },
        { title: this.$t('author') + ' ' + this.$t('userName'), key: 'author.value' },
        { title: this.$t('author') + ' ' + this.$t('role'), key: 'author.role' },
        { title: this.$t('type'), key: 'type' },
        { title: this.$t('activity'), key: 'verb' },
        { title: this.$t('details') + ' ID', key: 'subject.id' },
        { title: this.$t('details') + ' ' + this.$t('title'), key: 'subject.value' }
      ]
    },
    computedFiltersDirty () {
      if (
        !this.areArraysEqual(this.queryObject.categories, this.activityTypeItems) ||
        !this.areArraysEqual(this.queryObject.tags, this.activityVerbItems) ||
        this.queryObject.query !== this.searchDefault
      ) {
        return true
      } else {
        return false
      }
    },
    activitiesParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      if (this.queryObject.categories.length > 0) {
        query.type = { $in: this.queryObject.categories }
      }
      if (this.queryObject.tags.length > 0) {
        query.verb = { $in: this.queryObject.tags }
      }
      if (this.queryObject.query) {
        query['author.value'] = {
          $regex: this.queryObject.query, $options: 'i'
        }
      }
      return {
        query
      }
    },
    adminActivitiesStatusContainer () {
      return this.statusContainers.find(obj => obj.user === this.user._id && obj.type === 'activities' && obj.relation === 'admin')
    },
    computedActivities () {
      if (this.activitiesResponse && this.activitiesResponse.data) {
        return this.activitiesResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.activitiesResponse) {
        return this.activitiesResponse.total
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
    async 'queryObject.query' () {
      this.updateQueryQuery(this.queryObject.query)
      await this.loadDataTableEntities()
    },
    async 'queryObject.categories' () {
      this.updateQueryCategories(this.queryObject.categories)
      await this.loadDataTableEntities()
    },
    async 'queryObject.tags' (n, o) {
      this.updateQueryTags(this.queryObject.tags)
      await this.loadDataTableEntities()
    },
    activitiesParams: {
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
        await this.checkReadActivities()
      }
    }
  }
}
</script>
