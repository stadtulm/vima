<template>
  <v-card
    color="customGreyLight"
    theme="dark"
    class="elevation-5 my-1"
  >
    <v-card-text>
      <v-form
        ref="messagesForm_main"
        v-model="isValid"
      >
        <v-row dense>
          <v-col
            class="font-weight-bold pb-0 pt-3 text-body-1"
            cols="12"
          >
            {{ isEditMessage ? $t('editPostTitle') : $t('writeNewMessage') }}:
            <v-btn
              size="small"
              variant="outlined"
              class="ml-2"
              @click="resetInput"
              v-if="messageText || isEditMessage"
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
              :placeholder="$t('writeNewMessage')"
              v-model="messageText"
              id="messageInput_main"
              ref="messageInput_main"
              :extensions="['bold', 'italic', 'underline', 'strikethrough', 'bulletList', 'orderedList']"
            >
            </custom-tiptap>
            <v-row class="mt-3">
              <v-col
                cols="12"
                class="pt-0"
                tabIndex="0"
                @keypress="$refs.messageUpload_main.fakeClick()"
              >
                <FileUpload
                  ref="messageUpload_main"
                  v-model="pics"
                  @update:fileRemove="patchFileRemove"
                  @update:fileAdd="$nextTick(() => { $refs.messagesForm_main.validate() })"
                  :acceptedMimeTypes="[]"
                  :maxFileSize="2"
                  :maxFiles="10"
                  bgColor="transparent"
                  :scaleToFit="[1080, 1080]"
                  :reset="uploadResetTrigger"
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
              color="customGrey"
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
</template>

<script>

import { mapActions, mapMutations } from 'vuex'
import FileUpload from '@/components/FileUpload.vue'
import CustomTiptap from '@/components/CustomTiptap.vue'

export default {
  name: 'ChatSend',

  props: [
    'user',
    'chat',
    'isEditMessage',
    'isReplyMessage'
  ],

  emits: [
    'update:resetInput',
    'update:checkVisibleMessages',
    'update:message'
  ],

  components: {
    FileUpload,
    CustomTiptap
  },

  data: () => ({
    uploadResetTrigger: 0,
    pics: [],
    isValid: true,
    isSending: false,
    messageText: undefined
  }),

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('chats', {
      createChat: 'create'
    }),
    ...mapActions('chat-messages', {
      createMessage: 'create',
      patchMessage: 'patch'
    }),
    resetInput () {
      this.$emit('update:resetInput')
      this.messageText = undefined
      this.pics = []
      this.uploadResetTrigger = Date.now()
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
      if (!this.chat) {
        try {
          const tmpChat = await this.createChat([
            {
              tmpUsers: [this.user._id, this.$route.params.user]
            }
          ])
          this.$emit('create:chat', tmpChat)
          await this.$nextTick()
        } catch (e) {
        // Could not create chat
        }
      }
      try {
        await this.$refs.messageUpload_main.upload()
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
                chat: this.chat._id,
                author: this.user._id,
                text: [
                  {
                    value: this.messageText,
                    lang: null,
                    type: 'default'
                  }
                ],
                pics: this.pics
              }
            ]
          )
          this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
          this.messageText = undefined
          this.pics = []
          this.resetInput()
          this.$emit('update:resetInput')
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.$emit('update:checkVisibleMessages')
            })
          })
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
          this.$emit('update:chatMessage', this.isEditMessage._id)
          this.resetInput()
          this.$emit('update:resetInput')
        } catch (e) {
          this.setSnackbar({ text: this.$t('snackbarEditError'), color: 'error' })
        }
      }
      this.isSending = false
    }
  },

  computed: {
  },

  watch: {
    isEditMessage: {
      deep: true,
      handler () {
        if (this.isEditMessage) {
          this.messageText = this.isEditMessage.text.value
          setTimeout(() => {
            this.$refs.messageInput_main.editor.commands.focus('end')
          }, 1000)
          this.pics = this.isEditMessage.pics
        } else {
          this.messageText = undefined
          this.pics = undefined
        }
      }
    },
    isReplyMessage: {
      deep: true,
      handler () {
        if (this.isReplyMessage) {
          this.messageText = '<blockquote class="blockquote">' + this.isReplyMessage.text.value + '</blockquote><p></p>'
          setTimeout(() => {
            this.$refs.messageInput_main.editor.commands.focus('end')
          }, 1000)
        } else {
          this.messageText = undefined
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
