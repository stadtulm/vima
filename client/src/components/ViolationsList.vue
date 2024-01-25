<template>
  <div>
    <v-data-table-server
      v-if="!initialView"
      v-model:items-per-page="queryObject.itemsPerPage"
      v-model:page="queryObject.page"
      :sort-by="queryObject.sortBy"
      :headers="headers"
      :items-length="computedTotal"
      :items="computedViolations"
      :loading="isLoading"
      class="customGreyUltraLight pb-3 elevation-3"
      item-value="_id"
      @update:options="updateDataTableParams"
      sort-asc-icon="fas fa-caret-up"
      sort-desc-icon="fas fa-caret-down"
      :show-current-page="true"
      :must-sort="true"
      :row-props="itemRowBackground"
    >
      <template
        v-slot:[`item.responses.0`]="{ item }"
      >
        <v-list-item-title
          class="font-weight-bold"
        >
          {{getUser(item.responses[0].user).userName}}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{getUser(item.responses[0].user).firstName}} {{getUser(item.responses[0].user).lastName}}
        </v-list-item-subtitle>
      </template>
      <template
        v-slot:[`item.type`]="{ item }"
      >
        <template
          v-if="item.type === 'discussions'"
        >
          <div
            class="font-weight-bold pointer"
            @click="$router.push(item.link)"
          >
            {{$t('discussion')}}: {{item.discussion?.title?.value || ''}}
          </div>
        </template>
        <template
          v-else-if="item.type === 'groups'"
        >
          <div
            class="font-weight-bold pointer"
            @click="$router.push(item.link)"
          >
            {{$t('groupDiscussion')}}{{ item.discussion ? ': ' : '' }}
            {{ item.discussion?.title?.value ? item.discussion?.title?.value : '' }}
            {{ item.discussion?.group?.title?.value ? ' (' + item.discussion?.group?.title?.value + ')' : ''}}
          </div>
        </template>
        <template
          v-else-if="item.type === 'chats'"
        >
          <div
            class="font-weight-bold pointer"
            @click="$router.push(item.link)"
          >
            {{$t('chat')}}
          </div>
        </template>
      </template>
      <template
        v-slot:[`item.discussion`]="{ item }"
      >
        <template
          v-if="item.discussion"
        >
          {{item.discussion.title.value}}
        </template>
      </template>
      <template
        v-slot:[`item.isClosed`]="{ item }"
      >
        <v-btn
          variant="text"
          :icon="item.isClosed ? 'fas fa-check-square' : 'far fa-square'"
          color="customGrey"
          :loading="loaders[item._id + 'isClosed'] === true"
          @click="changeViolationProperty(
            item,
            'isClosed',
            !item.isClosed
          )"
        >
        </v-btn>
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
        <v-btn
          icon="fa fa-search"
          size="small"
          color="customGrey"
          class="my-3"
          @click="itemToReport = item"
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
          @click="deleteViolation(item._id)"
        >
        </v-btn>
      </template>
      <template
        v-slot:[`item.link`]="{ item }"
      >
        <v-btn
          v-if="item.discussion"
          icon="fa fa-arrow-right"
          size="small"
          color="customGrey"
          :to="item.link"
        >
        </v-btn>
      </template>
    </v-data-table-server>
    <ViolationDialog
      type="chats"
      :showViolationDialog="showViolationDialog"
      :message="itemToReport"
      :selectedViolation="itemToReport"
      @update:closeViolationDialog="itemToReport = undefined"
    ></ViolationDialog>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'
import ViolationDialog from '@/components/ViolationDialog.vue'

