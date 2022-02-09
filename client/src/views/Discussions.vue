<template>
  <div>
    <v-row>
      <v-col
        cols="12"
      >
        <v-row>
          <v-col
            class="text-h5 font-weight-bold customGrey--text text-uppercase"
            v-html="$t('discussionsTitle')"
          >
          </v-col>
          <v-col
            class="shrink align-self-center"
          >
            <v-btn
              v-if="filtersDirty"
              text
              color="customTeal"
              @click="resetFilterTrigger = Date.now()"
            >
              {{$t('resetFilters')}}
            </v-btn>
          </v-col>
          <v-col
            class="shrink align-self-center"
          >
            <v-badge
              :value="filtersDirty"
              color="customTeal"
              overlap
            >
            <v-btn
              outlined
              color="customTeal"
              @click="showFilters = !showFilters"
            >
              {{ showFilters ? $t('hideFiltersButton') : $t('showFiltersButton') }}
              <v-icon
                size="18"
                class="ml-3"
              >
                {{showFilters ? 'fas fa-chevron-up': 'fas fa-chevron-down'}}
              </v-icon>
            </v-btn>
            </v-badge>
          </v-col>
          <v-col
            v-if="user && user.role === 'admins'"
            class="shrink align-self-center"
          >
            <v-btn
              dark
              :to="{ name: 'DiscussionEditor' }"
              color="customTeal"
            >
              {{$t('newDiscussion')}}
              <v-icon
                class="ml-3"
                size="18"
              >
                fas fa-plus
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <DiscussionsList
          :showFilters="showFilters"
          :resetFilterTrigger="resetFilterTrigger"
          @filtersDirty="setFiltersDirty"
        >
        </DiscussionsList>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import DiscussionsList from '@/components/DiscussionsList.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'Discussions',

  components: {
    DiscussionsList
  },

  data: () => ({
    showFilters: false,
    filtersDirty: false,
    resetFilterTrigger: false
  }),

  methods: {
    setFiltersDirty (filtersDirty) {
      this.filtersDirty = filtersDirty
    }
  },

  computed: {
    ...mapGetters('auth', {
      user: 'user'
    })
  }
}
</script>
