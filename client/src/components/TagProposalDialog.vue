<template>
  <div>
    <!-- Tag dialog -->
    <v-dialog
      max-width="600"
      persistent
      :model-value="showTagProposalDialog"
    >
      <v-card
        color="customGreyUltraLight"
        tile
      >
        <v-card-text>
          <v-row
            class="pt-6 mb-3"
          >
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('newTagButton')}}
            </v-col>
          </v-row>
          <v-form
            ref="tagProposalForm"
            v-model="isValidTagProposal"
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
                  v-model="tagProposal"
                  :rules="[
                    rules.required,
                    rules.tagText,
                    rules.noBlanks,
                  ]"
                >
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-toolbar
          class="mt-2 pa-3"
        >
          <v-btn
            variant="elevated"
            @click="$emit('closeTagProposalDialog')"
          >
            {{$t('cancelButton')}}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            variant="elevated"
            color="customGrey"
            :loading="isTagLoading"
            :disabled="!isValidTagProposal"
            @click="saveTag()"
          >
            {{$t('tag')}} {{$t('send')}}
          </v-btn>
        </v-toolbar>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'TagProposalDialog',

  components: {
  },

  props: [
    'showTagProposalDialog'
  ],

  data: () => ({
    isTagLoading: false,
    tagProposal: undefined,
    isValidTagProposal: false
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('tags', {
      createTag: 'create'
    }),
    async saveTag () {
      this.isTagLoading = true
      try {
        await this.createTag([
          {
            text: this.tagProposal
          }
        ])
        this.isTagLoading = false
        this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
        this.tagProposal = ''
        this.$refs.tagProposalForm.reset()
        this.$emit('closeTagProposalDialog')
      } catch (e) {
        this.isTagLoading = false
        this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
      }
    }
  },

  computed: {
    ...mapGetters([
      'rules'
    ]),
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
