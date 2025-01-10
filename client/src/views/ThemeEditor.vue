<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('theme')}} {{ selectedTheme ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
      </span>
    </v-row>
    <v-row
      v-if="selectedTheme || !$route.params.theme"
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
              ref="themeEditorForm"
            >
              <v-row
                dense
                v-if="title"
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    ref="tabStart"
                    density="compact"
                    :label="$t('name')"
                    v-model="title.find(obj => obj.lang === currentLanguage).value"
                    :rules="[v => title.find(obj => obj.type === 'default').value !== '' || $t('defaultLanguageRequired')]"
                  >
                    <template v-slot:prepend>
                      <LanguageSelect
                        :currentLanguage="currentLanguage"
                        :languageObjects="title"
                        @update:setLanguage="(l) => { currentLanguage = l }"
                      ></LanguageSelect>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row
                dense
                v-if="description"
              >
                <v-col
                  cols="12"
                >
                  <v-textarea
                    density="compact"
                    v-model="description.find(obj => obj.lang === currentLanguage).value"
                    :label="$t('description') + ' ' + $t('optionalLabelExtension')"
                    :rules="[rules.shortText]"
                  >
                    <template v-slot:prepend>
                      <LanguageSelect
                        :currentLanguage="currentLanguage"
                        :languageObjects="description"
                        @update:setLanguage="(l) => { currentLanguage = l }"
                      ></LanguageSelect>
                    </template>
                  </v-textarea>
                </v-col>
              </v-row>
              <v-divider
                class="my-9"
              ></v-divider>
            </v-form>
            <v-divider
              class="mb-6 mt-9"
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
                @click="saveTheme()"
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
  name: 'ThemeEditor',

  components: {
    LanguageSelect
  },

  data: () => ({
    selectedTheme: undefined,
    isLoading: false,
    isValid: false,
    title: undefined,
    description: undefined,
    currentLanguage: 'en'
  }),

  async mounted () {
    this.currentLanguage = this.$i18n.locale
    await this.adapt()
    this.$refs.tabStart.focus()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapMutations('themes', {
      updateThemeItem: 'updateItem'
    }),
    ...mapActions('themes', {
      patchTheme: 'patch',
      createTheme: 'create',
      requestTheme: 'get'
    }),
    async adapt () {
      if (this.$route.params.theme) {
        this.selectedTheme = await this.requestTheme([this.$route.params.theme, { keepTranslations: true }])
      }
      if (this.selectedTheme) {
        this.title = this.hydrateTranslations(this.selectedTheme.title)
        this.description = this.hydrateTranslations(this.selectedTheme.description)
      } else {
        this.title = this.hydrateTranslations()
        this.description = this.hydrateTranslations()
      }
    },
    async saveTheme () {
      this.isLoading = true
      // Prepare map
      const map = {
        title: this.title.filter(language => language.value && language.value !== ''),
        description: this.description.filter(language => language.value && language.value !== '')
      }
      try {
        let result
        if (this.selectedTheme) {
          result = await this.patchTheme([this.selectedTheme._id, map, {}])
        } else {
          result = await this.createTheme([map, {}])
        }
        this.updateThemeItem(this.reduceTranslations(result, this.$i18n.locale, ['title', 'description']))
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
      'reduceTranslations',
      'hydrateTranslations'
    ]),
    ...mapGetters('auth', [
      'user'
    ])
  }
}
</script>
