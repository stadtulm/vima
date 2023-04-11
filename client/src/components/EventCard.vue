<template>
  <v-card
    color="customGreyUltraLight"
    v-if="computedEvent"
    :to="eventProp ? { name: 'Event', params: { event: computedEvent._id } } : ''"
  >
    <v-row>
      <v-col
        cols="12"
        sm="12"
        :md="eventProp ? 12 : 6"
        :order="2"
        :order-md="eventProp ? 2 : 1"
      >
        <v-row>
          <v-col>
            <!-- Title -->
            <v-card-title
              class="word-wrap mb-3"
            >
              {{computedEvent.title.value}}
            </v-card-title>
            <v-card-subtitle
              class="body-1 pb-0"
              v-if="computedEvent.location"
            >
              {{computedEvent.location}}
            </v-card-subtitle>
            <v-card-subtitle
              class="body-1"
            >
              {{computedDateTime}}
            </v-card-subtitle>
          </v-col>
          <v-col
            v-if="eventProp"
            class="shrink align-self-center"
            :class="$vuetify.breakpoint.smAndUp ? 'text-right' : ''"
            cols="12"
            sm="6"
          >
            <!-- View more button -->
            <v-btn
              class="customGrey--text mx-4"
              :to="{ name: 'Event', params: { event: computedEvent._id }}"
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
          v-if="computedEvent.categories && computedEvent.categories.length > 0"
        >
          <v-col>
            <v-chip
              outlined
              v-for="category in getCategories(computedEvent.categories)"
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
          v-if="computedEvent.tags && computedEvent.tags.length > 0"
        >
          <v-col>
            <v-chip
              v-for="tag in getTags(computedEvent.tags)"
              :key="tag._id"
              class="mr-1"
              disabled
            >
            {{tag.text.value}}
            </v-chip>
          </v-col>
        </v-row>
        <!-- Description -->
        <v-row>
          <v-col
            class="body-1 mx-4"
            v-html="eventProp ? truncatedDescription(newTab(computedEvent.text.value)) : $sanitize(newTab(computedEvent.text.value))"
          ></v-col>
        </v-row>
      </v-col>
      <!-- Carousel -->
      <v-col
        cols="12"
        sm="12"
        :md="eventProp ? 12 : 6"
        :order="1"
        :order-md="eventProp ? 1 : 2"
        :class="eventProp ? 'py-0' : $vuetify.breakpoint.mdAndUp ? 'pr-6' : 'pt-0'"
      >
          <v-carousel
            v-if="computedEvent.pics.length > 0"
            v-model="picsCarousel"
            hide-delimiters
            :show-arrows="computedEvent.pics.length > 1"
            :show-arrows-on-hover="computedEvent.pics.length > 1"
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
              v-for="pic in computedEvent.pics"
              :key="pic.url"
            >
              <v-img
                :height="eventProp ? 300 : 600"
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
    picsCarousel: 0
  }),

  async mounted () {
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
      if (this.$moment(this.computedEvent.duration.start).isSame(this.$moment(this.computedEvent.duration.end))) {
        return this.$moment(this.computedEvent.duration.start).format('DD.MM.YYYY, HH:mm') + ' ' + this.$t('oClock')
      } else if (this.$moment(this.computedEvent.duration.start).isSame(this.$moment(this.computedEvent.duration.end), 'day')) {
        return this.$moment(this.computedEvent.duration.start).format('DD.MM.YYYY, HH:mm') + '-' + this.$moment(this.computedEvent.duration.end).format('HH:mm') + ' ' + this.$t('oClock')
      } else {
        return this.$moment(this.computedEvent.duration.start).format('DD.MM.YYYY, HH:mm') + ' ' + this.$t('oClock') + ' - ' + this.$moment(this.computedEvent.duration.end).format('DD.MM.YYYY, HH:mm') + ' ' + this.$t('oClock')
      }
    }
  },

  asyncComputed: {
    async computedEvent () {
      if (this.eventProp) {
        return this.eventProp
      } else {
        if (this.$route.name === 'Event' && this.$route.params.event && !this.eventProp) {
          let selectedEvent = this.getEvent(this.$route.params.event)
          if (!selectedEvent) {
            selectedEvent = await this.requestEvent([
              this.$route.params.event
            ])
          }
          return selectedEvent
        }
      }
    }
  }
}
</script>
