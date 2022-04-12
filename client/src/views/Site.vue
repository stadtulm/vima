<template>
  <v-card
    color="customGreyUltraLight"
    v-if="computedSite"
  >
    <v-card-text>
      <v-row>
        <v-col
          class="word-wrap text-h5 font-weight-bold customGrey--text text-uppercase"
        >
          {{$t(computedSite.type === 'communicationrules' ? 'communicationRules' : computedSite.type)}}
        </v-col>
      </v-row>
      <v-row>
        <v-col
          class="body-1 customGrey--text"
          v-html="$sanitize(newTab(computedSite.text.value))"
        ></v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Site',

  components: {
  },

  data: () => ({
  }),

  async mounted () {
  },

  methods: {
    ...mapActions('sites', {
      fetchSites: 'find'
    })
  },

  computed: {
    ...mapGetters([
      's3',
      'newTab'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('sites', {
      findSites: 'get'
    })
  },

  asyncComputed: {
    async computedSite () {
      let selectedSite = this.findSites(
        {
          query: {
            type: this.$route.name.toLowerCase()
          }
        }
      )
      if (!selectedSite) {
        selectedSite = await this.fetchSites(
          {
            query: {
              type: this.$route.name.toLowerCase()
            }
          }
        )
        if (!selectedSite.data || !selectedSite.data[0]) {
          this.$router.push({ name: 'NotFound' })
          return
        }
        selectedSite = selectedSite.data[0]
      }
      return selectedSite
    }
  }
}
</script>
