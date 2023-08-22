<template>
  <div
    v-if="mainMessage"
  >
    <v-row>
      <v-col>
        <v-card
          color="#CFD8DC"
        >
          <v-card-text>
            <v-sheet
              id="replyContainer"
              class="pa-4"
              color="#ECEFF1"
            >
              <v-row>
                <v-col
                  v-if="!computedMessages || computedMessages.length === 0"
                >
                  <template v-if="isFindChatMessagesPending">
                    <v-progress-linear
                      color="customGrey"
                      indeterminate
                    ></v-progress-linear>
                    <v-col
                      class="text-center customGrey--text text-body-1 mt-4"
                    >
                      {{$t('loadingAnswers')}}
                    </v-col>
                  </template>
                   <template v-else>
                    <v-col
                      class="text-center customGrey--text text-body-1"
                    >
                      {{$t('noAnswersYet')}}
                    </v-col>
                  </template>
                </v-col>
                <template
                  v-else
                >
                  <v-col v-if="isFindChatMessagesPending">
                    <v-progress-linear
                      color="customGrey"
                      indeterminate
                    ></v-progress-linear>
                    <v-col
                      class="text-center customGrey--text text-body-1 mt-4"
                    >
                      {{$t('loadingOlderAnswers')}}
                    </v-col>
                  </v-col>
                  <v-col
                    v-else-if="chatMessagesPaginationData[mainMessage._id].mostRecent.total > computedMessages.length"
                    class="text-center customGrey--text text-body-1 my-3"
                  >
                    <v-btn
                      @click="loadMoreReplies()"
                      text
                      block
                      color="customGrey"
                    >
                      {{$t('loadOlderAnswersButton')}}
                      <v-icon
                        size="14"
                        class="ml-3"
                      >
                        fas fa-sync-alt
                      </v-icon>
                    </v-btn>
                  </v-col>
                  <v-col
                    v-else-if="chatMessagesPaginationData[mainMessage._id].mostRecent.total <= computedMessages.length"
                    class="text-center customGrey--text text-body-1 mt-3"
                  >
                    {{$t('noOlderAnswers')}}
                  </v-col>
                  <v-col
                    v-for="(message, i) in computedMessages.sort((b, a) => { return new Date(b.createdAt) - new Date(a.createdAt) })"
                    :key="i"
                    cols="12"
                    class="pa-2"
                    :class="isOwnMessage(message) ? 'text-right': 'reply text-left'"
                    :name="message._id"
                  >
                    <v-sheet
                      class="px-4 py-2 foreign-sheet"
                      :color="isOwnMessage(message) ? (isEditMessage === message._id ? '#ffeac2' : '#f0f0f0') : (computedOwnStatusContainer.unread.map(unread => unread.id).includes(message._id)) ? $settings.indicatorColor: '#f6f6f6'"
                    >
                      <!-- Date -->
                      <v-row
                        dense
                      >
                        <v-col
                          class="caption grey--text"
                        >
                          <span
                            :class="!isOwnMessage(message) ? 'pointer': ''"
                            @click="!isOwnMessage(message) ? $router.push({name: 'User', params: { user: message.author}}) : ''"
                          >
                            {{isOwnMessage(message) ? $t('you') + ', ' : getUser(message.author).userName + ', '}}
                          </span>
                          {{$moment(message.createdAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}} {{message.editedAt ? '(' + $t('editedOn') + ' ' + $moment(message.editedAt).format('DD.MM.YYYY, HH:mm') + ' ' + $t('oClock') + ')': ''}}
                        </v-col>
                      </v-row>
                      <!-- Message -->
                      <v-row
                        dense
                      >
                        <v-col
                          class="text-body-1"
                          cols="12"
                        >
                          <v-row>
                            <v-col>
                              <v-sheet
                                max-width="75%"
                                style="display:inline-block"
                                color="transparent"
                              >
                                <!-- Message and ellipsis-button -->
                                <v-row
                                  dense
                                  class="align-center"
                                >
                                  <v-menu
                                    v-if="isOwnMessage(message)"
                                    offset-y
                                    open-on-hover
                                  >
                                    <template v-slot:activator="{ on, attrs }">
                                      <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        class="mb-2 mr-2 elevation-1 customGreyUltraLight"
                                      >
                                        <v-icon
                                          size="14"
                                        >
                                          fas fa-ellipsis-v
                                        </v-icon>
                                      </v-btn>
                                    </template>
                                    <v-list
                                      dense
                                      rounded
                                    >
                                      <!-- Edit button -->
                                      <v-list-item
                                        @click="editMessage(message)"
                                      >
                                        <v-list-item-avatar>
                                          <v-icon>
                                            fas fa-pen
                                          </v-icon>
                                        </v-list-item-avatar>
                                        <v-list-item-content>
                                          <v-list-item-title>
                                            {{$t('editButton')}}
                                          </v-list-item-title>
                                        </v-list-item-content>
                                      </v-list-item>
                                      <!-- Delete button -->
                                      <v-list-item
                                        @click="deleteMessage(message._id)"
                                      >
                                        <v-list-item-avatar>
                                          <v-icon>
                                            fas fa-trash
                                          </v-icon>
                                        </v-list-item-avatar>
                                        <v-list-item-content>
                                          <v-list-item-title>
                                            {{$t('deleteButton')}}
                                          </v-list-item-title>
                                        </v-list-item-content>
                                      </v-list-item>
                                    </v-list>
                                  </v-menu>
                                  <v-col
                                    class="text-left"
                                  >

                                    <TranslatableText
                                      ownField="text"
                                      :allFields="['text']"
                                      :allIds="
                                        computedMessages
                                          .filter(m => !isOwnMessage(m))
                                          .map(m => { return { id: m._id, translationSum: m.translationSum } })
                                      "
                                      type="chat-messages"
                                      :textParent="message"
                                    >
                                      <template
                                        v-slot:defaultLang="{ computedText, translateText }"
                                      >
                                        <v-sheet
                                          :color="isOwnMessage(message) ? '#fff' : 'customGreyLight'"
                                          :class="{'rounded-l-xl rounded-tr-xl': isOwnMessage(message), 'rounded-r-xl rounded-tl-xl': !isOwnMessage(message), 'mb-2': isSeen(message._id)}"
                                          class="px-4 py-1 elevation-4"
                                        >
                                          <div
                                            v-html="message.text ? $sanitize(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />'))) : ''"
                                          >
                                          </div>
                                        </v-sheet>
                                        <v-col
                                          class="pa-0"
                                          :class="isOwnMessage(message) ? 'text-right' : ''"
                                        >
                                          <TranslatableTextInfo
                                            :canTranslate="true"
                                            :canTranslateAll="chatMessages.filter(m => !isOwnMessage(m)).length > 1"
                                            @translateText="(data) => { translateText(data) }"
                                          ></TranslatableTextInfo>
                                        </v-col>
                                      </template>

                                      <template
                                        v-slot:translatedLang="{ computedText, showOriginal, translateText }"
                                      >
                                        <v-sheet
                                          :color="isOwnMessage(message) ? '#fff' : 'customGreyLight'"
                                          :class="{'rounded-l-xl rounded-tr-xl': isOwnMessage(message), 'rounded-r-xl rounded-tl-xl': !isOwnMessage(message), 'mb-2': isSeen(message._id)}"
                                          class="px-3 pt-1 pb-3 elevation-4"
                                        >
                                          <v-sheet
                                            class="py-1 mt-3 mb-4 px-2 rounded"
                                            color="rgba(255,255,255,0.3)"
                                          >
                                            <div
                                              v-html="$sanitize(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />')))"
                                            >
                                            </div>
                                          </v-sheet>
                                        </v-sheet>
                                        <TranslatableTextInfo
                                          :canShowOriginal="true"
                                          :needsUpdate="message.translationSum !== computedText.translationSum"
                                          @showOriginal="(data) => { showOriginal(data) }"
                                          @translateText="(data) => { translateText(data) }"
                                        ></TranslatableTextInfo>
                                      </template>
                                    </TranslatableText>
                                  </v-col>
                                  <v-menu
                                    v-if="!isOwnMessage(message)"
                                    offset-y
                                    open-on-hover
                                  >
                                    <template v-slot:activator="{ on, attrs }">
                                      <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        class="mb-2 ml-2 elevation-1 customGreyUltraLight"
                                      >
                                        <v-icon
                                          size="14"
                                        >
                                          fas fa-ellipsis-v
                                        </v-icon>
                                      </v-btn>
                                    </template>
                                      <v-list
                                        dense
                                        rounded
                                      >
                                        <v-list-item
                                          @click="$emit('report', message)"
                                        >
                                          <v-list-item-avatar>
                                            <v-icon>
                                              fas fa-exclamation-triangle
                                            </v-icon>
                                          </v-list-item-avatar>
                                          <v-list-item-content>
                                            <v-list-item-title>
                                              {{$t('reportButton')}}
                                            </v-list-item-title>
                                          </v-list-item-content>
                                        </v-list-item>
                                      </v-list>
                                  </v-menu>
                                </v-row>
                              </v-sheet>
                            </v-col>
                          </v-row>
                          <!-- Unread -->
                          <v-row
                            dense
                            v-if="isOwnMessage(message) && !isSeen(message._id)"
                          >
                            <v-col
                              cols="12"
                              class="caption"
                            >
                              {{$t('unread')}}
                            </v-col>
                          </v-row>
                          <v-row
                            v-if="message.pics && message.pics.length > 0"
                            class="my-3 d-flex"
                            :class="isOwnMessage(message) ? 'justify-end': 'justify-start'"
                          >
                            <v-col
                              cols=2
                              v-for="(pic, i) in message.pics"
                              :key="i"
                            >
                              <a
                                v-if="!['jpg', 'jpeg', 'png', 'tiff', 'gif', 'bmp', 'svg'].includes(pic.url.split('.')[pic.url.split('.').length - 1].toLowerCase())"
                                :href="s3 + pic.url"
                                target="_blank"
                                style="text-decoration: none !important;"
                              >
                                <v-sheet
                                  class="pa-1 text-center align-center d-flex pointer fill-height"
                                >
                                  <v-row>
                                    <v-col
                                      cols="12"
                                      class="pb-0"
                                    >
                                      <v-icon
                                        size="48"
                                      >fas fa-file</v-icon>
                                    </v-col>
                                    <v-col
                                      cols="12"
                                    >
                                      {{/_(.+)/.exec(pic.url)[1]}}
                                    </v-col>
                                  </v-row>
                                </v-sheet>
                              </a>
                              <Lightbox
                                v-else
                                :pic="pic"
                              ></Lightbox>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-sheet>
                  </v-col>
                </template>
              </v-row>
            </v-sheet>
            <v-row>
              <v-col>
                <v-divider class="white mt-4 mb-2"></v-divider>
              </v-col>
            </v-row>
            <v-form
              ref="messagesReplyForm"
              v-model="isValid"
            >
              <v-row dense>
                <v-col
                  class="font-weight-bold pb-0 pt-3"
                  cols="12"
                >
                  {{ isEditMessage ? $t('editAnswerTitle') : $t('writeNewAnswer')}}
                  <v-btn
                    v-if="isEditMessage"
                    text
                    small
                    outlined
                    class="ml-2"
                    @click="resetInput"
                  >
                    {{$t('cancelButton')}}
                  </v-btn>
                </v-col>
              </v-row>
              <v-row
                class="align-end"
              >
                <v-col
                  class="text-left"
                  cols="11"
                >
                  <VuetifyTiptap
                    :editor-properties="{
                      disableInputRules: true,
                      disablePasteRules: true
                    }"
                    color="customGreyUltraLight"
                    v-model="message"
                    :card-props="{ tile: true, flat: true }"
                    style="border: 1px solid #aaa;"
                    :extensions="extensions"
                    :placeholder="$t('writeNewAnswer') + ' ...'"
                  >
                  </VuetifyTiptap>
                  <v-row class="mt-3">
                    <v-col
                      cols="12"
                      class="pt-0"
                      tabIndex="0"
                      @keypress="$refs.messageReplyUpload.fakeClick()"
                    >
                      <FileUpload
                        ref="messageReplyUpload"
                        v-model="pics"
                        @fileRemove="patchFileRemove"
                        @fileAdd="$nextTick(() => { $refs.messagesReplyForm.validate() })"
                        :acceptedMimeTypes="[]"
                        :maxFileSize="2"
                        :maxFiles="10"
                        bgColor="transparent"
                        :scaleToFit="[1080, 1080]"
                        :resizeQuality="50"
                      ></FileUpload>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col
                  cols="1"
                  class="px-0"
                >
                  <v-btn
                    fab
                    :small="!$vuetify.display.mdAndUp"
                    :loading="isSending"
                    :disabled="!message || message.replace(/(\r\n|\n|\r)/gm, '').replaceAll('<p>', '').replaceAll('</p>', '').replaceAll(' ', '') === ''"
                    @click="sendMessage()"
                    color="customGrey"
                  >
                    <template
                      slot="loader"
                    >
                      <v-progress-circular
                        color="white"
                        width="3"
                        indeterminate
                      ></v-progress-circular>
                    </template>
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
    </v-row>
  </div>
