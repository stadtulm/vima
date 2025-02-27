<template>
  <v-card
    color="customGreyUltraLight"
    v-if="computedUser"
  >
    <v-card-text>
      <v-row>
        <v-col>
          <v-img
            v-if="computedUser.pic"
            height="400"
            :src="s3 + computedUser.pic.url"
            :alt="$t('userPic')"
            :title="computedUser.pic.credit ? '© ' + computedUser.pic.credit : ''"
            contain
          ></v-img>
          <v-icon
            v-else
            size="400"
            color="white"
          >
            fas fa-user
          </v-icon>
        </v-col>
        <v-col>
          <v-card-title
            class="word-wrap px-0"
          >
            {{computedUser.userName}}
            <country-flag
              v-if="computedUser?.nationality"
              class="ml-1"
              :country="computedUser?.nationality === 'en' ? 'gb': computedUser?.nationality"
            ></country-flag>
          </v-card-title>
          <v-card-subtitle
            class="px-0"
            v-if="computedUser.description"
          >
            {{computedUser.description}}
          </v-card-subtitle>
          <v-row>
            <v-col
              v-if="computedUser.age !== undefined && computedUser.age !== null"
              cols="12"
            >
              {{$t('age')}}: {{ageItems[String(computedUser.age)]}}
            </v-col>
            <v-col
              v-if="computedUser.gender"
              cols="12"
            >
              {{$t('gender')}}: {{genderItems[computedUser.gender]}}
            </v-col>
            <v-col
              v-if="computedUser.residence"
              cols="12"
            >
              {{$t('residence')}}: {{computedUser.residence}}
            </v-col>
            <v-col
              v-if="computedUser.favoriteCategories?.length > 0"
              cols="12"
            >
              {{$t('favoriteCategories')}}: {{getCategories(computedUser.favoriteCategories).map(c => c.text.value).join(', ')}}
            </v-col>
          </v-row>
          <v-row
            v-if="computedUser._id !== user._id"
          >
            <v-col>
              <v-btn
                dark
                color="customGrey"
                :to="{ name: 'UserNameChat', params: { user: computedUser._id, username: computedUser.userName } }"
              >
                {{$t('goToChat')}}
                <v-icon
                  size="18"
                  class="ml-3"
                >
                  fas fa-comments
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'UserCard',

  data: () => ({
    computedUser: undefined,
    ageItems: {
      0: '<21',
      1: '21-30',
      2: '31-40',
      3: '41-50',
      4: '51-60',
      5: '61-70',
      6: '>70'
    }
  }),

  async mounted () {
    if (this.$route.name === 'User' && this.$route.params.user) {
      await this.loadUser()
    }
  },

  methods: {
    ...mapActions('users', {
      requestUser: 'get'
    }),
    async loadUser () {
      this.computedUser = await this.requestUser([this.$route.params.user])
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'getCategories'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    genderItems () {
      return {
        m: this.$t('male'),
        f: this.$t('female'),
        d: this.$t('diverse')
      }
    }
  }
}
</script>