export default {
  name: 'ViolationsList',

  components: {
    ViolationDialog
  },

  props: [
    'group',
    'types'
  ],

  emits: ['update:updateTypes'],

  data: () => ({
    showViolationDialog: false,
    itemToReport: undefined,
    loaders: {},
    initialView: true,
    violationsResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'isClosed', order: 'desc' }],
      categories: []
    }
  }),

  async mounted () {
    if (!this.group) {
      await this.adaptQuery()
    } else {
      await this.loadDataTableEntities()
      this.initialView = false
    }
    setTimeout(async () => {
      await this.checkNewViolations()
    }, 500)
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('violations', {
      findViolations: 'find',
      removeViolation: 'remove',
      patchViolation: 'patch'
    }),
    ...mapActions('status-container-helper', {
      patchViolationNotifications: 'patch'
    }),
    async updateDataTableParams (e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query,
          categories: this.queryObject.categories
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
      if (this.group || this.$route.name === 'ViolationListAdmin') {
        this.violationsResponse = await this.findViolations(
          this.violationsParams
        )
      }
      this.isLoading = false
      setTimeout(async () => {
        await this.checkNewViolations()
      }, 500)
    },
    itemRowBackground (props) {
      if (
        this.computedNewViolations &&
        this.computedNewViolations.includes(props.item._id)
      ) {
        return { class: 'new' }
      } else {
        return {}
      }
    },
    async changeViolationProperty (violation, property, value) {
      this.loaders[violation._id + property] = true
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchViolation(
          [
            violation._id,
            patchObj
          ]
        )
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[violation._id + property] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[violation._id + property] = undefined
      }
    },
    async deleteViolation (id) {
      this.loaders[id + 'delete'] = true
      try {
        await this.removeViolation(id)
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.loaders[id + 'delete'] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.loaders[id + 'delete'] = undefined
      }
    },
    async checkNewViolations () {
      const visibleViolations = this.computedViolations.map(obj => obj._id)
      const violationIds = visibleViolations.filter(e => this.computedNewViolations.indexOf(e) !== -1)
      if (this.computedResponsibleStatusContainer && violationIds.length > 0 && !this.isUpdating) {
        this.isUpdating = true
        await this.patchViolationNotifications(
          [
            'pullUnreadById',
            {
              containerId: this.computedResponsibleStatusContainer._id,
              ids: violationIds
            }
          ]
        )
        this.isUpdating = false
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
      'updateQueryCategories',
      'areArraysEqual'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    computedViolations () {
      if (this.violationsResponse && this.violationsResponse.data) {
        return this.violationsResponse.data
      } else {
        return []
      }
    },
    headers () {
      const headers = [
        { title: this.$t('submittedBy'), key: 'responses.0' },
        { title: this.$t('closed'), key: 'isClosed', align: 'center' },
        { title: this.$t('createdAt'), key: 'createdAt', minWidth: 170 },
        { title: this.$t('updatedAt'), key: 'updatedAt', minWidth: 170 },
        { title: this.$t('details'), key: 'edit', sortable: false, align: 'center' },
        { title: this.$t('deleteButton'), key: 'delete', sortable: false, align: 'center' }
      ]
      if (this.group) {
        headers.splice(1, 0, { title: this.$t('groupDiscussion'), key: 'discussion' })
        headers.push({ title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false })
      } else {
        headers.splice(1, 0, { title: this.$t('type'), key: 'type' })
      }
      return headers
    },
    computedResponsibleStatusContainer () {
      if (this.group) {
        return this.statusContainers.find(obj =>
          obj.user === this.user._id &&
          obj.type === 'groups' &&
          obj.reference === this.group._id &&
          (obj.relation === 'owner' || obj.relation === 'moderator')
        )
      } else {
        return this.statusContainers.find(obj =>
          obj.user === this.user._id &&
          obj.type === 'violations' &&
          obj.relation === 'admin'
        )
      }
    },
    computedNewViolations () {
      if (this.computedResponsibleStatusContainer) {
        if (this.group) {
          return this.computedResponsibleStatusContainer.unread.filter(obj => obj.type === 'violations').map(obj => obj.id)
        } else {
          return this.computedResponsibleStatusContainer.unread.map(obj => obj.id)
        }
      } else {
        return []
      }
    },
    violationsParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: (this.queryObject.categories.length > 0) ? 0 : this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      if (this.group) {
        query.group = this.group._id
      }
      if (this.categories?.length > 0) {
        query.type = { $in: this.queryObject.categories }
      }
      return {
        query
      }
    },
    computedTotal () {
      if (this.violationsResponse) {
        return this.violationsResponse.total
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
    violationsParams: {
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
    async 'queryObject.categories' () {
      if (!this.areArraysEqual(this.queryObject.categories, this.types)) {
        this.$emit('update:updateTypes', this.queryObject.categories)
      }
    },
    types: {
      deep: true,
      async handler () {
        this.queryObject.categories = this.types
        this.updateQueryCategories(this.queryObject.categories.join(','))
        await this.loadDataTableEntities()
      }
    },
    showViolationDialog () {
      if (!this.showViolationDialog) {
        this.itemToReport = undefined
      }
    },
    itemToReport () {
      if (this.itemToReport) {
        this.showViolationDialog = true
      } else {
        this.showViolationDialog = false
      }
    },
    statusContainers: {
      deep: true,
      async handler () {
        await this.checkNewViolations()
      }
    }
  }
}
</script>
