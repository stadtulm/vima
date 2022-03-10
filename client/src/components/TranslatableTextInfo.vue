<template>
  <span>
    <v-menu
      open-on-hover
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          class="ml-1"
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
      <v-list>
        <v-list-item
          v-if="canShowOriginal"
        >
          <v-list-item-avatar>
            <v-icon
              small
              class="mb-1 mr-1"
            >
              fas fa-info-circle
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{$t('machineTranslationHint')}}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              @click="$emit('showOriginal')"
            >
              {{$t('showOriginal')}}
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-list-item
          v-if="needsUpdate && canShowOriginal"
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
              {{$t('defaultLanguageEdited')}}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              text
              x-small
              @click="$emit('translateText', {
                allTexts: false,
                allFields: true,
                force: true
              })"
            >
              {{$t('updateTranslation')}}
            </v-btn>
          </v-list-item-action>
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
          v-if="canTranslate"
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
          v-if="translateAll"
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
    'translateAll',
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
