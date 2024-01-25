<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('account')}} {{ selectedUser ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
      </span>
    </v-row>
    <v-row
      v-if="selectedUser || !$route.params.user"
    >
      <v-col
        cols="12"
      >
        <v-card
          tile
        >
          <v-card-text>
            <v-form
              v-model="isValid"
              ref="userEditorForm"
            >
              <v-row
                dense
              >
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    ref="tabStart"
                    density="compact"
                    :label="$t('firstName')"
                    v-model="firstName"
                    :rules="[rules.required]"
                  >
                  </v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    density="compact"
                    :label="$t('lastName')"
                    v-model="lastName"
                    :rules="[rules.required]"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    density="compact"
                    :label="$t('userName')"
                    v-model="userName"
                    :error-messages="userNameError"
                    :rules="[rules.required, rules.userNameLength, rules.noBlanks]"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    density="compact"
                    v-model="email"
                    :error-messages="emailError"
                    :label="$t('email')"
                    :rules="[rules.required, rules.email]"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                dense
                v-if="selectedUser"
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    density="compact"
                    v-model="pw"
                    :rules="[rules.passwordOptional]"
                    :label="$t('password')"
                    type="password"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-select
                    density="compact"
                    :items="computedRoles"
                    v-model="role"
                    :label="$t('role')"
                    :rules="[rules.required]"
                    :disabled="user.role !== 'admins' && user.role !== 'hosts' && user.role !== 'exhibitors'"
                  >
                  </v-select>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    density="compact"
                    v-model="description"
                    :label="$t('aboutMe') + ' ' + $t('optionalLabelExtension')"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                v-if="selectedUser"
              >
                <v-col
                  class="mb-4"
                >
                  <v-alert
                    variant="outlined"
                    color="customGrey"
                    icon="fas fa-info-circle"
                  >
                    {{$t('optionalPreferencesBody')}}
                    <br>
                    <v-btn
                      color="customGrey"
                      dark
                      class="mt-4"
                      :to="{ name: 'PreferencesEditor', params: { user: selectedUser._id }}"
                    >
                      {{$t('preferences')}}
                      <v-icon
                        size="18"
                        class="ml-3"
                      >
                        fas fa-arrow-right
                      </v-icon>
                    </v-btn>
                  </v-alert>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-select
                    density="compact"
                    v-model="age"
                    :label="$t('age') + ' ' + $t('optionalLabelExtension')"
                    :items="[
                      { title: $t('notSpecified') , value: null },
                      { title: '<21' , value: 0 },
                      { title: '21-30' , value: 1 },
                      { title: '31-40' , value: 2 },
                      { title: '41-50' , value: 3 },
                      { title: '51-60' , value: 4 },
                      { title: '61-70' , value: 5 },
                      { title: '>70' , value: 6 }
                    ]"
                  >
                  </v-select>
                </v-col>
                <v-col
                  cols="12"
                >
                  <v-select
                    density="compact"
                    v-model="gender"
                    :label="$t('genderLabel') + ' ' + $t('optionalLabelExtension')"
                    :items="[
                      { title: $t('notSpecified') , value: null },
                      { title: $t('male') , value: 'm' },
                      { title: $t('female') , value: 'f' },
                      { title: $t('diverse') , value: 'd' },
                    ]"
                  >
                  </v-select>
                </v-col>
                <v-col
                  cols="12"
                >
                  <v-text-field
                    density="compact"
                    v-model="residence"
                    :label="$t('residence') + ' ' + $t('optionalLabelExtension')"
                    :rules="[rules.shortText]"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-divider
                class="mb-9 mt-3"
              ></v-divider>
              <v-row>
                <v-col
                  cols="12"
                >
                  <v-card
                    flat
                  >
                    <v-row>
                      <v-col
                        class="text-subtitle-1"
                        cols="12"
                      >
                        {{$t('userPic')}} {{$t('optionalLabelExtension')}}
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        tabIndex="0"
                        @keypress="$refs.userPicUpload.fakeClick()"
                      >
                        <FileUpload
                          ref="userPicUpload"
                          v-model="pic"
                          @update:fileRemove="patchFileRemove()"
                          @update:fileAdd="$nextTick(() => { $refs.userEditorForm.validate() })"
                          :acceptedMimeTypes="['image/png', 'image/jpg', 'image/jpeg']"
                          :maxFileSize="0.5"
                          :maxFiles="1"
                          bgColor="customGreyUltraLight"
                          :scaleToFit="[400, 400]"
                          :resizeQuality="75"
                        ></FileUpload>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
              <v-divider
                class="mb-6 mt-9"
              ></v-divider>
              <v-row
                v-if="!selectedUser"
              >
                <v-col>
                  <v-alert
                    color="customGreyLight"
                    icon="fas fa-info-circle"
                  >
                    {{$t('inviteUserHint')}}
                  </v-alert>
                </v-col>
              </v-row>
              <v-toolbar
                class="mt-4"
                color="transparent"
              >
                <v-btn
                  v-if="selectedUser"
                  variant="tonal"
                  size="large"
                  color="error"
                  :loading="isDeleting"
                  :disabled="isLoading"
                  @click="showDeleteDialog = true"
                >
                  {{$t('deleteAccountButton')}}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  size="large"
                  dark
                  variant="elevated"
                  color="customGrey"
                  :loading="isLoading"
                  :disabled="!isValid"
                  @click="checkPassword()"
                >
                  {{$t('saveDataButton')}}
                </v-btn>
              </v-toolbar>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-model="showDeleteDialog"
      persistent
      max-width="600"
    >
      <v-card
        tile
      >
        <v-card-text
          class="pa-8"
        >
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('deleteAccountWarningHeadline')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="text-body-1 font-weight-bold"
            >
              <div
                v-html="$t('deleteAccountWarningBody')"
              >
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                dense
                outlined
                color="customGrey"
                background-color="#fff"
                v-model="oldPw"
                :label="$t('password')"
                type="password"
                :error-messages="pwErrors"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-card-actions
            class="mt-6 pa-0"
          >
            <v-btn
              variant="elevated"
              @click="showDeleteDialog = false"
            >
              {{$t('cancelDeleteButton')}}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              variant="elevated"
              :disabled="!oldPw"
              @click="deleteUser()"
              color="error"
              :loading="isDeleting"
            >
              {{$t('acceptDeleteButton')}}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Password dialog -->
    <v-dialog
      v-model="showPasswordDialog"
      persistent
      max-width="600"
    >
      <v-card
        tile
      >
        <v-card-text>
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('changePasswordHeadline')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="text-body-1 font-weight-bold"
            >
              <div
                v-html="$t('changePasswordBody')"
              >
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                dense
                outlined
                color="customGrey"
                background-color="#fff"
                v-model="oldPw"
                :label="$t('password')"
                type="password"
                :error-messages="pwErrors"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-toolbar
          class="mt-2 pa-3"
        >
          <v-btn
            variant="elevated"
            @click="showPasswordDialog = false"
          >
            {{$t('cancelButton')}}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            variant="elevated"
            :disabled="!oldPw"
            @click="saveUser()"
            color="customGrey"
          >
            {{$t('saveDataButton')}}
          </v-btn>
        </v-toolbar>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import FileUpload from '@/components/FileUpload.vue'

