<template>
  <v-menu
    offset-y
    open-on-hover
  >
    <template v-slot:activator="{ props }">
      <v-btn
        :text="!isMainSwitch || !$vuetify.display.smAndUp ? 'true' : 'false'"
        :small="!isMainSwitch || !$vuetify.display.smAndUp"
        :large="isMainSwitch && $vuetify.display.mdAndUp"
        v-bind="props"
        :icon="!$vuetify.display.smAndUp"
        class="mr-2"
        :class="!isMainSwitch ? 'px-0' : 'rounded-ts-xl rounded-e-xl'"
        variant="elevated"
      >
        <country-flag
          :class="!isMainSwitch ? 'my-0' : ($vuetify.display.smAndUp ? 'mb-1': 'mb-0 ml-1 mr-1')"
          :country="currentLanguage === 'en' ? 'gb': currentLanguage"
        >
        </country-flag>
        <v-icon
          v-if="$vuetify.display.smAndUp"
          color="customGrey"
          class="ml-1 mb-1"
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
        <v-list-item-action
          v-if="computedExistingLanguages"
        >
          <v-icon
            class="ml-1"
            size="18"
          >
            {{ computedExistingLanguages.includes(language) ? 'fas fa-check' : 'fas fa-exclamation-triangle'}}
          </v-icon>
        </v-list-item-action>
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

  data: () => ({
    selectedLanguage: ''
  }),

  async mounted () {
    this.selectedLanguage = this.currentLanguage
  },

  methods: {
    selectLanguage (e) {
      this.$emit('setLanguage', e.id)
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

  asyncComputed: {
  },

  watch: {
    currentLanguage () {
      this.selectedLanguage = this.currentLanguage
    }
  }
}
</script>
