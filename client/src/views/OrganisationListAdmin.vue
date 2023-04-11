<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('adminView')}} {{$t('manageOrganisationsButton')}}
      </v-col>
      <v-col
        class="shrink align-self-center"
      >
        <v-btn
          dark
          :to="{ name: 'OrganisationAdminEditor' }"
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
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          :label="$t('filterByOrganisationNameLabel')"
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
          :items="organisations"
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
            v-slot:[`item.name`]="{ item }"
          >
            <v-list-item
              class="pa-0"
            >
              <v-list-item-content>
                <v-list-item-title
                  class="font-weight-bold"
                >
                  {{item.name}}
                </v-list-item-title>
                <v-list-item-subtitle
                  v-if="item.subTitle && item.description !== ''"
                >
                  {{item.description}}
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
            v-slot:[`item.members`]="{ item }"
          >
            <v-btn
              fab
              small
              color="customGrey"
              @click="membersDialogItem = item"
            >
              <v-icon
                color="white"
                size="18"
              >
                fas fa-list
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
              :to="{ name: 'OrganisationAdminEditor', params: { organisation: item._id } }"
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
              @click="deleteOrganisation(item._id)"
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
              color="customGrey"
              class="my-4"
              :to="{name: 'Organisation', params: { organisation: item._id } }"
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
              <v-tabs-items v-model="membersTab">
                <v-tab-item>
                  <v-card flat>
                    <v-card-text>
                      <v-list
                        v-if="computedMemberStatusContainers"
                      >
                        <v-list-item
                          v-for="member in computedMemberStatusContainers.filter(obj => obj.relation === 'member').map(obj => getUser(obj.user))"
                          :key="member._id"
                        >
                          <v-list-item-avatar
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
                          </v-list-item-avatar>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{member.userName}}
                            </v-list-item-title>
                          </v-list-item-content>
                          <v-list-item-action>
                            <v-btn
                              @click="removeMember(member)"
                              fab
                              small
                              dark
                              color="customGrey"
                            >
                              <v-icon
                                size="18"
                              >
                                fas fa-times
                              </v-icon>
                            </v-btn>
                          </v-list-item-action>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
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
                        :customQuery="{
                          role: { $nin: ['users', 'deleted'] },
                          _id: { $nin: computedMemberStatusContainers ? computedMemberStatusContainers.map(obj => obj.user) : [] }
                        }
                        "
                        @customAction="addMember"
                      ></UserTable>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import { makeFindMixin } from 'feathers-vuex'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import UserTable from '@/components/UserTable.vue'

export default {
  name: 'OrganisationListAdmin',

  mixins: [makeFindMixin({ service: 'organisations', watch: true })],

  components: {
    UserTable
  },

  data: () => ({
    membersTab: 0,
    membersTrigger: 1,
    membersDialogItem: undefined,
    showMembersDialog: false,
    loaders: {},
    search: '',
    page: 1,
    loading: true,
    total: 0,
    itemsPerPage: 25,
    sortBy: ['name'],
    sortDesc: [true]
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
    ...mapActions('organisations', {
      removeOrganisation: 'remove'
    }),
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    ...mapActions('status-container-helper', {
      createOrganisationMembership: 'create',
      removeOrganisationMembership: 'remove'
    }),
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
      this.$set(this.loaders, id + 'delete', true)
      try {
        await this.removeOrganisation(id)
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
      's3',
      'itemsPerPageOptions'
    ]),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        { text: this.$t('name'), value: 'name' },
        { text: this.$t('createdAt'), value: 'createdAt', width: 170 },
        { text: this.$t('updatedAt'), value: 'updatedAt', width: 170 },
        { text: this.$t('position'), value: 'position', width: 170 },
        { text: this.$t('manageMembersButton'), value: 'members', align: 'center', sortable: false },
        { text: this.$t('editButton'), value: 'edit', sortable: false, align: 'center' },
        { text: this.$t('deleteButton'), value: 'delete', sortable: false, align: 'center' },
        { text: this.$t('viewButton'), value: 'link', align: 'center', sortable: false }
      ]
    },
    organisationsParams () {
      return {
        query: {
          name: { $regex: this.search, $options: 'i' },
          $limit: this.computedLimit,
          $skip: (this.page - 1) * this.computedSkip,
          $sort: { [this.sortBy]: this.computedSortDesc }
        },
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

  asyncComputed: {
    async computedMemberStatusContainers () {
      if (this.membersDialogItem && this.membersTrigger) {
        return await this.findStatusContainers({
          query: {
            reference: this.membersDialogItem._id,
            relation: { $in: ['owner', 'member'] }
          }
        })
      } else {
        return []
      }
    }
  },

  watch: {
    isFindOrganisationsPending () {
      if (!this.isFindOrganisationsPending) {
        this.loading = false
        this.total = this.organisationsPaginationData.admin.mostRecent.total
      } else {
        this.loading = true
      }
    },
    membersDialogItem () {
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
    }
  }
}
</script>
