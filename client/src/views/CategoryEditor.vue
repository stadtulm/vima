<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('category')}} {{ selectedCategory ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
      </span>
    </v-row>
    <v-row
      v-if="selectedCategory || !$route.params.id"
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
              ref="categoryEditorForm"
            >
              <v-row
                dense
                v-if="text"
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    ref="tabStart"
                    density="compact"
                    :label="$t('name')"
                    v-model="text.find(obj => obj.lang === currentLanguage).value"
                    :rules="[v => text.find(obj => obj.type === 'default').value !== '' || $t('defaultLanguageRequired')]"
                  >
                    <template v-slot:prepend>
                      <LanguageSelect
                        :currentLanguage="currentLanguage"
                        :languageObjects="text"
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
              <v-row
                dense
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
                        class="text-subtitle-1"
                        cols="12"
                      >
                        {{$t('pic')}} {{$t('optionalLabelExtension')}}
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        tabIndex="0"
                        @keypress="$refs.categoryUpload.fakeClick()"
                      >
                        <FileUpload
                          ref="categoryPicUpload"
                          v-model="pic"
                          @update:fileRemove="patchFileRemove()"
                          @update:fileAdd="$nextTick(() => { $refs.categoryEditorForm.validate() })"
                          :acceptedMimeTypes="['image/png', 'image/jpg', 'image/jpeg']"
                          :maxFileSize="0.5"
                          :maxFiles="1"
                          bgColor="white"
                          :scaleToFit="[400, 400]"
                        ></FileUpload>
                      </v-col>
                    </v-row>
                  </v-card>
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
                @click="saveCategory()"
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
import FileUpload from '@/components/FileUpload.vue'

export default {
  name: 'CategoryEditor',

  components: {
    FileUpload,
    LanguageSelect
  },

  data: () => ({
    selectedCategory: undefined,
    isLoading: false,
    isValid: false,
    text: undefined,
    description: undefined,
    pic: undefined,
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
    ...mapMutations('categories', {
      updateCategoryItem: 'updateItem'
    }),
    ...mapActions('categories', {
      patchCategory: 'patch',
      createCategory: 'create',
      requestCategory: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    async patchFileRemove () {
      this.isLoading = true
      try {
        await this.patchCategory([
          this.selectedCategory._id,
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
        this.selectedCategory = await this.requestCategory([this.$route.params.id, { keepTranslations: true }])
      }
      if (this.selectedCategory) {
        this.pic = this.selectedCategory.pic
        this.text = this.hydrateTranslations(this.selectedCategory.text)
        this.description = this.hydrateTranslations(this.selectedCategory.description)
      } else {
        this.text = this.hydrateTranslations()
        this.description = this.hydrateTranslations()
      }
    },
    async saveCategory () {
      this.isLoading = true
      // Do uploads
      try {
        await this.$refs.categoryPicUpload.upload()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      // Prepare map
      const map = {
        text: this.text.filter(language => language.value && language.value !== ''),
        description: this.description.filter(language => language.value && language.value !== '')
      }
      if (this.pic && this.pic.url && this.pic.credit) {
        map.pic = this.pic
      }
      try {
        let result
        if (this.selectedCategory) {
          result = await this.patchCategory([this.selectedCategory._id, map, {}])
        } else {
          result = await this.createCategory([map, {}])
        }
        this.updateCategoryItem(this.reduceTranslations(result, this.$i18n.locale, ['text', 'description']))
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
