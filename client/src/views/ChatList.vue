<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('myChatsButton')}}
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          :item-class="itemRowBackground"
          class="customGreyUltraLight elevation-3"
          :headers="headers"
          :items="chats"
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
            v-slot:[`item.pic`]="{ item }"
            v-if="computedOtherStatusContainers"
          >
            <template
              v-for="user in computedOtherStatusContainers.filter(obj => obj.reference === item._id).map(obj => getUser(obj.user))"
            >
              <v-avatar
                class="ma-3"
                color="customGreyLight"
                :key="user._id"
              >
                <v-img
                  v-if="user.pic"
                  :src="s3 + user.pic.url"
                  :alt="$t('userPic')"
                  :title="user.pic.credit ? '© ' + user.pic.credit : ''"
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
          </template>
          <template
            v-slot:[`item.userName`]="{ item }"
          >
            <v-list-item
              class="pa-0"
              v-if="computedOtherStatusContainers"
            >
              <v-list-item-content
                v-for="user in computedOtherStatusContainers.filter(obj => obj.reference === item._id).map(obj => getUser(obj.user))"
                :key="user._id"
              >
                <v-list-item-title
                  class="font-weight-bold pointer"
                  @click="$router.push({name: 'User', params: { user: user._id}})"
                >
                  {{user.userName}}
                </v-list-item-title>
                <v-list-item-subtitle
                  v-if="user.description && user.description !== ''"
                >
                  {{user.description}}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template
            v-slot:[`item.status`]="{ item }"
          >
            <v-select
              :disabled="getIsBlocked(item.isBlocked) === 'otherBlocked'"
              v-model="blocks[item._id]"
              :items="getBlockedItems(item.isBlocked)"
              :item-text="(item) => $t(item.textKey)"
              hide-details
              flat
              dense
              item-color="customGrey"
              color="customGrey"
              @change="setProperty('isBlocked', item._id, blocks[item._id])"
            >
            </v-select>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-btn
              fab
              small
              color="customGrey"
              @click="deleteChat(item._id)"
            >
              <v-icon
                size="18"
                color="white"
              >
                fa fa-trash
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.goToChat`]="{ item }"
          >
            <v-badge
              :value="statusContainers.find(obj => obj.reference === item._id).unread.length > 0"
              color="customLimeBg"
              overlap
            >
              <template slot="badge">
                <span
                  class="customGrey--text font-weight-bold"
                >
                  {{statusContainers.find(obj => obj.reference === item._id).unread.length}}
                </span>
              </template>
              <v-btn
                :disabled="item.isBlocked ? true : false"
                fab
                small
                color="customGrey"
                :to="{ name: 'IdChat', params: { chat: item._id } }"
              >
                <v-icon
                  size="18"
                  color="white"
                >
                  fa fa-arrow-right
                </v-icon>
              </v-btn>
            </v-badge>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { makeFindMixin } from 'feathers-vuex'
import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'ChatList',

  mixins: [makeFindMixin({ service: 'chats', watch: true })],

  components: {
  },

  data: () => ({
    loaders: {},
    page: 1,
    loading: true,
    blocks: {},
    total: 0,
    itemsPerPage: 5,
    sortBy: ['createdAt'],
    sortDesc: [false]
  }),

  mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
    this.$nextTick(() => {
      this.checkNewChats()
    })
    this.fillObjects()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('chats', {
      removeChat: 'remove',
      patchChat: 'patch'
    }),
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    ...mapActions('status-container-helper', {
      patchChatNotifications: 'patch'
    }),
    fillObjects () {
      const tmpBlocks = {}
      for (const chat of this.chats) {
        if (!chat.isBlocked) {
          tmpBlocks[chat._id] = null
        } else {
          tmpBlocks[chat._id] = chat.isBlocked
        }
      }
      this.blocks = tmpBlocks
    },
    getBlockedItems (isBlocked) {
      const items = JSON.parse(JSON.stringify(this.blockedItems))
      if (this.getIsBlocked(isBlocked) === 'selfBlocked' || this.getIsBlocked(isBlocked) === 'notBlocked') {
        items.find(obj => obj.type === 'selfBlocked').value = this.user._id
        items.find(obj => obj.type === 'notBlocked').value = null
        items.splice(items.findIndex(obj => obj.type === 'otherBlocked'), 1)
      } else if (this.getIsBlocked(isBlocked) === 'otherBlocked') {
        items.find(obj => obj.type === 'otherBlocked').value = isBlocked
        items.splice(items.findIndex(obj => obj.type === 'notBlocked'), 1)
        items.splice(items.findIndex(obj => obj.type === 'selfBlocked'), 1)
      }
      return items
    },
    async setProperty (property, id, state) {
      const patchObject = {}
      patchObject[property] = state
      try {
        await this.patchChat([id, patchObject])
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.blocks[id] = undefined
        this.$nextTick(() => {
          this.blocks[id] = this.chats.find(obj => obj._id === id).isBlocked
        })
      }
    },
    getIsBlocked (isBlocked) {
      if (!isBlocked) {
        return 'notBlocked'
      } else if (isBlocked === this.user._id) {
        return 'selfBlocked'
      } else {
        return 'otherBlocked'
      }
    },
    itemRowBackground (item) {
      if (this.statusContainers.find(obj => obj.reference === item._id && obj.type === 'chats' && obj.user === this.user._id && obj.customField === 'new')) {
        return 'new'
      } else {
        return ''
      }
    },
    async checkNewChats () {
      const visibleChats = this.chats.map(obj => obj._id)
      const acceptedStatusContainers = this.statusContainers.filter(obj => obj.user === this.user._id && obj.type === 'chats' && obj.customField === 'new').map(obj => obj.reference)
      const chatIds = visibleChats.filter(e => acceptedStatusContainers.indexOf(e) !== -1)
      if (chatIds.length > 0) {
        await this.patchChatNotifications(
          [
            'resetCustomField',
            {
              type: 'chats',
              relation: 'owner',
              customField: 'new',
              references: chatIds
            }
          ]
        )
      }
    },
    async deleteChat (id) {
      try {
        await this.removeChat(id)
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
      }
    },
    myChar (id, idChar, otherChar) {
      if (id === this.user._id) {
        return idChar
      } else {
        return otherChar
      }
    },
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
      's3',
      'blockedItems'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    headers () {
      return [
        { text: '', value: 'pic', width: 50, sortable: false },
        { text: this.$t('userName'), value: 'userName' },
        { text: this.$t('block') + ' / ' + this.$t('unblock'), value: 'status' },
        // { text: this.$t('deleteButton'), value: 'delete', sortable: false, align: 'center' },
        { text: this.$t('goToChat'), value: 'goToChat', sortable: false, align: 'center' }
      ]
    },
    chatsParams () {
      const query = {
        _id: { $in: this.statusContainers.filter(obj => obj.user === this.user._id && obj.type === 'chats').map(obj => obj.reference) },
        $limit: this.computedLimit,
        $skip: (this.page - 1) * this.computedSkip,
        $sort: { [this.sortBy]: this.computedSortDesc }
      }
      return {
        query,
        debounce: 1000
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
    async computedOtherStatusContainers () {
      return await this.findStatusContainers(
        {
          query: {
            user: { $ne: this.user._id },
            type: 'chats',
            reference: {
              $in: this.chats.map(obj => obj._id)
            }
          }
        }
      )
    }
  },

  watch: {
    chatsError () {
      if (this.chatsError && this.chatsError.code === 403) {
        this.$router.push({ name: 'Forbidden' })
      }
    },
    chats: {
      deep: true,
      handler () {
        this.checkNewChats()
        this.fillObjects()
      }
    },
    statusContainers: {
      deep: true,
      handler () {
        this.checkNewChats()
      }
    },
    isFindChatsPending () {
      if (!this.isFindChatsPending) {
        this.loading = false
        this.total = this.chatsPaginationData.default.mostRecent.total
      } else {
        this.loading = true
      }
    }
  }
}
</script>
