<template>
  <v-row>
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
              {{$t('editSettings')}}
            </v-col>
          </v-row>
          <v-form
            v-model="isValid"
            ref="settingsForm"
          >
            <Upload
              :optional="false"
              :label="$t('brand')"
              :parent="settings[0]"
              path="headerLogo"
              :maxFilesize="2"
              :maxFiles="1"
              resolutionString="1400x400"
              :resizeWidth="1080"
              resizeMethod="contain"
              :resizeQuality="0.5"
              :patchParentMethod="patchSettings"
              titleType="title"
              bgColor="customGreyUltraLight"
            ></Upload>
            <v-divider
              :class="headerLogo ? 'mb-9 mt-5' : 'mb-9 mt-12'"
            ></v-divider>
            <v-row>
              <v-col
                class="title"
              >
                {{$t('colors')}}
              </v-col>
            </v-row>
            <v-row
              class="mb-4"
            >
              <!-- Header color -->
              <v-col
                cols="12"
                md="6"
              >
                <v-card
                  flat
                >
                  <v-card-text>
                    <v-row>
                      <v-col
                        class="title text-center"
                        cols="12"
                      >
                        {{$t('headerColor')}}
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        cols="12"
                        class="pa-0"
                      >
                        <v-color-picker
                          v-model="headerColor"
                          hide-canvas
                          width="100%"
                          :rules="[rules.required]"
                        >
                        </v-color-picker>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
              <!-- Indicator color -->
              <v-col
                cols="12"
                md="6"
              >
                <v-card
                  flat
                >
                  <v-card-text>
                    <v-row>
                      <v-col
                        class="title text-center"
                        cols="12"
                      >
                        {{$t('indicatorColor')}}
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        cols="12"
                        class="pa-0"
                      >
                        <v-color-picker
                          v-model="indicatorColor"
                          hide-canvas
                          width="100%"
                          :rules="[rules.required]"
                        >
                        </v-color-picker>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-divider
              class="my-9"
            ></v-divider>
            <v-row>
              <v-col
                class="title"
              >
                {{$t('modules')}}
              </v-col>
            </v-row>
            <v-row
              class="mb-4"
            >
              <v-col
                cols="12"
                md="6"
                v-for="(module, key) in modules"
                :key="key"
              >
                <v-card>
                  <v-card-text>
                    <v-row>
                      <v-col
                        class="title"
                      >
                        {{$t(key)}}
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-switch
                          :label="$t('isActiveModule')"
                          v-model="module.isActive"
                          color="customGrey"
                        ></v-switch>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-select
                          dense
                          color="customGrey"
                          item-color="customGrey"
                          outlined
                          v-model="module.position"
                          :label="$t('position')"
                          :items="Array.from({length: Object.keys(modules).length}, (_, i) => i + 1)"
                          :disabled="user.role !== 'admins'"
                          :rules="[rules.required, v => Object.keys(modules).map(k => modules[k].position).filter(p => v === p).length === 1 || $t('uniquePositionError')]"
                        >
                        </v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      v-if="module.color"
                    >
                      <v-col>
                        <v-card
                          flat
                        >
                          <v-card-text>
                            <v-row>
                              <v-col
                                class="subtitle-2"
                                cols="12"
                              >
                                {{$t('color')}}
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col
                                cols="12"
                                class="pa-0"
                              >
                                <v-color-picker
                                  v-model="module.color"
                                  hide-canvas
                                  width="100%"
                                  :rules="[rules.required]"
                                >
                                </v-color-picker>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-row
                      v-if="module.bgColor"
                    >
                      <v-col>
                        <v-card
                          flat
                        >
                          <v-card-text>
                            <v-row>
                              <v-col
                                class="subtitle-2"
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
                                  v-model="module.bgColor"
                                  hide-canvas
                                  width="100%"
                                  :rules="[rules.required]"
                                >
                                </v-color-picker>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-row
                      v-if="module.gradientColor"
                    >
                      <v-col>
                        <v-card
                          flat
                        >
                          <v-card-text>
                            <v-row>
                              <v-col
                                class="subtitle-2"
                                cols="12"
                              >
                                {{$t('gradientColor')}}
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col
                                cols="12"
                                class="pa-0"
                              >
                                <v-color-picker
                                  v-model="module.gradientColor"
                                  hide-canvas
                                  width="100%"
                                  :rules="[rules.required]"
                                >
                                </v-color-picker>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                    <Upload
                      :optional="false"
                      :label="$t('pic')"
                      :parent="settings[0]"
                      :path="'modules.' + key + '.pic'"
                      :maxFilesize="1"
                      :maxFiles="1"
                      resolutionString="1400x400"
                      :resizeWidth="1080"
                      resizeMethod="contain"
                      :resizeQuality="0.5"
                      :patchParentMethod="patchSettings"
                      titleType="subtitle-2"
                      bgColor="white"
                    ></Upload>
                  </v-card-text>
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
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import Upload from '@/components/Upload.vue'

export default {
  name: 'SettingsEditor',

  components: {
    Upload
  },

  data: () => ({
    headerColor: undefined,
    indicatorColor: undefined,
    modules: undefined,
    isQueued: false,
    isLoading: false,
    isValid: false,
    headerLogo: undefined
  }),

  async mounted () {
    await this.adapt()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('settings', {
      patchSettings: 'patch',
      createOrganisation: 'create',
      requestOrganisation: 'get'
    }),
    ...mapActions('uploads', {
      removeUpload: 'remove'
    }),
    async adapt () {
      if (this.settings) {
        this.headerColor = this.settings[0].headerColor
        this.indicatorColor = this.settings[0].indicatorColor
        this.modules = this.settings[0].modules
        this.$nextTick(() => {
          this.$refs.settingsForm.validate()
        })
      }
    },
    async saveOrganisation () {
      this.isLoading = true
      const map = {
        name: this.name,
        description: this.description,
        website: this.website,
        isActive: this.isActive
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
    }),
    ...mapGetters('settings', {
      settings: 'list'
    })
  },

  watch: {
    modules: {
      deep: true,
      handler () {
        this.$refs.settingsForm.validate()
      }
    }
  }
}
</script>
