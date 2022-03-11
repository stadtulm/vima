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
          </v-card-title>
          <v-card-subtitle
            class="px-0"
            v-if="computedUser.description"
          >
            {{computedUser.description}}
          </v-card-subtitle>
          <v-row>
            <v-col
              v-if="computedUser.age !== undefined"
              cols="12"
            >
              {{$t('age')}}: {{ageItems[computedUser.age]}}
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
          </v-row>
          <v-row
            v-if="computedUser._id !== user._id"
          >
            <v-col>
              <v-btn
                dark
                color="customGrey"
                :to="{ name: 'UserNameChat', params: { id: computedUser._id, username: computedUser.userName } }"
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
  }),

  async mounted () {
  },

  methods: {
    ...mapActions('users', {
      requestUser: 'get'
    })
  },

  computed: {
    ...mapGetters([
      's3'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    })
  },

  asyncComputed: {
    async computedUser () {
      if (this.$route.name === 'User' && this.$route.params.user) {
        const tmpUser = await this.requestUser([this.$route.params.user])
        return tmpUser
      }
    },
    genderItems () {
      return {
        m: this.$t('male'),
        f: this.$t('female'),
        d: this.$t('diverse')
      }
    },
    ageItems () {
      return {
        0: '<21',
        1: '21-30',
        2: '31-40',
        3: '41-50',
        4: '51-60',
        5: '61-70',
        6: '>70'
      }
    }
  }
}
</script>
