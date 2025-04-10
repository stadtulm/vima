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
              v-html="
                $t('categories') + ' ' + $t('for') + ' ' + $t(typeItems['ads'])
              "
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
            class="my-3 mr-1"
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
        >
          <v-text-field
            v-model="queryObject.query"
            :label="$t('filterByCategoryNameLabel')"
            hide-details
            density="compact"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-expand-transition>

    <v-row>
      <v-col
        cols="12"
      >
        <v-btn
          block
          :color="$settings.modules.ads.color"
          class="text-white"
          :to="{ name: 'AdsListView' }"
        >
          {{$t('buttonShowAllEntries')}}
        </v-btn>
      </v-col>
      <v-col
        cols="12"
      >
        <v-data-table-server
          v-if="!initialView"
          v-model:items-per-page="queryObject.itemsPerPage"
          v-model:page="queryObject.page"
          :sort-by="queryObject.sortBy"
          :headers="headers"
          :items-length="computedTotal"
          :items="computedCategories"
          :loading="loading"
          class="customGreyUltraLight pb-3 elevation-3"
          item-value="_id"
          @update:options="updateDataTableParams"
          sort-asc-icon="fas fa-caret-up"
          sort-desc-icon="fas fa-caret-down"
          :show-current-page="true"
          :must-sort="true"
        >
          <template
            v-slot:[`item.text.value`]="{ item }"
          >
            <v-row
              class="pointer font-weight-bold"
              @click="$router.push({ name: 'AdsListView', query: { c: item._id }})"
            >
              <v-col
                class="text-title"
              >
                {{item.text.value}}
              </v-col>
            </v-row>
          </template>
          <template
            v-slot:[`item.entries`]="{ item }"
          >
            {{item.ads}}
          </template>

          <template
            v-slot:[`item.tags`]="{ item }"
          >
            <template
              v-if="getTags(item).length > 0"
            >
              <v-chip
                v-for="tag in getTags(item)"
                :key="tag._id"
                class="ma-1"
                :to="{ name: 'AdsListView', query: { c: item._id, t: tag._id } }"
              >
                {{tag.text}}
              </v-chip>
            </template>
            <template v-else>
              -
            </template>
          </template>
          <template
            v-slot:[`item.description`]="{ item }"
          >
              {{item.description ? item.description.value : '-'}}
          </template>
        </v-data-table-server>
      </v-col>
      <v-col
        cols="12"
      >
        <v-btn
          block
          :color="$settings.modules.ads.color"
          class="text-white"
          :to="{ name: 'AdsListView' }"
        >
          {{$t('buttonShowAllEntries')}}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CategoriesListView',

  components: {
  },

  data: () => ({
    showFilters: true,
    initialView: true,
    loading: true,
    searchDefault: '',
    categoriesResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'text.value', order: 'desc' }]
    }
  }),

  async mounted () {
    await this.adaptQuery()
  },

  methods: {
    ...mapActions('categories', {
      findCategories: 'find'
    }),
    ...mapActions('logging', {
      createLog: 'create'
    }),
    resetFilters () {
      this.queryObject.query = this.searchDefault
    },
    async updateDataTableParams (e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query
        }
        this.updateQueryQuery(this.queryObject.query)
        this.updateQueryPage(this.queryObject.page)
        this.updateQueryItemsPerPage(e.itemsPerPage)
        if (e.sortBy[0]) {
          this.updateQuerySortBy(e.sortBy[0].key)
          this.updateQuerySortOrder(e.sortBy[0].order)
        }
      }
    },
    async loadDataTableEntities () {
      this.loading = true
      this.categoriesResponse = await this.findCategories(
        this.categoriesParams
      )
      this.loading = false
    },
    getTags (category) {
      if (category.adsTags) {
        const arrays = category.adsTags.filter(obj => obj.tags).map(obj => obj.tags)
        if (arrays.length > 0) {
          return [
            ...new Set(
              arrays.reduce((flatten, arr) => [...flatten, ...arr])
            )
          ]
            .map(obj => {
              const tag = this.getTag(obj)
              if (tag) {
                return tag
              } else {
                this.createLog({ type: 'error', route: window.location.pathname, user: (this.user ? this.user._id : '-'), method: 'getTags (CategoriesListView)', message: 'Not existant category: ' + obj })
                return false
              }
            })
            .filter(obj => !!obj)
            .sort((a, b) => '' + a.text.localeCompare(b.text))
        } else {
          return []
        }
      } else {
        return []
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder'
    ]),
    ...mapGetters([
      'typeItems'
    ]),
    ...mapGetters('tags', {
      getTag: 'get'
    }),
    ...mapGetters('categories', {
      categories: 'list'
    }),
    ...mapGetters('auth', {
      user: 'user'
    }),
    computedFiltersDirty () {
      if (
        this.queryObject.query !== this.searchDefault
      ) {
        return true
      } else {
        return false
      }
    },
    headers () {
      return [
        { title: this.$t('name'), key: 'text.value', minWidth: '30%' },
        { title: this.$t('tags'), key: 'tags', sortable: false },
        { title: this.$t('description'), key: 'description', minWidth: '50%', sortable: false },
        { title: this.$t('entries'), key: 'entries', align: 'center' }
      ]
    },
    categoriesParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder },
        $populate: ['ads', 'adsTags']
      }
      if (this.queryObject.query) {
        query.text = {
          $elemMatch: {
            $and: [
              { value: { $regex: this.queryObject.query, $options: 'i' } },
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
      return {
        query
      }
    },
    computedCategories () {
      if (this.categoriesResponse && this.categoriesResponse.data) {
        return this.categoriesResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.categoriesResponse) {
        return this.categoriesResponse.total
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
    'queryObject.query' () {
      this.updateQueryQuery(this.queryObject.query)
    },
    categoriesParams: {
      deep: true,
      async handler (newValue, oldValue) {
        if (
          !this.initialView &&
          JSON.stringify(newValue) !== JSON.stringify(oldValue)
        ) {
          await this.loadDataTableEntities()
        }
      }
    }
  }
}
</script>
