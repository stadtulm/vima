<template>
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
            {{$t('emailConfirmation')}}
          </v-col>
        </v-row>
          <template
            v-if="!showThanks"
          >
            <template
              v-if="!showError"
            >
              <v-row>
                <v-col
                  class="text-body-1"
                  cols="12"
                >
                  <v-progress-circular
                    indeterminate
                    class="mr-3"
                    color="customGrey"
                  >
                  </v-progress-circular>
                  {{$t('emailConfirmationProgress')}}
                </v-col>
              </v-row>
            </template>
            <template
              v-else
            >
              <v-row>
                <v-col
                  cols="12"
                  class="text-body-1"
                >
                  {{showError}}
                </v-col>
              </v-row>
            </template>
          </template>
          <template
            v-else
          >
            <v-row>
              <v-col
                cols="12"
                class="text-body-1"
              >
                {{$t('emailConfirmationThanks')}}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn
                  dark
                  color="customGrey"
                  :to="{ name: 'Login' }"
                >
                  {{$t('login')}}
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

import { mapActions } from 'vuex'

export default {
  name: 'Verify',

  components: {
  },

  data: () => ({
    showThanks: false,
    showError: false
  }),

  async mounted () {
    setTimeout(async () => {
      try {
        const verifiedUser = await this.createAuth({
          action: 'verifySignupLong',
          value: this.$route.params.token
        })
        if (verifiedUser.createdBy === 'signup') {
          this.showThanks = true
        } else {
          const resetPwUser = await this.createAuth(
            {
              action: 'sendResetPwd',
              value: { email: verifiedUser.email },
              notifierOptions: { isInvitationProcess: true }
            }
          )
          this.$router.push({ name: 'Renew', params: { token: resetPwUser.tmpResetToken, isInvitationProcess: true } })
        }
      } catch (e) {
        this.showError = this.$t('emailConfirmationError')
      }
    }, 1000)
  },

  methods: {
    ...mapActions('authManagement', {
      createAuth: 'create'
    })
  },

  computed: {
  },

  watch: {
  }
}
</script>
