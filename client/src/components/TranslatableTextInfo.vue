<template>
  <span>
    <v-menu
      open-on-hover
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          v-bind="attrs"
          v-on="on"
        >
          <v-icon
            size="18"
            color="customGrey"
          >
            {{needsUpdate ? 'fas fa-exclamation-triangle': 'fas fa-language'}}
          </v-icon>
        </v-btn>
      </template>
      <v-list
        rounded
        dense
      >
        <v-list-item
          dense
          disabled
          v-if="canShowOriginal"
        >
          <v-list-item-avatar>
            <v-icon
              class="mb-1 mr-1"
              color="customGreyLight"
            >
              fas fa-info-circle
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{$t('machineTranslationHint')}}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="canShowOriginal"
          @click="$emit('showOriginal')"
        >
          <v-list-item-avatar>
            <v-icon
              small
              class="mb-1 mr-1"
            >
              fa fa-undo
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{$t('showOriginal')}}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="needsUpdate && canShowOriginal"
          @click="$emit('translateText', {
            allTexts: false,
            allFields: true,
            force: true
          })"
        >
          <v-list-item-avatar>
            <v-icon
              small
              color="error"
              class="mb-1 mr-1"
            >
              fas fa-sync
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{$t('updateTranslation')}}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{$t('defaultLanguageEdited')}}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="canTranslate"
          @click="$emit('translateText', {
            allTexts: false,
            allFields: false,
            force: false
          })"
        >
          <v-list-item-avatar>
              <country-flag
                class="my-0"
                :country="$i18n.locale === 'en' ? 'gb': $i18n.locale"
              >
              </country-flag>
          </v-list-item-avatar>
          <v-list-item-title>
            {{$t('translateText')}}
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="canTranslateObject"
          @click="$emit('translateText', {
            allTexts: false,
            allFields: true,
            force: false
          })"
        >
          <v-list-item-avatar>
              <country-flag
                class="my-0"
                :country="$i18n.locale === 'en' ? 'gb': $i18n.locale"
              >
              </country-flag>
          </v-list-item-avatar>
          <v-list-item-title>
            {{$t('translateObject')}}
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="canTranslateAll"
          @click="$emit('translateText', {
              allTexts: true,
              allFields: true,
              force: false
            }
          )"
        >
          <v-list-item-avatar>
            <country-flag
              class="my-0"
              :country="$i18n.locale === 'en' ? 'gb': $i18n.locale"
            >
            </country-flag>
          </v-list-item-avatar>
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
