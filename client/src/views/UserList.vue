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
          class="customGreyUltraLight elevation-3"
          :headers="headers"
          :items="computedUsers"
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
          mobile-breakpoint="0"
          :footer-props="{ itemsPerPageText: '' }"
        >
          <template
            v-slot:progress
          >
            <v-progress-linear
              indeterminate
              color="customGrey"
            ></v-progress-linear>
          </template>
          <template
            v-slot:[`item.pic.url`]="{ item }"
          >
            <v-avatar
              :class="$vuetify.breakpoint.smAndUp ? 'ma-3' : ''"
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
              <v-list-item-content>
                <v-list-item-title
                  class="font-weight-bold"
                >
                  <span
                    class="pointer"
                    @click="$router.push({name: 'User', params: { user: item._id}})"
                  >
                    {{item.userName}}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle
                  v-if="item.description && item.description !== ''"
                >
                  {{item.description}}
                </v-list-item-subtitle>
              </v-list-item-content>
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
        </v-data-table>
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
    search: '',
    page: 1,
    loading: true,
    itemsPerPage: 5,
    sortBy: ['userName'],
    sortDesc: [true]
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
  },

  methods: {
    ...mapActions('chats', {
      removeChat: 'remove'
    }),
    ...mapActions('users', {
      findUsers: 'find'
    }),
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
      's3'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        { text: '', value: 'pic.url', width: 50, sortable: false },
        { text: this.$t('userName'), value: 'userName' },
        { text: this.$t('goToChat'), value: 'goToChat', sortable: false, align: 'center' }
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
          $skip: (this.page - 1) * this.computedSkip,
          $sort: { [this.sortBy]: this.computedSortDesc }
        }
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
    async usersResponse () {
      this.loading = true
      const users = await this.findUsers(
        this.usersParams
      )
      this.loading = false
      return users
    }
  }
}
</script>
