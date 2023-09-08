<template>
  <div>
    <v-row>
      <v-col
        cols="12"
        class="mb-4"
      >
        <v-row>
          <v-col
            class="text-h5 font-weight-bold text-customGrey text-uppercase"
          >
            <div
              v-html="$t('groupsTitle')"
            >
            </div>
          </v-col>
          <v-col
            class="shrink align-self-center"
          >
            <v-btn
              v-if="computedFiltersDirty"
              text
              :color="$settings.modules.groups.color"
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
              :color="$settings.modules.groups.color"
              overlap
            >
              <v-btn
                outlined
                :color="$settings.modules.groups.color"
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
              :to="{ name: 'GroupEditor' }"
              :color="$settings.modules.groups.color"
            >
              {{$t('newGroupButton')}}
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
        class="mb-4"
      >
        <v-col
          cols="12"
          sm="6"
          md="3"
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
          sm="12"
          md="3"
        >
          <v-select
            v-model="combinedSort"
            color="black"
            :item-color="$settings.modules.groups.color"
            :label="$t('sortByLabel')"
            outlined
            dense
            hide-details
            :items="[
              { text: $t('sortUpdateDesc'), value: [['latestMessage'], -1]},
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
            :item-color="$settings.modules.groups.color"
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
            :item-color="$settings.modules.groups.color"
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
      v-if="computedGroups && computedGroups.length > 0"
    >
      <v-row>
        <v-col
          v-for="group in computedGroups"
          :key="group._id"
          cols="12"
          sm="6"
          md="4"
        >
          <GroupCard
            :groupProp="group"
            :allGroupIds="computedGroups.map(
                obj => ({
                  id: obj._id,
                  translationSum: obj.translationSum
                })
              )"
            @selectCategory="selectCategory"
            @selectTag="selectTag"
          ></GroupCard>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-pagination
            :color="$settings.modules.groups.color"
            v-model="page"
            :length="Math.ceil(total / itemsPerPage)"
            :total-visible="6"
          ></v-pagination>
        </v-col>
      </v-row>
    </template>
    <template
      v-else-if="!isFindGroupsPending"
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
            :color="$settings.modules.groups.color"
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
import GroupCard from '@/components/GroupCard.vue'

export default {
  name: 'Groups',

  components: {
    GroupCard
  },

  data: () => ({
    showFilters: false,
    init: true,
    manualLoad: false,
    isFindGroupsPending: false,
    triggerReload: 1,
    page: 1,
    loading: true,
    search: '',
    categoriesList: [],
    tagsList: [],
    categoriesListDefault: [],
    tagsListDefault: [],
    searchDefault: '',
    total: 0,
    itemsPerPage: 12,
    combinedSort: [['latestMessage'], -1],
    sortBy: ['latestMessage'],
    sortDesc: -1
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
  },

  methods: {
    ...mapActions('groups', {
      findGroups: 'find'
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
    ...mapGetters('groups', {
      allGroups: 'list'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
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
    computedGroups () {
      if (this.computedGroupsData && this.computedGroupsData.data) {
        return this.computedGroupsData.data
      } else {
        return []
      }
    }
  },
  asyncComputed: {
    async computedGroupsData () {
      if (this.triggerReload) {}
      this.isFindGroupsPending = true
      const query = {
        'accepted.isAccepted': true,
        isActive: true,
        $limit: this.itemsPerPage,
        $skip: (this.page - 1) * this.itemsPerPage,
        $sort: { [this.sortBy]: this.sortDesc },
        $or: [
          { visibility: 'public' },
          { visibility: 'private' },
          {
            $and: [
              { visibility: 'hidden' },
              {
                _id: {
                  $in: this.statusContainers.filter(obj =>
                    obj.user === this.user._id &&
                    obj.type === 'groups' &&
                    obj.relation !== 'applicant'
                  ).map(obj => obj.reference)
                }
              }
            ]
          }
        ]
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
      return await this.findGroups(
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
              d: this.sortDesc,
              c: this.categoriesList.join(','),
              t: this.tagsList.join(',')
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
              t: this.tagsList.join(',')
            }
          }
        )
      }
    },
    sortBy () {
      let tmpData
      this.page = 1
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
            t: this.tagsList.join(',')
          }
        })
      } else if (!this.sortBy) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc,
            c: this.categoriesList.join(','),
            t: this.tagsList.join(',')
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
            t: this.tagsList.join(',')
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
            t: tmpData
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
    allGroups: {
      deep: true,
      handler (newValue, oldValue) {
        if (!this.init && !this.manualLoad) {
          this.triggerReload = Date.now()
          this.manualLoad = true
        }
      }
    },
    computedGroups (newValue, oldValue) {
      //
      this.total = this.computedGroupsData.total
      //
      if (this.page > Math.ceil(this.total / this.itemsPerPage)) {
        this.page = Math.ceil(this.total / this.itemsPerPage) + 1
      }
      //
      this.isFindGroupsPending = false
      this.init = false
      this.manualLoad = false
    }
  }
}
</script>