export default {
  name: 'UserEditor',

  components: {
    FileUpload
  },

  data: () => ({
    pwErrors: [],
    isDeleting: false,
    showPasswordDialog: undefined,
    oldPw: undefined,
    gender: undefined,
    residence: undefined,
    age: undefined,
    showDeleteDialog: false,
    selectedUser: undefined,
    isLoading: false,
    isValid: false,
    firstName: undefined,
    lastName: undefined,
    userName: undefined,
    email: undefined,
    pw: undefined,
    role: undefined,
    description: undefined,
    emailError: undefined,
    userNameError: undefined,
    pic: undefined
  }),

  async mounted () {
    await this.adapt()
    this.$refs.tabStart.focus()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('users', {
      patchUser: 'patch',
      createUser: 'create',
      requestUser: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    async patchFileRemove () {
      this.isLoading = true
      try {
        await this.patchUser([
          this.selectedUser._id,
          {
            pic: null
          }
        ])
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.isLoading = false
        this.adapt()
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.adapt()
      }
    },
    checkPassword () {
      if (this.pw) {
        this.showPasswordDialog = true
      } else {
        this.saveUser()
      }
    },
    async deleteUser () {
      this.isDeleting = true
      const map = {
        email: null,
        password: this.selectedUser._id,
        role: 'deleted',
        userName: this.selectedUser._id + ' (' + this.$t('deletedAccount') + ')',
        firstName: null,
        lastName: null,
        description: null,
        pic: null,
        isActive: false,
        isVerified: false,
        tmpRole: this.selectedUser.role,
        age: null,
        residence: null,
        gender: null,
        createdBy: null,
        status: 'deleted',
        tmpOldPassword: this.oldPw
      }
      if (this.selectedUser.pic) {
        map.tmpPicUrlToDelete = this.selectedUser.pic.url
      }
      try {
        await this.patchUser(
          [
            this.selectedUser._id,
            map
          ]
        )
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.isDeleting = false
        this.$router.push({ name: 'Participate' })
      } catch (e) {
        if (e.message === 'Wrong confirmation password') {
          this.pwErrors = [this.$t('changePasswordHeadline')]
        } else {
          this.pwErrors = [e.message]
        }
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isDeleting = false
      }
    },
    async adapt () {
      if (this.$route.params.user) {
        let selectedUser = this.getUser(this.$route.params.user)
        if (!selectedUser) {
          selectedUser = await this.requestUser([this.$route.params.user])
        }
        this.selectedUser = selectedUser
      }
      if (this.selectedUser) {
        this.pic = this.selectedUser.pic
        this.firstName = this.selectedUser.firstName
        this.lastName = this.selectedUser.lastName
        this.userName = this.selectedUser.userName
        this.email = this.selectedUser.email
        this.description = this.selectedUser.description
        this.role = this.selectedUser.role
        this.age = this.selectedUser.age
        this.gender = this.selectedUser.gender
        this.residence = this.selectedUser.residence
      }
    },
    async saveUser () {
      this.emailError = undefined
      this.userNameError = undefined
      this.isLoading = true
      // Do uploads
      try {
        await this.$refs.userPicUpload.upload()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      // Prepare map
      const map = {
        firstName: this.firstName,
        lastName: this.lastName,
        userName: this.userName,
        email: this.email,
        description: this.description,
        role: this.role,
        age: this.age,
        gender: this.gender,
        residence: this.residence
      }
      if (this.pic && this.pic.url && this.pic.credit) {
        map.pic = this.pic
      }
      if (this.pw && this.pw !== '') {
        map.password = this.pw
        map.tmpOldPassword = this.oldPw
      }
      if (!this.selectedUser) {
        map.password = 'XXXXXXXX'
      }
      try {
        if (this.selectedUser) {
          await this.patchUser([this.selectedUser._id, map])
        } else {
          map.createdBy = 'editor'
          await this.createUser([map, {}])
        }
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.showPasswordDialog = false
        this.$router.go(-1)
      } catch (e) {
        this.isLoading = false
        if (e.errors && e.errors.email) {
          this.emailError = [this.$t('emailExistsError')]
          this.showPasswordDialog = false
        } else if (e.errors && e.errors.userName) {
          this.showPasswordDialog = false
          this.userNameError = [this.$t('accountExistsError')]
        } else if (e.message === 'Wrong confirmation password') {
          this.pwErrors = [this.$t('changePasswordHeadline')]
        } else {
          this.showPasswordDialog = false
        }
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    }
  },

  computed: {
    ...mapGetters([
      'rules',
      's3',
      'roleItems'
    ]),
    ...mapGetters('auth', [
      'user'
    ]),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    pwRule () {
      return v => (!!v && v) === this.pw || this.$t('passwordsDoNotMatchError')
    },
    computedRoles () {
      const tmpRoleItems = JSON.parse(JSON.stringify(this.roleItems)).map(item => ({ title: this.$t(item.textKey), value: item.value }))
      if (this.user.role === 'admins' || this.user.role === 'hosts') {
        return tmpRoleItems
      } else {
        return tmpRoleItems.map(obj => {
          if (obj.value !== 'staffs' && obj.value !== 'exhibitors') {
            obj.disabled = true
          }
          return obj
        })
      }
    }
  },

  watch: {
    showPasswordDialog () {
      this.oldPw = undefined
    },
    email () {
      this.emailError = undefined
    },
    userName () {
      this.userNameError = undefined
    },
    '$route.params.user' () {
      this.adapt()
    },
    oldPw () {
      this.pwErrors = []
    }
  }
}
</script>
