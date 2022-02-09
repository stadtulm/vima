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
            <template
              v-if="!showThanks"
            >
            <v-row>
              <v-col
                class="text-h5 font-weight-bold"
              >
                {{$t('resendVerify')}}
              </v-col>
            </v-row>
            <v-row>
              <v-col
                class="body-1"
                v-html="$t('resendVerifyBody')"
              >
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-alert
                  outlined
                  color="customGrey"
                >
                  {{$t('resendVerifyHint')}}
                </v-alert>
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
                  :label="$t('email')"
                  v-model="email"
                  :error-messages="emailError"
                  @keydown.enter="email && pw ? resendInvitation() : ''"
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
                  :loading="isSending"
                  :disabled="emailError"
                  @click="resendInvitation()"
                >
                  {{$t('sendButton')}}
                </v-btn>
              </v-col>
            </v-row>
            </template>
            <template
              v-else
            >
              <v-row>
                <v-col
                  class="text-h5 font-weight-bold"
                >
                  {{$t('resendVerify')}}
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  class="body-1"
                >
                  {{$t('resendVerifyThanks')}}
                </v-col>
              </v-row>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapActions, mapMutations, mapGetters } from 'vuex'

export default {
  name: 'ResendVerify',

  components: {
  },

  data: () => ({
    isSending: false,
    email: undefined,
    showThanks: false,
    emailError: undefined
  }),

  mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('authManagement', {
      createAuth: 'create'
    }),
    async resendInvitation () {
      this.isSending = true
      try {
        await this.createAuth({
          action: 'resendVerifySignup',
          value: { email: this.email }
        })
        this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
        this.isSending = false
        this.showThanks = true
      } catch (e) {
        if (e.errors.$className === 'badParams') {
          this.emailError = [this.$t('errorInvalidEmail')]
        } else if (e.errors.$className === 'isNotVerified') {
          this.emailError = [this.$t('errorAlreadyVerified')]
        }
        this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
        this.isSending = false
      }
    }
  },

  computed: {
    ...mapGetters('auth', {
      user: 'user'
    })
  },

  watch: {
    email () {
      this.emailError = undefined
    }
  }
}
</script>
