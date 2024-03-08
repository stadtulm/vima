<template>
  <v-card
    color="customGreyUltraLight"
    v-if="event"
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
          <!-- Carousel -->
          <v-carousel
            v-if="event.pics.length > 0"
            v-model="picsCarousel"
            hide-delimiters
            :show-arrows="event.pics.length > 1"
            :show-arrows-on-hover="event.pics.length > 1"
            :cycle="false"
            :height="eventProp ? 250 : 350"
            class="mb-3"
          >
            <template
              v-slot:prev="{ props }"
            >
            <v-btn
              icon
              v-bind="props"
            >
              <v-icon>
                fas fa-chevron-left
              </v-icon>
            </v-btn>
            </template>
            <template
              v-slot:next="{ props }"
            >
            <v-btn
              icon
              v-bind="props"
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
                style="background-color: #fff"
                :class="eventProp ? 'pointer' : ''"
                @click="eventProp ? $router.push({ name: 'Event', params: { event: event._id }}) : ''"
              ></v-img>
            </v-carousel-item>
          </v-carousel>
          <!-- Title -->
          <div
            class="ma-4 mb-4 mb-0 text-h6 font-weight-bold"
            :class="eventProp ? 'pointer' : ''"
            @click="eventProp ? $router.push({ name: 'Event', params: { event: event._id }}) : ''"
          >
            {{event.title.value}}
          </div>
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
          <!-- Categories -->
          <v-row
            class="mx-1 mt-3"
            v-if="event.categories && event.categories.length > 0"
          >
            <v-col>
              <v-chip
                variant="outlined"
                v-for="category in getCategories(event.categories)"
                :key="category._id"
                class="mr-1 mb-1"
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
                class="mr-1 mb-1"
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
      </v-row>
      <!-- Show more button -->
      <v-row
        class="align-self-end"
        v-if="eventProp"
      >
        <v-col
          cols="12"
        >
          <v-card-actions
            class="px-4"
          >
            <v-btn
              block
              variant="elevated"
              class="text-customGrey"
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
          </v-card-actions>
        </v-col>
      </v-row>
    </v-container>
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
