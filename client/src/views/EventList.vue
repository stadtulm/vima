<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('myEventsButton')}}
      </span>
      <span
        class="my-3"
      >
        <v-btn
          variant="elevated"
          :to="{ name: 'EventEditor', params: { organisation: computedUserOrganisationId } }"
          dark
          color="customGrey"
        >
          {{$t('newEventButton')}}
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
          :items="computedEvents"
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
            <v-list-item-title
              class="font-weight-bold"
            >
              {{item.title.value}}
            </v-list-item-title>
          </template>
          <template
            v-slot:[`item.updatedAt`]="{ item }"
          >
            {{$moment(item.updatedAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{$moment(item.createdAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.duration.start`]="{ item }"
          >
            {{$moment(item.duration.start).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.duration.end`]="{ item }"
          >
            {{$moment(item.duration.end).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.edit`]="{ item }"
          >
            <v-btn
              icon="fa fa-pen"
              size="small"
              color="customGrey"
              class="my-3"
              :to="{ name: 'EventEditor', params: { organisation: computedUserOrganisationId, event: item._id } }"
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
              :loading="loaders[item._id + 'delete'] === true"
              @click="deleteEvent(item._id)"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.link`]="{ item }"
          >
            <v-btn
              icon="fa fa-arrow-right"
              size="small"
              color="customGrey"
              class="my-4"
              :to="{name: 'Event', params: { event: item._id } }"
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
  name: 'EventList',

  data: () => ({
    initialView: true,
    loaders: {},
    eventsResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'updatedAt', order: 'desc' }]
    }
  }),

  async mounted () {
    await this.adaptQuery()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('events', {
      removeEvent: 'remove',
      findEvents: 'find'
    }),
    async updateDataTableParams (e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query
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
      this.loading = true
      this.eventsResponse = await this.findEvents(
        this.eventsParams
      )
      this.loading = false
    },
    async deleteEvent (id) {
      this.loaders[id + 'delete'] = true
      try {
        await this.removeEvent(id)
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.loaders[id + 'delete'] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.loaders[id + 'delete'] = undefined
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
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
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value' },
        { title: this.$t('createdAt'), key: 'createdAt', minWidth: 170 },
        { title: this.$t('updatedAt'), key: 'updatedAt', minWidth: 170 },
        { title: this.$t('eventStart'), key: 'duration.start', minWidth: 170 },
        { title: this.$t('eventEnd'), key: 'duration.end', minWidth: 170 },
        { title: this.$t('editButton'), key: 'edit', sortable: false, align: 'center' },
        { title: this.$t('deleteButton'), key: 'delete', sortable: false, align: 'center' },
        { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false }
      ]
    },
    eventsParams () {
      const query = {
        organisation: this.computedUserOrganisationId,
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      if (this.queryObject.query) {
        query.title = {
          $elemMatch: {
            $and: [
              { value: { $regex: this.queryObject.query, $options: 'i' } },
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
      return {
        query
      }
    },
    computedUserOrganisationId () {
      const organisationStatusContainer = this.statusContainers.find(
        obj =>
          obj.type === 'organisations' &&
                obj.user === this.user._id &&
                (
                  obj.relation === 'member' ||
                  obj.relation === 'owner'
                )
      )
      return organisationStatusContainer ? organisationStatusContainer.reference : undefined
    },
    computedEvents () {
      if (this.eventsResponse && this.eventsResponse.data) {
        return this.eventsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.eventsResponse) {
        return this.eventsResponse.total
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
    eventsParams: {
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
