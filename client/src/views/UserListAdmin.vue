<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('adminView')}} {{$t('manageMembersButton')}}
      </span>
      <span
        class="my-3"
      >
        <v-btn
          variant="elevated"
          :to="{ name: 'UserAdminEditor' }"
          dark
          color="customGrey"
        >
          {{$t('newProfileButton')}}
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
      <v-col
        cols="12"
        sm="6"
      >
        <v-text-field
          v-model="queryObject.query"
          :label="$t('filterByUserNamesLabel')"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-select
          v-model="queryObject.role"
          :items="[{ textKey: 'all', value: 'all'}].concat(roleItems)"
          :item-title="(roleItem) => $t(roleItem.textKey)"
          :label="$t('role')"
          density="compact"
          hide-details
        >
        </v-select>
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
          :items="computedUsers"
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
            v-slot:[`item.pic.url`]="{ item }"
          >
            <v-avatar
              :class="$vuetify.display.smAndUp ? 'ma-3' : ''"
              color="customGreyLight"
            >
              <v-img
                v-if="item.pic"
                :src="s3 + item.pic.url"
                :alt="$t('userPic')"
                :title="item.pic?.credit ? '© ' + item.pic.credit : ''"
              >
              </v-img>
              <v-icon
                v-else
                color="white"
              >
                fas fa-user
              </v-icon>
            </v-avatar>
          </template>
          <template
            v-slot:[`item.userName`]="{ item }"
          >
           <span
              class="pointer font-weight-bold"
              @click="$router.push({name: 'User', params: { user: item._id}})"
            >
              {{item.userName}}
            </span>
            <country-flag
              class="ml-1"
              v-if="item.nationality"
              style="translate: -0px 5.5px;"
              :country="item.nationality === 'en' ? 'gb': item.nationality"
            ></country-flag>
          </template>
          <template
            v-slot:[`item.status`]="{ item }"
          >
            <v-tooltip
              top
            >
              <template v-slot:activator="{ props }">
                <v-avatar
                  size="20"
                  v-bind="props"
                  :color="item.status ? statusItems[item.status].color : ''"
                >
                </v-avatar>
              </template>
              <span>{{item.status ? $t(statusItems[item.status].textKey) : ''}}</span>
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{$moment(item.createdAt).format('DD.MM.YYYY')}}
          </template>
          <template
            v-slot:[`item.role`]="{ item }"
          >
            <v-select
              v-model="roles[item._id]"
              :items="roleItems"
              :item-title="(item) => $t(item.textKey)"
              hide-details
              density="compact"
              @update:modelValue="setProperty('role', item._id, roles[item._id])"
            >
            </v-select>
          </template>
          <template
            v-slot:[`item.isTranslator`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    :icon="item.isTranslator ? 'far fa-check-square' : 'far fa-square'"
                    variant="flat"
                    @click="setProperty('isTranslator', item._id, !item.isTranslator)"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('translator')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.isVerified`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    :icon="item.isVerified ? 'far fa-check-square' : 'far fa-square'"
                    variant="flat"
                    @click="setProperty('isVerified', item._id, !item.isVerified)"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('verified')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.isActive`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    :icon="item.isActive ? 'far fa-check-square' : 'far fa-square'"
                    variant="flat"
                    @click="item.isActive ? (setActiveItem = item) : setProperty('isActive', item._id, !item.isActive)"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('active')}}
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
                    class="my-3"
                    :to="{ name: 'UserAdminEditor', params: { user: item._id } }"
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
                    class="my-4"
                    @click="activateDeleteDialog(item)"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('deleteButton')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.resend`]="{ item }"
          >
            <template
              v-if="!item.isVerified"
            >
              <v-btn
                size="small"
                color="customGrey"
                @click="resendVerify(item)"
              >
                {{item.createdBy === 'invitation' ? $t('invitation') : $t('verificationLink')}}
              </v-btn>
            </template>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
    <v-dialog
      v-model="showSetActiveDialog"
      max-width="600"
      persistent
    >
      <v-card>
        <v-card-text>
          <v-row>
            <v-col></v-col>
          </v-row>
          <v-row>
            <v-col
              class="title font-weight-bold"
            >
              {{$t('deaktivateUserWarningTitle')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="text-body-1"
            >
              <div
                v-html="$t('deactivateUserWarningBody')"
              >
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-toolbar
          class="mt-4 pa-3"
        >
          <v-btn
            variant="elevated"
            @click="setActiveItem = undefined"
          >
            {{$t('cancelButton')}}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            variant="elevated"
            dark
            color="error"
            @click="setProperty('isActive', setActiveItem._id, !setActiveItem.isActive)"
          >
            {{$t('deactivateButton')}}
          </v-btn>
        </v-toolbar>
      </v-card>
    </v-dialog>
    <delete-dialog
      :showDeleteDialog="showDeleteDialog"
      @delete:executeDelete="deleteUser()"
      @update:closeDeleteDialog="deactivateDeleteDialog()"
    ></delete-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import DeleteDialog from '@/components/DeleteDialog.vue'

const showTranslators = import.meta.env.VITE_TRANSLATION_EDITOR_ACTIVE

export default {
  name: 'UserListAdmin',

  components: {
    DeleteDialog
  },

  data: () => ({
    deleteItem: undefined,
    showDeleteDialog: false,
    initialView: true,
    loading: true,
    usersResponse: undefined,
    roles: {},
    setActiveItem: undefined,
    showSetActiveDialog: false,
    loaders: {},
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'userName', order: 'desc' }],
      role: 'all'
    }
  }),

  async mounted () {
    await this.adaptQuery()
    this.fillObjects()
  },

  methods: {
    ...mapActions('users', {
      patchUser: 'patch',
      findUsers: 'find'
    }),
    ...mapActions('authManagement', {
      createAuth: 'create'
    }),
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    async updateDataTableParams (e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query,
          role: this.queryObject.role
        }
        this.updateQueryQuery(this.queryObject.query)
        this.updateQueryRole(this.queryObject.role)
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
      this.usersResponse = await this.findUsers(
        this.usersParams
      )
      this.loading = false
    },
    async deleteUser () {
      this.loaders[this.deleteItem._id + 'delete'] = true
      const map = {
        email: this.deleteItem._id,
        password: this.deleteItem._id,
        role: 'deleted',
        userName: this.deleteItem._id + ' (' + this.$t('deletedAccount') + ')',
        firstName: null,
        lastName: null,
        organisation: null,
        description: null,
        pic: null,
        isActive: false,
        isVerified: false,
        tmpRole: this.deleteItem.role,
        createdBy: null,
        status: 'deleted'
      }
      if (this.deleteItem.pic) {
        map.tmpPicUrlToDelete = this.deleteItem.pic.url
      }
      try {
        this.showDeleteDialog = false
        if (!this.deleteItem) throw new Error('Id to delete must be set')
        await this.patchUser(
          [
            this.deleteItem._id,
            map
          ]
        )
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
      } finally {
        this.deleteItem = undefined
        await this.loadDataTableEntities()
        this.loaders[this.deleteItem._id + 'delete'] = undefined
      }
    },
    async setProperty (property, id, state) {
      this.loaders[id + 'property'] = true
      const patchObject = {}
      if (property === 'role') {
        patchObject[property] = state
      } else {
        patchObject[property] = state === true
      }
      try {
        await this.patchUser([id, patchObject])
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[id + 'property'] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[id + 'property'] = undefined
        this.roles[id] = undefined
        this.$nextTick(() => {
          this.roles[id] = this.computedUsers.find(obj => obj._id === id).role
        })
      }
      this.setActiveItem = undefined
    },
    fillObjects () {
      const tmpRoles = {}
      for (const computedUser of this.computedUsers) {
        tmpRoles[computedUser._id] = computedUser.role
      }
      this.roles = tmpRoles
    },
    async resendVerify (user) {
      try {
        await this.createAuth({
          action: 'resendVerifySignup',
          value: { email: user.email }
        })
        this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
      }
    }
  },

  computed: {
    ...mapGetters([
      'roleItems',
      'statusItems',
      's3',
      'adaptQuery',
      'updateQueryRole',
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
        {
          title: '',
          key: 'pic.url',
          align: 'start',
          sortable: false,
          minWidth: 50
        },
        { title: this.$t('userName'), key: 'userName' },
        { title: this.$t('role'), minWidth: 170, key: 'role' },
        { title: this.$t('verified'), key: 'isVerified', align: 'center' },
        { title: this.$t('active'), key: 'isActive', align: 'center' },
        ...(this.computedShowTranslators ? [{ title: this.$t('translator'), key: 'isTranslator', align: 'center' }] : []),
        { title: this.$t('editButton'), key: 'edit', align: 'center', sortable: false },
        { title: this.$t('deleteButton'), key: 'delete', align: 'center', sortable: false },
        {
          title: this.$t('state'),
          key: 'status',
          align: 'center'
        },
        {
          title: this.$t('service'),
          key: 'resend',
          sortable: false,
          align: 'center'
        },
        { title: this.$t('firstName'), key: 'firstName' },
        { title: this.$t('lastName'), key: 'lastName' },
        { title: this.$t('email'), key: 'email' },
        { title: this.$t('dt'), key: 'createdAt' }
      ]
    },
    computedShowTranslators () {
      return parseInt(showTranslators)
    },
    usersParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: {
          [this.queryObject.sortBy[0].key]: this.computedSortOrder
        }
      }
      if (this.queryObject.role && this.queryObject.role !== 'all') {
        query.role = this.queryObject.role
      } else {
        query.role = { $ne: 'deleted' }
      }
      if (this.queryObject.query && this.queryObject.query.trim() !== '') {
        query.$or = [
          { userName: { $regex: this.queryObject.query, $options: 'i' } },
          { firstName: { $regex: this.queryObject.query, $options: 'i' } },
          { lastName: { $regex: this.queryObject.query, $options: 'i' } }
        ]
      }
      return {
        query
      }
    },
    computedUsers () {
      if (this.usersResponse) {
        return this.usersResponse.data
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.usersResponse) {
        return this.usersResponse.total
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
    'queryObject.role' () {
      this.updateQueryRole(this.queryObject.role)
    },
    computedUsers: {
      deep: true,
      handler () {
        this.fillObjects()
      }
    },
    setActiveItem () {
      if (this.setActiveItem) {
        this.showSetActiveDialog = true
      } else {
        this.showSetActiveDialog = false
      }
    },
    usersParams: {
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
