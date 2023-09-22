<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('adminView')}} {{$t('sponsors')}}
      </span>
      <span
        class="my-3"
      >
        <v-btn
          dark
          :to="{ name: 'SponsorEditor' }"
          color="customGrey"
        >
          {{$t('newSponsorButton')}}
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
          :label="$t('filterByTitleLabel')"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table-server
          v-if="!initialView"
          v-model:items-per-page="queryObject.itemsPerPage"
          v-model:page="queryObject.page"
          :sort-by="queryObject.sortBy"
          :headers="headers"
          :items-length="computedTotal"
          :items="computedSponsors"
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
            v-slot:[`item.name`]="{ item }"
          >
            <v-list-item-title
              class="font-weight-bold"
            >
              {{item.raw.name}}
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
              :to="{ name: 'SponsorEditor', params: { sponsor: item.raw._id } }"
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
              class="my-3"
              :loading="loaders[item.raw._id + 'delete'] === true"
              @click="deleteSponsor(item.raw._id)"
            >
            </v-btn>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'SponsorListAdmin',

  components: {
  },

  data: () => ({
    initialView: true,
    loading: true,
    loaders: {},
    sponsorsResponse: undefined,
    search: '',
    queryObject: {
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'name', order: 'desc' }],
      query: ''
    }
  }),

  async mounted () {
    await this.adaptQuery()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('sponsors', {
      removeSponsor: 'remove',
      findSponsors: 'find'
    }),
    async deleteSponsor (id) {
      this.loaders[id + 'delete'] = true
      try {
        await this.removeSponsor(id)
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.loaders[id + 'delete'] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.loaders[id + 'delete'] = undefined
      }
    },
    async updateDataTableParams (e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query
        }
        this.updateQueryQuery(this.queryObject.query)
        this.updateQueryPage(e.page)
        this.updateQueryItemsPerPage(e.itemsPerPage)
        if (e.sortBy[0]) {
          this.updateQuerySortBy(e.sortBy[0].key)
          this.updateQuerySortOrder(e.sortBy[0].order)
        }
      }
    },
    async loadDataTableEntities () {
      this.loading = true
      this.sponsorsResponse = await this.findSponsors(
        this.sponsorsParams
      )
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
      'updateQuerySortOrder'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        { title: this.$t('name'), key: 'name' },
        { title: this.$t('createdAt'), key: 'createdAt', width: 170 },
        { title: this.$t('updatedAt'), key: 'updatedAt', width: 170 },
        { title: this.$t('position'), key: 'position', width: 170 },
        { title: this.$t('editButton'), key: 'edit', sortable: false, align: 'center' },
        { title: this.$t('deleteButton'), key: 'delete', sortable: false, align: 'center' }
      ]
    },
    sponsorsParams () {
      return {
        query: {
          name: { $regex: this.queryObject.query, $options: 'i' },
          $limit: this.computedLimit,
          $skip: this.computedSkip,
          $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
        }
      }
    },
    computedSponsors () {
      if (this.sponsorsResponse && this.sponsorsResponse.data) {
        return this.sponsorsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.sponsorsResponse) {
        return this.sponsorsResponse.total
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
    sponsorsParams: {
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
