<template>
  <div>
    <v-row>
      <v-col
        class="text-right"
      >
        <v-btn
          large
          dark
          :to="{ name: 'DiscussionEditor' }"
          :color="$settings.modules.discussions.color"
        >
          Neues Diskussions-Thema erstellen
          <v-icon
            class="ml-3"
            size="18"
          >
            fas fa-plus
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card
          color="customGreyUltraLight"
          tile
        >
          <v-card-text>
            <v-row>
              <v-col
                class="text-h5 font-weight-bold"
              >
                Diskussionen
              </v-col>
            </v-row>
            <v-row
            >
              <v-col
                class="body-1"
              >
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card
          class="my-3"
          color="transparent"
          flat
        >
          <v-row>
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-text-field
                v-model="search"
                color="customGrey"
                label="Filter nach Titel ..."
                hide-details
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-select
                v-model="categoriesList"
                color="customGrey"
                :item-color="$settings.modules.discussions.color"
                label="Filter nach Kategorien ..."
                multiple
                outlined
                dense
                hide-details
                :items="categories"
                item-text="name"
                item-value="_id"
              ></v-select>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-select
                v-model="sortBy"
                color="customGrey"
                :item-color="$settings.modules.discussions.color"
                label="Sortieren nach ..."
                outlined
                dense
                hide-details
                :items="[
                  { text: 'Datum', value: ['createdAt']},
                  { text: 'Titel alphabetisch', value: ['title'] }
                ]"
              ></v-select>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-select
                v-model="sortDesc"
                color="customGrey"
                :item-color="$settings.modules.discussions.color"
                label="Reihenfolge ..."
                outlined
                dense
                hide-details
                :items="[
                  { text: 'Absteigend', value: 1 },
                  { text: 'Aufsteigend', value: -1 }
                ]"
              ></v-select>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <template
      v-if="computedDiscussions && computedDiscussions.length > 0"
    >
      <v-row>
        <v-col
          v-for="discussion in computedDiscussions"
          :key="discussion._id"
          cols="12"
          sm="6"
          md="4"
        >
          <DiscussionCard
            :discussionProp="discussion"
          ></DiscussionCard>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-pagination
            :color="$settings.modules.discussions.color"
            v-model="page"
            :length="Math.ceil(total / itemsPerPage)"
            :total-visible="6"
          ></v-pagination>
        </v-col>
      </v-row>
    </template>
    <template
      v-else-if="!isFindDiscussionsPending"
    >
      <v-row>
        <v-col
          class="text-center customGrey--text body-1"
        >
          <v-alert
            color="customGreyLight"
            class="pa-4"
          >
            Noch keine Diskussions-Themen vorhanden
          </v-alert>
        </v-col>
      </v-row>
    </template>
    <template
      v-else
    >
      <v-row>
        <v-col
          class="text-center"
        >
          <v-progress-circular
            :color="$settings.modules.discussions.color"
            indeterminate
            size="160"
            width="6"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'
import DiscussionCard from '@/components/DiscussionCard.vue'

export default {
  name: 'Discussions',

  components: {
    DiscussionCard
  },

  data: () => ({
    init: true,
    manualLoad: false,
    isFindDiscussionsPending: false,
    triggerReload: 1,
    search: '',
    page: 1,
    loading: true,
    categoriesList: [],
    total: 0,
    itemsPerPage: 12,
    sortBy: ['createdAt'],
    sortDesc: 1
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('discussions', {
      findDiscussions: 'find'
    }),
    initQuery () {
      // Process query
      if (this.$route.query.i) {
        this.itemsPerPage = parseInt(this.$route.query.i)
      }
      if (this.$route.query.p) {
        this.page = parseInt(this.$route.query.p)
      }
      if (this.$route.query.s) {
        this.sortBy = this.$route.query.s.split(',')
      }
      if (this.$route.query.d) {
        this.sortDesc = parseInt(this.$route.query.d)
      }
      if (this.$route.query.c) {
        this.categoriesList = this.$route.query.c.split(',')
      }
    }
  },

  computed: {
    ...mapGetters([
      's3'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('categories', {
      categories: 'list'
    }),
    ...mapGetters('discussions', {
      allDiscussions: 'list'
    }),
    computedDiscussions () {
      if (this.computedDiscussionsData && this.computedDiscussionsData.data) {
        return this.computedDiscussionsData.data
      } else {
        return []
      }
    }
  },
  asyncComputed: {
    async computedDiscussionsData () {
      if (this.triggerReload) {}
      this.isFindDiscussionsPending = true
      const query = {
        'accepted.isAccepted': true,
        isActive: true,
        $limit: this.itemsPerPage,
        $skip: (this.page - 1) * this.itemsPerPage,
        $sort: { createdAt: this.sortDesc }
      }
      if (this.search && this.search !== '') {
        query.title = { $regex: this.search, $options: 'i' }
      }
      if (this.categoriesList.length > 0) {
        query.categories = { $in: this.categoriesList }
      }
      return await this.findDiscussions(
        {
          query
        }
      )
    }
  },

  watch: {
    page () {
      this.manualLoad = true
      if (parseInt(this.$route.query.p) !== this.page) {
        this.$router.replace(
          {
            query: {
              p: this.page,
              i: this.itemsPerPage,
              s: this.sortBy.join(','),
              d: this.sortDesc,
              c: this.categoriesList.join(',')
            }
          }
        )
      }
    },
    itemsPerPage () {
      if (parseInt(this.$route.query.i) !== this.itemsPerPage) {
        this.$router.replace(
          {
            query: {
              p: this.page,
              i: this.itemsPerPage,
              s: this.sortBy.join(','),
              d: this.sortDesc,
              c: this.categoriesList.join(',')
            }
          }
        )
      }
    },
    sortBy () {
      let tmpData
      if (Array.isArray(this.sortBy)) {
        tmpData = this.sortBy.join(',')
      } else {
        tmpData = this.sortBy
      }
      if (this.sortBy && this.$route.query.s !== tmpData) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: tmpData,
            d: this.sortDesc,
            c: this.categoriesList.join(',')
          }
        })
      } else if (!this.sortBy) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc,
            c: this.categoriesList.join(',')
          }
        })
      }
    },
    categoriesList () {
      let tmpData
      if (Array.isArray(this.categoriesList)) {
        tmpData = this.categoriesList.join(',')
      } else {
        tmpData = this.categoriesList
      }
      if (this.categoriesList && this.$route.query.c !== tmpData) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: this.sortBy.join(','),
            d: this.sortDesc,
            c: tmpData
          }
        })
      } else if (!this.sortBy) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc
          }
        })
      }
    },
    sortDesc () {
      if (parseInt(this.$route.query.d) !== this.sortDesc) {
        this.$router.replace(
          {
            query: {
              p: this.page,
              i: this.itemsPerPage,
              s: this.sortBy.join(','),
              d: this.sortDesc,
              c: this.categoriesList.join(',')
            }
          }
        )
      }
    },
    allDiscussions: {
      deep: true,
      handler (newValue, oldValue) {
        if (!this.init && !this.manualLoad) {
          this.triggerReload = Date.now()
          this.manualLoad = true
        }
      }
    },
    computedDiscussions (newValue, oldValue) {
      //
      this.total = this.computedDiscussionsData.total
      //
      if (this.page > Math.ceil(this.total / this.itemsPerPage)) {
        this.page = Math.ceil(this.total / this.itemsPerPage) + 1
      }
      //
      this.isFindDiscussionsPending = false
      this.init = false
      this.manualLoad = false
    }
  }
}
</script>
