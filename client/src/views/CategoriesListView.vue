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
            {{$t('categories')}} {{ $route.params.type ? $t('for') + ' ' + $t(typeItems[$route.params.type]) : '' }}
          </v-col>
        </v-row>
      </v-col>
      <v-col
        class="shrink align-self-center"
      >
        <v-btn
          outlined
          :color="computedColor"
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
      <v-col
        v-if="user"
        class="shrink align-self-center"
      >
        <v-btn
          dark
          :to="{ name: $route.params.type[0].toUpperCase() + $route.params.type.substr(1, $route.params.type.length - 2) + 'Editor' }"
          :color="computedColor"
        >
          {{$t('new' + $route.params.type[0].toUpperCase() + $route.params.type.substr(1, $route.params.type.length - 2) + 'Button')}}
          <v-icon
            class="ml-3"
            size="18"
          >
            fas fa-plus
          </v-icon>
        </v-btn>
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
          class="pt-0"
        >
          <v-card
            color="transparent"
            flat
            class="my-3"
          >
            <v-row>
              <v-col>
                <v-text-field
                  v-model="search"
                  color="black"
                  :label="$t('filterByCategoryNameLabel')"
                  hide-details
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-expand-transition>
    <v-row>
      <v-col
        cols="12"
      >
        <v-btn
          block
          dark
          :color="computedColor"
          :to="{ name: $route.params.type[0].toUpperCase() + $route.params.type.substr(1) + 'ListView' }"
        >
          {{$t('buttonShowAllEntries')}}
        </v-btn>
      </v-col>
      <v-col
        cols="12"
      >
        <v-data-table
          item-class="pointer"
          class="customGreyUltraLight elevation-3"
          :headers="headers"
          :items="computedCategories.sort((a, b) => a.text.value.localeCompare(b.text.value))"
          @update:page="updatePage"
          @update:items-per-page="updateItemsPerPage"
          @update:sort-by="updateSortBy"
          @update:sort-desc="updateSortDesc"
          must-sort
          :page.sync="page"
          :items-per-page.sync="itemsPerPage"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :footer-props="{
            itemsPerPageText: '',
            itemsPerPageOptions
          }"
        >
          <template
            v-slot:[`item.pic`]="{ item }"
          >
            <v-img
              v-if="item.pic"
              :src="s3 + item.pic.url"
              contain
              max-height="100"
              max-width="100"
              :alt="$t('categoryPic')"
              :title="item.pic.credit ? '© ' + item.pic.credit : ''"
            >
            </v-img>
          </template>
          <template
            v-slot:[`item.text`]="{ item }"
          >
            <div
              class="pointer font-weight-bold"
              @click="$router.push({ name: $route.params.type[0].toUpperCase() + $route.params.type.substr(1) + 'ListView', query: { c: item._id }})"
            >
              {{item.text.value}}
            </div>
          </template>
          <template
            v-slot:[`item.entries`]="{ item }"
          >
            <span
              class="font-weight-bold pointer"
            >
              {{item[$route.params.type]}}
            </span>
          </template>

          <template
            v-slot:[`item.tags`]="{ item }"
          >
            <v-chip
              v-for="tag in getTags(item)"
              :key="tag._id"
              class="ma-1"
              :to="{ name: $route.params.type[0].toUpperCase() + $route.params.type.substr(1) + 'ListView', query: { c: item._id, t: tag._id } }"
            >
              {{tag.text.value}}
            </v-chip>
          </template>
          <template
            v-slot:[`item.description`]="{ item }"
          >
              {{item.description ? item.description.value : '-'}}
          </template>
        </v-data-table>
      </v-col>
      <v-col
        cols="12"
      >
        <v-btn
          block
          dark
          :color="computedColor"
          :to="{ name: $route.params.type[0].toUpperCase() + $route.params.type.substr(1) + 'ListView' }"
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
    search: '',
    showFilters: false,
    page: 1,
    total: 0,
    itemsPerPage: -1,
    sortBy: ['name'],
    sortDesc: [false]
  }),

  async mounted () {
    if (!this.categories || this.categories.length === 0) {
      if (this.$route.params.type) {
        const type = this.$route.params.type[0].toUpperCase() + this.$route.params.type.substr(1) + 'ListView'
        this.$router.replace({ params: { type: null } })
        this.$router.push({ name: type })
      }
    }
    this.initQuery()
  },

  methods: {
    ...mapActions('categories', {
      findCategories: 'find'
    }),
    ...mapActions('logging', {
      createLog: 'create'
    }),
    goToPage (i) {
      this.skip = this.itemsPerPage * (i - 1)
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
        const tmpDesc = this.$route.query.d.split(',')
        for (let i = 0; i < tmpDesc.length; i++) {
          if (tmpDesc[i] === 'true') {
            tmpDesc[i] = true
          } else if (tmpDesc[i] === 'false') {
            tmpDesc[i] = false
          }
        }
        this.sortDesc = tmpDesc
      }
    },
    updatePage (data) {
      if (parseInt(this.$route.query.p) !== data) {
        this.$router.replace(
          {
            query: {
              p: data,
              i: this.itemsPerPage,
              s: this.sortBy.join(','),
              d: this.sortDesc.join(',')
            }
          }
        )
      }
    },
    updateItemsPerPage (data) {
      if (parseInt(this.$route.query.i) !== data) {
        this.$router.replace(
          {
            query: {
              p: this.page,
              i: data,
              s: this.sortBy.join(','),
              d: this.sortDesc.join(',')
            }
          }
        )
      }
    },
    updateSortBy (data) {
      let tmpData
      if (Array.isArray(data)) {
        tmpData = data.join(',')
      } else {
        tmpData = data
      }
      if (data && this.$route.query.s !== tmpData) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: tmpData,
            d: this.sortDesc.join(',')
          }
        })
      } else if (!data) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc.join(',')
          }
        })
      }
    },
    updateSortDesc (data) {
      let tmpData
      if (Array.isArray(data)) {
        tmpData = data.join(',')
      } else {
        tmpData = data
      }
      if (data && this.$route.query.d !== tmpData) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: this.sortBy.join(','),
            d: tmpData
          }
        })
      }
    },
    getTags (category) {
      if (category[this.$route.params.type + 'Tags']) {
        const arrays = category[this.$route.params.type + 'Tags'].filter(obj => obj.tags).map(obj => obj.tags)
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
            .sort((a, b) => '' + a.text.value.localeCompare(b.text.value))
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
      'itemsPerPageOptions'
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
    headers () {
      return [
        { text: '', value: 'pic' },
        { text: this.$t('name'), value: 'text', width: '30%' },
        { text: this.$t('tags'), value: 'tags', sortable: false },
        { text: this.$t('description'), value: 'description', width: '50%' },
        { text: this.$t('entries'), value: 'entries', align: 'center' }
      ]
    },
    computedColor () {
      if (this.$settings.modules[this.$route.params.type] && this.$settings.modules[this.$route.params.type].color) {
        return this.$settings.modules[this.$route.params.type].color
      } else {
        return 'customGrey'
      }
    },
    computedCategories () {
      if (this.computedCategoriesWithCount) {
        if (this.search && this.search.trim() !== '') {
          return this.categories.filter(obj => obj.text.value.toLowerCase().includes(this.search.toLowerCase()))
        } else {
          return this.categories
        }
      } else {
        return []
      }
    }
  },

  asyncComputed: {
    async computedCategoriesWithCount () {
      if (this.$route.params.type) {
        return await this.findCategories({
          query: {
            $populate: [this.$route.params.type, this.$route.params.type + 'Tags']
          }
        })
      } else {
        return []
      }
    }
  }
}
</script>
