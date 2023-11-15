<template>
  <span>
    <v-menu
      open-on-hover
    >
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          v-bind="props"
          size="x-small"
          class="ml-2 mb-1"
        >
          <v-icon
            size="20"
            :color="canShowOriginal ? 'success' : 'customGrey'"
          >
            {{needsUpdate ? 'fas fa-exclamation-triangle': 'fas fa-globe'}}
          </v-icon>
        </v-btn>
      </template>
      <v-list
        density="compact"
      >
        <v-list-item
          density="compact"
          disabled
          v-if="canShowOriginal"
        >
          <template v-slot:prepend>
            <v-icon
              class="mb-1 mr-1"
              color="customGreyLight"
            >
              fas fa-info-circle
            </v-icon>
          </template>
          <v-list-item-title>
            {{$t('machineTranslationHint')}}
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="canShowOriginal"
          @click="$emit('update:showOriginal')"
        >
          <template v-slot:prepend>
            <v-icon
              small
              class="mb-1 mr-1"
            >
              fa fa-undo
            </v-icon>
          </template>
          <v-list-item-title>
            {{$t('showOriginal')}}
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="needsUpdate && canShowOriginal"
          @click="$emit('update:translateText', {
            allTexts: false,
            allFields: true,
            force: true
          })"
        >
          <template v-slot:prepend>
            <v-icon
              small
              color="error"
              class="mb-1 mr-1"
            >
              fas fa-sync
            </v-icon>
          </template>
          <v-list-item-title>
            {{$t('updateTranslation')}}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{$t('defaultLanguageEdited')}}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item
          v-if="canTranslate"
          @click="$emit('update:translateText', {
            allTexts: false,
            allFields: false,
            force: false
          })"
        >
          <template v-slot:prepend>
            <v-avatar>
              <country-flag
                class="my-0 mr-1"
                :country="$i18n.locale === 'en' ? 'gb': $i18n.locale"
              >
              </country-flag>
            </v-avatar>
          </template>
          <v-list-item-title>
            {{$t('translateText')}}
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="canTranslateObject"
          @click="$emit('update:translateText', {
            allTexts: false,
            allFields: true,
            force: false
          })"
        >
          <template v-slot:prepend>
            <v-avatar>
              <country-flag
                class="my-0 mr-1"
                :country="$i18n.locale === 'en' ? 'gb': $i18n.locale"
              >
              </country-flag>
            </v-avatar>
          </template>
          <v-list-item-title>
            {{$t('translateObject')}}
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="canTranslateAll"
          @click="$emit('update:translateText', {
              allTexts: true,
              allFields: true,
              force: false
            }
          )"
        >
          <template v-slot:prepend>
            <country-flag
              class="my-0"
              :country="$i18n.locale === 'en' ? 'gb': $i18n.locale"
            >
            </country-flag>
          </template>
          <v-list-item-title>
            {{$t('translateAll')}}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </span>
</template>

<script>

export default {
  name: 'TranslatableTextInfo',

  props: [
    'canTranslate',
    'canTranslateObject',
    'canTranslateAll',
    'canShowOriginal',
    'needsUpdate'
  ],

  emits: [
    'update:showOriginal',
    'update:translateText'
  ],

  data: () => ({
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
