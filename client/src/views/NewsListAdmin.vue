<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('adminView')}} {{$t('news')}}
      </v-col>
      <v-col
        class="shrink align-self-center"
      >
        <v-btn
          dark
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
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          :label="$t('filterByTitleLabel')"
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
          :items="computedNews"
          :loading="isFindNewsPending"
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
              color="customGrey"
            ></v-progress-linear>
          </template>
          <template
            v-slot:[`item.title.value`]="{ item }"
          >
            <v-list-item
              class="pa-0"
            >
              <v-list-item-content>
                <v-list-item-title
                  class="font-weight-bold"
                >
                  {{item.title.value}}
                </v-list-item-title>
                <v-list-item-subtitle
                  v-if="item.subTitle && item.subTitle !== ''"
                >
                  {{item.subTitle.value}}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
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
              fab
              small
              color="customGrey"
              class="my-3"
              :to="{ name: 'NewsEditor', params: { id: item._id } }"
            >
              <v-icon
                color="white"
                size="18"
              >
                fa fa-pen
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.send`]="{ item }"
          >
            <v-btn
              fab
              small
              color="customGrey"
              class="my-3"
              @click="newsletterDialogItem = item"
            >
              <v-icon
                color="white"
                size="18"
              >
                fa fa-inbox
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-btn
              fab
              small
              color="customGrey"
              class="my-3"
              :loading="loaders[item._id + 'delete'] === true"
              @click="deleteNews(item._id)"
            >
              <template
                slot="loader"
              >
                <v-progress-circular
                  color="white"
                  width="3"
                  indeterminate
                ></v-progress-circular>
              </template>
              <v-icon
                color="white"
                size="18"
              >
                fa fa-trash
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.link`]="{ item }"
          >
            <v-btn
              fab
              small
              color="customGrey"
              class="my-4"
              :to="{name: 'NewsEntry', params: { id: item._id } }"
            >
              <v-icon
                color="white"
                size="18"
              >
                fa fa-arrow-right
              </v-icon>
            </v-btn>
          </template>
        </v-data-table>
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
              <v-tabs-items v-model="newsletterTab">
                <v-tab-item>
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
                </v-tab-item>
                <v-tab-item>
                  <v-data-table
                    v-if="sendStats"
                    :headers="[
                      { text: this.$t('id'), value: 'id' },
                      { text: this.$t('email'), value: 'email' },
                      { text: this.$t('type'), value: 'type' },
                      { text: this.$t('dt'), value: 'dt' },
                    ]"
                    :items="sendStats.sent"
                    :footer-props="{
                      itemsPerPageText: '',
                      itemsPerPageOptions
                    }"
                  >
                    <template
                      v-slot:[`item.type`]="{ item }"
                    >
                      {{newsletterTypes[item.type]}}
                    </template>
                    <template
                      v-slot:[`item.dt`]="{ item }"
                    >
                      {{$moment(item.dt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
                    </template>
                  </v-data-table>
                </v-tab-item>
                <v-tab-item>
                  <v-data-table
                    v-if="sendStats"
                    :headers="[
                      { text: this.$t('id'), value: 'id' },
                      { text: this.$t('email'), value: 'email' },
                      { text: this.$t('type'), value: 'type' },
                      { text: this.$t('dt'), value: 'dt' },
                      { text: this.$t('errorMessage'), value: 'message' },
                    ]"
                    :items="sendStats.error"
                    :footer-props="{
                      itemsPerPageText: '',
                      itemsPerPageOptions
                    }"
                  >
                    <template
                      v-slot:[`item.type`]="{ item }"
                    >
                      {{newsletterTypes[item.type]}}
                    </template>
                    <template
                      v-slot:[`item.dt`]="{ item }"
                    >
                      {{$moment(item.dt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
                    </template>
                  </v-data-table>
                </v-tab-item>
                <v-tab-item>
                  <v-card>
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <v-text-field
                            v-model="searchRecipients"
                            background-color="white"
                            :label="$t('filterByEmailLabel')"
                            outlined
                            dense
                            hide-details
                            color="customGrey"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-data-table
                            :headers="[
                              { text: this.$t('id'), value: 'id' },
                              { text: this.$t('email'), value: 'email' },
                              { text: this.$t('type'), value: 'type' },
                            ]"
                            :items="computedRecievers"
                            :footer-props="{
                              itemsPerPageText: '',
                              itemsPerPageOptions
                            }"
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
                </v-tab-item>
              </v-tabs-items>
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

  components: {
  },

  data: () => ({
    isFindNewsPending: false,
    searchRecipients: undefined,
    newsletterTypes: {
      users: 'Mitglied',
      subscribers: 'Abonnent'
    },
    triggerStats: 1,
    isSending: false,
    newsletterTab: 0,
    newsletterDialogItem: undefined,
    showNewsletterDialog: false,
    loaders: {},
    search: '',
    page: 1,
    total: 0,
    itemsPerPage: 25,
    sortBy: ['updatedAt'],
    sortDesc: [true],
    triggerReload: 1
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
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
      this.triggerStats = Date.now()
      this.isSending = false
    },
    async deleteNews (id) {
      this.$set(this.loaders, id + 'delete', true)
      try {
        await this.removeNews(id)
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.$set(this.loaders, id + 'delete', undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.$set(this.loaders, id + 'delete', undefined)
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
      'itemsPerPageOptions'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('news', {
      news: 'list'
    }),
    headers () {
      return [
        { text: this.$t('title'), value: 'title.value' },
        { text: this.$t('createdAt'), value: 'createdAt', width: 170 },
        { text: this.$t('updatedAt'), value: 'updatedAt', width: 170 },
        { text: this.$t('editButton'), value: 'edit', sortable: false, align: 'center' },
        { text: this.$t('sendButton'), value: 'send', sortable: false, align: 'center' },
        { text: this.$t('deleteButton'), value: 'delete', sortable: false, align: 'center' },
        { text: this.$t('viewButton'), value: 'link', align: 'center', sortable: false }
      ]
    },
    computedRecievers () {
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
    computedNews () {
      if (this.computedNewsData && this.computedNewsData.data) {
        return this.computedNewsData.data
      } else {
        return []
      }
    }
  },

  asyncComputed: {
    async computedNewsData () {
      if (this.triggerReload) {}
      this.isFindNewsPending = true
      const query = {
        $limit: this.computedLimit,
        $skip: (this.page - 1) * this.computedSkip,
        $sort: { [this.sortBy]: this.computedSortDesc }
      }
      if (this.search && this.search !== '') {
        query.title = {
          $elemMatch: {
            $and: [
              { value: { $regex: this.search, $options: 'i' } },
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
      const tmpNews = await this.findNews(
        {
          query
        }
      )
      return tmpNews
    },
    async sendStats () {
      if (this.newsletterDialogItem && this.triggerStats) {
        const tmpSendStats = await this.findSendstats(
          {
            query: {
              reference: this.newsletterDialogItem._id,
              type: 'news'
            }
          }
        )
        if (tmpSendStats && tmpSendStats.data) {
          return tmpSendStats.data[0]
        }
      }
    },
    async recipients () {
      const tmpRecipients = await this.findRecipients()
      return tmpRecipients
    }
  },

  watch: {
    news () {
      this.triggerReload = Date.now()
    },
    computedNews (newValue, oldValue) {
      //
      this.total = this.computedNewsData.total
      //
      if (this.page > Math.ceil(this.total / this.itemsPerPage)) {
        this.page = Math.ceil(this.total / this.itemsPerPage) + 1
      }
      //
      this.isFindNewsPending = false
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
    }
  }
}
</script>
