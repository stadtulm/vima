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
              {{$t('forgotPassword')}}
            </v-col>
          </v-row>
          <template
            v-if="!showThanks"
          >
            <v-row>
              <v-col
                class="text-body-1"
              >
                {{$t('forgotPasswordBody')}}
              </v-col>
            </v-row>
            <v-form
              v-model="isValid"
            >
              <v-row
                class="mt-6"
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    density="compact"
                    bg-color="white"
                    v-model="email"
                    :error-messages="emailError"
                    :label="$t('email')"
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
                  <v-btn
                    block
                    large
                    :dark="isValid"
                    color="customGrey"
                    :loading="isLoading"
                    :disabled="!isValid"
                    @click="onReset()"
                  >
                    {{$t('reset')}}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </template>
          <v-row
            v-else
          >
            <v-col
              cols="12"
              class="text-body-1"
            >
              <div
                v-html="$t('resetPasswordThanks')"
              >
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Reset',

  components: {
  },

  data: () => ({
    isLoading: false,
    isValid: false,
    email: undefined,
    emailError: undefined,
    showThanks: false
  }),

  mounted () {
  },

  methods: {
    ...mapActions('authManagement', {
      createAuth: 'create'
    }),
    async onReset () {
      this.isLoading = true
      this.$nextTick(async () => {
        this.emailError = undefined
        try {
          await this.createAuth({
            action: 'sendResetPwd',
            value: { email: this.email }
          })
          this.showThanks = true
          this.isLoading = false
        } catch (e) {
          if (e.className === 'bad-request') {
            this.resetError = this.$t('emailDoesNotExistError')
          } else {
            this.emailError = e.message
          }
          this.isLoading = false
        }
      })
    }
  },

  computed: {
    ...mapGetters([
      'rules'
    ])
  },

  watch: {
    email () {
      this.emailError = undefined
    }
  }
}
</script>
