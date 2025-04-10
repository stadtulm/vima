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
              v-html="$t('groupsTitle')"
            >
            </div>
          </span>
          <span
            class="my-3 mr-3"
          >
            <v-btn
              v-if="computedFiltersDirty"
              variant="text"
              :color="$settings.modules.groups.color"
              @click="resetFilters()"
            >
              {{$t('resetFilters')}}
            </v-btn>
          </span>
          <span
            class="my-3 mr-6"
          >
            <v-badge
              :model-value="computedFiltersDirty"
              :color="$settings.modules.groups.color"
            >
              <v-btn
                variant="outlined"
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
          </span>
          <span
            v-if="user"
            class="my-3 mr-1"
          >
            <v-btn
              :to="{ name: 'GroupEditor' }"
              :color="$settings.modules.groups.color"
              class="text-white"
            >
              {{$t('newGroupButton')}}
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
          sm="6"
          md="3"
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
          sm="12"
          md="3"
        >
          <v-select
            v-model="rawSortBy"
            :label="$t('sortByLabel')"
            density="compact"
            hide-details
            :items="[
              { title: $t('sortUpdateDesc'), value: { key: 'latestMessage', order: 'asc' } },
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
      v-if="computedElements && computedElements.length > 0"
    >
      <v-row>
        <v-col
          v-for="element in computedElements"
          :key="element._id"
          cols="12"
          sm="6"
          md="4"
        >
          <template
            v-if="element.type === 'group'"
          >
            <GroupCard
              :groupProp="element"
              :allGroupIds="groupsResponse.data.map(
                  obj => ({
                    id: obj._id,
                    translationSum: obj.translationSum
                  })
                )"
              @update:selectCategory="selectCategoryHandler"
              @update:selectTag="selectTagHandler"
            ></GroupCard>
          </template>
          <template v-else-if="element.type === 'theme'">
            <v-card
              flat
              color="#fffb"
              class="fill-height"
            >
              <v-card-text>
                <v-row>
                  <v-col
                    class="text-h6 font-weight-bold"
                    :style="'color:'+$settings.modules.groups.color"
                  >
                    <v-icon
                      class="mr-1 mb-1"
                      :color="$settings.modules.groups.color"
                      size="24"
                    >
                      fas fa-folder
                    </v-icon>
                    {{element.title?.value}}
                  </v-col>
                </v-row>
                <v-row
                  v-if="element.description?.value"
                >
                  <v-col
                    class="text-body-1"
                  >
                    {{element.description?.value}}
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="pt-0">
                    <v-card
                      class="py-1"
                      :color="$settings.modules.groups.color"
                    >
                      <v-card-text>
                        <v-row>
                          <v-col
                            v-for="group in element.groups"
                            :key="group._id"
                            cols="12"
                            class="py-2"
                          >
                            <v-card
                              color="customGreyUltraLight"
                            >
                              <v-card-text>
                                <div
                                  class="text-h7 font-weight-bold pointer"
                                  @click="$router.push({ name: 'Group', params: { group: group._id }})"
                                >
                                  <TranslatableText
                                    ownField="title"
                                    :allFields="['title', 'description']"
                                    type="groups"
                                    :allIds="groupsResponse.data.map(
                                      obj => ({
                                        id: obj._id,
                                        translationSum: obj.translationSum
                                      })
                                    )"
                                    :textParent="group"
                                  >
                                  </TranslatableText>
                                </div>
                              </v-card-text>
                            </v-card>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-pagination
            variant="outlined"
            :color="$settings.modules.groups.color"
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
import TranslatableText from '@/components/TranslatableText.vue'

