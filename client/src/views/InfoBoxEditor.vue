<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('infoEntry')}} {{ selectedInfo ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
      </span>
    </v-row>
    <v-row
      v-if="selectedInfo || !$route.params.id"
    >
      <v-col
        cols="12"
      >
        <v-card
          color="customGreyUltraLight"
          tile
        >
          <v-card-text>
            <v-form
              v-model="isValid"
              ref="infoEditorForm"
            >
              <v-row
                v-if="title"
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    ref="tabStart"
                    density="compact"
                    :label="$t('headline')"
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
              <v-divider class="mt-4 mb-9"></v-divider>
              <v-row
                v-if="text"
                dense
                class="mb-6"
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
                        {{$t('text')}}
                      </v-col>
                    </v-row>
                    <v-row>
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
                              @update:setLanguage="(l) => { currentLanguage = l }"
                            ></LanguageSelect>
                          </template>
                          <template v-slot:default>
                            <custom-tiptap
                              v-model="text.find(obj => obj.lang === currentLanguage).value"
                              :extensions="['bold', 'italic', 'underline', 'strikethrough', 'bulletList', 'orderedList', 'link']"
                            ></custom-tiptap>
                          </template>
                        </v-input>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
              <v-divider class="my-9"></v-divider>
              <v-row
                dense
              >
                <v-col>
                  <v-checkbox
                    color="customGrey"
                    v-model="isActive"
                    :label="$t('infoActiveCheckbox')"
                  >
                  </v-checkbox>
                </v-col>
              </v-row>
              <v-divider class="my-9 mt-3"></v-divider>
              <v-row>
                <v-col
                  class="text-subtitle-2"
                  cols="12"
                >
                  {{$t('bgColor')}}
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="12"
                  class="pa-0"
                >
                  <v-color-picker
                    v-model="color"
                    :rules="[rules.required]"
                    mode="hex"
                    :modes="['hex']"
                  >
                  </v-color-picker>
                </v-col>
              </v-row>
              <v-divider class="my-9 mt-3"></v-divider>
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
                        {{$t('pics')}} {{$t('optionalLabelExtension')}}
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        tabIndex="0"
                        @keypress="$refs.infoUpload.fakeClick()"
                      >
                        <FileUpload
                          ref="infoUpload"
                          v-model="pic"
                          @update:fileRemove="patchFileRemove"
                          @update:fileAdd="$nextTick(() => { $refs.infoEditorForm.validate() })"
                          :acceptedMimeTypes="['image/png', 'image/jpg', 'image/jpeg']"
                          :maxFileSize="2"
                          :maxFiles="1"
                          bgColor="white"
                          :scaleToFit="[1080, 1080]"
                        ></FileUpload>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
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
                variant="elevated"
                color="customGrey"
                :loading="isLoading"
                :disabled="!isValid"
                @click="saveInfo()"
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
import CustomTiptap from '@/components/CustomTiptap.vue'

export default {
  name: 'InfoBoxEditor',

  components: {
    FileUpload,
    LanguageSelect,
    CustomTiptap
  },

  data: () => ({
    selectedInfo: undefined,
    isActive: true,
    isLoading: false,
    isValid: false,
    title: undefined,
    text: undefined,
    pic: undefined,
    color: '#ffffff',
    currentLanguage: 'en'
  }),

  async mounted () {
    this.currentLanguage = this.$i18n.locale
    window.load = () => {
      try {
        this.$refs.infoEditorForm.resetValidation()
      } catch (e) {}
    }
    await this.adapt()
    this.$refs.tabStart.focus()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('infos', {
      patchInfo: 'patch',
      createInfo: 'create',
      getInfo: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    async patchFileRemove () {
      this.isLoading = true
      try {
        await this.patchInfo([
          this.selectedInfo._id,
          {
            pic: null
          }
        ])
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.adapt()
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.adapt()
      }
    },
    async adapt () {
      if (this.$route.params.id) {
        this.selectedInfo = await this.getInfo([this.$route.params.id, { keepTranslations: true }])
      }
      if (this.selectedInfo) {
        this.title = this.hydrateTranslations(this.selectedInfo.title)
        this.text = this.hydrateTranslations(this.selectedInfo.text)
        this.isActive = this.selectedInfo.isActive
        this.pic = this.selectedInfo.pic
        this.color = this.selectedInfo.color
      } else {
        this.title = this.hydrateTranslations()
        this.text = this.hydrateTranslations()
      }
    },
    async saveInfo () {
      this.isLoading = true
      // Do uploads
      try {
        await this.$refs.infoUpload.upload()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      // Prepare map
      const map = {
        title: this.title.filter(language => language.value && language.value !== ''),
        isActive: this.isActive,
        text: this.sanitizedText.filter(language => language.value && language.value !== '' && language.value !== '<p></p>'),
        pic: this.pic,
        color: this.color
      }
      console.log(this.color)
      try {
        if (this.$route.params.id) {
          await this.patchInfo([this.$route.params.id, map, {}])
        } else {
          await this.createInfo([map, {}])
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
      'hydrateTranslations',
      'parseRgbString'
    ]),
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
  }
}
</script>
