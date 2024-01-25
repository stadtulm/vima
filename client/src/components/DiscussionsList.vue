<template>
  <div>
    <v-expand-transition
      mode="in-out"
    >
      <v-row
        v-if="showFilters"
      >
        <v-col
          cols="12"
          sm="4"
        >
          <v-text-field
            v-model="queryObject.query"
            :label="$t('filterByTitleLabel')"
            density="compact"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          sm="4"
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
          sm="4"
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
    <v-row>
      <v-col>
        <v-card
          tile
          color="transparent"
        >
          <v-data-table-server
            v-if="!initialView"
            v-model:items-per-page="queryObject.itemsPerPage"
            v-model:page="queryObject.page"
            :sort-by="queryObject.sortBy"
            :headers="headers"
            :items-length="computedTotal"
            :items="computedDiscussions"
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
              v-slot:[`item.title.value`]="{ item }"
            >
              <div
                class="pointer font-weight-bold"
                @click="
                  $router.push(
                    group ?
                      { name: 'GroupDiscussion', params: { group: group._id, id: item._id } } :
                      { name: 'Discussion', params: { id: item._id } }
                    )
                  "
              >
                <TranslatableText
                  ownField="title"
                  :allFields="['title']"
                  type="discussions"
                  :allIds="computedDiscussions.map(
                    obj => ({
                      id: obj._id,
                      translationSum: obj.translationSum
                    })
                  )"
                  :textParent="item"
                >
                </TranslatableText>
              </div>
            </template>
            <template
              v-slot:[`item.author`]="{ item }"
            >
              {{item.author && item.author.user ? item.author.user.userName : ''}}
            </template>
            <template
              v-slot:[`item.createdAt`]="{ item }"
            >
              {{ $moment(item.createdAt).format('DD.MM.YYYY, HH:mm') }} {{$t('oClock')}}
            </template>
            <template
              v-slot:[`item.latestMessage`]="{ item }"
            >
              {{ item.latestMessage ? $moment(item.latestMessage).format('DD.MM.YYYY, HH:mm') + ' ' + $t('oClock')  : '-' }}
            </template>
            <template
              v-slot:[`item.messagesCount`]="{ item }"
            >
              {{ item.messagesCount }}
            </template>
            <template
              v-slot:[`item.categories`]="{ item }"
            >
              <v-chip
                variant="outlined"
                v-for="category in getCategories(item.categories)"
                :key="category._id"
                class="mr-1"
                @click="selectCategory(category._id)"
              >
              {{category.text.value}}
              </v-chip>
            </template>
            <template
              v-slot:[`item.tags`]="{ item }"
            >
              <v-chip
                v-for="tag in getTags(item.tags)"
                :key="tag._id"
                class="mr-1"
                @click="selectTag(tag._id)"
              >
              {{tag.text}}
              </v-chip>
            </template>
            <template
              v-slot:[`item.accepted.isAccepted`]="{ item }"
            >
              <v-btn
                variant="text"
                :icon="item.accepted?.isAccepted ? 'fas fa-check-square' : 'far fa-square'"
                :color="'custom' + computedColor"
                :loading="loaders[item._id + 'accepted'] === true"
                @click="changeDiscussionProperty(
                  item,
                  'accepted',
                  {
                    isAccepted: !item.accepted?.isAccepted,
                    dt: new Date(),
                    user: user._id
                  }
                )"
              >
              </v-btn>
            </template>
            <template
              v-slot:[`item.isActive`]="{ item }"
            >
              <v-btn
                variant="text"
                :icon="item.isActive ? 'fas fa-check-square' : 'far fa-square'"
                disabled
                :color="'custom' + computedColor"
              >
              </v-btn>
            </template>
            <template
              v-slot:[`item.delete`]="{ item }"
            >
              <v-btn
                icon="fa fa-trash"
                size="small"
                :color="computedColor"
                class="my-4"
                :loading="loaders[item._id + 'delete'] === true"
                @click="deleteDiscussion(item._id)"
              >
              </v-btn>
            </template>
            <template
              v-slot:[`item.link`]="{ item }"
            >
              <v-btn
                icon="fa fa-arrow-right"
                size="small"
                class="my-3"
                :color="computedColor"
                :to="group ? {name: 'GroupDiscussion', params: { group: group._id, id: item._id } } : {name: 'Discussion', params: { id: item._id } }"
              >
              </v-btn>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'
import TranslatableText from '@/components/TranslatableText.vue'

