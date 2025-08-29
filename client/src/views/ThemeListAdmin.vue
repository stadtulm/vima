<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('adminView')}} {{$t('themes')}}
      </span>
      <span
        class="my-3"
      >
        <v-btn
          variant="elevated"
          :to="{ name: 'ThemeEditor' }"
          dark
          color="customGrey"
        >
          {{$t('newThemeButton')}}
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
          :items="computedThemes"
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
            v-slot:[`item.members`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fas fa-list"
                    size="small"
                    color="customGrey"
                    @click="membersDialogItem = item"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('manageGroupsButton')}}
            </v-tooltip>
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
                    :to="{ name: 'ThemeEditor', params: { theme: item._id } }"
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
                    :loading="loaders[item._id + 'delete'] === true"
                    @click="activateDeleteDialog(item._id)"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('deleteButton')}}
            </v-tooltip>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
    <!-- Members dialog -->
    <v-dialog
      v-model="showMembersDialog"
      max-width="800"
    >
      <v-card
        color="customGreyUltraLight"
        tile
      >
        <v-card-text
          class="pa-8"
        >
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('manageGroupsButton')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-toolbar
                color="customGreyUltraLight"
                flat
              >
              <v-tabs
                color="customGrey"
                v-model="membersTab"
              >
                <v-tab>
                  {{$t('currentThemeGroups')}}
                </v-tab>
                <v-tab>
                  {{$t('add')}}
                </v-tab>
              </v-tabs>
              </v-toolbar>
              <v-window v-model="membersTab">
                <v-window-item>
                  <v-card flat>
                    <v-card-text>
                      <v-list
                        v-if="membersDialogItem?.groups"
                      >
                        <v-list-item
                          v-for="member in membersDialogItem.groups"
                          :key="member._id"
                        >
                          <div
                            class="font-weight-bold"
                          >
                            {{member.title.find(obj => obj.type === 'default').value}}
                          </div>
                          <template v-slot:append>
                            <v-btn
                              @click="removeMember(member)"
                              icon="fas fa-times"
                              size="small"
                              color="customGrey"
                            >
                            </v-btn>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-window-item>
                <v-window-item>
                  <v-card
                    flat
                    color="transparent"
                  >
                    <v-card-text>
                      <GroupTable
                        v-if="membersDialogItem"
                        :customActionText="$t('add')"
                        customActionIcon="fas fa-plus"
                        customColor="customGrey"
                        :customQuery="
                        {
                          _id: { $nin: membersDialogItem?.groups ? membersDialogItem.groups.map(obj => obj._id) : [] },
                          $or: [
                            { theme: { $exists: false } },
                            { theme: null }
                          ],
                        }
                        "
                        @update:customAction="addMember"
                      ></GroupTable>
                    </v-card-text>
                  </v-card>
                </v-window-item>
              </v-window>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <delete-dialog
      :showDeleteDialog="showDeleteDialog"
      @delete:executeDelete="deleteTheme()"
      @update:closeDeleteDialog="deactivateDeleteDialog()"
    ></delete-dialog>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'
import GroupTable from '@/components/GroupTable.vue'
import DeleteDialog from '@/components/DeleteDialog.vue'

export default {
  name: 'ThemeListAdmin',

  components: {
    GroupTable,
    DeleteDialog
  },

  data: () => ({
    deleteItem: undefined,
    showDeleteDialog: false,
    currentLanguage: 'en',
    initialView: true,
    membersTab: 0,
    membersTrigger: 1,
    membersDialogItem: undefined,
    showMembersDialog: false,
    themesResponse: undefined,
    loaders: {},
    loading: true,
    queryObject: {
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'name', order: 'desc' }],
      query: ''
    }
  }),

  async mounted () {
    this.currentLanguage = this.$i18n.locale
    await this.adaptQuery()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('themes', {
      findThemes: 'find',
      removeTheme: 'remove'
    }),
    ...mapActions('groups', {
      patchGroup: 'patch'
    }),
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
      this.themesResponse = await this.findThemes(
        this.themesParams
      )
      this.loading = false
    },
    async addMember (group) {
      try {
        await this.patchGroup(
          [
            group._id,
            {
              theme: this.membersDialogItem._id
            }
          ]
        )
        this.membersTrigger = Date.now()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async removeMember (group) {
      try {
        await this.patchGroup(
          [
            group._id,
            {
              theme: null
            }
          ]
        )
        this.membersTrigger = Date.now()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async deleteTheme () {
      this.loaders[this.deleteItem + 'delete'] = true
      try {
        this.showDeleteDialog = false
        if (!this.deleteItem) throw new Error('Id to delete must be set')
        await this.removeTheme(this.deleteItem)
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
      's3',
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder',
      'activateDeleteDialog',
      'deactivateDeleteDialog'
    ]),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value' },
        { title: this.$t('manageGroupsButton'), key: 'members', align: 'center', sortable: false },
        { title: this.$t('editButton'), key: 'edit', sortable: false, align: 'center' },
        { title: this.$t('deleteButton'), key: 'delete', sortable: false, align: 'center' },
        { title: this.$t('createdAt'), key: 'createdAt' },
        { title: this.$t('updatedAt'), key: 'updatedAt' }
      ]
    },
    themesParams () {
      const query = {
        $populate: ['groups'],
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: {
          [this.queryObject.sortBy[0].key]: this.computedSortOrder
        }
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
      return { query }
    },
    computedThemes () {
      if (this.themesResponse) {
        return this.themesResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.themesResponse) {
        return this.themesResponse.total
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
    async membersTrigger () {
      if (this.membersDialogItem && this.membersTrigger) {
        await this.loadDataTableEntities()
      }
    },
    async membersDialogItem () {
      if (this.membersDialogItem) {
        this.showMembersDialog = true
      } else {
        this.showMembersDialog = false
      }
    },
    showMembersDialog () {
      if (!this.showMembersDialog) {
        this.membersDialogItem = undefined
      }
    },
    themesParams: {
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
