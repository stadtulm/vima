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
              v-html="$t('adsTitle')"
            >
            </div>
          </span>
          <span
            class="my-3 mr-3"
          >
            <v-btn
              v-if="computedFiltersDirty"
              variant="text"
              :color="$settings.modules.ads.color"
              @click="resetFilters()"
            >
              {{$t('resetFilters')}}
            </v-btn>
          </span>
          <span
            class="my-3 mr-6"
          >
            <v-badge
              v-model="computedFiltersDirty"
              :color="$settings.modules.ads.color"
            >
              <v-btn
                variant="outlined"
                :color="$settings.modules.ads.color"
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
          <span
            v-if="user"
            class="my-3 mr-3"
          >
            <v-btn
              :to="{ name: 'AdEditor' }"
              :color="$settings.modules.ads.color"
              class="text-white"
            >
              {{$t('newAdButton')}}
              <v-icon
                class="ml-3"
                size="18"
                color="white"
              >
                fas fa-plus
              </v-icon>
            </v-btn>
          </span>
        </v-row>
      </v-col>
    </v-row>
    <v-expand-transition
      mode="in-out"
    >
      <v-row
        v-if="showFilters"
      >
        <v-col
          cols="12"
          sm="4"
          md="2"
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
          sm="4"
          md="2"
        >
          <v-select
            v-model="queryObject.type"
            :item-color="$settings.modules.ads.color"
            :label="$t('type')"
            density="compact"
            hide-details
            :items="[
              { title: $t('all'), value: 'all'},
              { title: $t('offer'), value: 'offer'},
              { title: $t('wanted'), value: 'request' },
            ]"
          ></v-select>
        </v-col>
        <v-col
          cols="12"
          sm="4"
          md="2"
        >
          <v-select
            v-model="rawSortBy"
            :item-color="$settings.modules.ads.color"
            :label="$t('sortByLabel')"
            density="compact"
            hide-details
            :items="[
              { title: $t('sortDateAsc'), value: { key: 'createdAt', order: 'asc' } },
              { title: $t('sortDateDesc'), value: { key: 'createdAt', order: 'desc' } },
              { title: $t('sortTitleAsc'), value: { key: 'title.value', order: 'desc' }  },
              { title: $t('sortTitleDesc'), value: { key: 'title.value', order: 'asc' }  }
            ]"
          ></v-select>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-autocomplete
            v-model="queryObject.categories"
            :label="$t('filterByCategoriesLabel')"
            multiple
            auto-select-first
            density="compact"
            hide-details
            :items="categories.sort((a, b) => a.text.value.localeCompare(b.text.value))"
            item-title="text.value"
            item-value="_id"
          ></v-autocomplete>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-autocomplete
            v-model="queryObject.tags"
            :label="$t('filterByTagsLabel')"
            multiple
            auto-select-first
            chips
            closable-chips
            density="compact"
            hide-details
            :items="tags.sort((a, b) => a.text.localeCompare(b.text))"
            item-title="text"
            item-value="_id"
          ></v-autocomplete>
        </v-col>
      </v-row>
    </v-expand-transition>
    <template
      v-if="computedAds && computedAds.length > 0"
    >
      <v-row>
        <v-col
          v-for="ad in computedAds"
          :key="ad._id"
          cols="12"
          class="my-3"
        >
          <AdCard
            :adProp="ad"
            :allAdIds="computedAds.map(
                obj => ({
                  id: obj._id,
                  translationSum: obj.translationSum
                })
              )"
            @selectCategory="selectCategory"
            @selectTag="selectTag"
          ></AdCard>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          class="mx-0"
        >
          <v-pagination
            variant="outlined"
            :color="$settings.modules.ads.color"
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
            {{$t('noAdsYet')}}
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
            :color="$settings.modules.ads.color"
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
import AdCard from '@/components/AdCard.vue'

export default {
  name: 'AdsListView',

  components: {
    AdCard
  },

  data: () => ({
    rawSortBy: undefined,
    type: 'all',
    showFilters: false,
    loading: true,
    categoriesListDefault: [],
    tagsListDefault: [],
    searchDefault: '',
    typeDefault: 'all',
    adsResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'title.value', order: 'desc' }],
      categories: [],
      tags: [],
      type: 'all'
    }
  }),

  async mounted () {
    this.rawSortBy = { title: this.$t('sortTitleDesc'), value: this.queryObject.sortBy[0] }
    await this.adaptQuery()
  },

  methods: {
    ...mapActions('ads', {
      findAds: 'find'
    }),
    resetFilters () {
      this.queryObject.categories = this.categoriesListDefault
      this.queryObject.tags = this.tagsListDefault
      this.queryObject.type = this.typeDefault
      this.queryObject.query = this.searchDefault
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
    selectCategory (categoryId) {
      this.queryObject.tags = []
      this.queryObject.categories = [categoryId]
    },
    selectTag (tagId) {
      this.queryObject.categories = []
      this.queryObject.tags = [tagId]
    },
    async loadDataTableEntities () {
      this.loading = true
      try {
        this.adsResponse = await this.findAds(
          this.adsParams
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
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder',
      'updateQueryCategories',
      'updateQueryTags',
      'updateQueryType'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('categories', {
      categories: 'list'
    }),
    ...mapGetters('tags', {
      tags: 'list'
    }),
    computedFiltersDirty () {
      if (
        !this.areArraysEqual(this.queryObject.categories, this.categoriesListDefault) ||
        !this.areArraysEqual(this.queryObject.tags, this.tagsListDefault) ||
        this.queryObject.query !== this.searchDefault
      ) {
        return true
      } else {
        return false
      }
    },
    adsParams () {
      const query = {
        'accepted.isAccepted': true,
        isActive: true,
        $limit: this.computedLimit,
        $skip: (this.queryObject.query || this.queryObject.categories.length > 0 || this.queryObject.tags.length > 0) ? 0 : this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      if (this.queryObject.query) {
        query['title.value'] = {
          $regex: this.queryObject.query, $options: 'i'
        }
      }
      if (this.queryObject.categories.length > 0) {
        query.categories = { $in: this.queryObject.categories }
      }
      if (this.queryObject.tags.length > 0) {
        query.tags = { $in: this.queryObject.tags }
      }
      if (this.queryObject.type && this.queryObject.type !== 'all') {
        query.type = this.queryObject.type
      }
      return {
        query
      }
    },
    computedAds () {
      if (this.adsResponse && this.adsResponse.data) {
        return this.adsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.adsResponse) {
        return this.adsResponse.total
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
    async 'queryObject.categories' () {
      this.updateQueryCategories(this.queryObject.categories.join(','))
      await this.loadDataTableEntities()
    },
    async 'queryObject.tags' () {
      this.updateQueryTags(this.queryObject.tags.join(','))
      await this.loadDataTableEntities()
    },
    async 'queryObject.type' () {
      this.updateQueryType(this.queryObject.type)
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
