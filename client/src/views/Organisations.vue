<template>
  <div>
    <v-row>
      <v-col
        class="mb-4"
      >
        <v-row>
          <v-col
            class="text-h5 font-weight-bold text-customGrey text-uppercase"
          >
            <div
              v-html="$t('organisationsTitle')"
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
        >
          <v-text-field
            v-model="search"
            color="black"
            :label="$t('filterByOrganisationNameLabel')"
            hide-details
            outlined
            dense
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
            color="customGrey"
            v-model="page"
            :length="Math.ceil(total / itemsPerPage)"
            :total-visible="6"
          ></v-pagination>
        </v-col>
      </v-row>
    </template>
    <template
      v-else-if="!isFindOrganisationsPending"
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
    showFilters: false,
    init: true,
    manualLoad: false,
    isFindOrganisationsPending: false,
    triggerReload: 1,
    page: 1,
    loading: true,
    categoriesList: [],
    tagsList: [],
    search: '',
    categoriesListDefault: [],
    tagsListDefault: [],
    searchDefault: '',
    total: 0,
    itemsPerPage: 12,
    combinedSort: [['position'], 1],
    sortBy: ['position'],
    sortDesc: 1
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
  },

  methods: {
    ...mapActions('organisations', {
      findOrganisations: 'find'
    }),
    resetFilters () {
      this.categoriesList = this.categoriesListDefault
      this.tagsList = this.tagsListDefault
      this.search = this.searchDefault
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
    ...mapGetters('organisations', {
      allOrganisations: 'list'
    }),
    computedFiltersDirty () {
      if (this.search !== this.searchDefault) {
        return true
      } else {
        return false
      }
    },
    computedOrganisations () {
      if (this.computedOrganisationsData && this.computedOrganisationsData.data) {
        return this.computedOrganisationsData.data
      } else {
        return []
      }
    }
  },
  asyncComputed: {
    async computedOrganisationsData () {
      if (this.triggerReload) {}
      this.isFindOrganisationsPending = true
      const query = {
        isActive: true,
        $limit: this.itemsPerPage,
        $skip: (this.page - 1) * this.itemsPerPage,
        $sort: { [this.sortBy]: this.sortDesc }
      }
      if (this.search && this.search !== '') {
        query.name = { $regex: this.search, $options: 'i' }
      }
      return await this.findOrganisations(
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
    allOrganisations: {
      deep: true,
      handler (newValue, oldValue) {
        if (!this.init && !this.manualLoad) {
          this.triggerReload = Date.now()
          this.manualLoad = true
        }
      }
    },
    computedOrganisations (newValue, oldValue) {
      //
      this.total = this.computedOrganisationsData.total
      //
      if (this.page > Math.ceil(this.total / this.itemsPerPage)) {
        this.page = Math.ceil(this.total / this.itemsPerPage) + 1
      }
      //
      this.isFindOrganisationsPending = false
      this.init = false
      this.manualLoad = false
    }
  }
}
</script>
