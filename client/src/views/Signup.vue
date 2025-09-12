<template>
  <div>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card
          color="customGreyUltraLight"
          tile
        >
          <v-card-text>
            <v-row>
              <v-col
                class="text-h5 font-weight-bold"
              >
                {{$t('createProfileButton')}}
              </v-col>
            </v-row>
            <v-row
              v-if="!showThanks"
            >
              <v-col
                class="text-body-1"
              >
                <div
                  v-html="$t('registerBody')"
                >
                </div>
              </v-col>
            </v-row>
            <v-form
              v-if="!showThanks"
              v-model="isValid"
            >
              <v-row
                dense
                class="mt-10"
              >
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    bg-color="white"
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
                    bg-color="white"
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
                  sm="6"
                >
                  <v-text-field
                    bg-color="white"
                    density="compact"
                    v-model="userName"
                    :error-messages="userNameError"
                    :label="$t('userName')"
                    :rules="[rules.required, rules.noBlanks]"
                  >
                  </v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    bg-color="white"
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
              >
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    bg-color="white"
                    density="compact"
                    v-model="pw"
                    :label="$t('password')"
                    :rules="[rules.required, rules.password]"
                    :type="isPasswordVisible ? '' : 'password'"
                    :append-inner-icon="isPasswordVisible ? 'fas fa-eye': 'fas fa-eye-slash'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  >
                  </v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    bg-color="white"
                    density="compact"
                    :rules="[pwRule]"
                    v-model="pwRepitition"
                    :label="$t('repeatPassword')"
                    :type="isPasswordVisible ? '' : 'password'"
                    :append-inner-icon="isPasswordVisible ? 'fas fa-eye': 'fas fa-eye-slash'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col>
                  <v-checkbox
                    color="customGrey"
                    v-model="isPrivacyAgreed"
                    :rules="[v => v === true || $t('acceptPrivacyRule')]"
                  >
                    <template
                      v-slot:label
                    >
                      <div
                        @click.stop
                        v-html="$t('audienceCheckbox') + ' ' + $t('privacyCheckbox')"
                      >
                      </div>
                    </template>
                  </v-checkbox>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col>
                  <v-tooltip
                    color="customGrey"
                    right
                    :max-width="400"
                  >
                    <template v-slot:activator="{ props }">
                      <span
                        class="pointer"
                        v-bind="props"
                      >
                      <v-icon
                        color="customGrey"
                        class="ma-2 mt-0"
                      >
                        fa fa-question-circle
                      </v-icon>
                      <span class="text-body-1">
                      {{$t('audienceCheckBox')}}
                      </span>
                      </span>
                    </template>
                    <div
                      v-html="$t('audienceCheckBoxTooltip')"
                      class="pa-3"
                    >
                    </div>
                  </v-tooltip>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col
                  cols="12"
                  class="mt-3"
                >
                  <v-btn
                    block
                    large
                    :dark="isValid"
                    color="customGrey"
                    :loading="isLoading"
                    :disabled="!isValid"
                    @click="onSignup()"
                  >
                    {{$t('createProfileButton')}}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
            <v-row
              v-else
            >
              <v-col
                class="text-body-1"
              >
                {{$t('signupThanks')}}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapActions, mapMutations, mapGetters } from 'vuex'

export default {
  name: 'Signup',

  components: {
  },

  data: () => ({
    isPasswordVisible: false,
    isLoading: false,
    loginError: undefined,
    isValid: false,
    isPrivacyAgreed: false,
    firstName: undefined,
    lastName: undefined,
    userName: undefined,
    email: undefined,
    pw: undefined,
    pwRepitition: undefined,
    emailError: undefined,
    userNameError: undefined,
    showThanks: false
  }),

  mounted () {
  },

  methods: {
    ...mapActions('users', {
      createUser: 'create'
    }),
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    async onSignup () {
      this.emailError = undefined
      this.userNameError = undefined
      this.isLoading = true
      const map = {
        firstName: this.firstName,
        lastName: this.lastName,
        userName: this.userName,
        email: this.email,
        password: this.pw
      }
      try {
        await this.createUser([map, {}])
        this.loading = false
        this.showThanks = true
        this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
      } catch (e) {
        this.isLoading = false
        if (e.errors && e.errors.email) {
          this.emailError = [this.$t('emailExistsError')]
        } else if (e.errors && e.errors.userName) {
          this.userNameError = [this.$t('accountExistsError')]
        }
        this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
      }
    }
  },

  computed: {
    ...mapGetters([
      'rules'
    ]),
    pwRule () {
      return v => (!!v && v) === this.pw || this.$t('passwordsDoNotMatchError')
    }
  },

  watch: {
    email () {
      this.emailError = undefined
    },
    userName () {
      this.userNameError = undefined
    }
  }
}
</script>
