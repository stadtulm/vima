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
                  class="body-1"
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
                  class="body-1"
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
                class="body-1"
              >
                {{$t('subscriptionConfirmationThanks')}}
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
  name: 'Confirm',

  components: {
  },

  data: () => ({
    showThanks: false,
    showError: false
  }),

  async mounted () {
    setTimeout(async () => {
      try {
        await this.patchSubscriber(
          [
            this.$route.params.id,
            {
              tmpAction: 'confirmSignup',
              tmpValue: this.$route.params.token
            }
          ]
        )
        this.showThanks = true
      } catch (e) {
        this.showError = e.message
      }
    }, 1000)
  },

  methods: {
    ...mapActions('subscribers', {
      patchSubscriber: 'patch'
    })
  },

  computed: {
  },

  watch: {
  }
}
</script>
