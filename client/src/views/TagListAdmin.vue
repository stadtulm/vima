<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('adminView')}} {{$t('tags')}}
      </span>
      <span
        class="my-3"
      >
        <v-btn
          variant="elevated"
          :to="{ name: 'TagEditor' }"
          dark
          color="customGrey"
        >
          {{$t('newTagButton')}}
          <v-icon
            class="ml-3"
            size="18"
          >
            fas fa-plus
          </v-icon>
        </v-btn>
      </span>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="queryObject.query"
          :label="$t('filterByTagNameLabel')"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          v-if="!initialView"
          v-model:items-per-page="queryObject.itemsPerPage"
          v-model:page="queryObject.page"
          :sort-by="queryObject.sortBy"
          :headers="headers"
          :items-length="computedTotal"
          :items="computedTags"
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
            v-slot:[`item.text`]="{ item }"
          >
            <v-list-item-title
              class="font-weight-bold"
            >
              {{item.raw.text}}
            </v-list-item-title>
          </template>
          <template
            v-slot:[`item.updatedAt`]="{ item }"
          >
            {{$moment(item.raw.updatedAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{$moment(item.raw.createdAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.edit`]="{ item }"
          >
            <v-btn
              icon="fa fa-pen"
              size="small"
              color="customGrey"
              class="my-3"
              :to="{ name: 'TagEditor', params: { id: item.raw._id } }"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-btn
              icon="fa fa-trash"
              size="small"
              color="customGrey"
              class="my-4"
              @click="deleteTag(item.raw._id)"
            >
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'TagListAdmin',

  components: {
  },

  data: () => ({
    loaders: {},
    loading: true,
    initialView: true,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'name', order: 'desc' }]
    }
  }),

  async mounted () {
    await this.adaptQuery()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('tags', {
      patchTag: 'patch',
      removeTag: 'remove'
    }),
    ...mapActions('status-container-helper', {
      patchTagNotifications: 'patch'
    }),
    async updateDataTableParams(e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query,
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
      this.loading = false
    },
    async deleteTag (id) {
      this.loaders[id + 'delete'] = true
      try {
        await this.removeTag(id)
        this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.loaders[id + 'delete'] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.loaders[id + 'delete'] = undefined
      }
    },
    async changeTagProperty (tag, property, value) {
      this.loaders[tag._id + property] = true
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchTag(
          [
            tag._id,
            patchObj
          ]
        )
        this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[tag._id + property] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[tag._id + property] = undefined
      }
    }
  },

  computed: {
    ...mapGetters([
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('tags', {
      tags: 'list'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    headers () {
      return [
        { title: this.$t('name'), key: 'text' },
        { title: this.$t('createdAt'), key: 'createdAt' },
        { title: this.$t('updatedAt'), key: 'updatedAt' },
        { title: this.$t('editButton'), key: 'edit', sortable: false, align: 'center' },
        { title: this.$t('deleteButton'), key: 'delete', align: 'center', sortable: false }
      ]
    },
    computedTags () {
      if (this.queryObject.query && this.queryObject.query.trim() !== '') {
        return this.tags.filter(obj => obj.text.toLowerCase().includes(this.queryObject.query.toLowerCase()))
      } else {
        return this.tags
      }
    },
    computedTotal () {
      if (this.tags) {
        return this.tags.length
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
    ['queryObject.query'] () {
      this.updateQueryQuery(this.queryObject.query)
    }
  }
}
</script>
