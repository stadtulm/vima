<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('adminView')}} {{$t('interestGroups')}}
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          :label="$t('filterByTitleLabel')"
          outlined
          dense
          hide-details
          color="black"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          :item-class="itemRowBackground"
          item-key="_id"
          class="customGreyUltraLight elevation-3"
          :headers="headers"
          :items="computedGroups"
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
              :color="$settings.modules.groups.color"
            ></v-progress-linear>
          </template>
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
            v-slot:[`item.owner`]="{ item }"
          >
            {{item.owner && item.owner.user ? item.owner.user.userName : ''}}
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{ $moment(item.createdAt).format('DD.MM.YYYY, HH:mm') }} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.visibility`]="{ item }"
          >
            <v-chip
              dark
            >
              {{$t(item.visibility + 'VisibilityTitle')}}
            </v-chip>
          </template>
          <template
            v-slot:[`item.categories`]="{ item }"
          >
            <v-chip
              outlined
              v-for="category in getCategories(item.categories)"
              :key="category._id"
              class="mr-1"
              disabled
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
              disabled
            >
            {{tag.text}}
            </v-chip>
          </template>
          <template
            v-slot:[`item.isActive`]="{ item }"
          >
            <v-btn
              icon
              :color="$settings.modules.groups.color"
              :loading="loaders[item._id + 'isActive'] === true"
              disabled
              @click="changeGroupsProperty(
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
            v-slot:[`item.accepted.isAccepted`]="{ item }"
          >
            <v-btn
              icon
              :color="$settings.modules.groups.color"
              :disabled="user.role !== 'admins'"
              :loading="loaders[item._id + 'accepted'] === true"
              @click="changeGroupsProperty(
                item,
                'accepted',
                {
                  isAccepted: item.accepted && item.accepted.isAccepted ? false : true,
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
                {{item.accepted && item.accepted.isAccepted ? 'fas fa-check-square' : 'far fa-square'}}
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-btn
              fab
              small
              :color="$settings.modules.groups.color"
              class="my-4"
              :loading="loaders[item._id + 'delete'] === true"
              @click="deleteGroup(item._id)"
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
              :color="$settings.modules.groups.color"
              class="my-4"
              :disabled="!item.isActive"
              :to="{name: 'Group', params: { group: item._id } }"
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
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'GroupListAdmin',

  components: {
  },

  data: () => ({
    triggerReload: 1,
    message: undefined,
    activeAnswerField: undefined,
    loaders: {},
    search: '',
    page: 1,
    loading: true,
    itemsPerPage: 25,
    sortBy: ['createdAt'],
    sortDesc: [true],
    isUpdating: false
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
    setTimeout(async () => {
      await this.checkAcceptedGroups()
    }, 1000)
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('groups', {
      patchGroup: 'patch',
      removeGroup: 'remove',
      findGroups: 'find'
    }),
    ...mapActions('status-container-helper', {
      patchGroupNotifications: 'patch'
    }),
    async deleteGroup (id) {
      this.$set(this.loaders, id + 'delete', true)
      try {
        await this.removeGroup(id)
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.$set(this.loaders, id + 'delete', undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.$set(this.loaders, id + 'delete', undefined)
      }
    },
    itemRowBackground (item) {
      if (
        this.adminGroupStatusContainer &&
        this.adminGroupStatusContainer.unread &&
        this.adminGroupStatusContainer.unread.map(unread => unread.id).includes(item._id)
      ) {
        return 'new'
      } else {
        return ''
      }
    },
    async checkAcceptedGroups () {
      const visibleGroups = this.computedGroups.map(obj => obj._id)
      let adminGroups = []
      if (this.adminGroupStatusContainer && this.adminGroupStatusContainer.unread) {
        adminGroups = this.adminGroupStatusContainer.unread.map(unread => unread.id)
      }
      const groupIds = visibleGroups.filter(e => adminGroups.indexOf(e) !== -1)
      if (groupIds.length > 0 && !this.isUpdating) {
        this.isUpdating = true
        await this.patchGroupNotifications(
          [
            'pullUnreadById',
            {
              containerId: this.adminGroupStatusContainer._id,
              ids: groupIds
            }
          ]
        )
        this.isUpdating = false
      }
    },
    async changeGroupsProperty (group, property, value) {
      this.$set(this.loaders, group._id + property, true)
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchGroup(
          [
            group._id,
            patchObj
          ]
        )
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$set(this.loaders, group._id + property, undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.$set(this.loaders, group._id + property, undefined)
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
    },
    updateItemsPerPage (data) {
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
    },
    updateSortBy (data) {
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
    },
    updateSortDesc (data) {
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

  computed: {
    ...mapGetters([
      's3',
      'deepSort',
      'visibilityItems',
      'getTags',
      'getCategories',
      'itemsPerPageOptions'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('groups', {
      groups: 'list'
    }),
    headers () {
      return [
        { text: this.$t('title'), value: 'title.value' },
        { text: this.$t('author'), value: 'owner' },
        { text: this.$t('createdAt'), value: 'createdAt' },
        { text: this.$t('visibility'), value: 'visibility' },
        { text: this.$t('categories'), value: 'categories', sortable: false },
        { text: this.$t('tags'), value: 'tags', sortable: false },
        { text: this.$t('accepted'), value: 'accepted.isAccepted', align: 'center' },
        { text: this.$t('active'), value: 'isActive', align: 'center' },
        { text: this.$t('deleteButton'), value: 'delete', align: 'center', sortable: false },
        { text: this.$t('viewButton'), value: 'link', align: 'center', sortable: false }
      ]
    },
    groupsParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: (this.page - 1) * this.computedSkip,
        $sort: { [this.sortBy]: this.computedSortDesc }
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
    adminGroupStatusContainer () {
      return this.statusContainers.find(obj => obj.user === this.user._id && obj.type === 'groups' && obj.relation === 'admin')
    },
    computedGroups () {
      if (this.groupsResponse) {
        return this.groupsResponse.data
      } else {
        return []
      }
    },
    total () {
      if (this.groupsResponse) {
        return this.groupsResponse.total
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
    async groupsResponse () {
      if (this.triggerReload) {
        this.loading = true
        const groups = await this.findGroups(
          {
            query: this.groupsParams
          }
        )
        this.loading = false
        setTimeout(async () => {
          await this.checkAcceptedGroups()
        }, 1000)
        return groups
      }
    }
  },

  watch: {
    async groups () {
      this.triggerReload = Date.now()
    },
    statusContainers: {
      deep: true,
      async handler () {
        await this.checkAcceptedGroups()
      }
    }
  }
}
</script>
