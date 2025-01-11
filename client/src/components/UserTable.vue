<template>
  <div>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          background-color="white"
          :label="$t('filterByUserNameLabel')"
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
          :items="computedUsers"
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
            v-slot:[`item.pic.url`]="{ item }"
          >
            <v-avatar
              class="my-2"
              color="customGreyLight"
            >
              <v-img
                v-if="item.pic"
                :src="s3 + item.pic.url"
                :alt="$t('userPic')"
                :title="item.pic.credit ? '© ' + item.pic.credit : ''"
              >
              </v-img>
              <v-icon
                size="18"
                v-else
                color="white"
              >
                fas fa-user
              </v-icon>
            </v-avatar>
          </template>
          <template
            v-slot:[`item.userName`]="{ item }"
          >
            <div
              class="font-weight-bold"
            >
              {{item.userName}}
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
  name: 'UserTable',

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
    usersResponse: undefined,
    userChats: [],
    loaders: {},
    search: '',
    loading: true,
    queryObject: {
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'userName', order: 'desc' }]
    }
  }),

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('users', {
      findUsers: 'find'
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
      this.usersResponse = await this.findUsers(
        this.usersParams
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
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        { title: '', key: 'pic.url', minWidth: 50, sortable: false },
        { title: this.$t('userName'), key: 'userName', sortable: true }
      ]
    },
    usersParams () {
      return {
        query: Object.assign({
          isVerified: true,
          isActive: true,
          role: { $ne: 'deleted' },
          userName: { $regex: this.search, $options: 'i' },
          $limit: this.computedLimit,
          $skip: this.computedSkip,
          $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
        }, this.customQuery)
      }
    },
    computedUsers () {
      if (this.usersResponse) {
        return this.usersResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.usersResponse) {
        return this.usersResponse.total
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
    usersParams: {
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
