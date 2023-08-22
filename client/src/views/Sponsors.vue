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
              v-html="$t('sponsorsTitle')"
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
            :label="$t('filterBySponsorNameLabel')"
            hide-details
            outlined
            dense
          ></v-text-field>
        </v-col>
      </v-row>
    </v-expand-transition>
    <template
      v-if="computedSponsors && computedSponsors.length > 0"
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
            class="pointer pa-4"
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
              class="mt-7 mb-0"
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
            color="customGrey"
            v-model="page"
            :length="Math.ceil(total / itemsPerPage)"
            :total-visible="6"
          ></v-pagination>
        </v-col>
      </v-row>
    </template>
    <template
      v-else-if="!isFindSponsorsPending"
    >
      <v-row>
        <v-col
          class="text-center customGrey--text text-body-1"
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
    showFilters: false,
    init: true,
    manualLoad: false,
    isFindSponsorsPending: false,
    triggerReload: 1,
    page: 1,
    loading: true,
    search: '',
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
    ...mapActions('sponsors', {
      findSponsors: 'find'
    }),
    resetFilters () {
      this.search = this.searchDefault
    },
    initQuery () {
      // Process query
      if (this.$route.query.i) {
        this.itemsPerPage = parseInt(this.$route.query.i)
      }
      if (this.$route.query.p) {
        this.page = parseInt(this.$route.query.p)
      }
    }
  },

  computed: {
    ...mapGetters([
      's3'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('sponsors', {
      allSponsors: 'list'
    }),
    computedFiltersDirty () {
      if (this.search !== this.searchDefault) {
        return true
      } else {
        return false
      }
    },
    computedSponsors () {
      if (this.computedSponsorsData && this.computedSponsorsData.data) {
        return this.computedSponsorsData.data
      } else {
        return []
      }
    }
  },
  asyncComputed: {
    async computedSponsorsData () {
      if (this.triggerReload) {}
      this.isFindSponsorsPending = true
      const query = {
        $limit: this.itemsPerPage,
        $skip: (this.page - 1) * this.itemsPerPage,
        $sort: { [this.sortBy]: this.sortDesc }
      }
      if (this.search && this.search !== '') {
        query.name = { $regex: this.search, $options: 'i' }
      }
      return await this.findSponsors(
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
    allSponsors: {
      deep: true,
      handler (newValue, oldValue) {
        if (!this.init && !this.manualLoad) {
          this.triggerReload = Date.now()
          this.manualLoad = true
        }
      }
    },
    computedSponsors (newValue, oldValue) {
      //
      this.total = this.computedSponsorsData.total
      //
      if (this.page > Math.ceil(this.total / this.itemsPerPage)) {
        this.page = Math.ceil(this.total / this.itemsPerPage) + 1
      }
      //
      this.isFindSponsorsPending = false
      this.init = false
      this.manualLoad = false
    }
  }
}
</script>
