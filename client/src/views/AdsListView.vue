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
              v-html="$t('adsTitle')"
            >
            </div>
          </v-col>
          <v-col
            class="shrink align-self-center"
          >
            <v-btn
              v-if="computedFiltersDirty"
              text
              :color="$settings.modules.ads.color"
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
              :color="$settings.modules.ads.color"
              overlap
            >
              <v-btn
                outlined
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
          </v-col>
          <v-col
            v-if="user"
            class="shrink align-self-center"
          >
            <v-btn
              dark
              :to="{ name: 'AdEditor' }"
              :color="$settings.modules.ads.color"
            >
              {{$t('newAdButton')}}
              <v-icon
                class="ml-3"
                size="18"
              >
                fas fa-plus
              </v-icon>
            </v-btn>
          </v-col>
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
          sm="4"
          md="2"
        >
          <v-select
            v-model="type"
            color="black"
            :item-color="$settings.modules.ads.color"
            :label="$t('type')"
            outlined
            dense
            hide-details
            :items="[
              { text: $t('all'), value: 'all'},
              { text: $t('offer'), value: 'offer'},
              { text: $t('wanted'), value: 'request' },
            ]"
          ></v-select>
        </v-col>
        <v-col
          cols="12"
          sm="4"
          md="2"
        >
          <v-select
            v-model="combinedSort"
            color="black"
            :item-color="$settings.modules.ads.color"
            :label="$t('sortByLabel')"
            outlined
            dense
            hide-details
            :items="[
              { text: $t('sortDateAsc'), value: [['createdAt'], -1]},
              { text: $t('sortDateDesc'), value: [['createdAt'], 1]},
              { text: $t('sortTitleAsc'), value: [['title.value'], 1] },
              { text: $t('sortTitleDesc'), value: [['title.value'], -1] }
            ]"
          ></v-select>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-autocomplete
            v-model="categoriesList"
            color="black"
            :item-color="$settings.modules.ads.color"
            :label="$t('filterByCategoriesLabel')"
            multiple
            outlined
            auto-select-first
            dense
            hide-details
            :items="categories.sort((a, b) => a.text.value.localeCompare(b.text.value))"
            item-text="text.value"
            item-value="_id"
          ></v-autocomplete>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-autocomplete
            v-model="tagsList"
            color="black"
            :item-color="$settings.modules.ads.color"
            :label="$t('filterByTagsLabel')"
            multiple
            outlined
            auto-select-first
            chips
            deletable-chips
            dense
            hide-details
            :items="tags.sort((a, b) => a.text.localeCompare(b.text))"
            item-text="text"
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
        <v-col>
          <v-pagination
            :color="$settings.modules.ads.color"
            v-model="page"
            :length="Math.ceil(total / itemsPerPage)"
            :total-visible="6"
          ></v-pagination>
        </v-col>
      </v-row>
    </template>
    <template
      v-else-if="!isFindAdsPending"
    >
      <v-row>
        <v-col
          class="text-center customGrey--text body-1"
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
    type: 'all',
    showFilters: false,
    init: true,
    manualLoad: false,
    isFindAdsPending: false,
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
    itemsPerPage: 25,
    combinedSort: [['createdAt'], -1],
    sortBy: ['createdAt'],
    sortDesc: -1
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
  },

  methods: {
    ...mapActions('ads', {
      findAds: 'find'
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
    selectCategory (categoryId) {
      this.tagsList = []
      this.categoriesList = [categoryId]
    },
    selectTag (tagId) {
      this.categoriesList = []
      this.tagsList = [tagId]
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
      if (this.$route.query.y) {
        this.type = this.$route.query.y
      }
    }
  },

  computed: {
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('categories', {
      categories: 'list'
    }),
    ...mapGetters('tags', {
      tags: 'list'
    }),
    ...mapGetters('ads', {
      allAds: 'list'
    }),
    computedFiltersDirty () {
      if (
        !this.areArraysEqual(this.categoriesList, this.categoriesListDefault) ||
        !this.areArraysEqual(this.tagsList, this.tagsListDefault) ||
        this.search !== this.searchDefault
      ) {
        return true
      } else {
        return false
      }
    },
    computedAds () {
      if (this.computedAdsData && this.computedAdsData.data) {
        return this.computedAdsData.data
      } else {
        return []
      }
    }
  },
  asyncComputed: {
    async computedAdsData () {
      if (this.triggerReload) {}
      this.isFindAdsPending = true
      const query = {
        'accepted.isAccepted': true,
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
              { type: 'default' }
            ]
          }
        }
      }
      if (this.categoriesList.length > 0) {
        query.categories = { $in: this.categoriesList }
      }
      if (this.tagsList.length > 0) {
        query.tags = { $in: this.tagsList }
      }
      if (this.type && this.type !== 'all') {
        query.type = this.type
      }
      try {
        return await this.findAds(
          {
            query
          }
        )
      } catch (e) {
        if (e.code === 403) {
          this.$router.push({ name: 'Forbidden' })
        }
        return []
      }
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
              d: this.sortDesc,
              c: this.categoriesList.join(','),
              t: this.tagsList.join(','),
              y: this.type
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
              d: this.sortDesc,
              c: this.categoriesList.join(','),
              t: this.tagsList.join(','),
              y: this.type
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
            d: this.sortDesc,
            c: this.categoriesList.join(','),
            t: this.tagsList.join(','),
            y: this.type
          }
        })
      } else if (!this.sortBy) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc,
            c: this.categoriesList.join(','),
            t: this.tagsList.join(','),
            y: this.type
          }
        })
      }
    },
    categoriesList () {
      let tmpData
      if (Array.isArray(this.categoriesList)) {
        tmpData = this.categoriesList.join(',')
      } else {
        tmpData = this.categoriesList
      }
      if (this.categoriesList && this.$route.query.c !== tmpData) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: this.sortBy.join(','),
            d: this.sortDesc,
            c: tmpData,
            t: this.tagsList.join(','),
            y: this.type
          }
        })
      } else if (!this.sortBy) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc,
            y: this.type
          }
        })
      }
    },
    tagsList () {
      let tmpData
      if (Array.isArray(this.tagsList)) {
        tmpData = this.tagsList.join(',')
      } else {
        tmpData = this.tagsList
      }
      if (this.tagsList && this.$route.query.t !== tmpData) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: this.sortBy.join(','),
            d: this.sortDesc,
            c: this.categoriesList.join(','),
            t: tmpData,
            y: this.type
          }
        })
      } else if (!this.sortBy) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc,
            y: this.type
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
              t: this.tagsList.join(','),
              y: this.type
            }
          }
        )
      }
    },
    type () {
      if (this.type && this.$route.query.y !== this.type) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: this.sortBy.join(','),
            d: this.sortDesc,
            c: this.categoriesList.join(','),
            t: this.tagsList.join(','),
            y: this.type
          }
        })
      } else if (!this.sortBy) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc,
            t: this.tagsList.join(',')
          }
        })
      }
    },
    allAds: {
      deep: true,
      handler (newValue, oldValue) {
        if (!this.init && !this.manualLoad) {
          this.triggerReload = Date.now()
          this.manualLoad = true
        }
      }
    },
    computedAds (newValue, oldValue) {
      //
      this.total = this.computedAdsData.total
      //
      if (this.page > Math.ceil(this.total / this.itemsPerPage)) {
        this.page = Math.ceil(this.total / this.itemsPerPage) + 1
      }
      //
      this.isFindAdsPending = false
      this.init = false
      this.manualLoad = false
    }
  }
}
</script>
