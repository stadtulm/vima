<template>
  <div
    v-if="translations"
  >
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('translation')}} {{ selectedTranslation ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
      </span>
    </v-row>
    <v-row
      v-if="selectedTranslation || !$route.params.id"
    >
      <v-col
        cols="12"
      >
        <v-card
          tile
        >
          <v-card-text>
            <v-form
              v-model="isValid"
              ref="translationEditorForm"
            >
              <v-row
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    :readonly="selectedTranslation"
                    ref="tabStart"
                    density="compact"
                    :label="$t('textId')"
                    v-model="textId"
                    :rules="[rules.required]"
                    :hint="selectedTranslation ? $t('readonly'): undefined"
                    persistent-hint
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col>
                  <v-select
                    :label="$t('type')"
                    :items="translationTypes"
                    :rules="[rules.required]"
                    variant="outlined"
                    density="compact"
                    hide-details
                    v-model="type"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="12"
                >
                  <v-textarea
                    readonly
                    :hint="$t('readonly')"
                    persistent-hint
                    density="compact"
                    :label="$t('exampleLanguage')"
                    v-model="translations.find(obj => obj.lang === exampleLanguage).value"
                  >
                    <template v-slot:prepend>
                      <LanguageSelect
                        :currentLanguage="exampleLanguage"
                        :languageObjects="translations"
                        @update:setLanguage="(l) => { exampleLanguage = l }"
                      ></LanguageSelect>
                    </template>
                  </v-textarea>
                </v-col>
              </v-row>
              <v-row
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-textarea
                    density="compact"
                    :label="$t('editLanguage')"
                    v-model="translations.find(obj => obj.lang === currentLanguage).value"
                  >
                    <template v-slot:prepend>
                      <LanguageSelect
                        :currentLanguage="currentLanguage"
                        :languageObjects="translations"
                        @update:setLanguage="(l) => { currentLanguage = l }"
                      ></LanguageSelect>
                    </template>
                  </v-textarea>
                </v-col>
              </v-row>
            </v-form>
            <v-divider
              class="mb-6 mt-4"
            ></v-divider>
            <v-toolbar
              class="mt-4"
              color="transparent"
            >
              <v-btn
                block
                size="large"
                variant="elevated"
                color="customGrey"
                :loading="isLoading"
                :disabled="!isValid"
                @click="saveTranslation()"
                class="mx-0"
              >
                {{$t('saveDataButton')}}
              </v-btn>
            </v-toolbar>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import LanguageSelect from '@/components/LanguageSelect.vue'

export default {
  name: 'TranslationEditor',

  components: {
    LanguageSelect
  },

  data: () => ({
    textId: undefined,
    type: undefined,
    selectedTranslation: undefined,
    isLoading: false,
    isValid: false,
    translations: undefined,
    originalTranslations: undefined,
    exampleLanguage: 'en',
    currentLanguage: 'en'
  }),

  async mounted () {
    const existingFilters = this.getTranslationFilters()
    if (existingFilters) {
      this.exampleLanguage = existingFilters.l || this.exampleLanguage
      this.currentLanguage = existingFilters.r || this.currentLanguage
    }
    await this.adapt()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapMutations('translations', {
      updateTranslationItem: 'updateItem'
    }),
    ...mapActions('translations', {
      patchTranslation: 'patch',
      createTranslation: 'create',
      requestTranslation: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    getTranslationFilters () {
      let existingFilters = localStorage.getItem('filters')
      if (existingFilters) {
        existingFilters = JSON.parse(existingFilters)['/uebersetzungen']
      }
      return existingFilters
    },
    reduceTranslations (data, language, properties) {
      for (const property of properties) {
        if (data[property] && Array.isArray(data[property])) {
          const dataProperty = data[property].find(translation => translation && translation.lang === language)
          if (dataProperty) {
            data[property] = dataProperty
          } else if (data[property].find(translation => translation && translation.type === 'default')) {
            data[property] = data[property].find(translation => translation && translation.type === 'default')
          } else {
            data[property] = {
              value: this.$t('noDefaultValue'),
              type: 'error'
            }
          }
        }
      }
      return data
    },
    hydrateTranslations (data) {
      let tmpLanguages = JSON.parse(JSON.stringify(data || []))
      if (!Array.isArray(tmpLanguages)) {
        tmpLanguages = [tmpLanguages]
      }
      for (const language of this.$settings.languages) {
        if (!tmpLanguages.find(obj => obj.lang === language)) {
          tmpLanguages.push({
            lang: language,
            value: '',
            edits: []
          })
        }
      }
      return tmpLanguages
    },
    async patchFileRemove () {
      this.isLoading = true
      try {
        await this.patchTranslation([
          this.selectedTranslation._id,
          {
            pic: null
          }
        ])
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.isLoading = false
        this.adapt()
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.adapt()
      }
    },
    async adapt () {
      if (this.$route.params.id) {
        this.selectedTranslation = await this.requestTranslation([this.$route.params.id])
      }
      if (this.selectedTranslation) {
        this.textId = this.selectedTranslation.textId
        this.type = this.selectedTranslation.type
        this.translations = this.hydrateTranslations(this.selectedTranslation.translations)
      } else {
        this.translations = this.hydrateTranslations()
      }
      this.originalTranslations = JSON.parse(JSON.stringify(this.translations))
    },
    async saveTranslation () {
      this.isLoading = true
      // Prepare map
      const map = {
        textId: this.textId,
        type: this.type,
        translations: this.translations.filter(language => language.value && language.value !== '')
      }
      // TODO: Do that on server
      for (const translation of map.translations) {
        if (translation.value !== this.originalTranslations.find(t => t.lang === translation.lang).value) {
          translation.edits.push({
            author: this.user._id,
            ts: new Date()
          })
        }
      }
      try {
        let result
        if (this.selectedTranslation) {
          result = await this.patchTranslation([this.selectedTranslation._id, map, {}])
        } else {
          result = await this.createTranslation([map, {}])
        }
        this.updateTranslationItem(this.reduceTranslations(result, this.$i18n.locale, ['translations']))
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$router.go(-1)
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    }
  },

  computed: {
    ...mapGetters([
      'rules',
      'translationTypes',
      'addQueryToLocalStorage'
    ]),
    ...mapGetters('auth', [
      'user'
    ])
  },

  watch: {
    exampleLanguage () {
      const existingFilters = this.getTranslationFilters()
      if (this.exampleLanguage !== existingFilters?.l) {
        existingFilters.l = this.exampleLanguage
        this.addQueryToLocalStorage('/uebersetzungen', existingFilters)
        if (this.$router.prevRoutes.length > 0) {
          this.$router.prevRoutes[this.$router.prevRoutes.length - 1].query.l = this.exampleLanguage
        }
      }
    },
    currentLanguage () {
      const existingFilters = this.getTranslationFilters()
      if (this.currentLanguage !== existingFilters?.r) {
        existingFilters.r = this.currentLanguage
        this.addQueryToLocalStorage('/uebersetzungen', existingFilters)
        if (this.$router.prevRoutes.length > 0) {
          this.$router.prevRoutes[this.$router.prevRoutes.length - 1].query.r = this.currentLanguage
        }
      }
    }
  }
}
</script>
