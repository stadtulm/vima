<template>
  <v-menu
    offset-y
    open-on-hover
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        text
        v-bind="attrs"
        v-on="on"
        small
        class="px-0"
      >
        <country-flag
          class="my-0"
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
        v-for="language in languages"
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
    'languageObjects'
  ],

  data: () => ({
    languages: ['de', 'en', 'ro'],
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
