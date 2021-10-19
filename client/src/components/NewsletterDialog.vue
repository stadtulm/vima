<template>
  <div>
    <!-- Newsletter dialog -->
    <v-dialog
      max-width="600"
      persistent
      v-model="showNewsletterDialog"
      @click:outside="closeDialog()"
    >
      <v-card
        color="customGreyBg"
        tile
      >
        <v-card-text
          class="pa-8"
        >
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('receiveNewsletterLabel')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="body-1"
            >
              {{$t('newsletterBody')}}
            </v-col>
          </v-row>
          <v-row
            class="mb-4"
          >
            <v-col
              class="body-1 font-weight-bold"
            >
             {{$t('newsletterBodyUserInstructions')}}
            </v-col>
          </v-row>
          <v-form
            ref="subscribeForm"
            v-model="isValid"
            v-if="!user"
          >
            <v-row>
              <v-col>
                <v-text-field
                  v-model="newsletterEmail"
                  :label="$t('email')"
                  :rules="[rules.email, rules.required]"
                  color="customGrey"
                  :error-messages="emailError"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn
                  block
                  :dark="isValid"
                  color="customGrey"
                  :disabled="!isValid"
                  @click="saveSubscriber()"
                >
                  {{$t('receiveNewsletterLabel')}}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'NewsletterDialog',

  components: {
  },

  props: [
    'showNewsletterDialog'
  ],

  data: () => ({
    isValid: false,
    isLoading: false,
    newsletterEmail: undefined,
    emailError: undefined
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('subscribers', {
      createSubscriber: 'create'
    }),

    closeDialog () {
      this.newsletterEmail = ''
      this.emailError = undefined
      this.$emit('closeNewsletterDialog')
    },
    async saveSubscriber () {
      this.isLoading = true
      try {
        await this.createSubscriber([{ email: this.newsletterEmail }])
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
        this.newsletterEmail = ''
        this.emailError = undefined
        this.$emit('closeNewsletterDialog')
      } catch (e) {
        if (e.errors && e.errors.email) {
          this.emailError = [this.$t('subscriptionExistsError')]
        } else {
          this.emailError = e.message
        }
        this.isTagLoading = false
        if (e.code !== 409) {
          this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'rules'
    ]),
    ...mapGetters('auth', [
      'user'
    ])
  },

  watch: {
    newsletterEmail () {
      this.emailError = undefined
    }
  }
}
</script>
