<template>
  <div
    v-if="selectedChat || $route.params.username"
  >
    <v-row>
      <v-col
        class="text-h5 font-weight-bold text-customGrey text-uppercase"
      >
        {{$t('chatWith')}} {{selectedChat && computedOtherStatusContainers && computedOtherStatusContainers.length === 1 ? users.find(obj => obj._id === computedOtherStatusContainers[0].user).userName : $route.params.username }}
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card
          color="customGreyUltraLight"
        >
          <v-card-text>
            <v-sheet
              @scroll="onScroll"
              id="messageContainer"
              :max-height="maxContainerHeight"
              min-height="100px"
              style="overflow-y: auto; overflow-x: hidden"
              class="pa-4"
            >
              <v-row>
                <v-col
                  v-if="!computedMessages || computedMessages.length === 0"
                >
                  <template v-if="isFindChatMessagesPending || init">
                    <v-progress-linear
                      color="customGrey"
                      indeterminate
                    ></v-progress-linear>
                    <v-col
                      class="text-center text-customGrey text-body-1 mt-4"
                    >
                      {{$t('loadingMessages')}}
                    </v-col>
                  </template>
                  <v-col
                    v-else
                    class="text-center text-customGrey text-body-1 mt-3"
                  >
                    {{$t('noMessagesYet')}}
                    <v-icon
                      color="customGrey"
                      class="ml-2 mb-1"
                    >
                      fas fa-heart-broken
                    </v-icon>
                  </v-col>
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
                      class="text-center text-customGrey text-body-1 mt-4"
                    >
                      {{$t('loadingOlderAnswers')}}
                    </v-col>
                  </v-col>
                  <v-col
                    v-else-if="selectedChat && chatMessagesPaginationData[selectedChat._id].mostRecent.total <= computedMessages.length"
                    class="text-center text-customGrey text-body-1 mt-3"
                  >
                    {{$t('noOlderAnswers')}}
                  </v-col>
                  <v-col
                    v-for="(message, i) in computedMessages.sort((b, a) => { return new Date(b.createdAt) - new Date(a.createdAt) })"
                    :key="i"
                    cols="12"
                    class="pa-2"
                    :class="isOwnMessage(message) ? 'text-right': 'message text-left'"
                    :name="message._id"
                    :id="'replyInput' + message._id"
                  >
                    <v-sheet
                      class="pa-4 foreign-sheet"
                      :class="showRepliesObj[message._id] ? 'elevation-12 my-4' : 'elevation-0'"
                      :color="getBGColor(message)"
                    >
                      <!-- Date -->
                      <v-row
                        dense
                      >
                        <v-col
                          class="caption"
                          :class="showRepliesObj[message._id] ? 'text-white' : 'text-grey'"
                        >
                          <span
                            @click="!isOwnMessage(message) ? $router.push({name: 'User', params: { user: message.author}}) : ''"
                            :class="!isOwnMessage(message) ? 'pointer': ''"
                          >
                            {{isOwnMessage(message) ? $t('you') + ', ' : (getUser(message.author) ? getUser(message.author).userName + ', ' : '')}}
                          </span>
                          {{$moment(message.createdAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}} {{message.editedAt ? '(bearbeitet am ' + $moment(message.editedAt).format('DD.MM.YYYY, HH:mm') + ' ' + $t('oClock') + ')': ''}}
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
                                    open-on-hover
                                    v-if="isOwnMessage(message)"
                                  >
                                    <template v-slot:activator="{ on, attrs }">
                                      <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        class="mb-2 mr-2 customGreyUltraLight elevation-1"
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
                                    class="shrink px-0"
                                  >
                                    <v-btn
                                      v-if="isOwnMessage(message)"
                                      icon
                                      color="customGrey"
                                      class="mb-2 mr-2 customGreyUltraLight elevation-1"
                                      @click="toggleShowReplies(message._id)"
                                    >
                                      <v-icon
                                        size="14"
                                      >
                                        {{ showRepliesObj[message._id] ? 'fas fa-chevron-up' : 'fas fa-reply' }}
                                      </v-icon>
                                    </v-btn>
                                  </v-col>
                                  <v-col
                                    class="text-left"
                                  >
                                    <TranslatableText
                                      ownField="text"
                                      :allFields="['text']"
                                      :allIds="chatMessages.filter(m => !isOwnMessage(m)).map(m => ({ id: m._id, translationSum: m.translationSum }))"
                                      type="chat-messages"
                                      :textParent="message"
                                    >
                                      <template
                                        v-slot:defaultLang="{ computedText, translateText }"
                                      >
                                        <v-sheet
                                          :color="isOwnMessage(message) ? '#fff' : 'customGreyLight'"
                                          :class="{'rounded-l-xl rounded-tr-xl': isOwnMessage(message), 'rounded-r-xl rounded-tl-xl': !isOwnMessage(message), 'mb-2': isSeen(message._id)}"
                                          class="px-3 py-1 elevation-4"
                                        >
                                          <div
                                            v-html="$sanitize(newTab(computedText.value))"
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
                                  <v-btn
                                    v-if="!isOwnMessage(message)"
                                    icon
                                    color="customGrey"
                                    class="mb-2 ml-2 customGreyUltraLight elevation-1"
                                    @click="toggleShowReplies(message._id)"
                                  >
                                    <v-icon
                                      size="14"
                                    >
                                      {{ showRepliesObj[message._id] ? 'fas fa-chevron-up' : 'fas fa-reply' }}
                                    </v-icon>
                                  </v-btn>
                                  <v-menu
                                    open-on-hover
                                    v-if="!isOwnMessage(message)"
                                  >
                                    <template v-slot:activator="{ on, attrs }">
                                      <v-btn
                                        icon
                                        class="mb-2 ml-2 customGreyUltraLight elevation-1"
                                        v-bind="attrs"
                                        v-on="on"
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
                                      <!-- Report button -->
                                      <v-list-item
                                        @click="openReportDialog(message)"
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
                          <!-- Replies -->
                          <v-expand-transition
                            mode="in-out"
                          >
                            <v-row
                              v-if="showRepliesObj[message._id]"
                            >
                              <v-col
                                class="pt-0"
                              >
                                <ChatReplies
                                  :mainMessage="message"
                                  :selectedChat="selectedChat"
                                  @checkVisibleMessages="checkVisibleMessages"
                                  @report="openReportDialog"
                                  :computedOwnStatusContainer="computedOwnStatusContainer"
                                  :computedOtherStatusContainers="computedOtherStatusContainers"
                                ></ChatReplies>
                              </v-col>
                            </v-row>
                          </v-expand-transition>
                          <!-- Reply button -->
                          <v-row
                            v-if="message.replies && message.replies.length > 0"
                          >
                            <v-col
                              class="pt-0"
                              cols="12"
                            >
                              <v-btn
                                @click="toggleShowReplies(message._id)"
                                :color="showRepliesObj[message._id] ? 'customGrey' : 'customGreyLight'"
                                :dark="showRepliesObj[message._id]"
                                block
                                class="my-2 elevation-1"
                              >
                                {{ message.replies.length }} {{message.replies.length === 1 ? $t('reply') : $t('replies')}}
                                {{showRepliesObj[message._id] ? $t('hideButton') : $t('showButton')}}
                                <v-icon
                                  size="18"
                                  class="ml-3"
                                >
                                  {{ showRepliesObj[message._id] ? 'fas fa-chevron-up' : 'fas fa-chevron-down' }}
                                </v-icon>
                                <v-sheet
                                  :color="$settings.indicatorColor"
                                  class="ml-4 px-2 pt-1"
                                  v-if="message.replies.filter(obj => computedOwnStatusContainer.unread.map(unread => unread.id).includes(obj)).length > 0"
                                >
                                  {{message.replies.filter(obj => computedOwnStatusContainer.unread.map(unread => unread.id).includes(obj)).length}}
                                  <span>
                                    {{$t('newMultiple')}}
                                    <v-icon
                                      size="18"
                                      class="ml-1"
                                      style="margin-bottom: 3px"
                                    >
                                      far fa-envelope
                                    </v-icon>
                                  </span>
                                </v-sheet>
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-sheet>
                  </v-col>
                  <v-btn
                    style="bottom: 120px; right: calc(50% - 105px);"
                    absolute
                    large
                    :color="$settings.indicatorColor"
                    @click="scrollDown()"
                    v-if="showScrollDown"
                  >
                    {{$t('newChatMessages')}}
                    <v-icon
                      class="ml-3"
                      size="18"
                    >
                      fas fa-arrow-down
                    </v-icon>
                  </v-btn>
                </template>
              </v-row>
            </v-sheet>
            <v-row>
              <v-col>
                <v-divider class="mt-6"></v-divider>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-form
                  ref="messagesForm"
                  v-model="isValid"
                >
                  <v-row dense>
                    <v-col
                      class="font-weight-bold"
                      cols="12"
                    >
                      {{ isEditMessage ? $t('editPostTitle') : $t('writeNewPostTitle')}}
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
                      class="grow pr-1"
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
                        :placeholder="$t('writeNewMessage')"
                        id="messageInput"
                      >
                      </VuetifyTiptap>
                      <v-row class="mt-3">
                        <v-col
                          cols="12"
                          class="pt-0"
                          tabIndex="0"
                          @keypress="$refs.messageUpload.fakeClick()"
                        >
                          <FileUpload
                            ref="messageUpload"
                            v-model="pics"
                            @fileRemove="patchFileRemove"
                            @fileAdd="$nextTick(() => { $refs.messagesForm.validate() })"
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
                      class="shrink px-3"
                    >
                      <v-btn
                        fab
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
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <ViolationDialog
      type="chats"
      :showViolationDialog="showViolationDialog"
      :message="itemToReport"
      :key="JSON.stringify(itemToReport)"
      @closeViolationDialog="itemToReport = undefined"
    ></ViolationDialog>
  </div>
</template>

<script>

import { makeFindMixin } from '@feathersjs/vuex'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import ChatReplies from '@/views/ChatReplies.vue'
import ViolationDialog from '@/components/ViolationDialog.vue'
import TranslatableText from '@/components/TranslatableText.vue'
import TranslatableTextInfo from '@/components/TranslatableTextInfo.vue'
import Lightbox from '@/components/Lightbox.vue'
import FileUpload from '@/components/FileUpload.vue'

export default {
  name: 'Chat',

  mixins: [makeFindMixin({ service: 'chat-messages', watch: true })],

  components: {
    ChatReplies,
    ViolationDialog,
    TranslatableText,
    TranslatableTextInfo,
    Lightbox,
    FileUpload
  },
  data: () => ({
    pics: [],
    showViolationDialog: undefined,
    itemToReport: undefined,
    triggerNewMessage: 1,
    isUpdating: false,
    isEditMessage: undefined,
    showRepliesObj: {},
    init: true,
    manualLoad: false,
    showScrollDown: false,
    maxContainerHeight: 550,
    scrollDirty: false,
    selectedChat: undefined,
    isValid: false,
    message: undefined,
    isSending: false,
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
    // Chat is in route, simply request it
    if (this.$route.params.chat) {
      this.selectedChat = await this.requestChat(
        [
          this.$route.params.chat
        ]
      )
      this.$nextTick(() => {
        this.$nextTick(() => {
          if (document.querySelector('#messageContainer')) {
            document.querySelector('#messageContainer').scrollTop = document.querySelector('#messageContainer').scrollHeight
            this.checkVisibleMessages()
          }
        })
      })
    // There is only a user in route - check if chat exists
    } else if (this.$route.params.user) {
      const chats = await this.findCommonChat(
        {
          query: {
            type: 'commonChat',
            users: [this.user._id, this.$route.params.user]
          }
        }
      )
      this.selectedChat = chats[0]
      // Chat found
      if (this.selectedChat) {
        this.$nextTick(() => {
          this.$nextTick(() => {
            if (document.querySelector('#messageContainer')) {
              document.querySelector('#messageContainer').scrollTop = document.querySelector('#messageContainer').scrollHeight
              this.checkVisibleMessages()
            }
          })
        })
      // No chat exists
      } else {
        this.init = false
        this.loading = false
      }
    }
  },

  beforeUnmount () {
    window.removeEventListener('scroll', this.checkVisibleMessages)
    if (document.querySelector('#messageContainer')) {
      document.querySelector('#messageContainer').removeEventListener('scroll', this.checkVisibleMessages)
    }
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapMutations('translations', {
      updateTranslationItem: 'updateItem'
    }),
    ...mapActions('translations', {
      createTranslation: 'create'
    }),
    ...mapActions('chats', {
      requestChat: 'get',
      requestChats: 'find',
      createChat: 'create'
    }),
    ...mapActions('chat-messages', {
      createMessage: 'create',
      patchMessage: 'patch',
      removeMessage: 'remove'
    }),
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    ...mapActions('status-container-helper', {
      findCommonChat: 'find',
      patchChatMessageNotifications: 'patch'
    }),
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
      this.$refs.messagesForm.reset()
      this.message = undefined
      this.pics = []
    },
    openReportDialog (message) {
      this.itemToReport = message
    },
    isSeen (messageId) {
      if (this.computedOtherStatusContainers) {
        return this.computedOtherStatusContainers.filter(obj => obj.unread.map(unread => unread.id).includes(messageId)).length === 0
      } else {
        return true
      }
    },
    getBGColor (message) {
      if (this.showRepliesObj[message._id]) {
        return '#B0BEC5'
      } else {
        if (this.isOwnMessage(message)) {
          if (this.isEditMessage === message._id) {
            return '#ffeac2'
          } else {
            return '#f0f0f0'
          }
        } else {
          if (this.computedOwnStatusContainer.unread.map(unread => unread.id).includes(message._id)) {
            return this.$settings.indicatorColor
          } else {
            return '#f6f6f6'
          }
        }
      }
    },
    toggleShowReplies (messageId) {
      const tmpState = !this.showRepliesObj[messageId]
      this.showRepliesObj = {}
      if (tmpState) {
        this.$set(this.showRepliesObj, messageId, true)
        setTimeout(() => {
          document.querySelector('#replyInput' + messageId).scrollIntoView({ block: 'end', behavior: 'smooth' })
        }, 500)
      }
    },
    scrollDown () {
      document.querySelector('#messageContainer').scrollTop = document.querySelector('#messageContainer').scrollHeight
      this.showScrollDown = false
    },
    isOwnMessage (message) {
      return message.author === this.user._id
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
      document.querySelector('#messageInput').scrollIntoView({ block: 'start', behavior: 'smooth' })
    },
    async sendMessage () {
      this.manualLoad = true
      this.isSending = true
      try {
        await this.$refs.messageUpload.upload()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.isLoading = false
        return
      }
      if (!this.isEditMessage) {
        // Create chat if there is none
        if (!this.selectedChat) {
          this.selectedChat = await this.createChat([
            {
              tmpUsers: [this.user._id, this.$route.params.user]
            }
          ])
        }
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
                pics: this.pics
              }
            ]
          )
          this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
          this.resetInput()
          this.$nextTick(() => {
            this.$nextTick(() => {
              if (!this.ScrollDirty) {
                document.querySelector('#messageContainer').scrollTop = document.querySelector('#messageContainer').scrollHeight
              }
              this.checkVisibleMessages()
            })
          })
          this.triggerNewMessage = Date.now()
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
          this.triggerNewMessage = Date.now()
        } catch (e) {
          this.setSnackbar({ text: this.$t('snackbarEditError'), color: 'error' })
        }
      }
      this.isSending = false
    },
    onScroll ({ target: { scrollTop, clientHeight, scrollHeight } }) {
      this.scrollDirty = true
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        this.scrollDirty = false
        this.showScrollDown = false
      }
      if (
        scrollTop === 0 &&
        this.selectedChat &&
        !this.isFindChatMessagesPending &&
        this.chatMessagesPaginationData[this.selectedChat._id] &&
        this.chatMessagesPaginationData[this.selectedChat._id].mostRecent.total > this.computedMessages.length
      ) {
        this.manualLoad = true
        this.page++
      }
    },
    async checkVisibleMessages () {
      document.querySelectorAll('.message').forEach(async message => {
        if (
          this.isVisibleInsideDocument(message) &&
          this.isVisibleInsideContainer(message, document.querySelector('#messageContainer'))
        ) {
          const tmpChatMessage = this.computedMessages.find(obj => obj._id === message.getAttribute('name'))
          if (
            tmpChatMessage &&
            !this.isUpdating &&
            !this.isOwnMessage(tmpChatMessage) &&
            this.computedOwnStatusContainer.unread.map(unread => unread.id).includes(tmpChatMessage._id)
          ) {
            this.isUpdating = true
            await this.patchChatMessageNotifications(
              [
                'pullUnreadById',
                {
                  containerId: this.computedOwnStatusContainer._id,
                  ids: [tmpChatMessage._id]
                }
              ]
            )
            this.isUpdating = false
          }
        }
      })
      document.querySelectorAll('.reply').forEach(async message => {
        if (
          this.isVisibleInsideDocument(message) &&
          this.isVisibleInsideContainer(message, document.querySelector('#messageContainer')) &&
          this.isVisibleInsideContainer(message, document.querySelector('#replyContainer'))
        ) {
          const tmpChatMessage = this.messages.find(obj => obj._id === message.getAttribute('name'))
          if (
            tmpChatMessage &&
            !this.isUpdating &&
            !this.isOwnMessage(tmpChatMessage) &&
            this.computedOwnStatusContainer.unread.map(unread => unread.id).includes(tmpChatMessage._id)
          ) {
            this.isUpdating = true
            await this.patchChatMessageNotifications(
              [
                'pullUnreadById',
                {
                  containerId: this.computedOwnStatusContainer._id,
                  ids: [tmpChatMessage._id]
                }
              ]
            )
            this.isUpdating = false
          }
        }
      })
    },
    isVisibleInsideDocument (ele) {
      const { top, bottom } = ele.getBoundingClientRect()
      const vHeight = (window.innerHeight - 150 || document.documentElement.clientHeight - 150)
      const res = (
        (top > 0 || bottom > 0) &&
        top < vHeight
      )
      return res
    },
    isVisibleInsideContainer (ele, container) {
      const { bottom, height, top } = ele.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      return top <= containerRect.top
        ? (containerRect.top - top <= height)
        : (bottom - containerRect.bottom <= height)
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'rules',
      'newTab'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('users', {
      users: 'list',
      getUser: 'get'
    }),
    ...mapGetters('translations', {
      getTranslation: 'get'
    }),
    ...mapGetters('chats', {
      getChat: 'get'
    }),
    ...mapGetters('chat-messages', {
      messages: 'list'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    computedOwnStatusContainer () {
      if (this.selectedChat) {
        return this.statusContainers.find(obj => obj.reference === this.selectedChat._id && obj.user === this.user._id)
      } else {
        return undefined
      }
    },
    chatMessagesParams () {
      if (this.selectedChat) {
        return {
          query: {
            chat: this.selectedChat._id,
            repliesTo: { $exists: false },
            $limit: this.itemsPerPage,
            $skip: (this.page - 1) * this.itemsPerPage,
            $sort: { createdAt: -1 }
          },
          qid: this.selectedChat ? this.selectedChat._id : 'default'
        }
      } else {
        return false
      }
    },
    computedMessages () {
      if (this.selectedChat && this.messages && this.triggerNewMessage) {
        return this.messages.filter(obj => obj.chat === this.selectedChat._id && !obj.repliesTo)
      } else {
        return []
      }
    }
  },

  asyncComputed: {
    async computedOtherStatusContainers () {
      if (this.triggerNewMessage) {}
      if (this.selectedChat) {
        return await this.findStatusContainers(
          {
            query: {
              user: { $ne: this.user._id },
              type: 'chats',
              reference: this.selectedChat._id
            }
          }
        )
      } else {
        return []
      }
    }
  },

  watch: {
    computedMessages: {
      deep: true,
      handler (newValue, oldValue) {
        if (document.querySelector('#messageContainer')) {
          this.$nextTick(() => {
            this.$nextTick(() => {
              if (oldValue.length < newValue.length && !this.scrollDirty) {
                document.querySelector('#messageContainer').scrollTop = document.querySelector('#messageContainer').scrollHeight
              } else if (this.scrollDirty && this.manualLoad) {
                document.querySelector('#messageContainer').scrollTop = document.querySelector('#messageContainer').scrollHeight - this.tmpScrollHeight
              } else if (oldValue.length < newValue.length && this.scrollDirty && !this.manualLoad) {
                this.showScrollDown = true
              }
              this.checkVisibleMessages()
              this.manualLoad = false
            })
          })
          this.tmpScrollHeight = document.querySelector('#messageContainer').scrollHeight
        }
      }
    },
    isFindChatMessagesPending () {
      if (
        !this.isFindChatMessagesPending &&
        this.selectedChat &&
        this.chatMessagesPaginationData[this.selectedChat._id]
      ) {
        this.loading = false
        this.total = this.chatMessagesPaginationData[this.selectedChat._id].mostRecent.total
        this.triggerNewMessage = Date.now()
      } else {
        this.loading = true
        setTimeout(() => {
          this.init = false
        }, 1000)
      }
    },
    selectedChat () {
      if (this.init && this.selectedChat) {
        // Init listeners
        this.$nextTick(() => {
          window.addEventListener('scroll', this.checkVisibleMessages)
          document.querySelector('#messageContainer').addEventListener('scroll', this.checkVisibleMessages)
        })
      }
    },
    message () {
      if (this.message) {
        this.message = this.$sanitize(this.message)
        this.message = this.message.replaceAll('<blockquote>', '<blockquote class="blockquote">')
      }
    },
    showViolationDialog () {
      if (!this.showViolationDialog) {
        this.itemToReport = undefined
      }
    },
    itemToReport () {
      if (this.itemToReport) {
        this.showViolationDialog = true
      } else {
        this.showViolationDialog = false
      }
    }
  }
}
</script>
