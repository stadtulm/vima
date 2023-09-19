<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('tag')}} {{ selectedTag ? $t('editButton').toLowerCase() : $t('createButton').toLowerCase()}}
      </span>
    </v-row>
    <v-row
      v-if="selectedTag || !$route.params.id"
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
            >
              <v-row
                dense
              >
                <v-col
                  cols="12"
                >
                  <v-text-field
                    density="compact"
                    :label="$t('name')"
                    v-model="text"
                    :rules="[
                      rules.required,
                      rules.tagText,
                      rules.noBlanks
                    ]"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
            </v-form>
            <v-divider
              class="my-6"
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
                @click="saveTag()"
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

export default {
  name: 'TagEditor',

  components: {},

  data: () => ({
    selectedTag: undefined,
    isLoading: false,
    isValid: false,
    text: undefined
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
        this.selectedTag = await this.requestTag([this.$route.params.id])
      }
      if (this.selectedTag) {
        this.text = this.selectedTag.text
      }
    },
    async saveTag () {
      this.isLoading = true
      const map = {
        text: this.text
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
      'rules'
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
