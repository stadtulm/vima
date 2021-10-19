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
                  v-model="name"
                  :rules="[rules.required, rules.tagText, rules.noBlanks, v => !!v && !tags.map(obj => obj.name.toLowerCase()).includes(v.toLowerCase()) || $t('tagExistsError')]"
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

export default {
  name: 'TagEditor',

  data: () => ({
    selectedTag: undefined,
    isLoading: false,
    isValid: false,
    name: undefined,
    isActive: true
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
        let selectedTag = this.getTag(this.$route.params.id)
        if (!selectedTag) {
          selectedTag = await this.requestTag([this.$route.params.id])
        }
        this.selectedTag = selectedTag
      }
      if (this.selectedTag) {
        this.name = this.selectedTag.name
        this.isActive = this.selectedTag.isActive
      }
    },
    async saveTag () {
      this.isLoading = true
      const map = {
        name: this.name,
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
      's3'
    ]),
    ...mapGetters('auth', [
      'user'
    ]),
    ...mapGetters('tags', {
      tags: 'list',
      getTag: 'get'
    })
  }
}
</script>
