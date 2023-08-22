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
          @update:options="updateParams"
          sort-asc-icon="fas fa-caret-up"
          sort-desc-icon="fas fa-caret-down"
          show-current-page=true
          :showCurrentPage="true"
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
                :title="item.raw.pic.credit ? '© ' + item.raw.pic.credit : ''"
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
              fab
              small
              color="customGrey"
              :to="{ name: 'UserNameChat', params: { user: item._id, username: item.userName } }"
            >
              <v-icon
                color="white"
                size="18"
              >
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

  components: {
  },

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
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    await this.adaptQuery()
  },

  methods: {
    async updateParams(e) {
        this.queryObject = {
          ...e
        }
        // this.skip = e.itemsPerPage * (e.page - 1)
        this.updateQueryPage(e.page)
        this.updateQueryItemsPerPage(e.itemsPerPage)
        if (e.sortBy[0]) {
            this.updateQuerySortBy(e.sortBy[0].key)
            this.updateQuerySortOrder(e.sortBy[0].order)
        }
        await this.loadUsers()
    },
    ...mapActions('chats', {
      removeChat: 'remove'
    }),
    ...mapActions('users', {
      findUsers: 'find'
    }),
    async adaptQuery () {
      // Process existing query
      const tmpQueryObject = {}
      if (this.$route.query.i) {
        tmpQueryObject.itemsPerPage = parseInt(this.$route.query.i)
      }
      if (this.$route.query.p) {
        tmpQueryObject.page = parseInt(this.$route.query.p)
      }
      if (this.$route.query.s) {
        const tmpSortObject = {}
        tmpSortObject.key = this.$route.query.s
        if (this.$route.query.o) {
          tmpSortObject.order = this.$route.query.o
        }
        tmpQueryObject.sortBy = [tmpSortObject]
      }
      this.queryObject = tmpQueryObject
      await this.loadUsers()
      this.initialView = false
    },
    updateQueryPage (data) {
      if (parseInt(this.$route.query.p) !== data) {
        this.$router.replace(
          {
            query: {
              p: this.queryObject.page,
              i: this.queryObject.itemsPerPage,
              s: this.queryObject.sortBy[0].key,
              o: this.queryObject.sortBy[0].order
            }
          }
        )
      }
    },
    updateQueryItemsPerPage (data) {
      if (parseInt(this.$route.query.i) !== data) {
        this.$router.replace(
          {
            query: {
              p: this.queryObject.page,
              i: data,
              s: this.queryObject.sortBy[0].key,
              o: this.queryObject.sortBy[0].order
            }
          }
        )
      }
    },
    updateQuerySortBy (data) {
      if (data && this.$route.query.s !== data) {
        this.$router.replace({
          query: {
            p: this.queryObject.page,
            i: this.queryObject.itemsPerPage,
            s: data,
            o: this.queryObject.sortBy[0].order
          }
        })
      } else if (!data) {
        this.$router.replace({
          query: {
            p: this.queryObject.page,
            i: this.queryObject.itemsPerPage,
            o: this.queryObject.sortBy[0].order
          }
        })
      }
    },
    updateQuerySortOrder (data) {
      if (data && this.$route.query.d !== data) {
        this.$router.replace({
          query: {
            p: this.queryObject.page,
            i: this.queryObject.itemsPerPage,
            s: this.queryObject.sortBy[0].key,
            o: data
          }
        })
      }
    },
    async loadUsers () {
      this.loading = true
      this.usersResponse = await this.findUsers(
        this.usersParams
      )
      this.loading = false
    }
  },

  computed: {
    ...mapGetters([
      's3'
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
          sortable: false
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
  }
}
</script>
