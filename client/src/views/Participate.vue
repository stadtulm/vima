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
        v-for="(module, i) in computedModules"
        :key="i"
        cols="12"
        md="4"
      >
        <v-card
          height="100%"
          :color="module.bgColor"
          :to="{ name: module.to, params: { type: module.type } }"
        >
          <v-container
            fluid
            class="fill-height"
          >
            <v-row
              class="align-self-start"
            >
              <v-img
                :src="module.pic"
                height="200px"
                :alt="$t(module.type + 'SectionPic')"
                :tour-step-container="i === 0 || null"
              ></v-img>
              <v-col
                class="px-0 pb-0"
              >
                <v-card-title
                  v-html="$t(module.type + 'Title')"
                  class="word-wrap"
                >
                </v-card-title>
              </v-col>
              <v-col
                class="pb-0 shrink right-text align-self-center"
              >
                <v-btn
                  :style="'color:' + module.color"
                  :to="{ name: module.to, params: { type: module.type } }"
                  tour-step="3"
                >
                  {{$t('viewButton')}}
                  <v-icon
                    class="ml-3"
                    size="18"
                    :color="module.color"
                  >
                    fas fa-arrow-right
                  </v-icon>
                </v-btn>
              </v-col>
              <v-col
                cols="12"
                class="pb-4 px-4 body-1 black--text"
              >
                {{$t(module.type + 'Body')}}
              </v-col>
            </v-row>
            {{module.to}}
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
    computedModules () {
      return Object.keys(this.$settings.modules)
        .map(
          moduleKey => ({
            ...this.$settings.modules[moduleKey],
            type: moduleKey,
            to: moduleKey === 'ads' ? 'CategoryList' : moduleKey[0].toUpperCase() + moduleKey.substr(1)
          })
        )
        .filter(module => module.isActive)
        .sort((a, b) => (a.position > b.position) ? 1 : -1)
    }
  }
}
</script>
