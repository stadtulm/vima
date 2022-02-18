<template>
  <v-row
    v-if="selectedTag || !$route.params.id"
  >
    <v-col
      cols="12"
    >
      <v-card
        color="customGreyBg"
        tile
      >
        <v-card-text>
          <v-row
            class="mb-3"
          >
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('tag')}} {{ selectedTag ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
            </v-col>
          </v-row>
          <v-form
            v-model="isValid"
          >
            <v-row
              dense
            >
              <v-col
                cols="12"
              >
                <v-text-field
                  dense
                  outlined
                  color="customGrey"
                  :label="$t('name')"
                  background-color="#fff"
                  v-model="text.find(obj => obj.lang === currentLanguage).value"
                  :rules="[
                    v => text.find(obj => obj.type === 'default').value !== '' || $t('defaultLanguageRequired'),
                    rules.tagText,
                    rules.noBlanks
                  ]"
                >
                  <template v-slot:prepend>
                    <LanguageSelect
                      :currentLanguage="currentLanguage"
                      :languageObjects="text"
                      @setLanguage="(l) => { currentLanguage = l }"
                    ></LanguageSelect>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
            <v-row
              dense
            >
              <v-col>
                <v-checkbox
                  color="customGrey"
                  v-model="isActive"
                  :label="$t('tagActiveCheckbox')"
                >
                </v-checkbox>
              </v-col>
            </v-row>
          </v-form>
          <v-card-actions
            class="px-0"
          >
            <v-btn
              block
              large
              :dark="isValid"
              color="customGrey"
              :loading="isLoading"
              :disabled="!isValid"
              @click="saveTag()"
            >
              {{$t('saveDataButton')}}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import LanguageSelect from '@/components/LanguageSelect.vue'

export default {
  name: 'TagEditor',

  components: {
    LanguageSelect
  },

  data: () => ({
    selectedTag: undefined,
    isLoading: false,
    isValid: false,
    text: undefined,
    isActive: true,
    currentLanguage: 'de'
  }),

  async mounted () {
    await this.adapt()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('tags', {
      patchTag: 'patch',
      createTag: 'create',
      requestTag: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    async adapt () {
      if (this.$route.params.id) {
        this.selectedTag = await this.requestTag([this.$route.params.id, { keepTranslations: true }])
      }
      if (this.selectedTag) {
        this.text = this.hydrateTranslations(this.selectedTag.text)
        this.isActive = this.selectedTag.isActive
      }
    },
    async saveTag () {
      this.isLoading = true
      const map = {
        text: this.text.filter(language => language.value && language.value !== ''),
        isActive: this.isActive
      }
      try {
        if (this.selectedTag) {
          await this.patchTag([this.selectedTag._id, map, {}])
        } else {
          await this.createTag([map, {}])
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
      'hydrateTranslations'
    ]),
    ...mapGetters('auth', [
      'user'
    ]),
    ...mapGetters('tags', {
      tags: 'list'
    })
  }
}
</script>
