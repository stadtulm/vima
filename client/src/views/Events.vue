<template>
  <div>
    <v-row>
      <v-col
        class="d-flex mx-3 mb-4"
      >
        <v-row>
          <span
            class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
          >
            <div
              v-html="$t('eventsTitle')"
            >
            </div>
          </span>
          <span
            class="my-3 mr-3"
          >
            <v-btn
              v-if="computedFiltersDirty"
              variant="text"
              color="customGrey"
              @click="resetFilters()"
            >
              {{$t('resetFilters')}}
            </v-btn>
          </span>
          <span
            class="my-3 mr-1"
          >
            <v-badge
              :model-value="computedFiltersDirty"
              color="customGrey"
            >
              <v-btn
                variant="outlined"
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
          </span>
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
            v-model="queryObject.query"
            :label="$t('filterByTitleLabel')"
            hide-details
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="queryObject.location"
            :label="$t('filterByLocationLabel')"
            hide-details
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-select
            v-model="rawSortBy"
            :label="$t('sortByLabel')"
            density="compact"
            hide-details
            :items="[
              { title: $t('sortEventDateDesc'), value: { key: 'duration.end', order: 'desc' } },
              { title: $t('sortEventDateAsc'), value: { key: 'duration.end', order: 'asc' } },
              { title: $t('sortTitleAsc'), value: { key: 'title.value', order: 'desc' } },
              { title: $t('sortTitleDesc'), value: { key: 'title.value', order: 'asc' } },
              { title: $t('sortDateAsc'), value: { key: 'createdAt', order: 'asc' } },
              { title: $t('sortDateDesc'), value: { key: 'createdAt', order: 'desc' } }
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
            variant="outlined"
            color="customGrey"
            v-model="queryObject.page"
            :length="Math.ceil(computedTotal / queryObject.itemsPerPage)"
            :total-visible="6"
          ></v-pagination>
        </v-col>
      </v-row>
    </template>
    <template
      v-else-if="!loading"
    >
      <v-row>
        <v-col
          class="text-center text-customGrey text-body-1"
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
    rawSortBy: undefined,
    showFilters: false,
    loading: true,
    eventsResponse: undefined,
    searchDefault: '',
    locationDefault: '',
    queryObject: {
      query: '',
      location: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'duration.end', order: 'desc' }]
    }
  }),

  async mounted () {
    await this.adaptQuery()
    this.rawSortBy = this.queryObject.sortBy[0]
  },

  methods: {
    ...mapActions('events', {
      findEvents: 'find'
    }),
    resetFilters () {
      this.queryObject.query = this.searchDefault
      this.queryObject.location = this.locationDefault
    },
    async loadDataTableEntities () {
      this.loading = true
      try {
        this.eventsResponse = await this.findEvents(
          this.eventsParams
        )
      } catch (e) {
        if (e.code === 403) {
          this.$router.push({ name: 'Forbidden' })
        }
        return []
      }
      this.loading = false
    }
  },

  computed: {
    ...mapGetters([
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryLocation',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder'
    ]),
    computedFiltersDirty () {
      if (this.queryObject.query !== this.searchDefault || this.queryObject.location !== this.locationDefault) {
        return true
      } else {
        return false
      }
    },
    eventsParams () {
      const query = {
        isActive: true,
        $limit: this.computedLimit,
        $skip: this.queryObject.query || this.queryObject.location ? 0 : this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder } //,
        // 'duration.end': { $gte: this.$moment().subtract(7, 'days') }
      }
      if (this.queryObject.query) {
        query.title = {
          $elemMatch: {
            $and: [
              { value: { $regex: this.queryObject.query, $options: 'i' } },
              { type: 'default' }
            ]
          }
        }
      }
      if (this.queryObject.location) {
        query.location = { $regex: this.location, $options: 'i' }
      }
      return { query }
    },
    computedEvents () {
      if (this.eventsResponse?.data) {
        return this.eventsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.eventsResponse) {
        return this.eventsResponse.total
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
    rawSortBy () {
      this.queryObject.sortBy[0] = this.rawSortBy
    },
    'queryObject.sortBy': {
      deep: true,
      async handler () {
        this.updateQuerySortBy(this.queryObject.sortBy[0].key)
        this.updateQuerySortOrder(this.queryObject.sortBy[0].order)
        await this.loadDataTableEntities()
      }
    },
    async 'queryObject.query' () {
      this.updateQueryQuery(this.queryObject.query)
      await this.loadDataTableEntities()
    },
    async 'queryObject.location' () {
      this.updateQueryLocation(this.queryObject.location)
      await this.loadDataTableEntities()
    },
    async 'queryObject.page' () {
      this.updateQueryPage(this.queryObject.page)
      await this.loadDataTableEntities()
    },
    async 'queryObject.itemsPerPage' () {
      this.updateQueryItemsPerPage(this.queryObject.itemsPerPage)
      await this.loadDataTableEntities()
    }
  }
}
</script>