export default {
  name: 'DiscussionList',

  components: {
    TranslatableText
  },

  props: [
    'group',
    'showFilters',
    'resetFilterTrigger',
    'isAcceptList',
    'category'
  ],

  emits: ['update:filtersDirty'],

  data: () => ({
    loaders: {},
    categoriesListDefault: [],
    tagsListDefault: [],
    searchDefault: '',
    loading: true,
    discussionsResponse: undefined,
    initialView: true,
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
    if (!this.isAcceptList) {
      await this.adaptQuery()
    } else {
      this.sortBy = ['accepted.isAccepted']
    }
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('discussions', {
      patchDiscussion: 'patch',
      removeDiscussion: 'remove',
      findDiscussions: 'find'
    }),
    async updateDataTableParams (e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query,
          categories: this.queryObject.categories,
          tags: this.queryObject.tags
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
      if (!this.isAcceptList || (this.isAcceptList && this.group)) {
        this.loading = true
        this.discussionsResponse = await this.findDiscussions(
          this.discussionsParams
        )
        this.loading = false
      }
    },
    async deleteDiscussion (id) {
      this.loaders[id + 'delete'] = true
      try {
        await this.removeDiscussion(id)
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[id + 'delete'] = undefined
        this.findDiscussionsTrigger = Date.now()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[id + 'delete'] = undefined
      }
    },
    async changeDiscussionProperty (discussion, property, value) {
      this.loaders[discussion._id + property] = true
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchDiscussion(
          [
            discussion._id,
            patchObj
          ]
        )
        this.findDiscussionsTrigger = Date.now()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[discussion._id + property] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[discussion._id + property] = undefined
      }
    }
  },

  computed: {
    ...mapGetters([
      'getTags',
      'getCategories',
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder',
      'updateQueryType',
      'updateQueryCategories',
      'updateQueryTags',
      'areArraysEqual',
      'selectTag',
      'selectCategory'
    ]),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('categories', {
      categories: 'list'
    }),
    ...mapGetters('tags', {
      tags: 'list'
    }),
    ...mapGetters('discussions', {
      discussions: 'list'
    }),
    computedFiltersDirty () {
      if (
        !this.areArraysEqual(this.queryObject.categories, this.categoriesListDefault) ||
        !this.areArraysEqual(this.queryObject.tags, this.tagsListDefault) ||
        !!this.search
      ) {
        return true
      } else {
        return false
      }
    },
    headers () {
      if (this.isAcceptList) {
        return [
          { title: this.$t('title'), key: 'title.value' },
          { title: this.$t('author'), key: 'author' },
          { title: this.$t('accepted'), key: 'accepted.isAccepted', align: 'center' },
          { title: this.$t('active'), key: 'isActive', align: 'center' },
          { title: this.$t('deleteButton'), key: 'delete', align: 'center', sortable: false },
          { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false }
        ]
      } else {
        const tmpHeaders = [
          { title: this.$t('title'), key: 'title.value' },
          { title: this.$t('created'), key: 'createdAt' },
          { title: this.$t('latestPost'), key: 'latestMessage' },
          { title: this.$t('tags'), key: 'tags', sortable: false },
          { title: this.$t('posts'), key: 'messagesCount', sortable: false, align: 'center' },
          { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false }
        ]
        if (!this.category) {
          tmpHeaders.splice(3, 0, { title: this.$t('categories'), key: 'categories', sortable: false })
        }
        return tmpHeaders
      }
    },
    computedColor () {
      if (this.group) {
        return this.$settings.modules.groups.color
      } else {
        return this.$settings.modules.discussions.color
      }
    },
    discussionsParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: (this.queryObject.query || this.queryObject.categories.length > 0 || this.queryObject.tags.length > 0) ? 0 : this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder },
        isActive: true
      }
      if (this.queryObject.categories.length > 0) {
        query.categories = { $in: this.queryObject.categories }
      }
      if (this.queryObject.tags.length > 0) {
        query.tags = { $in: this.queryObject.tags }
      }
      if (!this.isAcceptList) {
        query['accepted.isAccepted'] = true
      }
      if (this.group) {
        query.group = this.group._id
      } else {
        query.group = null
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
      return {
        query
      }
    },
    computedDiscussions () {
      if (this.discussionsResponse && this.discussionsResponse.data) {
        return this.discussionsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.discussionsResponse) {
        return this.discussionsResponse.total
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
    async 'queryObject.categories' () {
      this.updateQueryCategories(this.queryObject.categories.join(','))
      await this.loadDataTableEntities()
    },
    async 'queryObject.tags' () {
      this.updateQueryTags(this.queryObject.tags.join(','))
      await this.loadDataTableEntities()
    },
    discussionsParams: {
      deep: true,
      async handler (newValue, oldValue) {
        if (
          !this.initialView &&
          JSON.stringify(newValue) !== JSON.stringify(oldValue)
        ) {
          await this.loadDataTableEntities()
        }
      }
    },
    resetFilterTrigger () {
      if (this.resetFilterTrigger) {
        this.queryObject.categories = this.categoriesListDefault
        this.queryObject.tags = this.tagsListDefault
        this.queryObject.query = this.searchDefault
      }
    },
    computedFiltersDirty () {
      this.$emit('update:filtersDirty', this.computedFiltersDirty)
    }
  }
}
</script>

<style>
.discussionTable table {
  table-layout: fixed;
}
</style>
