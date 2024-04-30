<template>
  <div
    v-if="$settings"
  >
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('adminView')}} {{$t('translations')}}
      </span>
      <span
        class="my-3"
      >
        <v-btn
          variant="elevated"
          dark
          color="customGrey"
          :to="{ name: 'TranslationEditor' }"
        >
          {{$t('newTranslationsButton')}}
          <v-icon
            class="ml-3"
            size="18"
          >
            fas fa-plus
          </v-icon>
        </v-btn>
        <v-btn
          v-if="user.role === 'admins'"
          class="ml-3"
          variant="elevated"
          dark
          color="customGrey"
          @click="showImportDialog = true"
        >
          {{$t('importTranslationsButton')}}
          <v-icon
            class="ml-3"
            size="18"
          >
            fas fa-upload
          </v-icon>
        </v-btn>
      </span>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="queryObject.query"
          :label="$t('filterByTranslationIdLabel')"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
      <v-col>
        <v-select
          :label="$t('type')"
          :items="translationTypes"
          variant="outlined"
          density="compact"
          hide-details
          v-model="queryObject.type"
        ></v-select>
      </v-col>
      <v-col>
        <v-checkbox
          v-model="queryObject.filterExisting"
          :label="$t('filterExisting')"
          density="compact"
          hide-details
        ></v-checkbox>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          :label="$t('exampleLanguage')"
          :items="$settings.languages"
          variant="outlined"
          density="compact"
          hide-details
          v-model="queryObject.location"
        ></v-select>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          :label="$t('editLanguage')"
          :items="$settings.languages"
          variant="outlined"
          density="compact"
          hide-details
          v-model="queryObject.role"
        ></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          v-if="!initialView"
          v-model:items-per-page="queryObject.itemsPerPage"
          v-model:page="queryObject.page"
          :sort-by="queryObject.sortBy"
          :headers="headers"
          :items-length="computedTotal"
          :items="computedTranslations"
          :loading="loading"
          class="customGreyUltraLight pb-3 elevation-3"
          item-value="_id"
          @update:options="updateDataTableParams"
          sort-asc-icon="fas fa-caret-up"
          sort-desc-icon="fas fa-caret-down"
          :show-current-page="true"
          :must-sort="true"
        >
          <template
            v-slot:[`item.textId`]="{ item }"
          >
            <v-list-item-title
              class="font-weight-bold"
            >
              {{item.textId}}
            </v-list-item-title>
          </template>
          <template
            v-slot:[`item.updatedAt`]="{ item }"
          >
            {{$moment(item.updatedAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.exampleLanguage`]="{ item }"
          >
            {{item.translations.find(obj => obj.lang === queryObject.location)?.value || '-'}}
          </template>
          <template
            v-slot:[`item.editLanguage`]="{ item }"
          >
            <v-textarea
              rows="3"
              class="my-3"
              ref="tabStart"
              density="compact"
              hide-details
              v-model="item.translations.find(obj => obj.lang === queryObject.role).value"
            >
              <template
                v-slot:append-inner
              >
                <v-btn
                  :disabled="item.translations.find(obj => obj.lang === queryObject.role).value === originalTranslations.find(t => t._id === item._id)?.translations.find(obj => obj.lang === queryObject.role).value"
                  :loading="loaders['save_' + item._id]"
                  size="x-small"
                  variant="tonal"
                  icon="fas fa-save"
                  @click="saveTranslation(item, item.translations.find(obj => obj.lang === queryObject.role))"
                ></v-btn>
              </template>
            </v-textarea>
          </template>
          <template
            v-slot:[`item.edit`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fa fa-pen"
                    size="small"
                    color="customGrey"
                    class="my-3"
                    :to="{ name: 'TranslationEditor', params: { id: item._id } }"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('editButton')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fa fa-trash"
                    size="small"
                    color="customGrey"
                    class="my-4"
                    :loading="loaders['delete_' + item._id]"
                    @click="deleteTranslation(item._id)"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('deleteButton')}}
            </v-tooltip>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row
      v-if="user.role === 'admins'"
    >
      <v-col>
        <v-btn
          block
          dense
          variant="elevated"
          color="customGrey"
          @loading="loaders.download"
          @click="downloadJson()"
        >
          {{$t('download')}}
          <v-icon
            class="ml-3"
          >
            fas fa-download
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <!-- Import dialog -->
    <v-dialog
      v-model="showImportDialog"
      max-width="1200"
    >
      <v-card
        color="customGreyUltraLight"
        tile
      >
        <v-card-text
          class="pa-8"
        >
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('importTranslations')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-checkbox
                density="compact"
                :label="$t('overwriteExisting')"
                v-model="overwriteExisting"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                density="compact"
                :label="$t('type')"
                v-model="importType"
                :items="translationTypes"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                density="compact"
                :label="$t('editLanguage')"
                v-model="importLanguage"
                :items="$settings.languages"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-file-input
                density="compact"
                :label="$t('selectJSONFile')"
                accept="application/json"
                v-model="importFile"
                :error-messages="importError"
              >
                <template slot:append-inner>
                  <v-icon>
                    fas fa-times
                  </v-icon>
                </template>
              </v-file-input>
            </v-col>
          </v-row>
        </v-card-text>
        <v-toolbar
          class="mt-2 pa-4"
        >
          <v-btn
            variant="elevated"
            @click="resetImportForm()"
          >
            {{$t('cancelButton')}}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="!parsedImportFile || !importLanguage || !importType"
            variant="elevated"
            color="customGrey"
            @click="importFromFile()"
          >
            {{$t('importButton')}}
          </v-btn>
        </v-toolbar>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'TranslationList',

  components: {
  },

  data: () => ({
    parsedImportFile: undefined,
    importError: undefined,
    importLanguage: undefined,
    importType: undefined,
    importFile: undefined,
    overwriteExisting: false,
    showImportDialog: false,
    loaders: {},
    loading: true,
    initialView: true,
    translationsResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'textId', order: 'desc' }],
      location: 'en',
      role: 'en',
      type: 'client'
    },
    originalTranslations: undefined
  }),

  async mounted () {
    await this.adaptQuery()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapMutations('translations', {
      updateTranslationItem: 'updateItem'
    }),
    ...mapActions('translator', {
      updateTranslations: 'update',
      findTranslationJsons: 'find'
    }),
    ...mapActions('translations', {
      findTranslations: 'find',
      patchTranslation: 'patch',
      removeTranslation: 'remove',
      createTranslation: 'create'
    }),
    // TODO: Export to json
    async downloadJson () {
      this.loaders.downloiad = true
      try {
        const result = await this.findTranslationJsons()
        // Prepare download
        const downloadAnchorNode = document.createElement('a')
        const arr = new Uint8Array(result[0])
        const blob = new Blob([arr])
        downloadAnchorNode.setAttribute('href', URL.createObjectURL(blob, { type: 'application/zip' }))
        downloadAnchorNode.setAttribute('download', 'translation_files_' + Date.now() + '.zip')
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()

        // TODO CHANGE MESSAGE
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        console.log(e)
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async importFromFile () {
      this.loaders.import = true
      try {
        await this.updateTranslations([this.importLanguage, this.parsedImportFile, { translationType: this.importType, overwriteExisting: this.overwriteExisting }])
        this.loaders.import = false
        this.resetImportForm()
        this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.loaders.import = false
        this.importError = e.message
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        console.log(e)
      }
    },
    resetImportForm () {
      this.showImportDialog = false
      this.importFile = undefined
      this.importLanguage = undefined
      this.importType = undefined
    },
    async saveTranslation (item, translation) {
      this.loaders['save_' + item._id] = true
      // Prepare map
      const map = {
        translations: item.translations.filter(language => language.value && language.value !== '')
      }
      // TODO: Do that on server
      translation.edits.push({
        author: this.user._id,
        ts: new Date()
      })
      try {
        await this.patchTranslation([item._id, map, {}])
        this.loaders['save_' + item._id] = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.loaders['save_' + item._id] = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
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
    async updateDataTableParams (e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query,
          location: this.queryObject.location,
          role: this.queryObject.role,
          type: this.queryObject.type
        }
        this.updateQueryQuery(this.queryObject.query)
        this.updateQueryPage(this.queryObject.page)
        this.updateQueryItemsPerPage(e.itemsPerPage)
        this.updateQueryLocation(this.queryObject.location)
        this.updateQueryRole(this.queryObject.role)
        this.updateQueryType(this.queryObject.type)
        if (e.sortBy[0]) {
          this.updateQuerySortBy(e.sortBy[0].key)
          this.updateQuerySortOrder(e.sortBy[0].order)
        }
      }
    },
    async loadDataTableEntities () {
      this.loading = false
      this.translationsResponse = await this.findTranslations(
        this.translationParams
      )
    },
    async deleteTranslation (id) {
      this.loaders['delete_' + id] = true
      try {
        await this.removeTranslation(id)
        this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.loaders['delete_' + id] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.loaders['delete_' + id] = undefined
      }
    }
  },

  computed: {
    ...mapGetters([
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder',
      'updateQueryLocation',
      'updateQueryRole',
      'updateQueryType',
      'translationTypes',
      'rules'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    headers () {
      return [
        { title: this.$t('textId'), key: 'textId' },
        { title: this.$t('createdAt'), key: 'createdAt' },
        { title: this.$t('updatedAt'), key: 'updatedAt' },
        { title: this.$t('exampleLanguage'), key: 'exampleLanguage', sortable: false },
        { title: this.$t('editLanguage'), key: 'editLanguage', minWidth: '350', sortable: false },
        { title: this.$t('editButton'), key: 'edit', sortable: false, align: 'center' },
        { title: this.$t('deleteButton'), key: 'delete', align: 'center', sortable: false }
      ]
    },
    translationParams () {
      const query = {
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      query.$and = [
        { type: this.queryObject.type }
      ]
      if (this.queryObject.query) {
        query.$and.push({ textId: { $regex: this.queryObject.query, $options: 'i' } })
      }
      if (this.queryObject.filterExisting) {
        query.$and = query.$and.concat({ $or: [{ 'translations.lang': { $ne: this.queryObject.role } }, { 'translations.value': { $eq: '' } }] })
      }
      return {
        query
      }
    },
    computedTranslations () {
      if (this.translationsResponse?.data) {
        return this.translationsResponse.data.map(translation => ({ ...translation, translations: this.hydrateTranslations(translation.translations) }))
      } else {
        return []
      }
    },
    computedTotal () {
      if (this.translationsResponse) {
        return this.translationsResponse.tital
      } else {
        return 0
      }
    },
    computedLimit () {
      if (this.queryObject.itemsPerPage === -1) {
        return 1000000
      } else {
        return this.queryObject.itemsPerPage
      }
    },
    computedSkip () {
      let tmpSkip = 0
      if (this.queryObject.itemsPerPage !== -1) {
        tmpSkip = this.queryObject.itemsPerPage
      }
      return (this.queryObject.page - 1) * tmpSkip
    },
    computedSortOrder () {
      if (this.queryObject.sortBy[0].order === 'desc') {
        return 1
      } else {
        return -1
      }
    }
  },

  watch: {
    importFile () {
      this.importError = undefined
      if (this.importFile) {
        const reader = new FileReader()
        reader.readAsText(this.importFile[0])
        reader.onload = () => {
          try {
            this.parsedImportFile = JSON.parse(reader.result)
          } catch (e) {
            console.log(e)
            this.importError = e.message
          }
        }
      }
    },
    'queryObject.query' () {
      this.updateQueryQuery(this.queryObject.query)
    },
    async 'queryObject.location' () {
      this.updateQueryLocation(this.queryObject.location)
      await this.loadDataTableEntities()
    },
    async 'queryObject.role' () {
      this.updateQueryRole(this.queryObject.role)
      await this.loadDataTableEntities()
    },
    async 'queryObject.type' () {
      this.updateQueryType(this.queryObject.type)
      await this.loadDataTableEntities()
    },
    translationParams: {
      deep: true,
      async handler (newValue, oldValue) {
        if (
          !this.initialView &&
          JSON.stringify(newValue) !== JSON.stringify(oldValue)
        ) {
          await this.loadDataTableEntities()
        }
      }
    },
    translationsResponse: {
      deep: true,
      async handler (newValue, oldValue) {
        await this.$nextTick()
        this.originalTranslations = JSON.parse(JSON.stringify(this.computedTranslations))
      }
    }
  }
}
</script>
