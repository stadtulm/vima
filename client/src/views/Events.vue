<template>
  <div>
    <v-row>
      <v-col
        class="mb-4"
      >
        <v-row>
          <v-col
            class="text-h5 font-weight-bold customGrey--text text-uppercase"
          >
            <div
              v-html="$t('eventsTitle')"
            >
            </div>
          </v-col>
          <v-col
            class="shrink align-self-center"
          >
            <v-btn
              v-if="computedFiltersDirty"
              text
              color="customGrey"
              @click="resetFilters()"
            >
              {{$t('resetFilters')}}
            </v-btn>
          </v-col>
          <v-col
            class="shrink align-self-center"
          >
            <v-badge
              :value="computedFiltersDirty"
              color="customGrey"
              overlap
            >
              <v-btn
                outlined
                color="customGrey"
                @click="showFilters = !showFilters"
              >
                {{ showFilters ? $t('hideFiltersButton') : $t('showFiltersButton') }}
                <v-icon
                  size="18"
                  class="ml-3"
                >
                  {{showFilters ? 'fas fa-chevron-up': 'fas fa-chevron-down'}}
                </v-icon>
              </v-btn>
            </v-badge>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-expand-transition
      mode="in-out"
    >
      <v-row
        v-if="showFilters"
        class="mb-4"
      >
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="search"
            color="black"
            :label="$t('filterByTitleLabel')"
            hide-details
            outlined
            dense
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="location"
            color="black"
            :label="$t('filterByLocationLabel')"
            hide-details
            outlined
            dense
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-select
            v-model="combinedSort"
            color="black"
            item-color="customGrey"
            :label="$t('sortByLabel')"
            outlined
            dense
            hide-details
            :items="[

              { text: $t('sortEventDateDesc'), value: [['duration.end'], 1]},
              { text: $t('sortEventDateAsc'), value: [['duration.end'], -1]},
              { text: $t('sortTitleAsc'), value: [['title.value'], 1] },
              { text: $t('sortTitleDesc'), value: [['title.value'], -1] },
              { text: $t('sortDateAsc'), value: [['createdAt'], -1]},
              { text: $t('sortDateDesc'), value: [['createdAt'], 1]},
            ]"
          ></v-select>
        </v-col>
      </v-row>
    </v-expand-transition>
    <template
      v-if="computedEvents && computedEvents.length > 0"
    >
      <v-row>
        <v-col
          v-for="event in computedEvents"
          :key="event._id"
          cols="12"
          sm="6"
          lg="4"
        >
          <EventCard
            :eventProp="event"
          ></EventCard>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-pagination
            color="customGrey"
            v-model="page"
            :length="Math.ceil(total / itemsPerPage)"
            :total-visible="6"
          ></v-pagination>
        </v-col>
      </v-row>
    </template>
    <template
      v-else-if="!isFindEventsPending"
    >
      <v-row>
        <v-col
          class="text-center customGrey--text text-body-1"
        >
          <v-alert
            color="customGreyLight"
            class="pa-4"
          >
            {{$t('noEventsYet')}}
          </v-alert>
        </v-col>
      </v-row>
    </template>
    <template
      v-else
    >
      <v-row>
        <v-col
          class="text-center"
        >
          <v-progress-circular
            color="customGrey"
            indeterminate
            size="160"
            width="6"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import EventCard from '@/components/EventCard.vue'

export default {
  name: 'Events',

  components: {
    EventCard
  },

  data: () => ({
    showFilters: false,
    init: true,
    manualLoad: false,
    isFindEventsPending: false,
    triggerReload: 1,
    page: 1,
    loading: true,
    categoriesList: [],
    tagsList: [],
    search: '',
    location: '',
    locationDefault: '',
    categoriesListDefault: [],
    tagsListDefault: [],
    searchDefault: '',
    total: 0,
    itemsPerPage: 12,
    combinedSort: [['duration.end'], -1],
    sortBy: ['duration.end'],
    sortDesc: -1
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
  },

  methods: {
    ...mapActions('events', {
      findEvents: 'find'
    }),
    resetFilters () {
      this.categoriesList = this.categoriesListDefault
      this.tagsList = this.tagsListDefault
      this.search = this.searchDefault
      this.location = this.locationDefault
    },
    areArraysEqual (array1, array2) {
      if (
        JSON.stringify(array1.slice().sort()) === JSON.stringify(array2.slice().sort())
      ) {
        return true
      } else {
        return false
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
        this.sortDesc = parseInt(this.$route.query.d)
      }
      if (this.$route.query.d || this.$route.query.s) {
        this.combinedSort = [this.sortBy, this.sortDesc]
      }
      if (this.$route.query.c) {
        this.categoriesList = this.$route.query.c.split(',')
      }
      if (this.$route.query.t) {
        this.tagsList = this.$route.query.t.split(',')
      }
    }
  },

  computed: {
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('events', {
      allEvents: 'list'
    }),
    computedFiltersDirty () {
      if (this.search !== this.searchDefault || this.location !== this.locationDefault) {
        return true
      } else {
        return false
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
        isActive: true,
        $limit: this.itemsPerPage,
        $skip: (this.page - 1) * this.itemsPerPage,
        $sort: { [this.sortBy]: this.sortDesc }
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
      if (this.location && this.location !== '') {
        query.location = { $regex: this.location, $options: 'i' }
      }
      return await this.findEvents(
        {
          query
        }
      )
    }
  },

  watch: {
    combinedSort (newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        this.sortBy = this.combinedSort[0]
        this.sortDesc = this.combinedSort[1]
      }
    },
    page () {
      if (parseInt(this.$route.query.p) !== this.page) {
        this.$router.replace(
          {
            query: {
              p: this.page,
              i: this.itemsPerPage,
              s: this.sortBy.join(','),
              d: this.sortDesc
            }
          }
        )
      }
    },
    itemsPerPage () {
      if (parseInt(this.$route.query.i) !== this.itemsPerPage) {
        this.$router.replace(
          {
            query: {
              p: this.page,
              i: this.itemsPerPage,
              s: this.sortBy.join(','),
              d: this.sortDesc
            }
          }
        )
      }
    },
    sortBy () {
      let tmpData
      if (Array.isArray(this.sortBy)) {
        tmpData = this.sortBy.join(',')
      } else {
        tmpData = this.sortBy
      }
      if (this.sortBy && this.$route.query.s !== tmpData) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: tmpData,
            d: this.sortDesc
          }
        })
      } else if (!this.sortBy) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc
          }
        })
      }
    },
    sortDesc () {
      if (parseInt(this.$route.query.d) !== this.sortDesc) {
        this.$router.replace(
          {
            query: {
              p: this.page,
              i: this.itemsPerPage,
              s: this.sortBy.join(','),
              d: this.sortDesc,
              c: this.categoriesList.join(','),
              t: this.tagsList.join(',')
            }
          }
        )
      }
    },
    allEvents: {
      deep: true,
      handler (newValue, oldValue) {
        if (!this.init && !this.manualLoad) {
          this.triggerReload = Date.now()
          this.manualLoad = true
        }
      }
    },
    computedEvents (newValue, oldValue) {
      //
      this.total = this.computedEventsData.total
      //
      if (this.page > Math.ceil(this.total / this.itemsPerPage)) {
        this.page = Math.ceil(this.total / this.itemsPerPage) + 1
      }
      //
      this.isFindEventsPending = false
      this.init = false
      this.manualLoad = false
    }
  }
}
</script>
