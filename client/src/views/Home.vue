<template>
  <div>
    <v-dialog
      :value="true"
      fullscreen
      no-click-animation
      persistent
      :transition="false"
    >
      <div style="position:fixed">
      <v-row
        no-gutters
      >
        <v-col
          v-for="(i, j) in computedPics"
          :key="j"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <v-img
            :src="'/pics/people/' + i + '.jpeg'"
            :alt="$t('welcomePic')"
            title="© ILEU e.V."
          >
          </v-img>
        </v-col>
      </v-row>
      </div>
      <v-container
          fluid
        >
          <v-row>
            <v-col
              cols="12"
              sm="6"
              md="5"
            >
              <v-card
                class="fill-height"
                tile
                flat
                color="rgba(255,255,255,0.94)"
              >
                <v-card-text>
                  <v-row>
                    <v-col>
                      <v-row>
                        <v-col
                          cols="12"
                          class="text-h4 font-weight-bold mt-4 customGrey--text"
                        >
                          {{$t('welcomeHeadline')}}
                          <img
                            src="/pics/logo.svg"
                            height="35px"
                            style="margin-bottom: -1px"
                            alt="Vima Logo"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          class="title customGrey--text font-weight-bold"
                        >
                          Virtuell.Mitmachen.Aktiv! in Ulm
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row
                    class="align-self-end"
                  >
                    <v-col>
                      <v-row>
                        <v-col
                          class="subtitle-1 customGrey--text"
                        >
                          <p>
                            <span class="pointer font-weight-bold" @click="$router.push({ name: 'Vima' })">ViMA</span> ist eine offene, multifunktionale online-Plattform, die zum digitalen Treffpunkt Ulmer Bürger*innen werden soll.
                          </p>
                          <p>
                            ViMA ist ein gemeinsames Projekt von  <span class="pointer font-weight-bold" @click="$router.push({ name: 'Ileu' })">ILEU e.V.</span> und der Geschäftsstelle Digitale Agenda der Stadt Ulm mit Unterstützung von  <span class="pointer font-weight-bold" @click="$router.push({ name: 'Vives' })">VIVES@BW</span>.
                          </p>
                          <p>
                            ViMA befindet sich in der Aufbauphase. Wir laden Sie ein, bei ViMA mitzumachen und uns Rückmeldung zu geben, wenn etwas noch nicht klappen sollte.
                          </p>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col
                          cols="12"
                        >
                          <v-btn
                            color="customGrey"
                            dark
                            large
                            class="mr-3"
                            :to="{name: 'Participate'}"
                          >
                            {{$t('tourButton')}}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-btn
                            color="customGrey"
                            dark
                            text
                            class="mr-1 px-1"
                            :to="{name: 'Signup'}"
                          >
                            {{$t('createProfileButton')}}
                          </v-btn>
                          /
                          <v-btn
                            color="customGrey"
                            dark
                            text
                            class="px-1"
                            :to="{name: 'Login'}"
                          >
                            {{$t('loginButton')}}
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
    </v-dialog>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'Home',

  components: {
  },

  data: () => ({
  }),

  mounted () {
  },

  methods: {
    shuffle () {
      const array = []
      for (let i = 0; i < 10; ++i) {
        array[i] = i + 1
      }
      let tmp
      let current
      let top = array.length
      if (top) {
        while (--top) {
          current = Math.floor(Math.random() * (top + 1))
          tmp = array[current]
          array[current] = array[top]
          array[top] = tmp
        }
      }
      return array
    },
    arrayHasConsecitiveRepetition (arrayIn) {
      return arrayIn.every(function (element, index) {
        return !index || element !== arrayIn[index - 1]
      })
    }
  },

  computed: {
    ...mapGetters([
      'currentLanguage'
    ]),
    computedPics () {
      const picSet = this.shuffle()
      let pics = []
      for (let i = 0; i < 10; ++i) {
        pics = pics.concat(picSet)
      }
      return pics
    }
  }
}
</script>
