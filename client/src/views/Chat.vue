<template>
  <div
    v-if="selectedChat || $route.params.username"
  >
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <v-col
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('chatWith')}} {{selectedChat && otherStatusContainers?.length === 1 ? users.find(obj => obj._id === otherStatusContainers[0].user).userName : $route.params.username }}
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-sheet
          @scroll="onScroll"
          id="messageContainer"
          min-height="100px"
          max-height="75vh"
          color="customGreyLight"
          class="pa-6 elevation-4"
          style="overflow-y: auto; overflow-x: hidden"
        >
          <template
            v-if="!computedMessages || computedMessages.length === 0"
          >
            <template v-if="isLoading || init">
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
          </template>
          <template
            v-else
          >
            <v-col v-if="isLoading">
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
              v-else-if="selectedChat && chatMessagesResponse.total <= computedMessages.length"
              class="text-center text-customGrey text-body-1 mt-3"
            >
              {{$t('noOlderAnswers')}}
            </v-col>
            <v-col
              v-for="(message, i) in computedMessages"
              :key="i"
              cols="12"
              class="pa-0 my-4"
              :class="isOwnMessage(message) ? 'text-right': 'message text-left'"
              :name="message._id"
            >
                <!-- Username & Date -->
                <v-row>
                  <v-col
                    class="mb-1 font-weight-light text-customGrey"
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
                    <v-sheet
                      style="display:inline-block"
                      color="transparent"
                    >
                      <v-row>
                        <v-col
                          class="text-left"
                        >
                          <TranslatableText
                            ownField="text"
                            :allFields="['text']"
                            :allIds="computedMessages.filter(m => !isOwnMessage(m)).map(m => ({ id: m._id, translationSum: m.translationSum }))"
                            type="chat-messages"
                            :textParent="message"
                          >
                            <template
                              v-slot:defaultLang="{ computedText, translateText }"
                            >
                              <v-row
                                dense
                                class="align-center"
                              >
                                <v-menu
                                  open-on-hover
                                  v-if="isOwnMessage(message)"
                                >
                                  <template v-slot:activator="{ props }">
                                    <v-btn
                                      size="small"
                                      icon="fas fa-ellipsis-v"
                                      v-bind="props"
                                      class="mb-2 mr-3 customGreyUltraLight elevation-1"
                                    >
                                    </v-btn>
                                  </template>
                                  <v-list
                                    dense
                                    rounded
                                  >
                                    <!-- Edit button -->
                                    <v-list-item
                                      @click="setIsEditMessage(message)"
                                    >
                                      <template
                                        v-slot:prepend
                                      >
                                        <v-avatar>
                                          <v-icon>
                                            fas fa-pen
                                          </v-icon>
                                        </v-avatar>
                                      </template>
                                      <v-list-item-title>
                                        {{$t('editButton')}}
                                      </v-list-item-title>
                                    </v-list-item>
                                    <!-- Delete button -->
                                    <v-list-item
                                      @click="deleteMessage(message._id)"
                                    >
                                      <template
                                        v-slot:prepend
                                      >
                                        <v-avatar>
                                          <v-icon>
                                            fas fa-trash
                                          </v-icon>
                                        </v-avatar>
                                      </template>
                                      <v-list-item-title>
                                        {{$t('deleteButton')}}
                                      </v-list-item-title>
                                    </v-list-item>
                                  </v-list>
                                </v-menu>
                                <v-sheet
                                  :color="getBGColor(message)"
                                  class="px-4 mr-1 py-1 elevation-4"
                                  :class="{'rounded-s-xl rounded-te-xl': isOwnMessage(message), 'rounded-e-xl rounded-ts-xl': !isOwnMessage(message), 'mb-2': isSeen(message._id)}"
                                >
                                  <div
                                    v-html="$sanitize(newTab(computedText.value))"
                                  >
                                  </div>
                                </v-sheet>
                                <!-- Menu for other message -->
                                <template
                                  v-if="!isOwnMessage(message)"
                                >
                                  <v-menu
                                    open-on-hover
                                  >
                                    <template v-slot:activator="{ props }">
                                      <v-btn
                                        size="small"
                                        icon="fas fa-ellipsis-v"
                                        class="mb-2 ml-2 customGreyUltraLight elevation-1"
                                        v-bind="props"
                                      >
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
                                        <template
                                          v-slot:prepend
                                        >
                                          <v-avatar>
                                            <v-icon>
                                              fas fa-exclamation-triangle
                                            </v-icon>
                                          </v-avatar>
                                        </template>
                                        <v-list-item-title>
                                          {{$t('reportButton')}}
                                        </v-list-item-title>
                                      </v-list-item>
                                    </v-list>
                                  </v-menu>
                                  <v-btn
                                    size="small"
                                    icon="fas fa-reply"
                                    class="mb-2 ml-3 customGreyUltraLight elevation-1"
                                    @click="setIsReplyMessage(message)"
                                  >
                                  </v-btn>
                                </template>
                              </v-row>
                              <v-col
                                class="px-0"
                                :class="isOwnMessage(message) ? 'text-right' : ''"
                              >
                                <TranslatableTextInfo
                                  :canTranslate="true"
                                  :canTranslateAll="computedMessages.filter(m => !isOwnMessage(m)).length > 1"
                                  @update:translateText="(data) => { translateText(data) }"
                                ></TranslatableTextInfo>
                              </v-col>
                            </template>

                            <template
                              v-slot:translatedLang="{ computedText, showOriginal, translateText }"
                            >
                              <v-row
                                dense
                                class="align-center"
                              >
                                <v-menu
                                  open-on-hover
                                  v-if="isOwnMessage(message)"
                                >
                                  <template v-slot:activator="{ props }">
                                    <v-btn
                                      size="small"
                                      icon="fas fa-ellipsis-v"
                                      v-bind="props"
                                      class="mb-2 mr-3 customGreyUltraLight elevation-1"
                                    >
                                    </v-btn>
                                  </template>
                                  <v-list
                                    dense
                                    rounded
                                  >
                                    <!-- Edit button -->
                                    <v-list-item
                                      @click="setIsEditMessage(message)"
                                    >
                                      <template
                                        v-slot:prepend
                                      >
                                        <v-avatar>
                                          <v-icon>
                                            fas fa-pen
                                          </v-icon>
                                        </v-avatar>
                                      </template>
                                      <v-list-item-title>
                                        {{$t('editButton')}}
                                      </v-list-item-title>
                                    </v-list-item>
                                    <!-- Delete button -->
                                    <v-list-item
                                      @click="deleteMessage(message._id)"
                                    >
                                      <template
                                        v-slot:prepend
                                      >
                                        <v-avatar>
                                          <v-icon>
                                            fas fa-trash
                                          </v-icon>
                                        </v-avatar>
                                      </template>
                                      <v-list-item-title>
                                        {{$t('deleteButton')}}
                                      </v-list-item-title>
                                    </v-list-item>
                                  </v-list>
                                </v-menu>
                                <v-sheet
                                  :color="isOwnMessage(message) ? '#fff' : 'customGrey'"
                                  class="px-3 mr-1 elevation-4"
                                  :class="{'rounded-s-xl rounded-te-xl': isOwnMessage(message), 'rounded-e-xl rounded-ts-xl': !isOwnMessage(message), 'mb-2': isSeen(message._id)}"
                                >
                                  <v-sheet
                                    tile
                                    class="py-1 mt-3 mb-4 px-2 rounded-lg"
                                    color="rgba(100,255,100,0.3)"
                                  >
                                    <div
                                      :class="isOwnMessage(message) ? '': 'text-white'"
                                      v-html="$sanitize(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />')))"
                                    >
                                    </div>
                                  </v-sheet>
                                </v-sheet>
                                <v-menu
                                  open-on-hover
                                  v-if="!isOwnMessage(message)"
                                >
                                  <template v-slot:activator="{ props }">
                                    <v-btn
                                      size="small"
                                      icon="fas fa-ellipsis-v"
                                      class="mb-2 ml-2 customGreyUltraLight elevation-1"
                                      v-bind="props"
                                    >
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
                                      <template
                                        v-slot:prepend
                                      >
                                        <v-avatar>
                                          <v-icon>
                                            fas fa-exclamation-triangle
                                          </v-icon>
                                        </v-avatar>
                                      </template>
                                      <v-list-item-title>
                                        {{$t('reportButton')}}
                                      </v-list-item-title>
                                    </v-list-item>
                                  </v-list>
                                </v-menu>
                              </v-row>
                              <v-col
                                class="pr-0"
                                :class="isOwnMessage(message) ? 'text-right' : ''"
                              >
                                <TranslatableTextInfo
                                  :canShowOriginal="true"
                                  :needsUpdate="message.translationSum !== computedText.translationSum"
                                  @update:showOriginal="(data) => { showOriginal(data) }"
                                  @update:translateText="(data) => { translateText(data) }"
                                ></TranslatableTextInfo>
                              </v-col>
                            </template>
                          </TranslatableText>
                        </v-col>
                      </v-row>
                    </v-sheet>
                    <!-- Unread -->
                    <v-row
                      dense
                      v-if="isOwnMessage(message) && !isSeen(message._id)"
                    >
                      <v-col
                        cols="12"
                        class="text-caption"
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
            </v-col>
            <v-snackbar
              :color="$settings.indicatorColor"
              @click="() => { scrollDownWithinContainer(); scrollDownToContainer(); showScrollDown = false }"
              timeout="-1"
              :model-value="showScrollDown"
            >
              {{$t('newChatMessages')}}
              <v-icon
                class="ml-3"
                size="18"
              >
                fas fa-arrow-down
              </v-icon>
            </v-snackbar>
          </template>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <chat-send
          id="chatSend"
          :user="user"
          :chat="selectedChat"
          :isEditMessage="isEditMessage"
          :isReplyMessage="isReplyMessage"
          @update:resetInput="resetInput"
          @update:checkVisibleMessages="checkVisibleMessages()"
        ></chat-send>
      </v-col>
    </v-row>
    <ViolationDialog
      type="chats"
      :showViolationDialog="showViolationDialog"
      :message="itemToReport"
      :key="JSON.stringify(itemToReport)"
      @update:closeViolationDialog="itemToReport = undefined"
    ></ViolationDialog>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import ViolationDialog from '@/components/ViolationDialog.vue'
