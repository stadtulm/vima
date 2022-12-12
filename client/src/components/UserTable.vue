<template>
  <div>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          background-color="white"
          :label="$t('filterByUserNameLabel')"
          outlined
          dense
          hide-details
          :color="customColor"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          :headers="computedHeaders"
          :items="computedUsers"
          :loading="loading"
          :server-items-length="total"
          must-sort
          :page.sync="page"
          :items-per-page.sync="itemsPerPage"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          mobile-breakpoint="0"
          :footer-props="{
            itemsPerPageText: '',
            itemsPerPageOptions
          }"
        >
          <template
            v-slot:progress
          >
            <v-progress-linear
              indeterminate
              :color="customColor"
            ></v-progress-linear>
          </template>
          <template
            v-slot:[`item.pic.url`]="{ item }"
          >
            <v-avatar
              class="my-2"
              color="customGreyLight"
              size="40"
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
            <v-list-item
              class="pa-0"
            >
              <v-list-item-content>
                <v-list-item-title
                  class="font-weight-bold"
                >
                  {{item.userName}}
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
            v-slot:[`item.customAction`]="{ item }"
          >
            <v-btn
              fab
              small
              :color="customColor"
              @click="$emit('customAction', item)"
            >
              <v-icon
                color="white"
                size="18"
              >
                {{customActionIcon}}
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.customSecondaryAction`]="{ item }"
          >
            <v-btn
              fab
              small
              :color="customColor"
              @click="$emit('customSecondaryAction', item)"
            >
              <v-icon
                color="white"
                size="18"
              >
                {{customSecondaryActionIcon}}
              </v-icon>
            </v-btn>
          </template>
        </v-data-table>
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

  data: () => ({
    userChats: [],
    loaders: {},
    search: '',
    page: 1,
    loading: true,
    itemsPerPage: 25,
    sortBy: ['userName'],
    sortDesc: [true]
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('users', {
      findUsers: 'find'
    }),
    goToPage (i) {
      this.skip = this.itemsPerPage * (i - 1)
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'itemsPerPageOptions'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        { text: '', value: 'pic.url', width: 50, sortable: false },
        { text: this.$t('userName'), value: 'userName' }
      ]
    },
    computedQuery () {
      return Object.assign({
        isVerified: true,
        isActive: true,
        role: { $ne: 'deleted' },
        userName: { $regex: this.search, $options: 'i' },
        $limit: this.computedLimit,
        $skip: (this.page - 1) * this.computedSkip,
        $sort: { [this.sortBy]: this.computedSortDesc }
      }, this.customQuery)
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
    },
    computedHeaders () {
      const tmpHeaders = JSON.parse(JSON.stringify(this.headers))
      tmpHeaders.push(
        { text: this.customActionText, value: 'customAction', sortable: false, align: 'center' }
      )
      if (this.customSecondaryActionText) {
        tmpHeaders.push(
          { text: this.customSecondaryActionText, value: 'customSecondaryAction', sortable: false, align: 'center' }
        )
      }
      return tmpHeaders
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
    }
  },

  asyncComputed: {
    async usersResponse () {
      this.loading = true
      const users = await this.findUsers(
        {
          query: this.computedQuery
        }
      )
      this.loading = false
      return users
    }
  }
}
</script>
