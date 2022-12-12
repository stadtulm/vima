<template>
  <v-card
    color="customGreyUltraLight"
    v-if="computedOrganisation"
    height="100%"
    :to="organisationProp ? { name: 'Organisation', params: { organisation: computedOrganisation._id }} : ''"
  >
    <v-container
      fluid
      class="fill-height"
    >
      <v-row
        class="align-self-start"
      >
        <v-col
          :class="organisationProp ? 'pa-0' : ''"
        >
          <v-row>
            <v-col
              cols="12"
              sm="12"
              :md="organisationProp ? 12 : 6"
              :order="2"
              :order-md="organisationProp ? 2 : 1"
            >
              <!-- Title -->
              <v-card-title
                class="word-wrap"
              >
                {{computedOrganisation.name}}
              </v-card-title>
              <v-card-text
                v-if="
                  !organisationProp &&
                  (
                    computedOrganisation.description || computedOrganisation.website
                  )
                "
              >
                <!-- Description -->
                <v-row
                  v-if="computedOrganisation.description"
                >
                  <v-col
                    class="body-1"
                    v-html="organisationProp ? truncatedDescription(newTab(computedOrganisation.description)) : $sanitize(newTab(computedOrganisation.description))"
                  ></v-col>
                </v-row>
                <!-- Website -->
                <v-row
                  v-if="computedOrganisation.website"
                >
                  <v-col
                    class="body-1"
                  >
                    {{$t('website')}}: <a :href="computedOrganisation.website">{{computedOrganisation.website}}</a>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-col>
            <!-- Carousel -->
            <v-col
              cols="12"
              sm="12"
              :md="organisationProp ? 12 : 6"
              :class="organisationProp ? 'py-0': ''"
              :order="1"
              :order-md="organisationProp ? 1 : 2"
            >
              <v-card-text
                :class="organisationProp ? 'pa-0' : ''"
              >
                <v-img
                  v-if="computedOrganisation.pic"
                  :height="organisationProp ? 300 : 500"
                  :src="s3 + computedOrganisation.pic.url"
                  :alt="$t('organisationPic')"
                  :title="computedOrganisation.pic.credit ? '© ' + computedOrganisation.pic.credit : ''"
                  contain
                ></v-img>
              </v-card-text>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <!-- View more button -->
      <v-row
        class="align-self-end"
      >
        <v-col>
          <v-card-actions
            class="mx-2 pb-4 grow"
            v-if="organisationProp"
          >
            <v-btn
              large
              block
              class="customGrey--text"
              :to="{ name: 'Organisation', params: { organisation: computedOrganisation._id }}"
            >
              {{$t('viewButton')}}
              <v-icon
                class="ml-3"
                size="18"
                color="customGrey"
              >
                fas fa-arrow-right
              </v-icon>
            </v-btn>
          </v-card-actions>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>

import { mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  name: 'OrganisationCard',

  components: {
  },

  props: [
    'organisationProp'
  ],

  data: () => ({
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('organisations', {
      requestOrganisation: 'get'
    }),
    truncatedDescription (text) {
      const len = 200
      text = this.$sanitize(text)
      text = text.replaceAll('<p>', '')
      text = text.replaceAll('</p>', '&nbsp;')
      const div = document.createElement('div')
      div.innerHTML = text
      let tmpStr = div.innerText
      if (tmpStr && tmpStr.length > len) {
        tmpStr = tmpStr.substr(0, len) + ' [...]'
      }
      return tmpStr
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'newTab'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('organisations', {
      getOrganisation: 'get'
    })
  },

  asyncComputed: {
    async computedOrganisation () {
      if (this.organisationProp) {
        return this.organisationProp
      } else {
        if (this.$route.name === 'Organisation' && this.$route.params.organisation && !this.organisationProp) {
          let selectedOrganisation = this.getOrganisation(this.$route.params.organisation)
          if (!selectedOrganisation) {
            selectedOrganisation = await this.requestOrganisation([this.$route.params.organisation])
          }
          return selectedOrganisation
        }
      }
    }
  }
}
</script>
