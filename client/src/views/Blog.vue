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
              v-html="$t('blogTitle')"
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
          md="6"
        >
          <v-text-field
            v-model="queryObject.query"
            color="black"
            :label="$t('filterByTitleLabel')"
            hide-details
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-select
            v-model="rawSortBy"
            :label="$t('sortByLabel')"
            density="compact"
            hide-details
            :items="[
              { title: $t('sortDateAsc'), value: { key: 'createdAt', order: 'asc' } },
              { title: $t('sortDateDesc'), value: { key: 'createdAt', order: 'desc' } },
              { title: $t('sortTitleAsc'), value: { key: 'title.value', order: 'desc' } },
              { title: $t('sortTitleDesc'), value: { key: 'title.value', order: 'asc' } }
            ]"
          ></v-select>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-autocomplete
            v-model="queryObject.categories"
            :label="$t('filterByCategoriesLabel')"
            multiple
            density="compact"
            hide-details
            :items="categories.sort((a, b) => a.text.value.localeCompare(b.text.value))"
            item-title="text.value"
            item-value="_id"
          ></v-autocomplete>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-autocomplete
            v-model="queryObject.tags"
            :label="$t('filterByTagsLabel')"
            multiple
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
      v-if="computedBlog?.length > 0"
    >
      <v-row>
        <v-col
          v-for="blogEntry in computedBlog"
          :key="blogEntry._id"
          cols="12"
          sm="6"
          md="4"
        >
          <BlogCard
            :blogProp="blogEntry"
            :allGroupIds="computedBlog.map(
                obj => ({
                  id: obj._id,
                  translationSum: obj.translationSum
                })
              )"
            @update:selectCategory="selectCategory"
            @update:selectTag="selectTag"
          ></BlogCard>
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
            {{$t('noGroupsYet')}}
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
import BlogCard from '@/components/BlogCard.vue'

export default {
  name: 'Blog',

  components: {
    BlogCard
  },

  data: () => ({
    rawSortBy: undefined,
    showFilters: false,
    loading: true,
    blogsResponse: undefined,
    search: '',
    categoriesListDefault: [],
    tagsListDefault: [],
    searchDefault: '',
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'createdAt', order: 'asc' }],
      categories: [],
      tags: []
    }
  }),

  async mounted () {
    this.rawSortBy = this.queryObject.sortBy[0]
    await this.adaptQuery()
  },

  methods: {
    ...mapActions('blog', {
      findBlogs: 'find'
    }),
    resetFilters () {
      this.queryObject.categories = this.categoriesListDefault
      this.queryObject.tags = this.tagsListDefault
      this.queryObject.query = this.searchDefault
    },
    async loadDataTableEntities () {
      this.loading = true
      try {
        this.blogsResponse = await this.findBlogs(
          this.blogParams
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
      'areArraysEqual',
      'selectTag',
      'selectCategory'
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
    blogParams () {
      const query = {
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
      if (!this.user) {
        query.isInternal = false
      }
      return {
        query
      }
    },
    computedBlog () {
      if (this.blogsResponse?.data) {
        return this.blogsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.blogsResponse) {
        return this.blogsResponse.total
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
