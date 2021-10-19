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
        <v-row>
          <v-col
            class="text-h5 font-weight-bold"
          >
            {{$t('unsubscribe')}}
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
                  {{$t('unsubsribeProgress')}}
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
                {{$t('unsubscribeThanks')}}
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
  name: 'Unsubscribe',

  components: {
  },

  data: () => ({
    showThanks: false,
    showError: false
  }),

  async mounted () {
    setTimeout(async () => {
      try {
        await this.removeFromNewletter(this.$route.params.id)
        this.showThanks = true
      } catch (e) {
        this.showError = e.message
      }
    }, 1000)
  },

  methods: {
    ...mapActions('newsletter', {
      removeFromNewletter: 'remove'
    })
  },

  computed: {
  },

  watch: {
  }
}
</script>
