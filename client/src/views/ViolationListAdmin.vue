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
              v-html="$t('adminView') + ' ' + $t('violations')"
            >
            </div>
          </span>
          <span
            class="my-3 mr-3"
          >
            <v-btn
              v-if="computedFiltersDirty"
              variant="text"
              color="customGrey"
              @click="resetFilters()"
            >
              {{$t('resetFilters')}}
            </v-btn>
          </span>
          <span
            class="my-3 mr-6"
          >
            <v-badge
              v-model="computedFiltersDirty"
              :color="$settings.modules.ads.color"
            >
              <v-btn
                variant="outlined"
                color="customGrey"
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
        </v-row>
      </v-col>
    </v-row>
    <v-expand-transition
      mode="in-out"
    >
      <v-row
        v-if="showFilters"
      >
        <v-col
          cols="12"
        >
          <v-select
            v-model="types"
            :label="$t('type')"
            density="compact"
            multiple
            chips
            closable-chips
            hide-details
            :items="typeItems"
          ></v-select>
        </v-col>
      </v-row>
    </v-expand-transition>
    <v-row>
      <v-col>
        <ViolationsList
          :types="types"
          @update:updateTypes="updateTypes($event)"
        ></ViolationsList>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import ViolationsList from '@/components/ViolationsList.vue'

export default {
  name: 'ViolationListAdmin',

  components: {
    ViolationsList
  },

  data: () => ({
    typeItems: [],
    types: [],
    computedFiltersDirty: false,
    showFilters: false
  }),

  async mounted () {
    this.typeItems = [
      { title: this.$t('chat'), value: 'chats' },
      { title: this.$t('discussion'), value: 'discussions' },
      { title: this.$t('group'), value: 'groups' }
    ]
    this.types = ['chats', 'discussions']
  },

  methods: {
    updateTypes (updatedTypes) {
      this.types = updatedTypes
    }
  },

  computed: {
  },

  watch: {
  }
}
</script>
