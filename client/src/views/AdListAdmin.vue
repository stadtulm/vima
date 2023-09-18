<template>
  <div>
     <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
        v-html="$t('adminView') + ' ' + $t('adsTitle')"
      >
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
          :items="computedAds"
          :loading="loading"
          class="customGreyUltraLight pb-3 elevation-3"
          item-value="_id"
          @update:options="updateDataTableParams"
          sort-asc-icon="fas fa-caret-up"
          sort-desc-icon="fas fa-caret-down"
          :show-current-page="true"
          :must-sort="true"
          :item-class="itemRowBackground"
        >
          <template
            v-slot:[`item.title.value`]="{ item }"
          >
            <div
              class="font-weight-bold"
            >
              {{item.raw.title.value}}
            </div>
          </template>
          <template
            v-slot:[`item.author`]="{ item }"
          >
            {{item.raw.author?.user?.userName || ''}}
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{ $moment(item.raw.createdAt).format('DD.MM.YYYY, HH:mm') }} {{$t('oClock')}}
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
            {{category.raw.text.value}}
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
              variant="text"
              :icon="item.raw.isActive ? 'fas fa-check-square' : 'far fa-square'"
              :color="$settings.modules.ads.color"
              :loading="loaders[item._id + 'isActive'] === true"
              disabled
              @click="changeAdProperty(
                item,
                'isActive',
                !item.raw.isActive
              )"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.accepted.isAccepted`]="{ item }"
          >
            <v-btn
              variant="text"
              :icon="item.raw.accepted.isAccepted ? 'fas fa-check-square' : 'far fa-square'"
              :color="$settings.modules.ads.color"
              :disabled="user.role !== 'admins'"
              :loading="loaders[item.raw._id + 'accepted'] === true"
              @click="changeAdProperty(
                item.raw,
                'accepted',
                {
                  isAccepted: !item.raw.accepted.isAccepted,
                  dt: new Date(),
                  user: user._id
                }
              )"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-btn
              icon
              size="small"
              :color="$settings.modules.ads.color"
              class="my-4"
              :loading="loaders[item.raw._id + 'delete'] === true"
              @click="deleteAd(item.raw._id)"
            >
              <template
                v-slot:loader
              >
                <v-progress-circular
                  color="white"
                  width="3"
                  indeterminate
                ></v-progress-circular>
              </template>
              <v-icon
                color="white"
              >
                fa fa-trash
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.link`]="{ item }"
          >
            <v-btn
              icon
              size="small"
              :color="$settings.modules.ads.color"
              class="my-4"
              :disabled="!item.raw.isActive"
              :to="{name: 'Ad', params: { id: item.raw._id } }"
            >
              <v-icon
                color="white"
              >
                fa fa-arrow-right
              </v-icon>
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
  name: 'AdList',

  components: {
  },

  data: () => ({
    initialView: true,
    loading: true,
    isUpdating: false,
    loaders: {},
    adsResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'createdAt', order: 'desc' }]
    },
  }),

  async mounted () {
    await this.adaptQuery()
    setTimeout(async () => {
      await this.checkAcceptedAds()
    }, 1000)
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('ads', {
      patchAd: 'patch',
      removeAd: 'remove',
      findAds: 'find'
    }),
    ...mapActions('status-container-helper', {
      patchAdNotifications: 'patch'
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
      this.loading = true
      this.adsResponse = await this.findAds(
        this.adsParams
      )
      this.loading = false
      setTimeout(async () => {
        await this.checkAcceptedAds()
      }, 1000)
    },
    async deleteAd (id) {
      this.loaders[id + 'delete'] = true
      try {
        await this.removeAd(id)
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.loaders[id + 'delete'] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.loaders[id + 'delete'] = undefined
      }
    },
    // TODO: Test
    itemRowBackground (item) {
      if (
        this.adminAdStatusContainer &&
        this.adminAdStatusContainer.unread &&
        this.adminAdStatusContainer.unread.map(unread => unread.id).includes(item._id)
      ) {
        return 'new'
      } else {
        return ''
      }
    },
    async checkAcceptedAds () {
      const visibleAds = this.ads.map(obj => obj._id)
      let adminAds = []
      if (this.adminAdStatusContainer && this.adminAdStatusContainer.unread) {
        adminAds = this.adminAdStatusContainer.unread.map(unread => unread.id)
      }
      const adIds = visibleAds.filter(e => adminAds.indexOf(e) !== -1)
      if (adIds.length > 0 && !this.isUpdating) {
        this.isUpdating = true
        await this.patchAdNotifications(
          [
            'pullUnreadById',
            {
              containerId: this.adminAdStatusContainer,
              ids: adIds
            }
          ]
        )
        this.isUpdating = false
      }
    },
    async changeAdProperty (ad, property, value) {
      this.loaders[ad._id + property] = true
      const patchObj = {}
      patchObj[property] = value
      patchObj.tmpAdAuthor = ad.author.user._id
      try {
        await this.patchAd(
          [
            ad._id,
            patchObj
          ]
        )
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[ad._id + property] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[ad._id + property] = undefined
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
      'updateQuerySortOrder'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('ads', {
      ads: 'list'
    }),
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value' },
        { title: this.$t('author'), key: 'author', sortable: false },
        { title: this.$t('createdAt'), key: 'createdAt' },
        { title: this.$t('categories'), key: 'categories', sortable: false },
        { title: this.$t('tags'), key: 'tags', sortable: false },
        { title: this.$t('accepted'), key: 'accepted.isAccepted', align: 'center' },
        { title: this.$t('active'), key: 'isActive', align: 'center' },
        { title: this.$t('deleteButton'), key: 'delete', align: 'center', sortable: false },
        { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false }
      ]
    },
    adsParams () {
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
              { type: 'default' }
            ]
          }
        }
      }
      return {
        query
      }
    },
    adminAdStatusContainer () {
      return this.statusContainers.find(obj => obj.user === this.user._id && obj.type === 'ads' && obj.relation === 'admin')
    },
    computedAds () {
      if (this.adsResponse && this.adsResponse.data) {
        return this.adsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.adsResponse) {
        return this.adsResponse.total
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
    },
    adsParams: {
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
    statusContainers: {
      deep: true,
      async handler () {
        await this.checkAcceptedAds()
      }
    }
  }
}
</script>
