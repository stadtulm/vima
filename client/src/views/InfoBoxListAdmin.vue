<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('adminView')}} {{$t('infoBox')}}
      </span>
      <span
        class="my-3"
      >
        <v-btn
          variant="elevated"
          :to="{ name: 'InfoBoxEditor' }"
          color="customGrey"
        >
          {{$t('newInfoBoxButton')}}
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
          :items="computedInfos"
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
              class="font-weight-bold"
            >
              {{item.title.value}}
            </div>
          </template>
          <template
            v-slot:[`item.type`]="{ item }"
          >
            <div>
              {{$t(item.type)}}
            </div>
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
            v-slot:[`item.edit`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fa fa-pen"
                    size="small"
                    color="customGrey"
                    class="my-3"
                    :to="{ name: 'InfoBoxEditor', params: { id: item._id } }"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('editButton')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fa fa-trash"
                    size="small"
                    color="customGrey"
                    class="my-3"
                    :loading="loaders[item._id + 'delete'] === true"
                    @click="activateDeleteDialog(item._id)"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('deleteButton')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.position`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  {{item.position}}
                </span>
              </template>
              {{$t('position')}}
            </v-tooltip>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
    <delete-dialog
      :showDeleteDialog="showDeleteDialog"
      @delete:executeDelete="deleteInfo()"
      @update:closeDeleteDialog="deactivateDeleteDialog()"
    ></delete-dialog>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'
import DeleteDialog from '@/components/DeleteDialog.vue'

export default {
  name: 'InfoBoxListAdmin',

  components: {
    DeleteDialog
  },

  data: () => ({
    deleteItem: undefined,
    showDeleteDialog: false,
    initialView: true,
    loading: true,
    searchRecipients: undefined,
    sendStats: undefined,
    isSending: false,
    loaders: {},
    infosResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'title.value', order: 'desc' }]
    },
    sendStatsQueryObject: {
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'email', order: 'asc' }]
    },
    recipients: undefined
  }),

  async mounted () {
    await this.adaptQuery()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('infos', {
      removeInfo: 'remove',
      findInfos: 'find'
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
      this.infosResponse = await this.findInfos(
        this.infosParams
      )
      this.loading = false
    },
    async loadSendStats () {
      const tmpSendStats = await this.findSendstats(this.sendStatsParams)
      if (tmpSendStats && tmpSendStats.data) {
        this.sendStats = tmpSendStats.data[0]
      } else {
        this.sendStats = undefined
      }
    },
    async loadRecipients () {
      const tmpRecipients = await this.findRecipients()
      if (tmpRecipients) {
        this.recipients = tmpRecipients
      } else {
        this.recipients = undefined
      }
      return tmpRecipients
    },
    async deleteInfo () {
      this.loaders[this.deleteItem + 'delete'] = true
      try {
        this.showDeleteDialog = false
        if (!this.deleteItem) throw new Error('Id to delete must be set')
        await this.removeInfo(this.deleteItem)
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.loaders[this.deleteItem + 'delete'] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.loaders[this.deleteItem + 'delete'] = undefined
      } finally {
        this.deleteItem = undefined
        await this.loadDataTableEntities()
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
      'updateQuerySortOrder',
      'activateDeleteDialog',
      'deactivateDeleteDialog'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value' },
        { title: this.$t('type'), key: 'type' },
        { title: this.$t('editButton'), key: 'edit', sortable: false, align: 'center' },
        { title: this.$t('deleteButton'), key: 'delete', sortable: false, align: 'center' },
        { title: this.$t('position'), key: 'position', align: 'center' },
        { title: this.$t('createdAt'), key: 'createdAt' },
        { title: this.$t('updatedAt'), key: 'updatedAt' }
      ]
    },
    infosParams () {
      const query = {
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
    computedInfos () {
      if (this.infosResponse && this.infosResponse.data) {
        return this.infosResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.infosResponse) {
        return this.infosResponse.total
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
    infosParams: {
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
