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
              v-html="$t('sponsorsTitle')"
            >
            </div>
          </span>
          <span
            class="my-3 mr-3"
          >
            <v-btn
              v-if="computedFiltersDirty"
              text
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
        >
          <v-text-field
            v-model="queryObject.query"
            :label="$t('filterBySponsorNameLabel')"
            hide-details
            density="compact"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-expand-transition>
    <template
      v-if="computedSponsors?.length > 0"
    >
      <v-row
        class="mt-4"
      >
        <v-col
          v-for="sponsor in computedSponsors"
          :key="sponsor._id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            class="pa-4"
            :class="sponsor.link ? 'pointer': ''"
            :href="sponsor.link"
            target="_blank"
            height="100%"
          >
            <v-img
              v-if="sponsor.pic && sponsor.pic.url"
              height="250px"
              contain
              :title="sponsor.pic && sponsor.pic.credit ? '© ' + sponsor.pic.credit : ''"
              :src="s3 + sponsor.pic.url"
            ></v-img>
            <v-divider
              class="mt-7 mb-2"
            ></v-divider>
            <v-card-text
              class="pa-0"
            >
              <v-card-title
                class="px-0 pb-0"
              >
                {{sponsor.name}}
              </v-card-title>
            </v-card-text>
          </v-card>
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
            {{$t('noSponsorsYet')}}
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

export default {
  name: 'Sponsors',

  components: {
  },

  data: () => ({
    showFilters: true,
    loading: true,
    searchDefault: '',
    sponsorsResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 12,
      sortBy: [{ key: 'position', order: 'asc' }]
    }
  }),

  async mounted () {
    await this.adaptQuery()
  },

  methods: {
    ...mapActions('sponsors', {
      findSponsors: 'find'
    }),
    resetFilters () {
      this.queryObject.query = this.searchDefault
    },
    async loadDataTableEntities () {
      this.loading = true
      try {
        this.sponsorsResponse = await this.findSponsors(
          this.sponsorParams
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
      's3',
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage'
    ]),
    computedFiltersDirty () {
      if (this.queryObject.query !== this.searchDefault) {
        return true
      } else {
        return false
      }
    },
    sponsorParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: this.queryObject.query ? 0 : this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      if (this.queryObject.query) {
        query.name = { $regex: this.queryObject.query, $options: 'i' }
      }
      return { query }
    },
    computedSponsors () {
      if (this.sponsorsResponse?.data) {
        return this.sponsorsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.sponsorsResponse) {
        return this.sponsorsResponse.total
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
    }
  },

  watch: {
    async 'queryObject.query' () {
      this.updateQueryQuery(this.queryObject.query)
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
