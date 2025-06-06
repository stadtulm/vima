<template>
  <div>
    <div
      v-show="!computedShowTranslation && computedText"
    >
      <slot
        name="defaultLang"
        v-bind:computedText="computedText"
        v-bind:translateText="translateText"
      >
        <slot
          name="defaultLangText"
          v-bind:computedText="computedText"
        >
          {{computedText.value}}
        </slot>
        <TranslatableTextInfo
          :canTranslate="true"
          :canTranslateAll="allIds ? allIds.length > 1 : false"
          :canTranslateObject="allFields ? allFields.length > 1 : false"
          @update:translateText="translateText"
        ></TranslatableTextInfo>
      </slot>
    </div>
    <div
      v-show="computedShowTranslation && computedText"
    >
      <slot
        name="translatedLang"
        v-bind:computedText="computedText"
        v-bind:showOriginal="showOriginal"
        v-bind:translateText="translateText"
      >
        <v-tooltip top>
          <template v-slot:activator="{ props }">
            <v-sheet
              class="pa-1 px-3"
              outlined
              v-bind="props"
            >
              <slot
                name="translatedLangText"
                v-bind:computedText="computedText"
              >
                {{computedText.value}}
              </slot>
              <TranslatableTextInfo
                :canShowOriginal="true"
                :canTranslateObject="allFields.length > 1"
                :needsUpdate="textParent.translationSum !== computedText.translationSum"
                @update:showOriginal="showOriginal"
                @update:translateText="translateText"
              ></TranslatableTextInfo>
            </v-sheet>
          </template>
          <span>
            {{$t('machineTranslationHint')}}
          </span>
        </v-tooltip>
      </slot>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapActions, mapMutations } from 'vuex'
import TranslatableTextInfo from '@/components/TranslatableTextInfo.vue'

export default {
  name: 'TranslatableText',

  components: {
    TranslatableTextInfo
  },

  props: [
    'textParent', // Object
    'ownField', // String
    'allFields', // [fieldString, fieldString]
    'type', // String
    'allIds' // [{ id, translationSum }]
  ],

  data: () => ({
    updateText: 1
  }),

  async mounted () {
    if (this.preferences?.instantTranslateAll) {
      await this.translateText({
        allTexts: true,
        allFields: true,
        force: false
      })
    }
  },

  methods: {
    ...mapMutations([
      'SET_TRANSLATOR_BLOCKED'
    ]),
    ...mapMutations('translator', {
      updateTranslationItem: 'updateItem'
    }),
    ...mapActions('translator', {
      createTranslation: 'create'
    }),
    showOriginal (all) {
      if (all) {
        if (this.allIds) {
          for (const id of this.allIds) {
            for (const field of this.allFields) {
              this.updateTranslationItem({ _id: id.id + '_' + field + '_' + this.$i18n.locale, show: false })
            }
          }
        } else {
          for (const field of this.allFields) {
            this.updateTranslationItem({ _id: this.textParent._id + '_' + field + '_' + this.$i18n.locale, show: false })
          }
        }
      } else {
        this.updateTranslationItem({ _id: this.textParent._id + '_' + this.ownField + '_' + this.$i18n.locale, show: false })
      }
    },
    async translateText ({ allTexts, allFields, force }) {
      if (this.translatorBlocked) return
      this.SET_TRANSLATOR_BLOCKED(true)
      let textsToTranslate
      let textsToShow
      textsToTranslate = allTexts && this.allIds ? this.allIds : [{ id: this.textParent._id, translationSum: this.textParent.translationSum }]

      if (force) {
        textsToShow = []
      } else {
        textsToTranslate = textsToTranslate.filter(text => !this.getTranslation(text.id + '_' + this.$i18n.locale))
        textsToShow = textsToTranslate.filter(text => this.getTranslation(text.id + '_' + this.$i18n.locale))
      }
      if (textsToTranslate.length > 0) {
        await this.createTranslation([
          {
            type: this.type,
            texts: textsToTranslate,
            target: this.$i18n.locale,
            fields: allFields ? this.allFields : [this.ownField],
            allFields: this.allFields,
            force
          }
        ])
      }
      for (const text of textsToShow) {
        this.updateTranslationItem({ _id: text.id + '_' + this.$i18n.locale, show: true })
      }
      this.updateText = Date.now()
      this.SET_TRANSLATOR_BLOCKED(false)
    }
  },

  computed: {
    ...mapGetters([
      'preferences',
      'translatorBlocked'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('translator', {
      translations: 'list',
      getTranslation: 'get'
    }),
    computedShowTranslation () {
      return this.updateText &&
        this.textParent &&
        this.ownField &&
        this.getTranslation(this.textParent._id + '_' + this.ownField + '_' + this.$i18n.locale) &&
        this.getTranslation(this.textParent._id + '_' + this.ownField + '_' + this.$i18n.locale).show
    },
    computedText () {
      if (this.computedShowTranslation) {
        return this.getTranslation(this.textParent._id + '_' + this.ownField + '_' + this.$i18n.locale)
      } else {
        if (Array.isArray(this.textParent[this.ownField])) {
          return this.textParent[this.ownField].find(t => t.type === 'default')
        } else {
          return this.textParent[this.ownField]
        }
      }
    }
  },

  watch: {
    translations: {
      deep: true,
      handler () {
        this.updateText = Date.now()
      }
    }
  }
}
</script>
