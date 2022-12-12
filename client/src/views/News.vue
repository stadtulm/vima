<template>
  <div>
    <v-row
      v-if="isPreview"
      class="mt-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        <span
          class="pointer"
          @click="$router.push({ name: 'News' })"
        >
          {{$t('news')}}
        </span>
        <v-btn
          icon
          color="customGrey"
          class="mb-1 ml-1"
          @click="$router.push({ name: 'News' })"
        >
          <v-icon>
            fas fa-arrow-right
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row
      v-else
    >
      <v-col
        cols="12"
        class="mb-4"
      >
        <v-row>
          <v-col
            class="text-h5 font-weight-bold customGrey--text text-uppercase"
          >
            {{$t('news')}}
          </v-col>
          <v-col
            class="shrink align-self-center"
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
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row
      v-if="!isPreview && showFilters"
    >
      <v-col
        cols="12"
        sm="6"
        md="6"
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
        md="6"
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
            { text: $t('sortDateAsc'), value: [['createdAt'], -1]},
            { text: $t('sortDateDesc'), value: [['createdAt'], 1]},
            { text: $t('sortTitleAsc'), value: [['title.value'], 1] },
            { text: $t('sortTitleDesc'), value: [['title.value'], -1] }
          ]"
        ></v-select>
      </v-col>
    </v-row>
    <template
      v-if="(computedNews && computedNews.length > 0)"
    >
      <v-row>
        <v-col
          v-for="newsEntry in computedNews"
          :key="newsEntry._id"
          cols="12"
          sm="6"
          md="4"
        >
          <NewsCard
            :newsProp="newsEntry"
          >
          </NewsCard>
        </v-col>
      </v-row>
      <v-row
        v-if="!isPreview"
      >
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
      v-else-if="!isFindNewsPending"
    >
      <v-row>
        <v-col
          class="text-center customGrey--text body-1"
        >
          <v-alert
            color="customGreyLight"
            class="pa-4"
          >
            {{$t('noNewsYet')}}
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
import NewsCard from '@/components/NewsCard.vue'

export default {
  name: 'News',

  components: {
    NewsCard
  },

  props: [
    'isPreview'
  ],

  data: () => ({
    showFilters: false,
    init: true,
    manualLoad: false,
    isFindNewsPending: false,
    triggerReload: 1,
    search: '',
    page: 1,
    loading: true,
    total: 0,
    itemsPerPage: 12,
    combinedSort: [['createdAt'], -1],
    sortBy: ['createdAt'],
    sortDesc: -1
  }),

  async mounted () {
    if (this.isPreview) {
      this.itemsPerPage = 3
    } else {
      // Save current query
      this.$router.options.tmpQuery = this.$route.query
      this.initQuery()
    }
  },

  methods: {
    ...mapActions('news', {
      findNews: 'find'
    }),
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
    }
  },

  computed: {
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('news', {
      allNews: 'list'
    }),
    computedNews () {
      if (this.computedNewsData && this.computedNewsData.data) {
        const tmp = JSON.parse(JSON.stringify(this.computedNewsData))
        return tmp.data
      } else {
        return []
      }
    }
  },

  asyncComputed: {
    async computedNewsData () {
      if (this.triggerReload) {}
      this.isFindNewsPending = true
      const query = {
        isActive: true,
        $limit: this.itemsPerPage,
        $skip: (this.page - 1) * this.itemsPerPage,
        $sort: { [this.sortBy]: this.sortDesc }
      }
      if (!this.user) {
        query.isInternal = false
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
      return await this.findNews(
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
      if (!this.isPreview && parseInt(this.$route.query.p) !== this.page) {
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
      if (!this.isPreview && parseInt(this.$route.query.i) !== this.itemsPerPage) {
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
      if (!this.isPreview) {
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
      }
    },
    sortDesc () {
      if (!this.isPreview && parseInt(this.$route.query.d) !== this.sortDesc) {
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
    allNews: {
      deep: true,
      handler (newValue, oldValue) {
        if (
          !this.init &&
          !this.manualLoad &&
          JSON.stringify(newValue) !== JSON.stringify(oldValue)
        ) {
          this.triggerReload = Date.now()
          this.manualLoad = true
        }
      }
    },
    computedNews (newValue, oldValue) {
      //
      this.total = this.computedNewsData.total
      //
      if (this.page > Math.ceil(this.total / this.itemsPerPage)) {
        this.page = Math.ceil(this.total / this.itemsPerPage) + 1
      }
      //
      this.isFindNewsPending = false
      this.init = false
      this.manualLoad = false
    }
  }
}
</script>
