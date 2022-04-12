<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('adminView')}} {{$t('tags')}}
      </v-col>
      <v-col
        class="shrink align-self-center"
      >
        <v-btn
          large
          dark
          :to="{ name: 'TagEditor' }"
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
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          :label="$t('filterByTagNameLabel')"
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
          @current-items="setCurrentItems"
          :item-class="itemRowBackground"
          class="customGreyUltraLight elevation-3"
          :headers="headers"
          :items="computedTags"
          @update:page="updatePage"
          @update:items-per-page="updateItemsPerPage"
          @update:sort-by="updateSortBy"
          @update:sort-desc="updateSortDesc"
          must-sort
          :page.sync="page"
          :items-per-page.sync="itemsPerPage"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          mobile-breakpoint="0"
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
              color="customGrey"
            ></v-progress-linear>
          </template>
          <template
            v-slot:[`item.text.value`]="{ item }"
          >
            <v-list-item
              class="pa-0"
            >
              <v-list-item-content>
                <v-list-item-title
                  class="font-weight-bold"
                  :class="item.text.type === 'error' ? 'error--text' : ''"
                >
                  {{item.text.value}}
                </v-list-item-title>
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
            v-slot:[`item.isAccepted`]="{ item }"
          >
            <v-btn
              icon
              color="customGrey"
              :disabled="user.role !== 'admins' || item.text.type === 'error'"
              :loading="loaders[item._id + 'accepted'] === true"
              @click="changeTagProperty(
                item,
                'isAccepted',
                !item.isAccepted
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
                {{item.isAccepted ? 'fas fa-check-square' : 'far fa-square'}}
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.isActive`]="{ item }"
          >
            <v-btn
              icon
              color="customGrey"
              :disabled="user.role !== 'admins'"
              :loading="loaders[item._id + 'accepted'] === true"
              @click="changeTagProperty(
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
            v-slot:[`item.edit`]="{ item }"
          >
            <v-btn
              fab
              small
              color="customGrey"
              class="my-3"
              :to="{ name: 'TagEditor', params: { id: item._id } }"
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
              class="my-4"
              @click="deleteTag(item._id)"
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
  name: 'TagListAdmin',

  components: {
  },

  data: () => ({
    idUpdating: false,
    currentTags: [],
    search: '',
    loaders: {},
    page: 1,
    total: 0,
    itemsPerPage: 25,
    sortBy: ['name'],
    sortDesc: [false]
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
    setTimeout(async () => {
      await this.checkAcceptedTags()
    }, 1000)
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
    setCurrentItems (items) {
      this.currentTags = items
    },
    async deleteTag (id) {
      this.$set(this.loaders, id + 'delete', true)
      try {
        await this.removeTag(id)
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.$set(this.loaders, id + 'delete', undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.$set(this.loaders, id + 'delete', undefined)
      }
    },
    async changeTagProperty (tag, property, value) {
      this.$set(this.loaders, tag._id + property, true)
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchTag(
          [
            tag._id,
            patchObj
          ]
        )
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$set(this.loaders, tag._id + property, undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.$set(this.loaders, tag._id + property, undefined)
      }
    },
    itemRowBackground (item) {
      if (
        this.adminTagStatusContainer &&
        this.adminTagStatusContainer.unread &&
        this.adminTagStatusContainer.unread.map(obj => obj.id).includes(item._id)
      ) {
        return 'new'
      } else {
        return ''
      }
    },
    async checkAcceptedTags () {
      const visibleTags = this.currentTags.map(obj => obj._id)
      let adminTags = []
      if (this.adminTagStatusContainer && this.adminTagStatusContainer.unread) {
        adminTags = this.adminTagStatusContainer.unread.map(obj => obj.id)
      }
      const tagIds = visibleTags.filter(e => adminTags.indexOf(e) !== -1)
      if (tagIds.length > 0 && !this.isUpdating) {
        this.isUpdating = true
        await this.patchTagNotifications(
          [
            'pullUnreadById',
            {
              containerId: this.adminTagStatusContainer,
              ids: tagIds
            }
          ]
        )
        this.isUpdating = false
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
        { text: this.$t('name'), value: 'text.value' },
        { text: this.$t('createdAt'), value: 'createdAt' },
        { text: this.$t('updatedAt'), value: 'updatedAt' },
        { text: this.$t('accepted'), value: 'isAccepted', align: 'center' },
        { text: this.$t('active'), value: 'isActive', align: 'center' },
        { text: this.$t('editButton'), value: 'edit', sortable: false, align: 'center' },
        { text: this.$t('deleteButton'), value: 'delete', align: 'center', sortable: false }
      ]
    },
    adminTagStatusContainer () {
      return this.statusContainers.find(obj => obj.user === this.user._id && obj.type === 'tags' && obj.relation === 'admin')
    },
    computedTags () {
      const filteredTags = this.tags.map(tag => tag.text && (tag.text.lang === this.$i18n.locale || tag.text.type === 'default') ? tag : { ...tag, text: { value: this.$t('noDefaultValue'), type: 'error' } })
      if (this.search && this.search.trim() !== '') {
        return filteredTags.filter(obj => obj.text.value.toLowerCase().includes(this.search.toLowerCase()))
      } else {
        return filteredTags
      }
    }
  },

  watch: {
    async currentTags () {
      await this.checkAcceptedTags()
    },
    statusContainers: {
      deep: true,
      async handler () {
        await this.checkAcceptedTags()
      }
    }
  }
}
</script>
