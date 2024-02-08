<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('myChatsButton')}}
      </span>
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
          :items="computedChats"
          :loading="isLoading"
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
            v-slot:[`item.pic`]="{ item }"
            v-if="otherStatusContainers?.length > 0"
          >
            <div
              v-for="user in otherStatusContainers.filter(obj => obj.reference === item._id).map(obj => getUser(obj.user))"
              :key="user._id"
            >
              <v-avatar
                class="ma-3"
                color="customGreyLight"
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
            </div>
          </template>
          <template
            v-slot:[`item.user.userName`]="{ item }"
          >
            <v-list-item
              class="pa-0"
              v-if="otherStatusContainers?.length > 0"
            >
              <template
                v-for="user in otherStatusContainers.filter(obj => obj.reference === item._id).map(obj => getUser(obj.user))"
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
              </template>
            </v-list-item>
          </template>
          <template
            v-slot:[`item.latestMessageUpdate`]="{ item }"
          >
            <v-list-item
              class="pt-3 px-0"
              v-if="item.latestChatMessage || item.latestMessageUpdate"
            >
              <v-list-item-subtitle
                class="font-weight-bold"
              >
                {{$moment((item.latestMessageUpdate || item.latestChatMessage?.createdAt)).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}:
              </v-list-item-subtitle>
              <span v-html="item.latestChatMessage?.text?.value"></span>
            </v-list-item>
            <template v-else>
              -
            </template>
          </template>
          <template
            v-slot:[`item.status`]="{ item }"
          >
            <v-select
              :disabled="getIsBlocked(item.isBlocked) === 'otherBlocked'"
              v-model="blocks[item._id]"
              :items="getBlockedItems(item.isBlocked)"
              :item-title="(item) => $t(item.textKey)"
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
              icon="fa fa-trash"
              size="small"
              color="customGrey"
              @click="deleteChat(item._id)"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.goToChat`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-badge
                    :model-value="statusContainers.find(obj => obj.reference === item._id).unread.length > 0"
                    :color="$settings.indicatorColor"
                  >
                    <template v-slot:badge>
                      <span
                        class="text-customGrey font-weight-bold"
                      >
                        {{statusContainers.find(obj => obj.reference === item._id).unread.length}}
                      </span>
                    </template>
                    <v-btn
                      :disabled="item.isBlocked ? true : false"
                      icon="fa fa-arrow-right"
                      size="small"
                      color="customGrey"
                      :to="{ name: 'IdChat', params: { chat: item._id } }"
                    >
                    </v-btn>
                  </v-badge>
                </span>
              </template>
              {{$t('goToChat')}}
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
  name: 'ChatList',

  components: {
  },

  data: () => ({
    loading: true,
    blocks: {},
    otherStatusContainers: undefined,
    initialView: true,
    chatsResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'createdAt', order: 'desc' }]
    }
  }),

  async mounted () {
    await this.adaptQuery()
    this.$nextTick(async () => {
      await this.checkNewChats()
    })
    this.fillObjects()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('chats', {
      findChats: 'find',
      removeChat: 'remove',
      patchChat: 'patch'
    }),
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    ...mapActions('status-container-helper', {
      patchChatNotifications: 'patch'
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
      this.chatsResponse = await this.findChats(
        this.chatsParams
      )
      await this.loadOtherStatusContainers()
      this.isLoading = false
      setTimeout(async () => {
        await this.checkNewChats()
      }, 1000)
    },
    fillObjects () {
      const tmpBlocks = {}
      for (const chat of this.computedChats) {
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
          this.blocks[id] = this.computedChats.find(obj => obj._id === id).isBlocked
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
    itemRowBackground (props) {
      if (this.statusContainers.find(obj => obj.reference === props.item._id && obj.type === 'chats' && obj.user === this.user._id && obj.customField === 'new')) {
        return { class: 'new' }
      } else {
        return {}
      }
    },
    async checkNewChats () {
      const visibleChats = this.computedChats.map(obj => obj._id)
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
    async loadOtherStatusContainers () {
      this.otherStatusContainers = await this.findStatusContainers(
        {
          query: {
            user: { $ne: this.user._id },
            type: 'chats',
            reference: {
              $in: this.computedChats.map(obj => obj._id)
            }
          }
        }
      )
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'blockedItems',
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
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('chats', {
      chats: 'list'
    }),
    headers () {
      return [
        { title: '', key: 'pic', minWidth: 50, sortable: false },
        { title: this.$t('userName'), key: 'user.userName', sortable: false },
        { title: this.$t('latestPost'), key: 'latestMessageUpdate' },
        { title: this.$t('block') + ' / ' + this.$t('unblock'), key: 'status' },
        // { title: this.$t('deleteButton'), key: 'delete', sortable: false, align: 'center' },
        { title: this.$t('goToChat'), key: 'goToChat', sortable: false, align: 'center' }
      ]
    },
    computedChats () {
      if (this.chatsResponse?.data) {
        return this.chatsResponse.data
      } else {
        return []
      }
    },
    chatsParams () {
      const query = {
        _id: { $in: this.statusContainers.filter(obj => obj.user === this.user._id && obj.type === 'chats').map(obj => obj.reference) },
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      return {
        query
      }
    },
    computedTotal () {
      if (this.chatsResponse) {
        return this.chatsResponse.total
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
    chats: {
      deep: true,
      async handler () {
        await this.checkNewChats()
        this.fillObjects()
      }
    },
    chatsParams: {
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
        await this.checkNewChats()
      }
    }
  }
}
</script>
