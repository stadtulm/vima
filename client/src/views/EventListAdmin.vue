 <template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('adminView')}} {{$t('manageEventsButton')}}
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
          :items="computedEvents"
          :loading="isFindEventsPending"
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
              </v-list-item-content>
            </v-list-item>
          </template>
           <template
            v-slot:[`item.organisation`]="{ item }"
          >
            <v-list-item
              class="pa-0"
            >
              <v-list-item-content>
                <v-list-item-title
                  class="font-weight-bold"
                >
                  <template v-if="item.organisation && item.organisation.name">
                    {{item.organisation.name}}
                  </template>
                  <template v-else>
                    <v-icon
                      color="error"
                    >
                      fas fa-exclamation-triangle
                    </v-icon>
                  </template>
                </v-list-item-title>
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
            v-slot:[`item.duration.start`]="{ item }"
          >
            {{$moment(item.duration.start).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.duration.end`]="{ item }"
          >
            {{$moment(item.duration.end).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
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
              @click="deleteEvent(item._id)"
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
              :to="{name: 'Event', params: { event: item._id } }"
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
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'EventListAdmin',

  components: {
  },

  data: () => ({
    isFindEventsPending: false,
    loaders: {},
    search: '',
    page: 1,
    loading: true,
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
    ...mapActions('events', {
      findEvents: 'find',
      removeEvent: 'remove'
    }),
    async deleteEvent (id) {
      this.$set(this.loaders, id + 'delete', true)
      try {
        await this.removeEvent(id)
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
      's3',
      'itemsPerPageOptions'
    ]),
    ...mapGetters('events', {
      events: 'list'
    }),
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        { text: this.$t('title'), value: 'title.value' },
        { text: this.$t('organisation'), value: 'organisation' },
        { text: this.$t('createdAt'), value: 'createdAt', width: 170 },
        { text: this.$t('updatedAt'), value: 'updatedAt', width: 170 },
        { text: this.$t('eventStart'), value: 'duration.start', width: 170 },
        { text: this.$t('eventEnd'), value: 'duration.end', width: 170 },
        { text: this.$t('deleteButton'), value: 'delete', sortable: false, align: 'center' },
        { text: this.$t('viewButton'), value: 'link', align: 'center', sortable: false }
      ]
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
    computedEvents () {
      if (this.computedEventsData && this.computedEventsData.data) {
        return this.computedEventsData.data
      } else {
        return []
      }
    }
  },

  asyncComputed: {
    async computedEventsData () {
      if (this.triggerReload) {}
      this.isFindEventsPending = true
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
      const tmpEvents = await this.findEvents(
        {
          query
        }
      )
      return tmpEvents
    }
  },

  watch: {
    events () {
      this.triggerReload = Date.now()
    },
    async computedEvents () {
    //
      this.total = this.computedEventsData.total
      //
      if (this.page > Math.ceil(this.total / this.itemsPerPage)) {
        this.page = Math.ceil(this.total / this.itemsPerPage) + 1
      }
      //
      this.isFindEventsPending = false
    }
  }
}
</script>
