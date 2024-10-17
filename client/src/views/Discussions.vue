<template>
  <div>
    <v-row>
      <v-col
        class="d-flex mx-3 mb-4"
      >
        <v-row>
          <span
            class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
          >
            <div
              v-html="$t('discussionsTitle')"
            >
            </div>
          </span>
          <span
            class="my-3 mr-3"
          >
            <v-btn
              v-if="filtersDirty"
              variant="text"
              :color="$settings.modules.discussions.color"
              @click="resetFilterTrigger = Date.now()"
            >
              {{$t('resetFilters')}}
            </v-btn>
          </span>
          <span
            class="my-3 mr-6"
          >
            <v-badge
              :model-value="filtersDirty"
              :color="$settings.modules.discussions.color"
            >
            <v-btn
              variant="outlined"
              :color="$settings.modules.discussions.color"
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
          </span>
          <span
            v-if="user && user.role === 'admins'"
            class="my-3 mr-1"
          >
            <v-btn
              :to="{ name: 'DiscussionEditor' }"
              :color="$settings.modules.discussions.color"
              class="text-white"
            >
              {{$t('newDiscussion')}}
              <v-icon
                class="ml-3"
                size="18"
                color="white"
              >
                fas fa-plus
              </v-icon>
            </v-btn>
          </span>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <DiscussionsList
          :showFilters="showFilters"
          :resetFilterTrigger="resetFilterTrigger"
          @update:filtersDirty="setFiltersDirty($event)"
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
    showFilters: true,
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
