<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('adminView')}} {{$t('news')}}
      </span>
      <span
        class="my-3"
      >
        <v-btn
          variant="elevated"
          :to="{ name: 'NewsEditor' }"
          color="customGrey"
        >
          {{$t('newNewsButton')}}
          <v-icon
            class="ml-3"
            size="18"
          >
            fas fa-plus
          </v-icon>
        </v-btn>
      </span>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="queryObject.query"
          :label="$t('filterByTitleLabel')"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
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
          :items="computedNews"
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
            <v-list-item-title
              class="font-weight-bold"
            >
              {{item.title.value}}
            </v-list-item-title>
          </template>
          <template
            v-slot:[`item.updatedAt`]="{ item }"
          >
            {{$moment(item.updatedAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{$moment(item.createdAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.edit`]="{ item }"
          >
            <v-btn
              icon="fa fa-pen"
              size="small"
              color="customGrey"
              class="my-3"
              :to="{ name: 'NewsEditor', params: { id: item._id } }"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.send`]="{ item }"
          >
            <v-btn
              icon="fa fa-inbox"
              size="small"
              color="customGrey"
              class="my-3"
              @click="newsletterDialogItem = item"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-btn
              icon="fa fa-trash"
              size="small"
              color="customGrey"
              class="my-3"
              :loading="loaders[item._id + 'delete'] === true"
              @click="deleteNews(item._id)"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.link`]="{ item }"
          >
            <v-btn
              icon="fa fa-arrow-right"
              size="small"
              color="customGrey"
              class="my-3"
              :to="{name: 'NewsEntry', params: { id: item._id } }"
            >
            </v-btn>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
    <!-- Newsletter dialog -->
    <v-dialog
      v-model="showNewsletterDialog"
      max-width="1200"
    >
      <v-card
        color="customGreyUltraLight"
        tile
      >
        <v-card-text
          class="pa-8"
        >
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('manageNewsletter')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-toolbar
                color="customGreyUltraLight"
                flat
              >
                <v-tabs
                  color="customGrey"
                  v-model="newsletterTab"
                >
                  <v-tab>
                    {{$t('sendButton')}}
                  </v-tab>
                  <v-tab
                    :disabled="sendStats ? false : true"
                  >
                    {{$t('alreadySent')}}
                  </v-tab>
                  <v-tab
                    :disabled="sendStats ? false : true"
                  >
                    {{$t('sendErrors')}}
                  </v-tab>
                  <v-tab>
                    {{$t('overview')}} {{$t('recipients')}}
                  </v-tab>
                </v-tabs>
              </v-toolbar>
              <v-window
                v-model="newsletterTab"
              >
                <v-window-item>
                  <v-card flat>
                    <v-card-text
                      class="my-4"
                    >
                      <template
                        v-if="sendStats"
                      >
                        <v-row>
                          <v-col>
                            <v-progress-linear
                              color="success"
                              height="60"
                              dark
                              :value="sendStats.sent.length / (sendStats.sent.length + sendStats.error.length) * 100"
                            >
                              {{ sendStats.sent.length }} / {{ sendStats.sent.length + sendStats.error.length }}
                            </v-progress-linear>
                          </v-col>
                        </v-row>
                        <v-divider
                          class="my-6"
                        ></v-divider>
                      </template>
                      <v-row>
                        <v-col>
                          <v-btn
                            block
                            dark
                            :loading="isSending"
                            color="customGrey"
                            @click="sendNewsletter()"
                          >
                            {{sendStats ? $t('sendToPending'): $t('sendToAll')}}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-btn
                            block
                            dark
                            :loading="isSending"
                            color="customGrey"
                            @click="sendTestNewsletter()"
                          >
                            {{$t('sendToMe', { email: user.email })}}
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-window-item>
                <v-window-item>
                  <v-data-table
                    v-if="sendStats"
                    :headers="[
                      { title: this.$t('id'), key: 'id' },
                      { title: this.$t('email'), key: 'email' },
                      { title: this.$t('type'), key: 'type' },
                      { title: this.$t('dt'), key: 'dt' },
                    ]"
                    :items="sendStats.sent"
                    class="customGreyUltraLight pb-3 elevation-3"
                    item-value="_id"
                    sort-asc-icon="fas fa-caret-down"
                    sort-desc-icon="fas fa-caret-up"
                    :show-current-page="true"
                    :must-sort="true"
                    :sort-by="sendStatsQueryObject.sortBy"
                    :items-per-page="sendStatsQueryObject.itemsPerPage"
                  >
                    <template
                      v-slot:[`item.type`]="{ item }"
                    >
                      {{newsletterTypes[item.type]}}
                    </template>
                    <template
                      v-slot:[`item.dt`]="{ item }"
                    >
                      {{$moment(item.dt).format('DD.MM.YYYY, HH:mm:ss:SSS')}}
                    </template>
                  </v-data-table>
                </v-window-item>
                <v-window-item>
                  <v-data-table
                    v-if="sendStats"
                    :headers="[
                      { title: this.$t('id'), key: 'id' },
                      { title: this.$t('email'), key: 'email' },
                      { title: this.$t('type'), key: 'type' },
                      { title: this.$t('dt'), key: 'dt' },
                      { title: this.$t('errorMessage'), key: 'message' },
                    ]"
                    :items="sendStats.error"
                    class="customGreyUltraLight pb-3 elevation-3"
                    item-value="_id"
                    sort-asc-icon="fas fa-caret-down"
                    sort-desc-icon="fas fa-caret-up"
                    :show-current-page="true"
                    :must-sort="true"
                    :sort-by="sendStatsQueryObject.sortBy"
                    :items-per-page="sendStatsQueryObject.itemsPerPage"
                  >
                    <template
                      v-slot:[`item.type`]="{ item }"
                    >
                      {{newsletterTypes[item.type]}}
                    </template>
                    <template
                      v-slot:[`item.dt`]="{ item }"
                    >
                      {{$moment(item.dt).format('DD.MM.YYYY, HH:mm:ss:SSS')}}
                    </template>
                  </v-data-table>
                </v-window-item>
                <v-window-item>
                  <v-card>
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <v-text-field
                            v-model="searchRecipients"
                            :label="$t('filterByEmailLabel')"
                            density="compact"
                            hide-details
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-data-table
                            :headers="[
                              { title: this.$t('id'), key: 'id' },
                              { title: this.$t('email'), key: 'email' },
                              { title: this.$t('type'), key: 'type' },
                            ]"
                            :items="computedRecipients"
                            class="customGreyUltraLight pb-3 elevation-3"
                            item-value="_id"
                            sort-asc-icon="fas fa-caret-down"
                            sort-desc-icon="fas fa-caret-up"
                            :show-current-page="true"
                            :must-sort="true"
                            :sort-by="sendStatsQueryObject.sortBy"
                            :items-per-page="sendStatsQueryObject.itemsPerPage"
                          >
                            <template
                              v-slot:[`item.type`]="{ item }"
                            >
                              {{newsletterTypes[item.type]}}
                            </template>
                          </v-data-table>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-window-item>
              </v-window>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'NewsListAdmin',

  data: () => ({
    initialView: true,
    loading: true,
    searchRecipients: undefined,
    newsletterTypes: {
      users: 'Mitglied',
      subscribers: 'Abonnent'
    },
    sendStats: undefined,
    isSending: false,
    newsletterTab: 0,
    newsletterDialogItem: undefined,
    showNewsletterDialog: false,
    loaders: {},
    newsResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'title.value', order: 'desc' }]
    },
    sendStatsQueryObject: {
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'email', order: 'asc' }]
    },
    recipients: undefined
  }),

  async mounted () {
    await this.adaptQuery()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('news', {
      removeNews: 'remove',
      findNews: 'find'
    }),
    ...mapActions('sendstats', {
      findSendstats: 'find',
      patchSendStats: 'patch',
      createSendStats: 'create'
    }),
    ...mapActions('newsletter', {
      findRecipients: 'find',
      createTestNewsletter: 'create'
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
      this.newsResponse = await this.findNews(
        this.newsParams
      )
      this.loading = false
    },
    async loadSendStats () {
      const tmpSendStats = await this.findSendstats(this.sendStatsParams)
      if (tmpSendStats && tmpSendStats.data) {
        this.sendStats = tmpSendStats.data[0]
      } else {
        this.sendStats = undefined
      }
    },
    async loadRecipients () {
      const tmpRecipients = await this.findRecipients()
      if (tmpRecipients) {
        this.recipients = tmpRecipients
      } else {
        this.recipients = undefined
      }
      return tmpRecipients
    },
    async sendTestNewsletter () {
      try {
        await this.createTestNewsletter(
          {
            reference: this.newsletterDialogItem._id,
            type: 'news',
            tmpTestUser: {
              email: this.user.email,
              id: this.user._id,
              language: this.user.language
            }
          }
        )
      } catch (e) {
        this.isSending = false
      }
    },
    async sendNewsletter () {
      this.isSending = true
      if (this.sendStats) {
        try {
          await this.patchSendStats(
            [
              this.sendStats._id,
              {},
              {}
            ]
          )
        } catch (e) {
          this.isSending = false
        }
      } else {
        try {
          await this.createSendStats(
            {
              reference: this.newsletterDialogItem._id,
              type: 'news'
            }
          )
        } catch (e) {
          this.isSending = false
        }
      }
      this.isSending = false
    },
    async deleteNews (id) {
      this.loaders[id + 'delete'] = true
      try {
        await this.removeNews(id)
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.loaders[id + 'delete'] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.loaders[id + 'delete'] = undefined
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
      'updateQuerySortOrder'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value' },
        { title: this.$t('createdAt'), key: 'createdAt', minWidth: 170 },
        { title: this.$t('updatedAt'), key: 'updatedAt', minWidth: 170 },
        { title: this.$t('editButton'), key: 'edit', sortable: false, align: 'center' },
        { title: this.$t('sendButton'), key: 'send', sortable: false, align: 'center' },
        { title: this.$t('deleteButton'), key: 'delete', sortable: false, align: 'center' },
        { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false }
      ]
    },
    sendStatsParams () {
      return {
        query: {
          reference: this.newsletterDialogItem?._id,
          type: 'news'
        }
      }
    },
    newsParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      if (this.queryObject.query) {
        query.title = {
          $elemMatch: {
            $and: [
              { value: { $regex: this.queryObject.query, $options: 'i' } },
              {
                $or: [
                  { lang: this.$i18n.locale },
                  { type: 'default' }
                ]
              }
            ]
          }
        }
      }
      return {
        query
      }
    },
    computedRecipients () {
      if (this.recipients) {
        if (this.searchRecipients) {
          return this.recipients.filter(obj => obj.email.includes(this.searchRecipients))
        } else {
          return this.recipients
        }
      } else {
        return []
      }
    },
    computedNews () {
      if (this.newsResponse && this.newsResponse.data) {
        return this.newsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.newsResponse) {
        return this.newsResponse.total
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
    'queryObject.query' () {
      this.updateQueryQuery(this.queryObject.query)
    },
    newsletterDialogItem () {
      if (this.newsletterDialogItem) {
        this.showNewsletterDialog = true
      } else {
        this.showNewsletterDialog = false
      }
    },
    showNewsletterDialog () {
      if (!this.showNewsletterDialog) {
        this.newsletterDialogItem = undefined
      }
    },
    newsParams: {
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
    sendStatsParams: {
      deep: true,
      async handler (newValue, oldValue) {
        if (
          this.newsletterDialogItem &&
          JSON.stringify(newValue) !== JSON.stringify(oldValue)
        ) {
          await this.loadSendStats()
        }
      }
    },
    async newsletterTab () {
      if (this.newsletterTab === 3) {
        await this.loadRecipients()
      }
    }
  }
}
</script>