import TranslatableText from '@/components/TranslatableText.vue'
import TranslatableTextInfo from '@/components/TranslatableTextInfo.vue'
import Lightbox from '@/components/Lightbox.vue'
import ChatSend from '@/components/ChatSend.vue'

export default {
  name: 'Chat',

  components: {
    ViolationDialog,
    TranslatableText,
    TranslatableTextInfo,
    Lightbox,
    ChatSend
  },
  data: () => ({
    chatMessagesResponse: undefined,
    otherStatusContainers: undefined,
    showViolationDialog: undefined,
    itemToReport: undefined,
    triggerNewMessage: 1,
    isUpdating: false,
    isEditMessage: undefined,
    isReplyMessage: undefined,
    init: true,
    manualLoad: false,
    showScrollDown: false,
    scrollDirty: false,
    selectedChat: undefined,
    page: 1,
    isLoading: true,
    total: 0,
    itemsPerPage: 10
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
      this.selectedChat = (await this.findCommonChat(
        {
          query: {
            type: 'commonChat',
            users: [this.user._id, this.$route.params.user]
          }
        }
      ))[0]
      // No chat found
      if (!this.selectedChat) {
        this.isLoading = false
        return
      } else {
        this.$nextTick(() => {
          this.$nextTick(() => {
            if (document.querySelector('#messageContainer')) {
              document.querySelector('#messageContainer').scrollTop = document.querySelector('#messageContainer').scrollHeight
              this.checkVisibleMessages()
            }
          })
        })
      }
    }
    await this.loadOtherStatusContainers()
    await this.loadChatMessages()
    await this.checkVisibleMessages()
    this.init = false
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
      findChatMessages: 'find',
      removeMessage: 'remove'
    }),
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    ...mapActions('status-container-helper', {
      findCommonChat: 'find',
      patchChatMessageNotifications: 'patch'
    }),
    async loadChatMessages () {
      this.isLoading = true
      this.chatMessagesResponse = await this.findChatMessages(this.chatMessagesParams)
      this.isLoading = false
    },
    openReportDialog (message) {
      this.itemToReport = message
    },
    isSeen (messageId) {
      if (this.otherStatusContainers) {
        return this.otherStatusContainers.filter(obj => obj.unread.map(unread => unread.id).includes(messageId)).length === 0
      } else {
        return true
      }
    },
    getBGColor (message) {
      if (this.isOwnMessage(message)) {
        if (this.isEditMessage?._id === message._id) {
          return '#ffeac2'
        } else {
          return '#fff'
        }
      } else {
        if (this.computedOwnStatusContainer.unread.map(unread => unread.id).includes(message._id)) {
          return this.$settings.indicatorColor
        } else {
          return 'customGrey'
        }
      }
    },
    scrollDownWithinContainer () {
      document.querySelector('#messageContainer').scrollTo({ top: document.querySelector('#messageContainer').scrollHeight, behavior: 'smooth' })
    },
    scrollDownToContainer () {
      window.scrollTo({ top: document.querySelector('#chatSend').scrollHeight - 200, behavior: 'smooth' })
    },
    scrollDownToSend () {
      document.querySelector('#chatSend').scrollIntoView({ behavior: 'smooth', block: 'end' })
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
    async onScroll ({ target: { scrollTop, clientHeight, scrollHeight } }) {
      this.scrollDirty = true
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        this.scrollDirty = false
        this.showScrollDown = false
      }
      if (
        scrollTop === 0 &&
        this.selectedChat &&
        !this.isLoading &&
        this.chatMessagesResponse?.total > this.computedMessages.length
      ) {
        this.manualLoad = true
        this.page++
        await this.loadChatMessages()
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
    },
    async loadOtherStatusContainers () {
      if (this.triggerNewMessage) {}
      if (this.selectedChat) {
        this.otherStatusContainers = await this.findStatusContainers(
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
    },
    setIsEditMessage (message) {
      this.isEditMessage = message
      this.scrollDownToSend()
    },
    setIsReplyMessage (message) {
      this.isReplyMessage = message
      this.scrollDownToSend()
    },
    resetInput () {
      this.isEditMessage = undefined
      this.isReplyMessage = undefined
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
      if (this.selectedChat && this.triggerNewMessage) {
        return {
          query: {
            chat: this.selectedChat._id,
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
      if (this.selectedChat && this.messages?.length > 0) {
        return this.messages
          .filter(obj => obj.chat === this.selectedChat._id)
          .sort((b, a) => { return new Date(b.createdAt) - new Date(a.createdAt) })
      } else {
        return []
      }
    }
  },

  watch: {
    messages () {
      if (!this.init) {
        this.loadChatMessages()
      }
    },
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
    selectedChat () {
      if (this.init && this.selectedChat) {
        // Init listeners
        this.$nextTick(() => {
          window.addEventListener('scroll', this.checkVisibleMessages)
          document.querySelector('#messageContainer').addEventListener('scroll', this.checkVisibleMessages)
        })
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
