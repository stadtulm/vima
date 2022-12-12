<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('adminView')}} {{$t('sponsors')}}
      </v-col>
      <v-col
        class="shrink align-self-center"
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
          class="customGreyUltraLight elevation-3"
          :headers="headers"
          :items="computedSponsors"
          :loading="isFindSponsorsPending"
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
            itemsPerPageOptions,
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
            v-slot:[`item.title.value`]="{ item }"
          >
            <v-list-item
              class="pa-0"
            >
              <v-list-item-content>
                <v-list-item-title
                  class="font-weight-bold"
                >
                  {{item.title.value}}
                </v-list-item-title>
                <v-list-item-subtitle
                  v-if="item.subTitle && item.subTitle !== ''"
                >
                  {{item.subTitle.value}}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
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
              :to="{ name: 'SponsorEditor', params: { sponsor: item._id } }"
            >
              <v-icon
                color="white"
                size="18"
              >
                fa fa-pen
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
              @click="deleteSponsor(item._id)"
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
        </v-data-table>
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
    isFindSponsorsPending: false,
    loaders: {},
    search: '',
    page: 1,
    total: 0,
    itemsPerPage: 5,
    sortBy: ['updatedAt'],
    sortDesc: [true],
    triggerReload: 1
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
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
      this.$set(this.loaders, id + 'delete', true)
      try {
        await this.removeSponsor(id)
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
      'itemsPerPageOptions'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('sponsors', {
      sponsors: 'list'
    }),
    headers () {
      return [
        { text: this.$t('name'), value: 'name' },
        { text: this.$t('createdAt'), value: 'createdAt', width: 170 },
        { text: this.$t('updatedAt'), value: 'updatedAt', width: 170 },
        { text: this.$t('editButton'), value: 'edit', sortable: false, align: 'center' },
        { text: this.$t('deleteButton'), value: 'delete', sortable: false, align: 'center' }
      ]
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
    },
    computedSponsors () {
      if (this.computedSponsorsData && this.computedSponsorsData.data) {
        return this.computedSponsorsData.data
      } else {
        return []
      }
    }
  },

  asyncComputed: {
    async computedSponsorsData () {
      if (this.triggerReload) {}
      this.isFindSponsorsPending = true
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
      const tmpSponsors = await this.findSponsors(
        {
          query
        }
      )
      return tmpSponsors
    }
  },

  watch: {
    sponsors () {
      this.triggerReload = Date.now()
    },
    computedSponsors (newValue, oldValue) {
      //
      this.total = this.computedSponsorsData.total
      //
      if (this.page > Math.ceil(this.total / this.itemsPerPage)) {
        this.page = Math.ceil(this.total / this.itemsPerPage) + 1
      }
      //
      this.isFindSponsorsPending = false
    }
  }
}
</script>
