<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('adminView')}} {{$t('manageViolationsButton')}}
      </v-col>
      <v-col
        class="shrink align-self-center"
      >
        <v-btn
          v-if="computedFiltersDirty"
          text
          color="customGrey"
          @click="resetFilters()"
        >
          {{$t('resetFilters')}}
        </v-btn>
      </v-col>
      <v-col
        class="shrink align-self-center"
      >
        <v-badge
          :value="computedFiltersDirty"
          color="customGrey"
          overlap
        >
          <v-btn
            outlined
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
            color="black"
            item-color="customGrey"
            :label="$t('type')"
            outlined
            dense
            multiple
            chips
            deletable-chips
            hide-details
            :items="[
              { text: $t('chat'), value: 'chats'},
              { text: $t('discussion'), value: 'discussions'},
              { text: $t('group'), value: 'groups' }
            ]"
          ></v-select>
        </v-col>
      </v-row>
    </v-expand-transition>
    <v-row>
      <v-col>
        <ViolationsList
          :types="types"
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
    types: ['chats', 'discussions'],
    computedFiltersDirty: false,
    showFilters: false
  }),

  async mounted () {
  },

  methods: {
  },

  computed: {
  },

  watch: {
  }
}
</script>
