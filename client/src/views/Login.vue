<template>
  <div>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card
          color="customGreyBg"
          tile
        >
          <v-card-text>
            <v-row>
              <v-col
                class="text-h5 font-weight-bold"
              >
                {{$t('loginButton')}}
              </v-col>
            </v-row>
            <v-row
              v-if="$route.query.redirect"
            >
              <v-col
                class="body-1"
              >
                {{$t('redirect403')}}
              </v-col>
            </v-row>
            <v-row
              class="mt-6"
            >
              <v-col
                cols="12"
              >
                <v-text-field
                  dense
                  outlined
                  background-color="#fff"
                  color="customGrey"
                  :error-messages="loginError"
                  :label="$t('email')"
                  v-model="email"
                  @keydown.enter="email && pw ? onLogin() : ''"
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
                  dense
                  outlined
                  background-color="#fff"
                  color="customGrey"
                  :type="isPasswordVisible ? '' : 'password'"
                  :append-icon="isPasswordVisible ? 'fas fa-eye': 'fas fa-eye-slash'"
                  @click:append="isPasswordVisible = !isPasswordVisible"
                  :label="$t('password')"
                  v-model="pw"
                  @keydown.enter="email && pw ? onLogin(): ''"
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
                <v-btn
                  block
                  dark
                  large
                  color="customGrey"
                  :loading="loading"
                  @click="onLogin()"
                >
                  {{$t('loginButton')}}
                </v-btn>
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
  name: 'Login',

  components: {
  },

  data: () => ({
    loading: false,
    loginError: undefined,
    email: undefined,
    pw: undefined,
    isPasswordVisible: false
  }),

  mounted () {
  },

  methods: {
    ...mapMutations({
      setFirstLoad: 'SET_FIRST_LOAD'
    }),
    ...mapActions('auth', {
      authenticate: 'authenticate'
    }),
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    async onLogin () {
      this.loading = true
      try {
        await this.authenticate({ strategy: 'local', email: this.email, password: this.pw })
        await this.findStatusContainers(
          {
            query: {
              user: this.user._id
            }
          }
        )
        if (this.$matomo) {
          this.$matomo.setUserId(this.user._id)
          this.$matomo.setCustomVariable(1, 'Rolle', this.user.role, 'visit')
        }
        this.loading = false
        this.setFirstLoad(true)
        if (this.$route.query.redirect) {
          this.$router.push(this.$route.query.redirect)
        } else {
          this.$router.push({ name: 'Participate' })
        }
      } catch (e) {
        if (e.code === 404) {
          this.loginError = e.message
        } else {
          this.loginError = this.$t('loginFailedError')
        }
        this.loading = false
      }
    }
  },

  computed: {
    ...mapGetters('auth', {
      user: 'user'
    })
  }
}
</script>
