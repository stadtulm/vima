<template>
  <div
    v-if="message || selectedViolation"
  >
    <!-- Violation dialog -->
    <v-dialog
      max-width="800"
      persistent
      :value="showViolationDialog"
      @click:outside="closeViolationDialog()"
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
              {{$t('reportButton')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="font-weight-bold pb-0"
            >
              {{$t('reportedText')}} {{selectedViolation ? $t('by') + ' ' + selectedViolation.originalAuthor : ''}} {{computedMessage ? '' : ' - ' + $t('deleted')}}:
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-alert
                color="warning"
                dark
                v-html="selectedViolation ? selectedViolation.originalMessage : computedMessage.text.value"
              >
              </v-alert>
              <v-row
                v-if="computedMessage && computedMessage.pics && computedMessage.pics.length > 0"
                class="my-3"
              >
                <v-col
                  cols=2
                  v-for="(pic, i) in computedMessage.pics"
                  :key="i"
                >
                  <Lightbox
                    :pic="pic"
                  ></Lightbox>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <template
            v-if="selectedViolation"
          >
            <v-row
              v-if="computedMessage"
            >
              <v-col>
                <v-btn
                  :loading="isDeleting"
                  color="error"
                  @click="deleteMessage(computedMessage)"
                >
                  {{$t('deleteButton')}}
                </v-btn>
              </v-col>
            </v-row>
            <v-divider
              class="my-4 mb-6"
            ></v-divider>
            <v-row
              v-for="(response, i) of selectedViolation.responses"
              :key="i"
            >
                <v-col
                  cols="12"
                  class="font-weight-bold pb-0"
                >
                  {{i === 0 ? $t('submittedBy') : $t('comment') + ' ' + $t('by')}} {{getUser(response.user).userName}} ({{getUser(response.user).firstName}} {{getUser(response.user).lastName}}):
                </v-col>
                <v-col
                  cols="12"
                >
                <v-alert>
                  {{$sanitize(newTab(response.comment))}}
                </v-alert>
              </v-col>
            </v-row>
          </template>
          <v-divider
            class="my-4 mb-6"
          ></v-divider>
          <v-form
            ref="violationForm"
            v-model="isValidViolation"
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
                  :label="$t('writeComment')"
                  background-color="#fff"
                  v-model="comment"
                  :rules="[rules.required]"
                >
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
          <v-card-actions
            class="px-0"
          >
            <v-btn
              block
              large
              :dark="isValidViolation"
              color="customGrey"
              :loading="isLoading"
              :disabled="!isValidViolation"
              @click="saveViolation()"
            >
              {{ selectedViolation ? $t('sendComment') : $t('reportButton')}}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import Lightbox from '@/components/Lightbox.vue'

export default {
  name: 'ViolationDialog',

  components: {
    Lightbox
  },

  props: [
    'showViolationDialog',
    'message',
    'discussion',
    'selectedViolation',
    'type'
  ],

  data: () => ({
    isDeleting: false,
    isLoading: false,
    isValidViolation: false,
    comment: undefined
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('violations', {
      createViolation: 'create',
      patchViolation: 'patch'
    }),
    ...mapActions('discussion-messages', {
      removeDiscussionMessage: 'remove'
    }),
    ...mapActions('chat-messages', {
      removeChatMessage: 'remove'
    }),
    closeViolationDialog () {
      this.comment = ''
      this.$emit('closeViolationDialog')
    },
    async deleteMessage (message) {
      this.isDeleting = true
      try {
        if (message.constructor.name === 'chatMessages') {
          await this.removeChatMessage(message._id)
        } else if (message.constructor.name === 'discussionMessages') {
          await this.removeDiscussionMessage(message._id)
        }
      } catch (e) {
        this.isDeleting = false
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        return
      }
      try {
        await this.patchViolation(
          [
            this.selectedViolation._id,
            {
              message: { id: null },
              isClosed: true
            }
          ]
        )
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.isDeleting = false
        this.closeViolationDialog()
      } catch (e) {
        this.isDeleting = false
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
      }
    },
    async saveViolation () {
      this.isLoading = true
      try {
        if (this.selectedViolation) {
          await this.patchViolation([
            this.selectedViolation._id,
            {
              $push: {
                responses: {
                  user: this.user._id,
                  comment: this.comment,
                  dt: Date.now()
                }
              }
            }
          ])
        } else {
          const map = {
            link: this.$route.fullPath,
            type: this.type,
            chat: this.message.chat,
            discussion: this.discussion ? this.discussion._id : undefined,
            group: this.discussion && this.discussion.group ? this.discussion.group : undefined,
            originalMessage: this.message.text.value,
            originalAuthor: this.getUser(this.message.author).userName + ' (ID: ' + this.message.author + ')',
            message: {
              id: this.message._id,
              type: this.message.constructor.name
            },
            responses: [
              {
                user: this.user._id,
                comment: this.comment,
                dt: Date.now()
              }
            ]
          }
          await this.createViolation([map, {}])
        }
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.closeViolationDialog()
        document.querySelector('.v-overlay__scrim').click()
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'rules',
      'newTab'
    ]),
    ...mapGetters('auth', [
      'user'
    ]),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('chat-messages', {
      getChatMessage: 'get'
    }),
    ...mapGetters('discussion-messages', {
      getDiscussionMessage: 'get'
    }),
    computedMessage () {
      if (this.selectedViolation) {
        if (this.selectedViolation.message.type === 'chatMessages') {
          return this.getChatMessage(this.selectedViolation.message.id)
        } else if (this.selectedViolation.message.type === 'discussionMessages') {
          return this.getDiscussionMessage(this.selectedViolation.message.id)
        } else {
          return undefined
        }
      } else {
        return this.message
      }
    }
  }
}
</script>
