<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('manageMembersButton')}}
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
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
          density="compact"
          v-model:items-per-page="queryObject.itemsPerPage"
          v-model:page="queryObject.page"
          :sort-by="queryObject.sortBy"
          :headers="headers"
          :items-length="total"
          :items="computedUsers"
          :loading="loading"
          :search="search"
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
    search: '',
    loading: true,
    usersResponse: undefined,
    queryObject: {
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'userName', order: 'desc' }]
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
        this.queryObject = {
          ...e
        }
        this.updateQueryPage(e.page)
        this.updateQueryItemsPerPage(e.itemsPerPage)
        if (e.sortBy[0]) {
            this.updateQuerySortBy(e.sortBy[0].key)
            this.updateQuerySortOrder(e.sortBy[0].order)
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
          userName: { $regex: this.search, $options: 'i' },
          $limit: this.computedLimit,
          $skip: (this.queryObject.page - 1) * this.computedSkip,
          $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder}
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
    total () {
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
      if (this.queryObject.itemsPerPage === -1) {
        return 0
      } else {
        return this.queryObject.itemsPerPage
      }
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
