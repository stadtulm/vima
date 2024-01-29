<template>
  <v-col
    v-if="!user"
  >
    <v-alert
      class="text-white"
      icon="fas fa-info-circle"
      :color="$settings.modules.discussions.color"
    >
      <v-row>
        <v-col
          class="text-body-1 pt-3"
        >
          {{$t('loginForDiscussions')}}
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            class="elevation-1 text-customGrey"
            color="white"
            :to="{ name: 'Signup' }"
          >
            {{$t('createProfileButton')}}
            <v-icon
              class="ml-3"
              size="18"
            >
              fa fa-user-plus
            </v-icon>
          </v-btn>
          <v-btn
            class="elevation-1 ml-3 text-customGrey"
            color="white"
            :to="{ name: 'Login' }"
          >
            {{$t('login')}}
            <v-icon
              class="ml-3"
              size="18"
            >
              fa fa-sign-in-alt
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
  </v-col>
  <v-col
    v-else-if="discussion.group && !computedGroupStatus.isMember"
  >
    <v-alert
      dark
      icon="fas fa-info-circle"
      :color="$settings.modules.discussions.color"
    >
      <v-row>
        <v-col>
          {{$t('applyForGroup')}}
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            class="elevation-1 text-customGrey"
            color="white"
            :to="{ name: 'Group',  params: { group: discussion.group } }"
          >
            {{$t('group')}} {{$t('viewButton')}}
            <v-icon
              class="ml-3"
              size="18"
            >
              fa fa-arrow-right
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
  </v-col>
  <v-col
    v-else-if="message && level < $settings.replyLevel && selectedReplyToAnswer !== message._id"
  >
    <v-btn
      icon
      color="customGrey"
      class="mb-2 customGreyUltraLight elevation-1"
      @click="$emit('update:selectedReplyToAnswer', message._id)"
      :title="$t('replies')"
    >
      <v-icon
        size="14"
      >
        fas fa-reply
      </v-icon>
    </v-btn>
  </v-col>
  <v-col v-else-if="level === 0 || selectedReplyToAnswer === message._id">
    <v-card
      color="#e8e8e8"
      class="elevation-5 my-1"
    >
      <v-card-text>
        <v-form
          :ref="'messagesReplyForm_' + (message ? message._id : 'main')"
          v-model="isValid"
        >
          <v-row dense>
            <v-col
              class="font-weight-bold pb-0 pt-3 text-body-1 text-black"
              cols="12"
            >
              {{ message ? (isEditMessage ? $t('editAnswerTitle') : $t('writeNewAnswer')) : (isEditMessage ? $t('editPostTitle') : $t('writeNewPostTitle'))}}:
              <v-btn
                size="small"
                variant="outlined"
                class="ml-2"
                @click="resetInput"
                v-if="message || isEditMessage"
              >
                {{$t('cancelButton')}}
              </v-btn>
            </v-col>
          </v-row>
          <v-row
            class="align-start"
          >
            <v-col
              class="text-left"
              cols="12"
            >
              <custom-tiptap
                :placeholder="$t('writeNewAnswer') + ' ...'"
                v-model="messageText"
                :id="'messageInput_' + (isEditMessage ? isEditMessage._id : (message ? message._id : 'main'))"
                :ref="'messageInput_' + (isEditMessage ? isEditMessage._id : (message ? message._id : 'main'))"
                :extensions="['bold', 'italic', 'underline', 'strikethrough', 'bulletList', 'orderedList', 'mentions']"
              >
              </custom-tiptap>
              <v-col
                :id="'mentionAchor_' + (isEditMessage ? isEditMessage._id : (message ? message._id : 'main'))"
              ></v-col>
              <v-row class="mt-3">
                <v-col
                  cols="12"
                  class="pt-0"
                  tabIndex="0"
                  @keypress="$refs['messageReplyUpload_' + (message ? message._id : 'main')].fakeClick()"
                >
                  <FileUpload
                    :ref="'messageReplyUpload_' + (message ? message._id : 'main')"
                    v-model="pics"
                    @update:fileRemove="patchFileRemove"
                    @update:fileAdd="$nextTick(() => { $refs['messagesReplyForm_' + (message ? message._id : 'main')].validate() })"
                    :acceptedMimeTypes="[]"
                    :maxFileSize="2"
                    :maxFiles="10"
                    bgColor="transparent"
                    :scaleToFit="[1080, 1080]"
                    :resizeQuality="50"
                  >
                  </FileUpload>
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="12"
            >
              <v-btn
                block
                :size="!$vuetify.display.mdAndUp ? 'small' : 'default'"
                :loading="isSending"
                :disabled="!isValid || !messageText || messageText.replace(/(\r\n|\n|\r)/gm, '').replaceAll('<p>', '').replaceAll('</p>', '').replaceAll(' ', '') === ''"
                @click="sendMessage()"
                :color="$settings.modules.discussions.color"
              >
                <v-icon
                  size="18"
                  color="white"
                >
                  fas fa-paper-plane
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script>

