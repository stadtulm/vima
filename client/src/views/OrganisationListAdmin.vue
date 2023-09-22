<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('adminView')}} {{$t('manageOrganisationsButton')}}
      </span>
      <span
        class="my-3"
      >
        <v-btn
          variant="elevated"
          :to="{ name: 'OrganisationAdminEditor' }"
          dark
          color="customGrey"
        >
          {{$t('newOrganisationButton')}}
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
          :label="$t('filterByOrganisationNameLabel')"
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
          :items="computedOrganisations"
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
            v-slot:[`item.members`]="{ item }"
          >
            <v-btn
              icon="fas fa-list"
              size="small"
              color="customGrey"
              @click="membersDialogItem = item.raw"
            >
            </v-btn>
          </template>
          <template
            v-slot:[`item.edit`]="{ item }"
          >
            <v-btn
              icon="fa fa-pen"
              size="small"
              color="customGrey"
              :to="{ name: 'OrganisationAdminEditor', params: { organisation: item.raw._id } }"
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
              :loading="loaders[item.raw._id + 'delete'] === true"
              @click="deleteOrganisation(item.raw._id)"
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
              class="my-3"
              :to="{name: 'Organisation', params: { organisation: item.raw._id } }"
            >
            </v-btn>
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
              {{$t('manageGroupMembers')}}
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
                  {{$t('currentGroupMembers')}}
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
                        v-if="memberStatusContainers"
                      >
                        <v-list-item
                          v-for="member in memberStatusContainers.filter(obj => obj.relation === 'member').map(obj => getUser(obj.user))"
                          :key="member._id"
                        >
                          <template v-slot:prepend>
                            <v-avatar
                              class="my-2"
                              color="customGreyLight"
                              size="40"
                            >
                              <v-img
                                v-if="member.pic"
                                :src="s3 + member.pic.url"
                                :alt="$t('userPic')"
                                :title="member.pic.credit ? '© ' + member.pic.credit : ''"
                              >
                              </v-img>
                              <v-icon
                                v-else
                                color="white"
                                size="18"
                              >
                                fas fa-user
                              </v-icon>
                            </v-avatar>
                          </template>
                          <v-list-item-title>
                            {{member.userName}}
                          </v-list-item-title>
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
                      <UserTable
                        v-if="membersDialogItem"
                        :customActionText="$t('add')"
                        customActionIcon="fas fa-plus"
                        customColor="customGrey"
                        :customQuery="
                        {
                          role: { $nin: ['users', 'deleted'] },
                          _id: { $nin: memberStatusContainers ? memberStatusContainers.map(obj => obj.user) : [] }
                        }
                        "
                        @customAction="addMember"
                      ></UserTable>
                    </v-card-text>
                  </v-card>
                </v-window-item>
              </v-window>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'
import UserTable from '@/components/UserTable.vue'

export default {
  name: 'OrganisationListAdmin',

  components: {
    UserTable
  },

  data: () => ({
    memberStatusContainers: undefined,
    initialView: true,
    membersTab: 0,
    membersTrigger: 1,
    membersDialogItem: undefined,
    showMembersDialog: false,
    organisationsResponse: undefined,
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
    await this.adaptQuery()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('organisations', {
      findOrganisations: 'find',
      removeOrganisation: 'remove'
    }),
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    ...mapActions('status-container-helper', {
      createOrganisationMembership: 'create',
      removeOrganisationMembership: 'remove'
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
      this.organisationsResponse = await this.findOrganisations(
        this.organisationsParams
      )
      this.loading = false
    },
    async addMember (user) {
      try {
        await this.createOrganisationMembership(
          {
            type: 'createOrganisationMembership',
            userId: user._id,
            organisationId: this.membersDialogItem._id
          }
        )
        this.membersTrigger = Date.now()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async removeMember (user) {
      try {
        await this.removeOrganisationMembership(
          [
            this.membersDialogItem._id,
            {
              query: {
                type: 'removeOrganisationMembership',
                userId: user._id
              }
            }
          ]
        )
        this.membersTrigger = Date.now()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async deleteOrganisation (id) {
      this.loaders[id + 'delete'] = true
      try {
        await this.removeOrganisation(id)
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
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        { title: this.$t('name'), key: 'name', width: 350 },
        { title: this.$t('createdAt'), key: 'createdAt' },
        { title: this.$t('updatedAt'), key: 'updatedAt' },
        { title: this.$t('position'), key: 'position' },
        { title: this.$t('manageMembersButton'), key: 'members', align: 'center', sortable: false },
        { title: this.$t('editButton'), key: 'edit', sortable: false, align: 'center' },
        { title: this.$t('deleteButton'), key: 'delete', sortable: false, align: 'center' },
        { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false }
      ]
    },
    organisationsParams () {
      return {
        query: {
          name: { $regex: this.queryObject.query, $options: 'i' },
          $limit: this.computedLimit,
          $skip: this.computedSkip,
          $sort: {
            [this.queryObject.sortBy[0].key]: this.computedSortOrder
          }
        }
      }
    },
    computedOrganisations () {
      if (this.organisationsResponse) {
        return this.organisationsResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.organisationsResponse) {
        return this.organisationsResponse.total
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
        this.memberStatusContainers = await this.findStatusContainers({
          query: {
            reference: this.membersDialogItem._id,
            relation: { $in: ['owner', 'member'] }
          }
        })
      } else {
        return []
      }
    },
    async membersDialogItem () {
      if (this.membersDialogItem) {
        if (this.membersDialogItem && this.membersTrigger) {
          this.memberStatusContainers = await this.findStatusContainers({
            query: {
              reference: this.membersDialogItem._id,
              relation: { $in: ['owner', 'member'] }
            }
          })
        } else {
          return []
        }
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
    organisationsParams: {
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