</template>

<script>

import { makeFindMixin } from '@feathersjs/vuex'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import TranslatableText from '@/components/TranslatableText.vue'
import TranslatableTextInfo from '@/components/TranslatableTextInfo.vue'
import Lightbox from '@/components/Lightbox.vue'
import FileUpload from '@/components/FileUpload.vue'

export default {
  name: 'ChatReplies',

  mixins: [makeFindMixin({ service: 'chat-messages', watch: true })],

  props: [
    'mainMessage',
    'selectedChat',
    'computedOwnStatusContainer',
    'computedOtherStatusContainers'
  ],
  components: {
    TranslatableText,
    TranslatableTextInfo,
    Lightbox,
    FileUpload
  },

  data: () => ({
    pics: [],
    isUpdating: false,
    isEditMessage: undefined,
    showRepliesObj: {},
    manualLoad: false,
    maxContainerHeight: 500,
    isValid: false,
    message: undefined,
    isSending: false,
    loaders: {},
    search: '',
    page: 1,
    loading: true,
    total: 0,
    itemsPerPage: 10,
    intersectionOptions: {
      root: null,
      rootMargin: '0px 0px 0px 0px',
      threshold: [0, 1]
    }
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapMutations('translations', {
      updateTranslationItem: 'updateItem'
    }),
    ...mapActions('chat-messages', {
      createMessage: 'create',
      patchMessage: 'patch',
      removeMessage: 'remove'
    }),
    isSeen (messageId) {
      if (this.computedOtherStatusContainers) {
        return this.computedOtherStatusContainers.filter(obj => obj.unread.map(obj => obj.id).includes(messageId)).length === 0
      } else {
        return true
      }
    },
    loadMoreReplies () {
      this.manualLoad = true
      this.page++
    },
    isOwnMessage (message) {
      return message.author === this.user._id
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
        console.log(e)
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    },
    resetInput () {
      this.isEditMessage = undefined
      this.$refs.messagesReplyForm.reset()
      this.message = undefined
      this.pics = []
    },
    async deleteMessage (messageId) {
      try {
        await this.removeMessage(messageId)
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
      }
    },
    async editMessage (message) {
      this.isEditMessage = message
      this.message = message.text.value
      this.pics = message.pics
      document.querySelector('#replyInput' + this.mainMessage._id).scrollIntoView()
    },
    async sendMessage () {
      this.isSending = true
      try {
        await this.$refs.messageReplyUpload.upload()
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
                chat: this.selectedChat._id,
                author: this.user._id,
                text: [
                  {
                    value: this.message,
                    lang: null,
                    type: 'default'
                  }
                ],
                repliesTo: this.mainMessage._id,
                pics: this.pics
              }
            ]
          )
          this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
          this.resetInput()
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.$emit('checkVisibleMessages')
            })
          })
          this.message = undefined
        } catch (e) {
          this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
        }
      } else {
        try {
          await this.patchMessage(
            [
              this.isEditMessage,
              {
                text: [
                  {
                    value: this.message,
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
          this.resetInput()
        } catch (e) {
          this.setSnackbar({ text: this.$t('snackbarEditError'), color: 'error' })
        }
      }
      this.isSending = false
    }
  },

  computed: {
    ...mapGetters([
      'newTab',
      's3'
    ]),
    ...mapGetters('translations', {
      getTranslation: 'get'
    }),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('chat-messages', {
      messages: 'list'
    }),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    chatMessagesParams () {
      const query = {
        chat: this.selectedChat._id,
        repliesTo: this.mainMessage._id,
        $limit: this.itemsPerPage,
        $skip: (this.page - 1) * this.itemsPerPage,
        $sort: { createdAt: -1 }
      }
      return {
        query,
        qid: this.mainMessage._id,
        debounce: 1000
      }
    },
    computedMessages () {
      if (this.messages) {
        return this.messages.filter(obj => obj.repliesTo === this.mainMessage._id)
      } else {
        return []
      }
    }
  },

  watch: {
    computedMessages: {
      deep: true,
      handler (newValue, oldValue) {
        if (document.querySelector('#replyContainer')) {
          this.$nextTick(() => {
            this.$nextTick(() => {
              if (oldValue.length < newValue.length && !this.manualLoad) {
                document.querySelector('#messageContainer').scrollTop = document.querySelector('#messageContainer').scrollTop + document.querySelector('[name="' + newValue[newValue.length - 1]._id + '"]').clientHeight
              }
              this.$emit('checkVisibleMessages')
              this.manualLoad = false
            })
          })
        }
      }
    },
    isFindChatMessagesPending () {
      if (!this.isFindChatMessagesPending) {
        this.loading = false
        this.total = this.chatMessagesPaginationData[this.mainMessage._id].mostRecent.total
      } else {
        this.loading = true
      }
    },
    message () {
      if (this.message) {
        this.message = this.$sanitize(this.message)
        this.message = this.message.replaceAll('<blockquote>', '<blockquote class="blockquote">')
      }
    }
  }
}
</script>
