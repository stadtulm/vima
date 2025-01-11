<template>
  <div>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          background-color="white"
          :label="$t('filterByTitleLabel')"
          density="compact"
          hide-details
          :color="customColor"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table-server
          v-model:items-per-page="queryObject.itemsPerPage"
          v-model:page="queryObject.page"
          :sort-by="queryObject.sortBy"
          :headers="computedHeaders"
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
            v-slot:[`item.customAction`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    :icon="customActionIcon"
                    size="small"
                    :color="customColor"
                    @click="$emit('update:customAction', item)"
                  >
                  </v-btn>
                </span>
              </template>
              {{customActionText}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.customSecondaryAction`]="{ item }"
          >
            <v-btn
              :icon="customSecondaryActionIcon"
              size="small"
              :color="customColor"
              @click="$emit('update:customSecondaryAction', item)"
            >
            </v-btn>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'groupTable',

  components: {
  },

  props: [
    'customColor',
    'customActionIcon',
    'customActionText',
    'customSecondaryActionIcon',
    'customSecondaryActionText',
    'customQuery'
  ],

  emits: [
    'update:customAction',
    'update:customSecondaryAction'
  ],

  data: () => ({
    groupsResponse: undefined,
    loaders: {},
    search: '',
    loading: true,
    queryObject: {
      page: 1,
      itemsPerPage: 10,
      sortBy: [{ key: 'title.value', order: 'desc' }]
    }
  }),

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('groups', {
      findGroups: 'find'
    }),
    // Can not be externalized
    async updateDataTableParams (e) {
      this.queryObject = {
        ...e
      }
      await this.loadDataTableEntities()
    },
    async loadDataTableEntities () {
      this.loading = true
      this.groupsResponse = await this.findGroups(
        this.groupsParams
      )
      this.loading = false
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'adaptQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder'
    ]),
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value', sortable: true }
      ]
    },
    groupsParams () {
      const query = Object.assign({
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }, this.customQuery)
      if (this.search) {
        query.title = {
          $elemMatch: {
            $and: [
              { value: { $regex: this.search, $options: 'i' } },
              { type: 'default' }
            ]
          }
        }
      }
      return { query }
    },
    computedGroups () {
      if (this.groupsResponse) {
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
    },
    computedHeaders () {
      const tmpHeaders = JSON.parse(JSON.stringify(this.headers))
      tmpHeaders.push(
        { title: this.customActionText, key: 'customAction', sortable: false, align: 'center' }
      )
      if (this.customSecondaryActionText) {
        tmpHeaders.push(
          { title: this.customSecondaryActionText, key: 'customSecondaryAction', sortable: false, align: 'center' }
        )
      }
      return tmpHeaders
    }
  },
  watch: {
    groupsParams: {
      deep: true,
      async handler (newValue, oldValue) {
        if (
          JSON.stringify(newValue) !== JSON.stringify(oldValue)
        ) {
          await this.loadDataTableEntities()
        }
      }
    }
  }
}
</script>
