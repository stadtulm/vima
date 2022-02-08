<template>
      <v-row>
      <v-col
        cols="12"
      >
      <v-card
        color="customGreyBg"
        tile
      >
        <v-card-text>
          <v-row
            class="my-6"
          >
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('setNewPassword')}}
            </v-col>
          </v-row>
            <v-form
              v-if="!showThanks"
              v-model="isValid"
            >
            <v-row
              dense
            >
              <v-col
                cols="12"
              >
                <v-text-field
                  dense
                  outlined
                  color="customGrey"
                  background-color="#fff"
                  type="password"
                  v-model="pw"
                  :label="$t('password')"
                  :error-messages="pwError"
                  :rules="[rules.required, rules.password]"
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
                  color="customGrey"
                  background-color="#fff"
                  type="password"
                  :rules="[pwRule]"
                  v-model="pwRepitition"
                  :label="$t('repeatPassword')"
                >
                </v-text-field>
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
                  :outlined="!isValid"
                  :loading="isLoading"
                  :disabled="!isValid"
                  @click="onRenew()"
                >
                  {{$t('reset')}}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
          <template
            v-else
          >
            <v-row>
              <v-col
                class="body-1"
                cols="12"
              >
                {{$t('renewThanks')}}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn
                  dark
                  large
                  color="customGrey"
                  :to="{ name: 'Login'}"
                >
                  {{$t('goToLogin')}}
                </v-btn>
              </v-col>
            </v-row>
          </template>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Renew',

  components: {
  },

  data: () => ({
    isLoading: false,
    isValid: false,
    pw: undefined,
    pwRepitition: undefined,
    showThanks: false,
    pwError: undefined
  }),

  mounted () {
  },

  methods: {
    ...mapActions('authManagement', {
      createAuth: 'create'
    }),
    async onRenew () {
      this.isLoading = true
      try {
        await this.createAuth({
          action: 'resetPwdLong',
          value: { token: this.$route.params.token, password: this.pw },
          notifierOptions: {
            isInvitationProcess: this.$route.params.isInvitationProcess
          }
        })
        this.isLoading = false
        this.showThanks = true
      } catch (e) {
        this.isLoading = false
        this.pwError = e.message
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
    pw () {
      this.pwError = undefined
    }
  }
}
</script>
