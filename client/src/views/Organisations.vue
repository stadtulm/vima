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
              v-html="$t('organisationsTitle')"
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
        >
          <v-text-field
            v-model="queryObject.query"
            :label="$t('filterByOrganisationNameLabel')"
            hide-details
            density="compact"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-expand-transition>
    <template
      v-if="computedOrganisations && computedOrganisations.length > 0"
    >
      <v-row
        class="mt-4"
      >
        <v-col
          v-for="organisation in computedOrganisations"
          :key="organisation._id"
          cols="12"
          sm="6"
          md="4"
        >
          <OrganisationCard
            :organisationProp="organisation"
          ></OrganisationCard>
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
            {{$t('noOrganisationsYet')}}
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
import OrganisationCard from '@/components/OrganisationCard.vue'

export default {
  name: 'Organisations',

  components: {
    OrganisationCard
  },

  data: () => ({
    showFilters: true,
    loading: true,
    searchDefault: '',
    organisationsResponse: undefined,
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
    ...mapActions('organisations', {
      findOrganisations: 'find'
    }),
    resetFilters () {
      this.queryObject.query = this.searchDefault
    },
    async loadDataTableEntities () {
      this.loading = true
      try {
        this.organisationsResponse = await this.findOrganisations(
          this.organisationParams
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
    organisationParams () {
      const query = {
        isActive: true,
        $limit: this.computedLimit,
        $skip: this.queryObject.query ? 0 : this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      if (this.queryObject.query) {
        query.name = { $regex: this.queryObject.query, $options: 'i' }
      }
      return { query }
    },
    computedOrganisations () {
      if (this.organisationsResponse?.data) {
        return this.organisationsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.organisationsResponse) {
        return this.organisationsResponse.total
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
