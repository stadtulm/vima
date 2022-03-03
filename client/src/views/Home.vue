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
                          {{$t('sloganUlm')}}
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
                            <span class="pointer font-weight-bold" @click="$router.push({ name: 'Vima' })">{{$t('vima')}}</span>{{$t('homeWelcome1')}}
                          </p>
                          <p>
                            {{$t('homeWelcome2')}}<span class="pointer font-weight-bold" @click="$router.push({ name: 'Ileu' })">{{$t('ileu')}}</span>{{$t('homeWelcome3')}}<span class="pointer font-weight-bold" @click="$router.push({ name: 'Vives' })">{{$t('vives')}}</span>.
                          </p>
                          <p>
                            {{$t('homeWelcome4')}}
                          </p>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <v-btn
                            color="customGrey"
                            dark
                            large
                            class="mr-3 mb-3"
                            :to="{name: 'Participate'}"
                          >
                            {{$t('tourButton')}}
                          </v-btn>
                          <v-btn
                            color="customGrey"
                            dark
                            large
                            class="mr-3 mb-3"
                            target="_blank"
                            href="https://youtu.be/eaCl-0GBje0"
                          >
                            {{$t('introductionVideo')}}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col
                          cols="12"
                        >
                          <v-sheet
                            color="yellow"
                            class="pa-5"
                          >
                            <v-btn
                              color="blue"
                              dark
                              x-large
                              block
                              class="mr-3"
                              :to="{ name: 'Group', params: { group: '622094013b8ba8046b7ab23c' } }"
                            >
                              Hilfe für Ukraine
                            </v-btn>
                          </v-sheet>
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
                            {{$t('login')}}
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