export default {
  name: 'Groups',

  components: {
    GroupCard,
    TranslatableText
  },

  data: () => ({
    computedElements: [],
    rawSortBy: undefined,
    showFilters: true,
    loading: true,
    categoriesListDefault: [],
    tagsListDefault: [],
    searchDefault: '',
    groupsResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'latestMessage', order: 'asc' }],
      categories: [],
      tags: []
    }
  }),

  async mounted () {
    await this.adaptQuery()
    this.rawSortBy = this.queryObject.sortBy[0]
  },

  methods: {
    ...mapActions('groups', {
      findGroups: 'find'
    }),
    resetFilters () {
      this.queryObject.categories = this.categoriesListDefault
      this.queryObject.tags = this.tagsListDefault
      this.queryObject.query = this.searchDefault
    },
    async loadDataTableEntities () {
      this.loading = true
      try {
        this.groupsResponse = await this.findGroups(
          this.groupsParams
        )
      } catch (e) {
        if (e.code === 403) {
          this.$router.push({ name: 'Forbidden' })
        }
        return []
      }
      this.loading = false
    },
    selectCategoryHandler (categoryId) {
      this.selectCategory(categoryId)
    },
    selectTagHandler (tagId) {
      this.selectTag(tagId)
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
      'updateQueryType',
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
    ...mapGetters('status-containers', {
      statusContainers: 'list'
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
    groupsParams () {
      const query = {
        'accepted.isAccepted': true,
        isActive: true,
        $limit: this.computedLimit,
        $skip: (this.queryObject.query || this.queryObject.categories.length > 0 || this.queryObject.tags.length > 0) ? 0 : this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder },
        $or: [
          { visibility: 'public' },
          { visibility: 'private' },
          {
            $and: [
              { visibility: 'hidden' },
              {
                _id: {
                  $in: this.statusContainers.filter(obj =>
                    obj.reference && // TODO: Check how many containers without reference exist
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
      if (this.queryObject.query) {
        query.title = {
          $elemMatch: {
            $and: [
              { value: { $regex: this.queryObject.query, $options: 'i' } },
              { type: 'default' }
            ]
          }
        }
      }
      if (this.queryObject.categories.length > 0) {
        query.categories = { $in: this.queryObject.categories }
      }
      if (this.queryObject.tags.length > 0) {
        query.tags = { $in: this.queryObject.tags }
      }
      return {
        query
      }
    },
    computedTotal () {
      if (this.groupsResponse) {
        return this.groupsResponse.total
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
    async 'queryObject.page' () {
      this.updateQueryPage(this.queryObject.page)
      await this.loadDataTableEntities()
    },
    async 'queryObject.itemsPerPage' () {
      this.updateQueryItemsPerPage(this.queryObject.itemsPerPage)
      await this.loadDataTableEntities()
    },
    groupsResponse: {
      deep: true,
      async handler () {
        if (this.groupsResponse && this.groupsResponse.data) {
          const foundThemes = []
          const tmpGroups = JSON.parse(JSON.stringify(this.groupsResponse.data)).map(group => {
            if (!group.theme) {
              group.type = 'group'
              return group
            } else {
              if (!foundThemes.map(theme => theme._id).includes(group.theme._id)) {
                const tmpTheme = group.theme
                delete group.theme
                foundThemes.push(tmpTheme)
                tmpTheme.type = 'theme'
                tmpTheme.groups = [group]
                return tmpTheme
              } else {
                const foundThemeId = group.theme._id
                delete group.theme
                foundThemes.find(theme => theme._id === foundThemeId).groups.push(group)
                return null
              }
            }
          }).filter(element => !!element)
          foundThemes.map(theme => {
            for (const prop of ['title', 'description']) {
              let tmpTranslation = theme[prop]?.find(p => p.lang === this.$i18n.locale)
              if (!tmpTranslation) tmpTranslation = theme[prop]?.find(p => p.lang === this.$i18n.fallbackLocale)
              if (!tmpTranslation) tmpTranslation = theme[prop]?.find(p => p.type === 'default')
              if (tmpTranslation) theme[prop] = tmpTranslation
            }
            return theme
          })
          this.computedElements = tmpGroups
        } else {
          this.computedElements = []
        }
      }
    }
  }
}
</script>
