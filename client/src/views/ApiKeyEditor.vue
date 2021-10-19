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
            class="mb-3"
          >
            <v-col
              class="text-h5 font-weight-bold text-uppercase"
            >
              {{$t('apiKey')}}
            </v-col>
          </v-row>
          <v-row
          >
            <v-col>
              <v-alert
                outlined
                color="customGRey"
                icon="fas fa-info-circle"
              >
                Der API-Schlüssel kann als Header oder Query-Parameter mit dem Namen 'x-access-token' übermittelt werden. Der Wert muss aus Client-Id und Client-Secret bestehen, die mit einem Komma getrennt sind.
                <br><br>
                Beispiel-Header: x-access-token:clientId,clientSecret<br>
                Beispiel-Query: [url]?x-access-token=clientId,clientSecret
              </v-alert>
            </v-col>
          </v-row>
          <v-row
            v-if="selectedApiKey || clientSecret"
          >
            <v-col
              class="title"
            >
              Client-Id: {{$route.params.organisation}}
            </v-col>
          </v-row>
          <v-row
            v-if="clientSecret"
          >
            <v-col
              class="title pt-0"
            >
              Client-Secret: {{clientSecret}}
            </v-col>
          </v-row>
          <v-row
            v-if="selectedApiKey && !clientSecret"
          >
            <v-col>
              <v-alert
                dark
                color="error"
                icon="fas fa-exclamation-triangle"
              >
                Der existierende API-Schluessel Ihrer Organisation wird bei der Generierung eines neuen Schlüssels gelöscht und kann nicht weiter verwendet werden!
              </v-alert>
            </v-col>
          </v-row>
          <v-row
            v-if="clientSecret"
          >
            <v-col>
              <v-alert
                dark
                color="warning"
                icon="fas fa-exclamation-triangle"
              >
                Das Client-Secret wird nur jetzt einmalig angezeigt. Bitte verwahren Sie den Schlüssel an einem sicheren Ort.
              </v-alert>
            </v-col>
          </v-row>
          <v-divider
            class="my-9 mb-6"
          ></v-divider>
          <v-card-actions
            class="px-0"
          >
            <v-btn
              block
              large
              dark
              color="customGrey"
              :loading="isLoading"
              @click="generateApiKey()"
            >
              {{$t('getApiKey')}}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'ApiKeyEditor',

  data: () => ({
    selectedApiKey: undefined,
    isLoading: false,
    isValid: false,
    clientSecret: undefined
  }),

  async mounted () {
    await this.adapt()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapMutations('apikeys', {
      removeApiKey: 'removeItem'
    }),
    ...mapActions('apikeys', {
      createApiKey: 'create',
      fetchApiKeys: 'find'
    }),
    async adapt () {
      let selectedApiKey = this.findApiKeys({
        query: {
          clientId: this.$route.params.organisation
        }
      })
      if (selectedApiKey.data && selectedApiKey.data.length === 1) {
        selectedApiKey = selectedApiKey.data[0]
      } else {
        try {
          selectedApiKey = await this.fetchApiKeys(
            {
              query: {
                clientId: this.$route.params.organisation
              }
            }
          )
        } catch (e) {
          if (e.code === 403) {
            this.$router.push({ name: 'Forbidden' })
          }
        }
        if (selectedApiKey.data.length === 1) {
          selectedApiKey = selectedApiKey.data[0]
        } else {
          selectedApiKey = undefined
        }
      }
      this.selectedApiKey = selectedApiKey
    },
    async generateApiKey () {
      this.isLoading = true
      try {
        const apiKey = await this.createApiKey([{
          clientId: this.$route.params.organisation
        }, {}])
        this.clientSecret = apiKey.clientSecret
        await this.removeApiKey(apiKey)
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    }
  },

  computed: {
    ...mapGetters([
      'rules',
      's3'
    ]),
    ...mapGetters('auth', [
      'user'
    ]),
    ...mapGetters('apikeys', {
      findApiKeys: 'find'
    })
  }
}
</script>

<style scoped>
.min-width {
  min-width: 320px;
}
</style>
