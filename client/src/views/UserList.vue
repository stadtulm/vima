<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('manageMembersButton')}}
      </span>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="queryObject.query"
          :label="$t('filterByUserNameLabel')"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table-server
          v-if="initialView === false"
          v-model:items-per-page="queryObject.itemsPerPage"
          v-model:page="queryObject.page"
          :sort-by="queryObject.sortBy"
          :headers="headers"
          :items-length="computedTotal"
          :items="computedUsers"
          :loading="loading"
          class="pb-3 elevation-3"
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
              :class="$vuetify.display.smAndUp ? 'ma-3' : ''"
              color="customGreyLight"
            >
              <v-img
                v-if="item.raw.pic"
                :src="s3 + item.raw.pic.url"
                :alt="$t('userPic')"
                :title="item.raw.pic?.credit ? '© ' + item.raw.pic.credit : ''"
              >
              </v-img>
              <v-icon
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
            <v-list-item
              class="pa-0"
            >
              <v-list-item-title
                class="font-weight-bold"
              >
                <span
                  class="pointer"
                  @click="$router.push({name: 'User', params: { user: item.raw._id}})"
                >
                  {{item.raw.userName}}
                </span>
              </v-list-item-title>
              <v-list-item-subtitle
                v-if="item.raw.description"
              >
                {{item.raw.description}}
              </v-list-item-subtitle>
            </v-list-item>
          </template>
          <template
            v-slot:[`item.goToChat`]="{ item }"
          >
            <v-btn
              icon
              size="small"
              class="pr-1 pb-1"
              color="customGrey"
              :to="{ name: 'UserNameChat', params: { user: item._id, username: item.userName } }"
            >
              <v-icon>
                fa fa-comments
              </v-icon>
            </v-btn>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'UserList',

  data: () => ({
    initialView: true,
    loading: true,
    usersResponse: undefined,
    queryObject: {
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'userName', order: 'desc' }],
      query: ''
    }
  }),

  async mounted () {
    await this.adaptQuery()
  },

  methods: {
    ...mapActions('chats', {
      removeChat: 'remove'
    }),
    ...mapActions('users', {
      findUsers: 'find'
    }),
    // Can not be externalized
    async updateDataTableParams(e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query
        }
        this.updateQueryQuery(this.queryObject.query)
        this.updateQueryPage(e.page)
        this.updateQueryItemsPerPage(e.itemsPerPage)
        if (e.sortBy[0]) {
            this.updateQuerySortBy(e.sortBy[0].key)
            this.updateQuerySortOrder(e.sortBy[0].order)
        }
      }
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
      'updateQueryQuery',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        {
          title: '',
          key: 'pic.url',
          align: 'start',
          sortable: false,
          width: 50
        },
        {
          title: this.$t('userName'),
          key: 'userName',
          align: 'start',
          sortable: true
        },
        {
          title: this.$t('goToChat'),
          key: 'goToChat',
          align: 'center',
          sortable: false
        }
      ]
    },
    usersParams () {
      return {
        query: {
          _id: { $ne: this.user._id },
          role: { $ne: 'deleted' },
          isVerified: true,
          isActive: true,
          userName: { $regex: this.queryObject.query, $options: 'i' },
          $limit: this.computedLimit,
          $skip: this.computedSkip,
          $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
        }
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
    }
  },
  watch: {
    ['queryObject.query'] () {
      this.updateQueryQuery(this.queryObject.query)
    },
    usersParams: {
      deep: true,
      async handler (newValue, oldValue) {
        if (
          !this.initialView &&
          JSON.stringify(newValue) !== JSON.stringify(oldValue)
        ) {
          await this.loadDataTableEntities()
        }
      }
    }
  }
}
</script>
