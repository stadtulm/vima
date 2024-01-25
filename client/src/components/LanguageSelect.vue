<template>
  <v-menu
    offset-y
    open-on-hover
  >
    <template v-slot:activator="{ props }">
      <v-btn
        :variant="!isMainSwitch || !$vuetify.display.smAndUp ? 'text' : 'elevated'"
        size="large"
        v-bind="props"
        :icon="!$vuetify.display.smAndUp"
        class="rounded-ts-xl rounded-e-xl"
      >
        <country-flag
          :class="$vuetify.display.smAndUp ? 'mb-1': 'mb-0 ml-1 mr-1'"
          :country="currentLanguage === 'en' ? 'gb': currentLanguage"
        >
        </country-flag>
        <v-icon
          v-if="$vuetify.display.smAndUp"
          color="customGrey"
          class="ml-2 mb-1"
          size="18"
          icon="fa fa-chevron-down"
        >
        </v-icon>
      </v-btn>
    </template>

    <v-list
      v-model="selectedLanguage"
      @click:select="selectLanguage"
    >
      <v-list-item
        dense
        v-for="language in $settings.languages"
        :key="language"
        :value="language"
      >
        <template v-slot:prepend>
          <country-flag
            class="my-0 mr-3"
            :country="language === 'en' ? 'gb' : language"
          >
          </country-flag>
        </template>
        <v-list-item-title>
          {{$t(language)}}
          {{ language === computedDefaultLanguage ? '(' + $t('defaultLanguage') + ')' : ''}}
        </v-list-item-title>
        <template
          v-slot:append
          v-if="computedExistingLanguages"
        >
          <v-icon
            class="ml-1"
            size="18"
          >
            {{ computedExistingLanguages.includes(language) ? 'fas fa-check' : 'fas fa-exclamation-triangle'}}
          </v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>

export default {
  name: 'LanguageSelect',

  props: [
    'currentLanguage',
    'languageObjects',
    'isMainSwitch'
  ],

  emits: ['update:setLanguage'],

  data: () => ({
    selectedLanguage: ''
  }),

  async mounted () {
    this.selectedLanguage = this.currentLanguage
  },

  methods: {
    selectLanguage (e) {
      this.$emit('update:setLanguage', e.id)
    }
  },

  computed: {
    computedExistingLanguages () {
      if (this.languageObjects) {
        return this.languageObjects
          .filter(language => language && language.value && language.value !== '' && language.value !== '<p></p>')
          .map(language => language.lang)
      } else {
        return undefined
      }
    },
    computedDefaultLanguage () {
      if (this.languageObjects) {
        const defaultObject = this.languageObjects
          .find(language => language.type === 'default')
        if (defaultObject) {
          return defaultObject.lang
        } else {
          return ''
        }
      } else {
        return undefined
      }
    }
  },

  watch: {
    currentLanguage () {
      this.selectedLanguage = this.currentLanguage
    }
  }
}
</script>
