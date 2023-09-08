<template>
  <v-card
    color="customGreyUltraLight"
    v-if="event"
    :to="eventProp ? { name: 'Event', params: { event: event._id } } : ''"
  >
    <v-row>
      <v-col
        cols="12"
        sm="12"
        :md="eventProp ? 12 : 8"
        :order="2"
        :order-md="eventProp ? 2 : 1"
      >
        <v-row>
          <v-col>
            <!-- Title -->
            <v-card-title
              class="word-wrap mb-3"
            >
              {{event.title.value}}
            </v-card-title>
            <v-card-subtitle
              class="text-body-1 pb-0"
              v-if="event.location"
            >
              {{event.location}}
            </v-card-subtitle>
            <v-card-subtitle
              class="text-body-1"
            >
              {{computedDateTime}}
            </v-card-subtitle>
          </v-col>
          <v-col
            v-if="eventProp"
            class="shrink align-self-center"
            :class="$vuetify.display.smAndUp ? 'text-right' : ''"
            cols="12"
            sm="6"
          >
            <!-- View more button -->
            <v-btn
              class="text-customGrey mx-4"
              :to="{ name: 'Event', params: { event: event._id }}"
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
        </v-row>
        <!-- Categories -->
        <v-row
          dense
          class="mx-1"
          v-if="event.categories && event.categories.length > 0"
        >
          <v-col>
            <v-chip
              outlined
              v-for="category in getCategories(event.categories)"
              :key="category._id"
              class="mr-1"
              disabled
            >
            {{category.text.value}}
            </v-chip>
          </v-col>
        </v-row>
        <!-- Tags -->
        <v-row
          class="mx-1"
          v-if="event.tags && event.tags.length > 0"
        >
          <v-col>
            <v-chip
              v-for="tag in getTags(event.tags)"
              :key="tag._id"
              class="mr-1"
              disabled
            >
            {{tag.text}}
            </v-chip>
          </v-col>
        </v-row>
        <!-- Description -->
        <v-row>
          <v-col
            class="text-body-1 mx-4"
          >
            <div
              v-html="eventProp ? truncatedDescription(newTab(event.text.value)) : $sanitize(newTab(event.text.value))"
            >
            </div>
          </v-col>
        </v-row>
      </v-col>
      <!-- Carousel -->
      <v-col
        cols="12"
        sm="12"
        :md="eventProp ? 12 : 4"
        :order="1"
        :order-md="eventProp ? 1 : 2"
        :class="eventProp ? 'py-0' : $vuetify.display.mdAndUp ? 'pr-6' : 'pt-0'"
      >
          <v-carousel
            v-if="event.pics.length > 0"
            v-model="picsCarousel"
            hide-delimiters
            :show-arrows="event.pics.length > 1"
            :show-arrows-on-hover="event.pics.length > 1"
            height="100%"
            max-height="200px"
            class="white"
          >
            <template
              v-slot:prev="{ on, attrs }"
            >
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>
                fas fa-chevron-left
              </v-icon>
            </v-btn>
            </template>
            <template
              v-slot:next="{ on, attrs }"
            >
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>
                fas fa-chevron-right
              </v-icon>
            </v-btn>
            </template>
            <v-carousel-item
              v-for="pic in event.pics"
              :key="pic.url"
            >
              <v-img
                :height="eventProp ? 250 : 350"
                :src="s3 + pic.url"
                :contain="eventProp ? false : true"
                :alt="$t('eventTitlePic')"
                :title="pic.credit ? '© ' + pic.credit : ''"
              ></v-img>
            </v-carousel-item>
          </v-carousel>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>

import { mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  name: 'EventCard',

  components: {
  },

  props: [
    'eventProp'
  ],

  data: () => ({
    picsCarousel: 0,
    event: undefined
  }),

  async mounted () {
    await this.loadEvent()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('events', {
      requestEvent: 'get'
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
    async loadEvent () {
      if (this.eventProp) {
        this.event = this.eventProp
      } else {
        if (this.$route.name === 'Event' && this.$route.params.event && !this.eventProp) {
          let selectedEvent = this.getEvent(this.$route.params.event)
          if (!selectedEvent) {
            selectedEvent = await this.requestEvent([
              this.$route.params.event
            ])
          }
          this.event = selectedEvent
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'newTab',
      'getTags',
      'getCategories'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('events', {
      getEvent: 'get'
    }),
    ...mapGetters('categories', {
      categories: 'list'
    }),
    computedDateTime () {
      if (this.$moment(this.event.duration.start).isSame(this.$moment(this.event.duration.end))) {
        return this.$moment(this.event.duration.start).format('DD.MM.YYYY, HH:mm') + ' ' + this.$t('oClock')
      } else if (this.$moment(this.event.duration.start).isSame(this.$moment(this.event.duration.end), 'day')) {
        return this.$moment(this.event.duration.start).format('DD.MM.YYYY, HH:mm') + '-' + this.$moment(this.event.duration.end).format('HH:mm') + ' ' + this.$t('oClock')
      } else {
        return this.$moment(this.event.duration.start).format('DD.MM.YYYY, HH:mm') + ' ' + this.$t('oClock') + ' - ' + this.$moment(this.event.duration.end).format('DD.MM.YYYY, HH:mm') + ' ' + this.$t('oClock')
      }
    }
  }
}
</script>
