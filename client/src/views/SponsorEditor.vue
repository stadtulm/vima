<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('sponsor')}} {{ selectedSponsor ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
      </span>
    </v-row>
    <v-row
      v-if="selectedSponsor || !$route.params.sponsor"
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
              ref="sponsorsEditorForm"
            >
              <v-row
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    ref="tabStart"
                    density="compact"
                    :label="$t('name')"
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
                  <v-text-field
                    density="compact"
                    v-model="link"
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
                  <v-select
                    density="compact"
                    v-model="position"
                    :label="$t('position')"
                    :items="Array.from({length: 1000}, (_, i) => i + 1)"
                    :rules="[rules.required]"
                  >
                  </v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="12"
                >
                  <v-card
                    flat
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
                        @keypress="$refs.sponsorUpload.fakeClick()"
                      >
                        <FileUpload
                          ref="sponsorUpload"
                          v-model="pic"
                          @update:fileRemove="patchFileRemove"
                          @update:fileAdd="$nextTick(() => { $refs.sponsorsEditorForm.validate() })"
                          :acceptedMimeTypes="['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml']"
                          :maxFileSize="0.5"
                          :maxFiles="1"
                          bgColor="customGreyUltraLight"
                          :scaleToFit="[400, 400]"
                        ></FileUpload>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
            <v-divider
              class="my-9 mb-6"
            ></v-divider>
            <v-toolbar
              class="pa-0"
              color="transparent"
            >
              <v-btn
                block
                size="large"
                variant="elevated"
                color="customGrey"
                :loading="isLoading"
                :disabled="!isValid"
                @click="saveSponsor()"
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
import FileUpload from '@/components/FileUpload.vue'

export default {
  name: 'SponsorEditor',

  components: {
    FileUpload
  },

  data: () => ({
    selectedSponsor: undefined,
    isLoading: false,
    isValid: false,
    name: undefined,
    pic: undefined,
    link: undefined,
    position: undefined
  }),

  async mounted () {
    await this.adapt()
    this.$refs.tabStart.focus()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('sponsors', {
      patchSponsor: 'patch',
      createSponsor: 'create',
      requestSponsor: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    async patchFileRemove () {
      this.isLoading = true
      try {
        await this.patchSponsor([
          this.selectedSponsor._id,
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
      if (this.$route.params.sponsor) {
        let selectedSponsor = this.getSponsor(this.$route.params.sponsor)
        if (!selectedSponsor) {
          selectedSponsor = await this.requestSponsor([this.$route.params.sponsor])
        }
        this.selectedSponsor = selectedSponsor
      }
      if (this.selectedSponsor) {
        this.pic = this.selectedSponsor.pic
        this.name = this.selectedSponsor.name
        this.link = this.selectedSponsor.link
        this.position = this.selectedSponsor.position
      }
    },
    async saveSponsor () {
      this.isLoading = true
      // Do uploads
      try {
        await this.$refs.sponsorUpload.upload()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      const map = {
        name: this.name,
        link: this.link,
        pic: this.pic,
        position: this.position
      }
      try {
        if (this.selectedSponsor) {
          await this.patchSponsor([this.selectedSponsor._id, map, {}])
        } else {
          await this.createSponsor([map, {}])
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
    ...mapGetters('sponsors', {
      getSponsor: 'get'
    })
  }
}
</script>
