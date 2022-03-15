<template>
  <div>
    <v-row
      v-if="selectedSite || !$route.params.site"
    >
      <v-col
        cols="12"
      >
        <v-card
          color="customGreyUltraLight"
          tile
        >
          <v-card-text>
            <v-row
              class="mb-3"
            >
              <v-col
                class="text-h5 font-weight-bold"
              >
                {{$t('siteEntry')}} {{ selectedSite ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
              </v-col>
            </v-row>
            <v-form
              v-model="isValid"
              ref="siteEditorForm"
            >
              <v-row
                dense
              >
                <v-col>
                  <v-select
                    dense
                    color="customGrey"
                    item-color="customGrey"
                    background-color="#fff"
                    outlined
                    v-model="type"
                    :label="$t('type')"
                    :rules="[rules.required]"
                    :items="[
                      { text: $t('imprint'), value: 'imprint', disabled: !computedTypes || computedTypes.includes('imprint') },
                      { text: $t('privacy'), value: 'privacy', disabled: !computedTypes || computedTypes.includes('privacy')},
                      { text: $t('contact'), value: 'contact', disabled: !computedTypes || computedTypes.includes('contact')},
                      { text: $t('aboutIleu'), value: 'ileu', disabled: !computedTypes || computedTypes.includes('ileu')},
                      { text: $t('aboutVima'), value: 'vima', disabled: !computedTypes || computedTypes.includes('vima')},
                      { text: $t('aboutVives'), value: 'vives', disabled: !computedTypes || computedTypes.includes('vives')},
                      { text: $t('communicationRules'), value: 'communicationrules', disabled: !computedTypes || computedTypes.includes('communicationrules')}
                    ]"
                  >
                  </v-select>
                </v-col>
              </v-row>
              <v-row
                dense
                class="mb-6"
                v-if="text"
              >
                <v-col
                  cols="12"
                >
                  <v-card
                    flat
                    color="customGreyUltraLight"
                  >
                    <v-row>
                      <v-col
                        class="subtitle-1"
                        cols="12"
                      >
                        {{$t('text')}}
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                      >
                        <v-input
                          :rules="[v => (text.find(obj => obj.type === 'default').value !== '' && text.find(obj => obj.type === 'default').value !== '<p></p>') || $t('defaultLanguageRequired')]"
                          v-model="text.find(obj => obj.lang === currentLanguage).value"
                          width="100%"
                        >
                          <template v-slot:prepend>
                            <LanguageSelect
                              :currentLanguage="currentLanguage"
                              :languageObjects="text"
                              @setLanguage="(l) => { currentLanguage = l }"
                            ></LanguageSelect>
                          </template>
                          <template slot="default">
                            <tiptap-vuetify
                              :editor-properties="{
                                disableInputRules: true,
                                disablePasteRules: true
                              }"
                              color="customGreyUltraLight"
                              v-model="text.find(obj => obj.lang === currentLanguage).value"
                              :card-props="{ tile: true, flat: true }"
                              style="border: 1px solid #aaa;"
                              :extensions="extensions"
                              :placeholder="$t('enterText')"
                            >
                            </tiptap-vuetify>
                          </template>
                        </v-input>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
              <v-divider class="my-9 mt-3"></v-divider>
            </v-form>
            <v-card-actions
              class="px-0"
            >
              <v-btn
                block
                :dark="isValid"
                color="customGrey"
                :loading="isLoading"
                :disabled="!isValid"
                @click="saveSite()"
              >
                {{$t('saveDataButton')}}
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import { TiptapVuetify, Bold, Italic, Strike, Underline, BulletList, OrderedList, ListItem, Link, Heading } from 'tiptap-vuetify'
import LanguageSelect from '@/components/LanguageSelect.vue'

export default {
  name: 'SiteEditor',

  components: {
    TiptapVuetify,
    LanguageSelect
  },

  data: () => ({
    type: undefined,
    selectedSite: undefined,
    isLoading: false,
    isValid: false,
    text: undefined,
    currentLanguage: 'en',
    extensions: [
      Bold,
      Italic,
      Underline,
      Strike,
      ListItem,
      BulletList,
      OrderedList,
      Link,
      [Heading, {
        options: {
          levels: [1, 2, 3]
        }
      }]
    ]
  }),

  async mounted () {
    this.currentLanguage = this.$i18n.locale
    await this.adapt()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('sites', {
      patchSite: 'patch',
      createSite: 'create',
      requestSite: 'get',
      findSites: 'find'
    }),
    async adapt () {
      if (this.$route.params.site) {
        let selectedSite = this.getSite(this.$route.params.site)
        if (!selectedSite) {
          selectedSite = await this.requestSite([this.$route.params.site])
        }
        this.selectedSite = selectedSite
      }
      if (this.selectedSite) {
        this.type = this.selectedSite.type
        this.text = this.hydrateTranslations(this.selectedSite.text)
      } else {
        this.text = this.hydrateTranslations()
      }
    },
    async saveSite () {
      this.isLoading = true
      const map = {
        type: this.type,
        text: this.sanitizedText.filter(language => language.value && language.value !== '' && language.value !== '<p></p>')
      }
      try {
        if (this.$route.params.site) {
          await this.patchSite([this.$route.params.site, map, {}])
        } else {
          await this.createSite([map, {}])
        }
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
      's3',
      'hydrateTranslations'
    ]),
    ...mapGetters('sites', {
      getSite: 'get'
    }),
    ...mapGetters('auth', [
      'user'
    ]),
    sanitizedText () {
      return this.text.map(language => {
        return {
          ...language,
          value: this.$sanitize(language.value)
        }
      })
    }
  },

  asyncComputed: {
    async computedTypes () {
      const types = await this.findSites(
        [
          {
            query: {
              $select: { type: 1 }
            }
          }
        ]
      )
      return types.data.map(obj => obj.type)
    }
  }
}
</script>
