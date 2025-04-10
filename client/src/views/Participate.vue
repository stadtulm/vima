<template>
  <div>
    <v-row
      class="mt-3 mb-6"
    >
      <v-col>
        <info-box></info-box>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        class="text-h5 font-weight-bold text-customGrey"
      >
        <span
          class="text-uppercase"
          @click="$router.push({ name: 'Participate' })"
          tour-step="1"
        >
          {{$t('participate')}}
        </span>
        <span
          class="ml-8 pointer text-body-2"
          @click="$router.push({name: 'Faq'})"
        >
          <v-btn
            variant="plain"
          >
            {{$t('howToSwitchLanguage')}}
            <v-icon
              class="ml-2"
              size="18"
            >
              fas fa-arrow-right
            </v-icon>
          </v-btn>
        </span>
        <LanguageSelect
          :isMainSwitch="true"
          :currentLanguage="$i18n.locale"
          @update:setLanguage="setLanguage"
        ></LanguageSelect>
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
        >
          <v-container
            fluid
            class="fill-height"
          >
            <v-row
              class="align-self-start"
            >
              <v-col
                cols="12"
                class="pa-0"
              >
                <v-img
                  :src="module.pic ? (s3 + module.pic.url) : ''"
                  height="200px"
                  cover
                  :alt="$t(module.type + 'SectionPic')"
                  :tour-step-container="i === 0 ? '3' : null"
                  :title="module.pic && module.pic.credit ? '© ' + module.pic.credit : ''"
                  @click="$router.push({ name: module.to, params: { type: module.type } })"
                  class="pointer"
                ></v-img>
              </v-col>
              <v-col
                class="px-0 pb-0"
              >
                <v-card-title
                  class="word-wrap"
                >
                  <div
                    v-html="$t(module.type + 'Title')"
                    class="pointer"
                    @click="$router.push({ name: module.to, params: { type: module.type } })"
                  >
                  </div>
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
                class="pb-4 px-4 text-body-1 text-black"
              >
                <div
                  v-html="$sanitize(pickLanguage(module))"
                >
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import LanguageSelect from '@/components/LanguageSelect.vue'
import InfoBox from '@/components/InfoBox.vue'

export default {
  name: 'Home',

  components: {
    LanguageSelect,
    InfoBox
  },

  data: () => ({
  }),

  mounted () {
  },

  methods: {
    pickLanguage (module) {
      // Try to use custom text in user language
      const userLanguageText = module.text.find(language => language.lang === this.$i18n.locale)
      if (userLanguageText) {
        return userLanguageText.value
      } else {
        // Try to use custom text in default language
        const defaultLanguageText = module.text.find(language => language.type === 'default')
        if (defaultLanguageText) {
          return defaultLanguageText.value
        } else {
          return ''
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'newTab',
      'setLanguage'
    ]),
    computedModules () {
      return Object.keys(this.$settings.modules)
        .map(
          moduleKey => ({
            ...this.$settings.modules[moduleKey],
            type: moduleKey,
            to: moduleKey === 'ads' ? 'AdsListView' : moduleKey[0].toUpperCase() + moduleKey.substr(1)
          })
        )
        .filter(module => module.isActive)
        .sort((a, b) => (a.position > b.position) ? 1 : -1)
    }
  }
}
</script>
