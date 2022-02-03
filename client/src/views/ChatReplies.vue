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
                      class="text-center customGrey--text body-1 mt-4"
                    >
                      {{$t('loadingAnswers')}}
                    </v-col>
                  </template>
                   <template v-else>
                    <v-col
                      class="text-center customGrey--text body-1"
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
                      class="text-center customGrey--text body-1 mt-4"
                    >
                      {{$t('loadingOlderAnswers')}}
                    </v-col>
                  </v-col>
                  <v-col
                    v-else-if="chatMessagesPaginationData[mainMessage._id].mostRecent.total > computedMessages.length"
                    class="text-center customGrey--text body-1 my-3"
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
                    class="text-center customGrey--text body-1 mt-3"
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
                      :color="isOwnMessage(message) ? (isEditMessage === message._id ? '#ffeac2' : '#f0f0f0') : (computedOwnStatusContainer.unread.map(unread => unread.id).includes(message._id)) ? 'customLimeBg': '#f6f6f6'"
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
                          class="body-1"
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
                                    <v-card>
                                      <v-card-text>
                                        <v-row
                                          dense
                                        >
                                          <v-col>
                                            <v-btn
                                              block
                                              outlined
                                              small
                                              color="customGrey"
                                              @click="editMessage(message)"
                                            >
                                              {{$t('editButton')}}
                                              <v-icon
                                                size="14"
                                                class="ml-2"
                                              >
                                                fas fa-pen
                                              </v-icon>
                                            </v-btn>
                                          </v-col>
                                        </v-row>
                                        <v-row
                                          dense
                                        >
                                          <v-col>
                                            <v-btn
                                              block
                                              outlined
                                              small
                                              color="customGrey"
                                              @click="deleteMessage(message._id)"
                                            >
                                              {{$t('deleteButton')}}
                                              <v-icon
                                                size="14"
                                                class="ml-2"
                                              >
                                                fas fa-trash
                                              </v-icon>
                                            </v-btn>
                                          </v-col>
                                        </v-row>
                                      </v-card-text>
                                    </v-card>
                                  </v-menu>
                                  <v-col
                                    class="text-left"
                                  >
                                    <v-sheet
                                      v-html="$sanitize(newTab(message.text.replace(/(?:\r\n|\r|\n)/g, '<br />')))"
                                      :color="isOwnMessage(message) ? '#fff' : 'customGreyLight'"
                                      :class="{'rounded-l-xl rounded-tr-xl': isOwnMessage(message), 'rounded-r-xl rounded-tl-xl': !isOwnMessage(message), 'mb-2': isSeen(message._id)}"
                                      class="px-4 py-1 elevation-4"
                                    >
                                    </v-sheet>
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
                                    <v-card>
                                      <v-card-text>
                                        <v-btn
                                          block
                                          outlined
                                          small
                                          color="customGrey"
                                          @click="$emit('report', message)"
                                        >
                                          {{$t('reportButton')}}
                                          <v-icon
                                            size="14"
                                            class="ml-2"
                                          >
                                            fas fa-exclamation-triangle
                                          </v-icon>
                                        </v-btn>
                                      </v-card-text>
                                    </v-card>
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
            <v-row
              dense
            >
              <v-col>
                <v-form
                  ref="messagesForm"
                  v-model="isValid"
                >
                  <v-row
                    class="align-end"
                  >
                    <v-col
                      class="grow pr-1 text-left"
                    >
                      <tiptap-vuetify
                        :editor-properties="{
                          disableInputRules: true,
                          disablePasteRules: true
                        }"
                        color="customGreyBg"
                        v-model="message"
                        :card-props="{ tile: true, flat: true }"
                        style="border: 1px solid #aaa;"
                        :extensions="extensions"
                        :placeholder="$t('writeNewAnswer') + ' ...'"
                      >
                      </tiptap-vuetify>
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
  </div>
</template>

<script>

import { makeFindMixin } from 'feathers-vuex'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { TiptapVuetify, Bold, Blockquote, BulletList, OrderedList, ListItem, Link } from 'tiptap-vuetify'

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
    TiptapVuetify
  },

  data: () => ({
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
    },
    extensions: [
      Bold,
      Blockquote,
      ListItem,
      BulletList,
      OrderedList,
      Link
    ]
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
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
    async deleteMessage (messageId) {
      try {
        await this.removeMessage(messageId)
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
      }
    },
    async editMessage (message) {
      this.isEditMessage = message._id
      this.message = message.text
      document.querySelector('#replyInput' + this.mainMessage._id).scrollIntoView()
    },
    async sendMessage () {
      this.isSending = true
      if (!this.isEditMessage) {
        try {
          await this.createMessage(
            [
              {
                chat: this.selectedChat._id,
                author: this.user._id,
                text: this.message,
                repliesTo: this.mainMessage._id
              }
            ]
          )
          this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
          this.$refs.messagesForm.reset()
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
                text: this.message,
                editedAt: new Date()
              }
            ]
          )
          this.setSnackbar({ text: this.$t('snackbarEditSuccess'), color: 'success' })
          this.$refs.messagesForm.reset()
          this.message = undefined
          this.isEditMessage = undefined
        } catch (e) {
          this.setSnackbar({ text: this.$t('snackbarEditError'), color: 'error' })
        }
      }
      this.isSending = false
    }
  },

  computed: {
    ...mapGetters([
      'newTab'
    ]),
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
