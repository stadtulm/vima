<template>
  <div>
    <v-data-table
      :item-class="itemRowBackground"
      class="customGreyUltraLight elevation-3"
      :headers="headers"
      :items="violations"
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
      mobile-breakpoint="0"
      :footer-props="{
        itemsPerPageText: ''
      }"
    >
      <template
        v-slot:progress
      >
        <v-progress-linear
          indeterminate
          color="customGrey"
        ></v-progress-linear>
      </template>
      <template
        v-slot:[`item.responses.0`]="{ item }"
      >
        <v-list-item
          class="pa-0"
        >
          <v-list-item-content>
            <v-list-item-title
              class="font-weight-bold"
            >
              {{getUser(item.responses[0].user).userName}}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{getUser(item.responses[0].user).firstName}} {{getUser(item.responses[0].user).lastName}}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
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
            {{$t('discussion')}}: {{item.discussion ? item.discussion.title.value : ''}}
          </div>
        </template>
        <template
          v-else-if="item.type === 'groups'"
        >
          <div
            class="font-weight-bold pointer"
            @click="$router.push(item.link)"
          >
            {{$t('groupDiscussion')}}: {{item.discussion ? item.discussion.title.value : ''}} ({{item.discussion && item.discussion.group ? item.discussion.group.title.value : ''}})
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
          icon
          color="customGrey"
          :loading="loaders[item._id + 'isClosed'] === true"
          @click="changeViolationProperty(
            item,
            'isClosed',
            !item.isClosed
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
            {{item.isClosed ? 'fas fa-check-square' : 'far fa-square'}}
          </v-icon>
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
          fab
          small
          color="customGrey"
          class="my-3"
          @click="itemToReport = item"
        >
          <v-icon
            color="white"
            size="18"
          >
            fa fa-search
          </v-icon>
        </v-btn>
      </template>
      <template
        v-slot:[`item.delete`]="{ item }"
      >
        <v-btn
          fab
          small
          color="customGrey"
          class="my-3"
          :loading="loaders[item._id + 'delete'] === true"
          @click="deleteViolation(item._id)"
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
          v-if="item.discussion"
          fab
          small
          color="customGrey"
          :to="item.link"
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
    <ViolationDialog
      type="chats"
      :showViolationDialog="showViolationDialog"
      :message="itemToReport"
      :selectedViolation="itemToReport"
      @closeViolationDialog="itemToReport = undefined"
    ></ViolationDialog>
  </div>
</template>

<script>

import { makeFindMixin } from 'feathers-vuex'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import ViolationDialog from '@/components/ViolationDialog.vue'

export default {
  name: 'ViolationsList',

  mixins: [makeFindMixin({ service: 'violations', watch: true })],

  components: {
    ViolationDialog
  },

  props: [
    'group',
    'types'
  ],

  data: () => ({
    showViolationDialog: false,
    itemToReport: undefined,
    loaders: {},
    search: '',
    page: 1,
    loading: true,
    total: 0,
    itemsPerPage: 5,
    sortBy: ['isClosed'],
    sortDesc: [true]
  }),

  async mounted () {
    if (!this.group) {
      // Save current query
      this.$router.options.tmpQuery = this.$route.query
      this.initQuery()
    }
    setTimeout(async () => {
      await this.checkNewViolations()
    }, 1000)
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('violations', {
      removeViolation: 'remove',
      patchViolation: 'patch'
    }),
    ...mapActions('status-container-helper', {
      patchViolationNotifications: 'patch'
    }),
    itemRowBackground (item) {
      if (
        this.computedViolations &&
        this.computedViolations.includes(item._id)
      ) {
        return 'new'
      } else {
        return ''
      }
    },
    async changeViolationProperty (violation, property, value) {
      this.$set(this.loaders, violation._id + property, true)
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchViolation(
          [
            violation._id,
            patchObj
          ]
        )
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$set(this.loaders, violation._id + property, undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.$set(this.loaders, violation._id + property, undefined)
      }
    },
    async deleteViolation (id) {
      this.$set(this.loaders, id + 'delete', true)
      try {
        await this.removeViolation(id)
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.$set(this.loaders, id + 'delete', undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.$set(this.loaders, id + 'delete', undefined)
      }
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
    },
    goToPage (i) {
      this.skip = this.itemsPerPage * (i - 1)
    },
    updatePage (data) {
      if (!this.group) {
        if (parseInt(this.$route.query.p) !== data) {
          this.$router.replace(
            {
              query: {
                p: data,
                i: this.itemsPerPage,
                s: this.sortBy.join(','),
                d: this.sortDesc.join(',')
              }
            }
          )
        }
      }
    },
    updateItemsPerPage (data) {
      if (!this.group) {
        if (parseInt(this.$route.query.i) !== data) {
          this.$router.replace(
            {
              query: {
                p: this.page,
                i: data,
                s: this.sortBy.join(','),
                d: this.sortDesc.join(',')
              }
            }
          )
        }
      }
    },
    updateSortBy (data) {
      if (!this.group) {
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
              d: this.sortDesc.join(',')
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
      if (!this.group) {
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
              d: tmpData
            }
          })
        }
      }
    },
    async checkNewViolations () {
      const visibleViolations = this.violations.map(obj => obj._id)
      const violationIds = visibleViolations.filter(e => this.computedViolations.indexOf(e) !== -1)
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
      's3'
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
    headers () {
      const headers = [
        { text: this.$t('submittedBy'), value: 'responses.0' },
        { text: this.$t('closed'), value: 'isClosed', align: 'center' },
        { text: this.$t('createdAt'), value: 'createdAt', width: 170 },
        { text: this.$t('updatedAt'), value: 'updatedAt', width: 170 },
        { text: this.$t('details'), value: 'edit', sortable: false, align: 'center' },
        { text: this.$t('deleteButton'), value: 'delete', sortable: false, align: 'center' }
      ]
      if (this.group) {
        headers.splice(1, 0, { text: this.$t('groupDiscussion'), value: 'discussion' })
        headers.push({ text: this.$t('viewButton'), value: 'link', align: 'center', sortable: false })
      } else {
        headers.splice(1, 0, { text: this.$t('type'), value: 'type' })
      }
      return headers
    },
    violationsQueryWhen () {
      return this.group || this.$route.name === 'ViolationListAdmin'
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
    computedViolations () {
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
        $skip: (this.page - 1) * this.computedSkip,
        $sort: { [this.sortBy]: this.computedSortDesc }
      }
      if (this.group) {
        query.group = this.group._id
      }
      query.type = { $in: this.types }
      return {
        query,
        debounce: 1000,
        qid: 'admin'
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

  watch: {
    isFindViolationsPending () {
      if (!this.isFindViolationsPending) {
        this.loading = false
        this.total = this.violationsPaginationData.admin.mostRecent.total
      } else {
        this.loading = true
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
    async ads () {
      await this.checkNewViolations()
      if (this.violations) {
        await this.findViolations()
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
