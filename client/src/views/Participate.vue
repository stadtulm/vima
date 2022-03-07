<template>
  <div>
    <v-row>
      <v-col
        class="text-h5 font-weight-bold customGrey--text"
      >
        <span
          class="text-uppercase"
          :class="isPreview ? 'pointer' : ''"
          @click="$router.push({ name: 'Participate' })"
          tour-step="1"
        >
          {{$t('participate')}}
        </span>
        <v-btn
          v-if="isPreview"
          icon
          color="customGrey"
          class="mb-1 ml-1"
          @click="$router.push({ name: 'Participate' })"
        >
          <v-icon>
            fas fa-arrow-right
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          height="100%"
          color="customCyanBg"
          :to="{ name: 'CategoryList', params: { type: 'ads' } }"
        >
          <v-container
            fluid
            class="fill-height"
          >
            <v-row
              class="align-self-start"
            >
              <v-img
                src="/pics/ads.jpg"
                height="200px"
                :alt="$t('adsSectionPic')"
                title="© ILEU e.V."
                tour-step-container="3"
              ></v-img>
              <v-col
                class="px-0 pb-0"
              >
                <v-card-title
                  v-html="$t('adsTitle')"
                  class="word-wrap"
                >
                </v-card-title>
              </v-col>
              <v-col
                class="pb-0 shrink right-text align-self-center"
              >
                <v-btn
                  class="customCyan--text"
                  :to="{ name: 'CategoryList', params: { type: 'ads' } }"
                  tour-step="3"
                >
                  {{$t('viewButton')}}
                  <v-icon
                    class="ml-3"
                    size="18"
                    color="customCyan"
                  >
                    fas fa-arrow-right
                  </v-icon>
                </v-btn>
              </v-col>
              <v-col
                cols="12"
                class="pb-4 px-4 body-1 black--text"
              >
                {{$t('adsBody')}}
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          height="100%"
          color="customPurpleBg"
          :to="{ name: 'Groups' }"
        >
          <v-container
            fluid
            class="fill-height"
          >
            <v-row
              class="align-self-start"
            >
              <v-img
                src="/pics/groups.jpg"
                height="200px"
                :alt="$t('groupsSectionPic')"
                title="© ILEU e.V."
              ></v-img>
              <v-col
                class="px-0 pb-0"
              >
                <v-card-title
                  v-html="$t('groupsTitle')"
                  class="word-wrap"
                >
                </v-card-title>
              </v-col>
              <v-col
                class="pb-0 shrink right-text align-self-center"
              >
                <v-btn
                  class="customPurple--text"
                  :to="{ name: 'Groups' }"
                >
                  {{$t('viewButton')}}
                  <v-icon
                    class="ml-3"
                    size="18"
                    color="customPurple"
                  >
                    fas fa-arrow-right
                  </v-icon>
                </v-btn>
              </v-col>
              <v-col
                cols="12"
                class="pb-4 px-4 body-1 black--text"
              >
                {{$t('groupsBody')}}
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          height="100%"
          color="customTealBg"
          :to="{ name: 'Discussions' }"
        >
          <v-container
            fluid
            class="fill-height"
          >
            <v-row
              class="align-self-start"
            >
              <v-img
                src="/pics/discussions.jpg"
                height="200px"
                :alt="$t('discussionsSectionPic')"
                title="© ILEU e.V."
              ></v-img>
              <v-col
                class="px-0 pb-0"
              >
                <v-card-title
                  v-html="$t('discussionsTitle')"
                  class="word-wrap"
                >
                </v-card-title>
              </v-col>
              <v-col
                class="pb-0 shrink right-text align-self-center"
              >
                <v-btn
                  class="customTeal--text"
                  :to="{ name: 'Discussions' }"
                >
                  {{$t('viewButton')}}
                  <v-icon
                    class="ml-3"
                    size="18"
                    color="customTeal"
                  >
                    fas fa-arrow-right
                  </v-icon>
                </v-btn>
              </v-col>
              <v-col
                cols="12"
                class="pb-4 px-4 body-1 black--text"
              >
                {{$t('discussionsBody')}}
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <!-- -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          height="100%"
          color="customGreyBg"
          :to="{ name: 'News' }"
        >
          <v-container
            fluid
            class="fill-height"
          >
            <v-row
              class="align-self-start"
            >
              <v-img
                src="/pics/news.jpg"
                height="200px"
                width="100%"
                :alt="$t('newsSectionPic')"
                title="© ILEU e.V."
              ></v-img>
              <v-col
                class="px-0 pb-0"
              >
                <v-card-title
                  v-html="$t('newsTitle')"
                  class="word-wrap"
                >
                </v-card-title>
              </v-col>
              <v-col
                class="pb-0 shrink right-text align-self-center"
              >
                <v-btn
                  class="customGrey--text"
                  :to="{ name: 'News' }"
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
              </v-col>
              <v-col
                cols="12"
                class="pb-t px-4 body-1 black--text"
              >
                {{$t('newsBody')}}
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          height="100%"
          color="customGreyBg"
          :to="{ name: 'Events' }"
        >
          <v-container
            fluid
            class="fill-height"
          >
            <v-row
              class="align-self-start"
            >
              <v-img
                src="/pics/events.jpg"
                height="200px"
                width="100%"
                :alt="$t('eventsSectionPic')"
                title="© ILEU e.V."
              ></v-img>
              <v-col
                class="px-0 pb-0"
              >
                <v-card-title
                  class="word-wrap"
                  v-html="$t('calendarTitle')"
                >
                </v-card-title>
              </v-col>
              <v-col
                class="pb-0 shrink right-text align-self-center"
              >
                <v-btn
                  class="customGrey--text"
                  :to="{ name: 'Events' }"
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
              </v-col>
              <v-col
                cols="12"
                class="pt-0 px-4 body-1 black--text"
              >
                {{$t('calendarBody')}}
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          height="100%"
          color="customGreyBg"
          :to="{ name: 'Organisations' }"
        >
          <v-container
            fluid
            class="fill-height"
          >
            <v-row
              class="align-self-start"
            >
              <v-img
                src="/pics/partners.jpg"
                height="200px"
                width="100%"
                :alt="$t('partnersSectionPic')"
                title="© ILEU e.V."
              ></v-img>
              <v-col
                class="px-0 pb-0"
              >
                <v-card-title
                  class="word-wrap"
                  v-html="$t('partnersTitle')"
                >
                </v-card-title>
              </v-col>
              <v-col
                class="pb-0 shrink right-text align-self-center"
              >
                <v-btn
                  class="customGrey--text"
                  :to="{ name: 'Organisations' }"
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
              </v-col>
              <v-col
                cols="12"
                class="pt-0 px-4 body-1 black--text"
              >
                {{$t('partnersBody')}}
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

export default {
  name: 'Home',

  components: {
  },

  props: [
    'isPreview'
  ],

  data: () => ({
  }),

  mounted () {
  },

  methods: {
  },

  computed: {
  }
}
</script>
