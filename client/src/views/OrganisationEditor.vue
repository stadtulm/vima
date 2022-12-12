<template>
  <v-row
    v-if="selectedOrganisation || !$route.params.organisation"
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
              {{$t('organisation')}} {{ selectedOrganisation ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
            </v-col>
          </v-row>
          <v-form
            v-model="isValid"
            ref="organisationsEditorForm"
          >
            <v-row
              dense
            >
              <v-col
                cols="12"
              >
                <v-text-field
                  ref="tabStart"
                  dense
                  outlined
                  color="customGrey"
                  :label="$t('name')"
                  background-color="#fff"
                  v-model="name"
                  :rules="[rules.required]"
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row
              dense
            >
              <v-col
                cols="12"
              >
                <v-textarea
                  dense
                  outlined
                  color="customGrey"
                  v-model="description"
                  background-color="#fff"
                  :label="$t('description') + ' ' + $t('optionalLabelExtension')"
                  :rules="[rules.longText]"
                >
                </v-textarea>
              </v-col>
            </v-row>
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
                  v-model="website"
                  background-color="#fff"
                  :label="$t('website') + ' ' + $t('optionalLabelExtension')"
                  :rules="[rules.shortText, rules.webLink]"
                >
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
                  :label="$t('organisationActiveCheckbox')"
                >
                </v-checkbox>
              </v-col>
            </v-row>
            <v-row>
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
                      {{$t('pic')}} {{$t('optionalLabelExtension')}}
                    </v-col>
                  </v-row>
                  <v-row
                    dense
                  >
                    <v-col
                      cols="12"
                      tabIndex="0"
                      @keypress="$refs.organisationUpload.fakeClick()"
                    >
                      <FileUpload
                        ref="organisationUpload"
                        v-model="pic"
                        @fileRemove="patchFileRemove"
                        @fileAdd="$nextTick(() => { $refs.organisationsEditorForm.validate() })"
                        :acceptedMimeTypes="['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml']"
                        :maxFileSize="0.5"
                        :maxFiles="1"
                        bgColor="white"
                        :scaleToFit="[400, 400]"
                        :resizeQuality="75"
                      ></FileUpload>
                    </v-col>
                  </v-row>
                </v-card>
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
              @click="saveOrganisation()"
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
import FileUpload from '@/components/FileUpload.vue'

export default {
  name: 'OrganisationEditor',

  components: {
    FileUpload
  },

  data: () => ({
    selectedOrganisation: undefined,
    isLoading: false,
    isValid: false,
    name: undefined,
    description: undefined,
    pic: undefined,
    website: undefined,
    isActive: undefined
  }),

  async mounted () {
    await this.adapt()
    this.$refs.tabStart.focus()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('organisations', {
      patchOrganisation: 'patch',
      createOrganisation: 'create',
      requestOrganisation: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    async patchFileRemove () {
      this.isLoading = true
      try {
        await this.patchOrganisation([
          this.selectedOrganisation._id,
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
      if (this.$route.params.organisation) {
        let selectedOrganisation = this.getOrganisation(this.$route.params.organisation)
        if (!selectedOrganisation) {
          selectedOrganisation = await this.requestOrganisation([this.$route.params.organisation])
        }
        this.selectedOrganisation = selectedOrganisation
      }
      if (this.selectedOrganisation) {
        this.pic = this.selectedOrganisation.pic
        this.name = this.selectedOrganisation.name
        this.description = this.selectedOrganisation.description
        this.website = this.selectedOrganisation.website
        this.isActive = this.selectedOrganisation.isActive
      }
    },
    async saveOrganisation () {
      this.isLoading = true
      // Do uploads
      try {
        await this.$refs.organisationUpload.upload()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      const map = {
        name: this.name,
        description: this.description,
        website: this.website,
        isActive: this.isActive,
        pic: this.pic
      }
      try {
        if (this.selectedOrganisation) {
          await this.patchOrganisation([this.selectedOrganisation._id, map, {}])
        } else {
          await this.createOrganisation([map, {}])
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
      's3'
    ]),
    ...mapGetters('auth', [
      'user'
    ]),
    ...mapGetters('organisations', {
      getOrganisation: 'get'
    })
  }
}
</script>
