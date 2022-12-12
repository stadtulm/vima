<template>
  <v-menu
    offset-y
    open-on-hover
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        :text="!isMainSwitch || !$vuetify.breakpoint.smAndUp"
        :small="!isMainSwitch || !$vuetify.breakpoint.smAndUp"
        :large="isMainSwitch && $vuetify.breakpoint.mdAndUp"
        v-bind="attrs"
        v-on="on"
        :class="!isMainSwitch ? 'px-0' : 'pl-0 pr-1 rounded-tl-xl rounded-r-xl'"
      >
        <country-flag
          :class="!isMainSwitch ? 'my-0' : 'mb-1'"
          :country="currentLanguage === 'en' ? 'gb': currentLanguage"
        >
        </country-flag>
        <v-icon
          v-if="$vuetify.breakpoint.smAndUp"
          color="customGrey"
          class="ml-1"
          size="14"
        >
          fa fa-chevron-down
        </v-icon>
      </v-btn>
    </template>

    <v-list>
    <v-list-item-group
      v-model="selectedLanguage"
      @change="$emit('setLanguage', selectedLanguage)"
    >
      <v-list-item
        dense
        v-for="language in $settings.languages"
        :key="language"
        :value="language"
      >
        <v-list-item-avatar>
          <country-flag
            class="my-0"
            :country="language === 'en' ? 'gb' : language"
          >
          </country-flag>
        </v-list-item-avatar>
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
    </v-list-item-group>
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
