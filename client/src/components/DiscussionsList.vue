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
            v-model="search"
            :label="$t('filterByTitleLabel')"
            outlined
            dense
            hide-details
            color="black"
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-autocomplete
            v-model="categoriesList"
            color="black"
            :item-color="$settings.modules.discussions.color"
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
          sm="4"
        >
          <v-autocomplete
            v-model="tagsList"
            color="black"
            :item-color="$settings.modules.discussions.color"
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
    <v-row>
      <v-col>
        <v-card
          tile
          color="transparent"
        >
          <v-data-table
            class="discussionTable"
            item-key="_id"
            :headers="headers"
            :items="computedDiscussions"
            :loading="loading"
            @update:page="updatePage"
            @update:items-per-page="updateItemsPerPage"
            @update:sort-by="updateSortBy"
            @update:sort-desc="updateSortDesc"
            :server-items-length="total"
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
              v-slot:progress
            >
              <v-progress-linear
                indeterminate
                :color="'custom' + computedColor"
              ></v-progress-linear>
            </template>
            <template
              v-slot:[`item.title.value`]="{ item }"
            >
              <div
                class="pointer font-weight-bold"
                @click="$router.push(group ? {name: 'GroupDiscussion', params: { group: group._id, id: item._id } } : {name: 'Discussion', params: { id: item._id } })"
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
                outlined
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
                icon
                :color="'custom' + computedColor"
                :loading="loaders[item._id + 'accepted'] === true"
                @click="changeDiscussionProperty(
                  item,
                  'accepted',
                  {
                    isAccepted: !item.accepted.isAccepted,
                    dt: new Date(),
                    user: user._id
                  }
                )"
              >
                <template
                  slot="loader"
                >
                  <v-progress-circular
                    color="white"
                    width="3"
                    indeterminate
                  ></v-progress-circular>
                </template>
                <v-icon>
                  {{item.accepted.isAccepted ? 'fas fa-check-square' : 'far fa-square'}}
                </v-icon>
              </v-btn>
            </template>
            <template
              v-slot:[`item.isActive`]="{ item }"
            >
              <v-btn
                icon
                disabled
                :color="'custom' + computedColor"
                :loading="loaders[item._id + 'isActive'] === true"
                @click="changeDiscussionProperty(
                  item,
                  'isActive',
                  !item.isActive
                )"
              >
                <template
                  slot="loader"
                >
                  <v-progress-circular
                    color="white"
                    width="3"
                    indeterminate
                  ></v-progress-circular>
                </template>
                <v-icon>
                  {{item.isActive ? 'fas fa-check-square' : 'far fa-square'}}
                </v-icon>
              </v-btn>
            </template>
            <template
              v-slot:[`item.delete`]="{ item }"
            >
              <v-btn
                fab
                small
                :color="computedColor"
                class="my-4"
                :loading="loaders[item._id + 'delete'] === true"
                @click="deleteDiscussion(item._id)"
              >
                <template
                  slot="loader"
                >
                  <v-progress-circular
                    color="white"
                    width="3"
                    indeterminate
                  ></v-progress-circular>
                </template>
                <v-icon
                  color="white"
                  size="18"
                >
                  fa fa-trash
                </v-icon>
              </v-btn>
            </template>
            <template
              v-slot:[`item.link`]="{ item }"
            >
              <v-btn
                fab
                small
                class="my-3"
                :color="computedColor"
                :to="group ? {name: 'GroupDiscussion', params: { group: group._id, id: item._id } } : {name: 'Discussion', params: { id: item._id } }"
              >
                <v-icon
                  color="white"
                  size="18"
                >
                  fa fa-arrow-right
                </v-icon>
              </v-btn>
            </template>
          </v-data-table>
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

  data: () => ({
    findDiscussionsTrigger: 1,
    loaders: {},
    categoriesList: [],
    tagsList: [],
    search: '',
    sortBy: ['latestMessage'],
    sortDesc: [false],
    categoriesListDefault: [],
    tagsListDefault: [],
    searchDefault: '',
    page: 1,
    itemsPerPage: 25,
    loading: true
  }),

  async mounted () {
    // Save current query
    if (!this.isAcceptList) {
      this.$router.options.tmpQuery = this.$route.query
      this.initQuery()
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
    async deleteDiscussion (id) {
      this.$set(this.loaders, id + 'delete', true)
      try {
        await this.removeDiscussion(id)
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$set(this.loaders, id + 'delete', undefined)
        this.findDiscussionsTrigger = Date.now()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.$set(this.loaders, id + 'delete', undefined)
      }
    },
    async changeDiscussionProperty (discussion, property, value) {
      this.$set(this.loaders, discussion._id + property, true)
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
        this.$set(this.loaders, discussion._id + property, undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.$set(this.loaders, discussion._id + property, undefined)
      }
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
      if (this.$route.query.c) {
        this.categoriesList = this.$route.query.c.split(',')
      }
      if (this.$route.query.t) {
        this.tagsList = this.$route.query.t.split(',')
      }
    },
    goToPage (i) {
      this.skip = this.itemsPerPage * (i - 1)
    },
    updatePage (data) {
      if (!this.isAcceptList) {
        if (parseInt(this.$route.query.p) !== data) {
          this.$router.replace(
            {
              query: {
                p: data,
                i: this.itemsPerPage,
                s: this.sortBy.join(','),
                d: this.sortDesc.join(','),
                c: this.categoriesList.join(','),
                t: this.tagsList.join(',')
              }
            }
          )
        }
      }
    },
    updateItemsPerPage (data) {
      if (!this.isAcceptList) {
        if (parseInt(this.$route.query.i) !== data) {
          this.$router.replace(
            {
              query: {
                p: this.page,
                i: data,
                s: this.sortBy.join(','),
                d: this.sortDesc.join(','),
                c: this.categoriesList.join(','),
                t: this.tagsList.join(',')
              }
            }
          )
        }
      }
    },
    updateSortBy (data) {
      if (!this.isAcceptList) {
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
              d: this.sortDesc.join(','),
              c: this.categoriesList.join(','),
              t: this.tagsList.join(',')
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
      }
    },
    updateSortDesc (data) {
      if (!this.isAcceptList) {
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
              d: tmpData,
              c: this.categoriesList.join(','),
              t: this.tagsList.join(',')
            }
          })
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'deepSort',
      'getTags',
      'getCategories',
      'itemsPerPageOptions'
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
        !this.areArraysEqual(this.categoriesList, this.categoriesListDefault) ||
        !this.areArraysEqual(this.tagsList, this.tagsListDefault) ||
        this.search !== this.searchDefault
      ) {
        return true
      } else {
        return false
      }
    },
    headers () {
      if (this.isAcceptList) {
        return [
          { text: this.$t('title'), value: 'title.value' },
          { text: this.$t('author'), value: 'author' },
          { text: this.$t('accepted'), value: 'accepted.isAccepted', align: 'center' },
          { text: this.$t('active'), value: 'isActive', align: 'center' },
          { text: this.$t('deleteButton'), value: 'delete', align: 'center', sortable: false },
          { text: this.$t('viewButton'), value: 'link', align: 'center', sortable: false }
        ]
      } else {
        const tmpHeaders = [
          { text: this.$t('title'), value: 'title.value' },
          { text: this.$t('created'), value: 'createdAt' },
          { text: this.$t('latestPost'), value: 'latestMessage' },
          { text: this.$t('tags'), value: 'tags', sortable: false },
          { text: this.$t('posts'), value: 'messagesCount', width: '80px', sortable: false },
          { text: this.$t('viewButton'), value: 'link', align: 'center', sortable: false }
        ]
        if (!this.category) {
          tmpHeaders.splice(3, 0, { text: this.$t('categories'), value: 'categories', sortable: false })
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
    discussionsQueryWhen () {
      return !this.isAcceptList || (this.isAcceptList && this.group)
    },
    discussionsParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: (this.page - 1) * this.computedSkip,
        $sort: { [this.sortBy]: this.computedSortDesc },
        isActive: true
      }
      if (this.categoriesList.length > 0) {
        query.categories = { $in: this.categoriesList }
      }
      if (this.tagsList.length > 0) {
        query.tags = { $in: this.tagsList }
      }
      if (!this.isAcceptList) {
        query['accepted.isAccepted'] = true
      }
      if (this.group) {
        query.group = this.group._id
      } else {
        query.group = null
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
      return query
    },
    computedDiscussions () {
      if (this.discussionsResponse) {
        return this.discussionsResponse.data
      } else {
        return []
      }
    },
    total () {
      if (this.discussionsResponse) {
        return this.discussionsResponse.total
      } else {
        return 0
      }
    },
    computedLimit () {
      if (this.itemsPerPage === -1) {
        return 1000000
      } else {
        return this.itemsPerPage
      }
    },
    computedSkip () {
      if (this.itemsPerPage === -1) {
        return 0
      } else {
        return this.itemsPerPage
      }
    },
    computedSortDesc () {
      if (this.sortDesc[0] === true) {
        return 1
      } else {
        return -1
      }
    }
  },

  asyncComputed: {
    async discussionsResponse () {
      if (this.findDiscussionsTrigger) {
        this.loading = true
        const discussions = await this.findDiscussions(
          {
            query: this.discussionsParams
          }
        )
        this.loading = false
        return discussions
      }
    }
  },

  watch: {
    category (newValue, oldValue) {
      if (newValue && !this.categoriesList.includes(newValue._id)) {
        this.categoriesList.push(newValue._id)
      } else if (!newValue && oldValue) {
        this.categoriesList = this.categoriesList.filter(category => category !== oldValue._id)
      }
    },
    discussions () {
      this.findDiscussionsTrigger = Date.now()
    },
    resetFilterTrigger () {
      if (this.resetFilterTrigger) {
        this.categoriesList = this.categoriesListDefault
        this.tagsList = this.tagsListDefault
        this.search = this.searchDefault
      }
    },
    computedFiltersDirty () {
      this.$emit('filtersDirty', this.computedFiltersDirty)
    },
    categoriesList () {
      if (!this.isAcceptList) {
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
      }
    },
    tagsList () {
      if (!this.isAcceptList) {
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
      }
    }
  }
}
</script>

<style>
.discussionTable table {
  table-layout: fixed;
}
</style>