import { mapActions, mapMutations } from 'vuex'
import FileUpload from '@/components/FileUpload.vue'
import CustomTiptap from '@/components/CustomTiptap.vue'

export default {
  name: 'DiscussionReply',

  props: [
    'level',
    'user',
    'selectedReplyToAnswer',
    'message',
    'computedGroupStatus',
    'discussion',
    'isEditMessage'
  ],

  emits: [
    'update:resetInput',
    'update:selectedReplyToAnswer',
    'update:checkVisibleMessages',
    'update:message'
  ],

  components: {
    FileUpload,
    CustomTiptap
  },

  data: () => ({
    slug: undefined,
    skipUsers: 0,
    users: [],
    showSuggestions: false,
    pics: [],
    isValid: true,
    isSending: false,
    messageText: undefined
  }),

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('discussion-messages', {
      createMessage: 'create',
      patchMessage: 'patch'
    }),
    resetInput () {
      this.$emit('update:resetInput')
      this.messageText = undefined
      this.pics = []
    },
    async patchFileRemove (file) {
      this.isLoading = true
      try {
        await this.patchMessage([
          this.isEditMessage._id,
          {
            $pull: {
              pics: {
                _id: file._id
              }
            }
          }
        ])
        this.pics = this.isEditMessage.pics
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    async sendMessage () {
      this.isSending = true
      try {
        await this.$refs['messageReplyUpload_' + (this.message ? this.message._id : 'main')].upload()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      if (!this.isEditMessage) {
        try {
          await this.createMessage(
            [
              {
                discussion: this.discussion._id,
                author: this.user._id,
                text: [
                  {
                    value: this.messageText,
                    lang: null,
                    type: 'default'
                  }
                ],
                repliesTo: this.message ? this.message._id : undefined,
                pics: this.pics
              }
            ]
          )
          this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
          this.messageText = undefined
          this.pics = []
          this.$emit('update:resetInput')
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.$emit('update:checkVisibleMessages')
            })
          })
          this.$emit('update:message', undefined)
        } catch (e) {
          this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
        }
      } else {
        try {
          await this.patchMessage(
            [
              this.isEditMessage._id,
              {
                text: [
                  {
                    value: this.messageText,
                    lang: null,
                    type: 'default'
                  }
                ],
                pics: this.pics,
                editedAt: new Date()
              }
            ]
          )
          this.setSnackbar({ text: this.$t('snackbarEditSuccess'), color: 'success' })
          this.messageText = undefined
          this.pics = []
          this.$emit('update:resetInput')
          this.$emit('update:message')
        } catch (e) {
          this.setSnackbar({ text: this.$t('snackbarEditError'), color: 'error' })
        }
      }
      this.isSending = false
    }
  },

  watch: {
    selectedReplyToAnswer: {
      deep: true,
      handler () {
        this.messageText = undefined
        this.pics = undefined
      }
    },
    isEditMessage: {
      deep: true,
      handler () {
        if (this.isEditMessage) {
          this.messageText = this.isEditMessage.text.value
          this.pics = this.isEditMessage.pics
        } else {
          this.messageText = undefined
          this.pics = undefined
        }
      }
    },
    async messageText () {
      if (this.messageText) {
        this.messageText = this.$sanitize(this.messageText)
        this.messageText = this.messageText.replaceAll('<blockquote>', '<blockquote class="blockquote">')
        if (this.messageText.includes('@')) {
          this.showSuggestions = true
        }
      }
    }
  }
}
</script>
