<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('adminView')}} {{$t('manageMembersButton')}}
      </v-col>
      <v-col
        class="shrink align-self-center"
      >
        <v-btn
          dark
          :to="{ name: 'UserAdminEditor' }"
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
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        sm="6"
      >
        <v-text-field
          v-model="search"
          :label="$t('filterByUserNamesLabel')"
          outlined
          dense
          hide-details
          color="black"
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-select
          dense
          outlined
          color="customGrey"
          item-color="customGrey"
          :items="[{ textKey: 'all', value: false}].concat(roleItems)"
          :item-text="(item) => $t(item.textKey)"
          v-model="selectedRole"
          :label="$t('role')"
          hide-details
          v-if="user.role === 'admins'"
        >
        </v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          class="customGreyUltraLight elevation-3"
          :headers="headers"
          :items="computedUsers"
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
            v-slot:[`item.pic.url`]="{ item }"
          >
            <v-avatar
              :class="$vuetify.breakpoint.smAndUp ? 'ma-3' : ''"
              color="customGreyLight"
            >
              <v-img
                v-if="item.pic.url"
                :src="s3 + item.pic.url"
                :alt="$t('userPic')"
                :title="item.pic.credit ? '© ' + item.pic.credit : ''"
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
          </template>
          <template
            v-slot:[`item.status`]="{ item }"
          >
            <v-tooltip
              top
            >
              <template v-slot:activator="{ on, attrs }">
                <v-avatar
                  size="20"
                  v-bind="attrs"
                  v-on="on"
                  :color="item.status ? statusItems[item.status].color : ''"
                >
                </v-avatar>
              </template>
              <span>{{item.status ? $t(statusItems[item.status].textKey) : ''}}</span>
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.role`]="{ item }"
          >
            <v-select
              v-model="roles[item._id]"
              :items="roleItems"
              :item-text="(item) => $t(item.textKey)"
              hide-details
              flat
              dense
              item-color="customGrey"
              color="customGrey"
              @change="setProperty('role', item._id, roles[item._id])"
            >
            </v-select>
          </template>
          <template
            v-slot:[`item.isVerified`]="{ item }"
          >
            <v-btn
              icon
              @click="setProperty('isVerified', item._id, !item.isVerified)"
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
                {{item.isVerified ? 'far fa-check-square' : 'far fa-square'}}
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.isActive`]="{ item }"
          >
            <v-btn
              icon
              @click="item.isActive ? (setActiveItem = item) : setProperty('isActive', item._id, !item.isActive)"
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
                {{item.isActive ? 'far fa-check-square' : 'far fa-square'}}
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
              :to="{ name: 'UserAdminEditor', params: { user: item._id } }"
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
              @click="deleteUser(item)"
            >
              <v-icon
                color="white"
                size="18"
              >
                fa fa-trash
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.resend`]="{ item }"
          >
            <template
              v-if="!item.isVerified"
            >
              <v-btn
                v-if="item.createdBy === 'invitation'"
                small
                @click="resendInvitation(item)"
              >
                {{$t('invitation')}}
              </v-btn>
              <v-btn
                small
                outlined
                @click="resendVerify(item)"
                v-else
              >
                {{$t('verificationLink')}}
              </v-btn>
            </template>
          </template>
        </v-data-table>
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
              class="body-1"
              v-html="$t('deactivateUserWarningBody')"
            >
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions
          class="pb-4"
        >
          <v-btn
            @click="setActiveItem = undefined"
          >
            {{$t('cancelButton')}}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            @click="setProperty('isActive', setActiveItem._id, !setActiveItem.isActive)"
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
            {{$t('deactivateButton')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'Users',

  data: () => ({
    selectedRole: false,
    search: '',
    roles: {},
    setActiveItem: undefined,
    showSetActiveDialog: false,
    loaders: {},
    page: 1,
    loading: true,
    itemsPerPage: 25,
    sortBy: ['userName'],
    sortDesc: [true],
    triggerReload: 1
  }),

  async mounted () {
    this.fillObjects()
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
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
    async deleteUser (user) {
      this.$set(this.loaders, user._id + 'delete', true)
      const map = {
        email: null,
        password: user._id,
        role: 'deleted',
        userName: user._id + ' (' + this.$t('deletedAccount') + ')',
        firstName: null,
        lastName: null,
        organisation: null,
        description: null,
        pic: null,
        isActive: false,
        isVerified: false,
        tmpRole: user.role,
        createdBy: null,
        status: 'deleted'
      }
      if (user.pic) {
        map.tmpPicUrlToDelete = user.pic.url
      }
      try {
        await this.patchUser(
          [
            user._id,
            map
          ]
        )
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
      }
      this.$set(this.loaders, user._id + 'delete', undefined)
      await this.findUsers()
    },
    async setProperty (property, id, state) {
      this.$set(this.loaders, id + 'property', true)
      const patchObject = {}
      patchObject[property] = state
      try {
        await this.patchUser([id, patchObject])
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$set(this.loaders, id + 'property', undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.$set(this.loaders, id + 'property', undefined)
        this.roles[id] = undefined
        this.$nextTick(() => {
          this.roles[id] = this.computedUsers.find(obj => obj._id === id).role
        })
      }
      this.setActiveItem = undefined
      this.triggerReload = Date.now()
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
    },
    async resendInvitation (user) {
      try {
        await this.createAuth({
          action: 'resendVerifyInvitation',
          value: user
        })
        this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
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
      'roleItems',
      'statusItems',
      's3',
      'itemsPerPageOptions'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('booths', {
      booths: 'list',
      getBooth: 'get'
    }),
    computedUsers () {
      if (this.usersResponse) {
        return this.usersResponse.data
      } else {
        return []
      }
    },
    total () {
      if (this.usersResponse) {
        return this.usersResponse.total
      } else {
        return 0
      }
    },
    headers () {
      return [
        { text: this.$t('userName'), value: 'userName' },
        { text: this.$t('firstName'), value: 'firstName' },
        { text: this.$t('lastName'), value: 'lastName' },
        { text: this.$t('email'), value: 'email' },
        {
          text: this.$t('state'),
          value: 'status',
          align: 'center'
        },
        { text: this.$t('role'), width: 150, value: 'role' },
        { text: this.$t('verified'), value: 'isVerified', align: 'center' },
        { text: this.$t('active'), value: 'isActive', align: 'center' },
        { text: this.$t('editButton'), value: 'edit', align: 'center', sortable: false },
        { text: this.$t('deleteButton'), value: 'delete', align: 'center', sortable: false },
        {
          text: this.$t('service'),
          value: 'resend',
          sortable: false,
          align: 'center'
        }
      ]
    },
    usersParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: (this.page - 1) * this.computedSkip,
        $sort: { [this.sortBy]: this.computedSortDesc }
      }
      if (this.selectedRole) {
        query.role = this.selectedRole
      } else {
        query.role = { $ne: 'deleted' }
      }
      if (this.search && this.search.trim() !== '') {
        query.$or = [
          { userName: { $regex: this.search, $options: 'i' } },
          { firstName: { $regex: this.search, $options: 'i' } },
          { lastName: { $regex: this.search, $options: 'i' } }
        ]
      }
      return {
        query
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
    async usersResponse () {
      if (this.triggerReload) {
        this.loading = true
        const users = await this.findUsers(
          this.usersParams
        )
        this.loading = false
        return users
      }
    }
  },

  watch: {
    computedUsers: {
      deep: true,
      handler (newValue, oldValue) {
        this.fillObjects()
      }
    },
    setActiveItem () {
      if (this.setActiveItem) {
        this.showSetActiveDialog = true
      } else {
        this.showSetActiveDialog = false
      }
    }
  }

}
</script>
