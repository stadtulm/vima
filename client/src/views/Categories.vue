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
        sm="4"
        md="3"
      >
        <v-lazy
          height="100%"
        >
          <v-card
            height="100%"
            :to="{ name: $route.params.type[0].toUpperCase() + $route.params.type.substr(1) }"
          >
            <v-img
              :src="''"
              cover
              height="150"
            >
            </v-img>
            <v-card-text>
              <v-card-title>
                {{$t('showAllEntriesHeadline')}}
              </v-card-title>
              <v-card-subtitle>
                {{$t('showAllEntriesBody')}}
              </v-card-subtitle>
            </v-card-text>
          </v-card>
        </v-lazy>
      </v-col>
      <v-col
        v-for="category in computedCategories.sort((a, b) => a.name.localeCompare(b.name))"
        :key="category._id"
        cols="12"
        sm="4"
        md="3"
      >
        <v-lazy
          height="100%"
        >
          <v-card
            height="100%"
            :to="{ name: $route.params.type[0].toUpperCase() + $route.params.type.substr(1), query: { c: category._id }}"
          >
            <v-container
              fluid
              class="fill-height"
            >
              <v-row
                class="align-self-start"
              >
                <v-col
                  class="pa-0"
                >
                  <v-img
                    v-if="category.pic"
                    :src="s3 + category.pic.url"
                    :alt="$t('categoryPic')"
                    :title="category.pic.credit ? '© ' + category.pic.credit : ''"
                    cover
                    height="150"
                  >
                  </v-img>
                  <v-card-title
                    class="word-wrap"
                  >
                    {{category.name}} ({{$route.params.type ? category[$route.params.type] + (category[$route.params.type] > 1 || category[$route.params.type] === 0 ? ' ' + $t('posts') : ' ' + $t('post')) : ''}})
                  </v-card-title>
                  <v-card-text>
                    {{category.description}}
                  </v-card-text>
                </v-col>
              </v-row>
              <v-row
                class="align-self-end"
              >
                <v-col>
                  <v-sheet
                    color="customGreyBg"
                    class="pa-2 align-self-end"
                    v-if="getTags(category).length > 0"
                  >
                    <v-chip
                      v-for="tag in getTags(category)"
                      :key="tag"
                      class="ma-1"
                      :to="{ name: $route.params.type[0].toUpperCase() + $route.params.type.substr(1), query: { c: category._id, t: tag }}"
                    >
                      {{getTag(tag).name}}
                    </v-chip>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-lazy>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Categories',

  components: {
  },

  data: () => ({
    search: '',
    showFilters: false
  }),

  async mounted () {
    if (!this.categories || this.categories.length === 0) {
      if (this.$route.params.type) {
        const type = this.$route.params.type[0].toUpperCase() + this.$route.params.type.substr(1)
        this.$router.replace({ params: { type: null } })
        this.$router.push({ name: type })
      }
    }
  },

  methods: {
    ...mapActions('categories', {
      findCategories: 'find'
    }),
    getTags (category) {
      if (category[this.$route.params.type + 'Tags']) {
        const arrays = category[this.$route.params.type + 'Tags'].filter(obj => obj.tags).map(obj => obj.tags)
        if (arrays.length > 0) {
          return [...new Set(arrays.reduce((flatten, arr) => [...flatten, ...arr]))]
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
      's3'
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
    computedColor () {
      if (this.$route.params.type === 'ads') {
        return 'customCyan'
      } else if (this.$route.params.type === 'discussions') {
        return 'customTeal'
      } else if (this.$route.params.type === 'groups') {
        return 'customPurple'
      } else {
        return 'customGrey'
      }
    },
    computedCategories () {
      if (this.computedCategoriesWithCount) {
        if (this.search && this.search.trim() !== '') {
          return this.categories.filter(obj => obj.name.toLowerCase().includes(this.search.toLowerCase()))
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
            $populate: [this.$route.params.type, this.$route.params.type + 'Tags'],
            $select: [this.$route.params.type]
          }
        })
      } else {
        return []
      }
    }
  }
}
</script>
