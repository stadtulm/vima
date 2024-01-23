<template>
  <v-card
    color="customGreyUltraLight"
    v-if="organisation"
    height="100%"
  >
    <v-container
      class="fill-height pa-0 pb-3"
      fluid
    >
      <v-row
        class="align-self-start"
        style="width: 100%"
      >
        <v-col
          cols="12"
        >
          <!-- Img -->
          <v-sheet
            class="pa-4"
          >
          <v-img
            v-if="organisation.pic"
            :height="organisationProp ? 250 : 350"
            :src="s3 + organisation.pic.url"
            :alt="$t('organisationPic')"
            :title="organisation.pic.credit ? '© ' + organisation.pic.credit : ''"
            contain
            style="background-color: #fff"
          ></v-img>
          </v-sheet>
          <!-- Title -->
          <v-row
            class="ma-1"
          >
            <v-col
              cols="12"
              class="text-h6 font-weight-bold"
            >
            {{organisation.name}}
            </v-col>
          </v-row>
          <!-- Description -->
          <v-row
            v-if="organisation.description"
            class="ma-1"
          >
            <v-col
              cols="12"
              class="pt-0 text-body-1"
            >
              <div
                v-html="organisationProp ? truncatedDescription(newTab(organisation.description)) : $sanitize(newTab(organisation.description))"
              >
              </div>
            </v-col>
          </v-row>
          <!-- Website -->
          <v-row
            v-if="organisation.website"
            class="ma-1"
          >
            <v-col
              class="py-0 text-body-1"
            >
              {{$t('website')}}: <a :href="organisation.website">{{organisation.website}}</a>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <!-- Show more button -->
      <v-row
        class="align-self-end"
        v-if="organisationProp"
      >
        <v-col
          cols="12"
        >
          <v-card-actions
            class="px-4"
          >
            <v-btn
              variant="elevated"
              block
              class="text-customGrey"
              :to="{ name: 'Organisation', params: { organisation: organisation._id }}"
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
    organisation: undefined
  }),

  async mounted () {
    await this.loadOrganisation()
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
    },
    async loadOrganisation () {
      if (this.organisationProp) {
        this.organisation = this.organisationProp
      } else {
        if (this.$route.name === 'Organisation' && this.$route.params.organisation && !this.organisationProp) {
          let selectedOrganisation = this.getOrganisation(this.$route.params.organisation)
          if (!selectedOrganisation) {
            selectedOrganisation = await this.requestOrganisation([
              this.$route.params.organisation
            ])
          }
          this.organisation = selectedOrganisation
        }
      }
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
  }
}
</script>
