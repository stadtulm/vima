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
              style="overflow-y: auto; overflow-x: hidden"
              color="#ECEFF1"
              :max-height="maxContainerHeight"
            >
              <v-row>
                <v-col
                  v-if="!computedMessages || computedMessages.length === 0"
                >
                  <template v-if="isFindDiscussionMessagesPending">
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
                  <v-col v-if="isFindDiscussionMessagesPending">
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
                    v-else-if="discussionMessagesPaginationData[mainMessage._id].mostRecent.total > computedMessages.length"
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
                    v-else-if="discussionMessagesPaginationData[mainMessage._id].mostRecent.total <= computedMessages.length"
                    class="text-center customGrey--text body-1 mt-3"
                  >
                    {{$t('noOlderAnswers')}}
                  </v-col>
                  <v-col
                    v-for="(message, i) in computedMessages.sort((b, a) => { return new Date(b.createdAt) - new Date(a.createdAt) })"
                    :key="i"
                    cols="12"
                    class="pa-2"
                    :class="isOwnMessage(message) ? '': 'reply'"
                    :name="message._id"
                  >
                    <v-sheet
                      class="px-4 py-2 foreign-sheet"
                      :color="isOwnMessage(message) ? (isEditMessage === message._id ? '#ffeac2' : '#f0f0f0') : (computedOwnSubscriberStatusContainer && computedOwnSubscriberStatusContainer.unread.map(unread => unread.id).includes(message._id)) ? 'customLimeBg': '#f6f6f6'"
                    >
                      <!-- User -->
                      <v-row
                        dense
                      >
                        <v-col
                          :class="showRepliesObj[message._id] ? 'white--text' : 'grey--text'"
                        >
                          <v-list-item
                            class="px-0"
                          >
                            <v-list-item-avatar>
                              <v-avatar
                                color="customGreyLight"
                              >
                                <v-img
                                  v-if="getUser(message.author).pic"
                                  :src="s3 + getUser(message.author).pic.url"
                                  :alt="$t('userPic') + ' ' + $t('by') + ' ' + getUser(message.author).userName"
                                  :title="getUser(message.author).pic.credit ? '© ' + getUser(message.author).pic.credit : ''"
                                >
                                </v-img>
                                <v-icon
                                  v-else
                                  color="white"
                                >
                                  fas fa-user
                                </v-icon>
                              </v-avatar>
                            </v-list-item-avatar>
                            <v-list-item-content>
                              <v-row>
                                <v-col
                                  cols="12"
                                  class="subtitle-1 pb-0"
                                  style="line-height:20px"
                                  @click="!isOwnMessage(message) ? $router.push({name: 'User', params: { user: message.author}}) : ''"
                                  :class="!isOwnMessage(message) ? 'pointer' : ''"
                                >
                                  {{getUser(message.author).userName}}
                                </v-col>
                                <v-col
                                  class="pt-0 caption"
                                >
                                {{$moment(message.createdAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}} {{message.editedAt ? '(' + $t('editedAt') + ' ' + $moment(message.editedAt).format('DD.MM.YYYY, HH:mm') + ' ' + $t('oClock') + ')': ''}}
                                </v-col>
                              </v-row>
                            </v-list-item-content>
                          </v-list-item>
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
                                max-width="90%"
                                style="display:inline-block"
                                color="transparent"
                              >
                                <!-- Message and ellipsis-button -->
                                <v-row
                                  dense
                                  class="align-center"
                                >
                                  <v-col
                                    cols="12"
                                  >
                                    <v-sheet
                                      v-html="$sanitize(newTab(message.text.replace(/(?:\r\n|\r|\n)/g, '<br />')))"
                                      color="transparent"
                                      class="pa-1"
                                    >
                                    </v-sheet>
                                  </v-col>
                                  <v-col
                                    cols="12"
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
                                          class="mb-2 elevation-1 customGreyUltraLight"
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
                                    <v-menu
                                      v-if="!isOwnMessage(message) && user"
                                      offset-y
                                      open-on-hover
                                    >
                                      <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                          icon
                                          v-bind="attrs"
                                          v-on="on"
                                          class="mb-2 elevation-1 customGreyUltraLight"
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
                                  </v-col>
                                </v-row>
                              </v-sheet>
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
              <v-col
                v-if="!user"
              >
                <v-alert
                  dark
                  icon="fas fa-info-circle"
                  color="customTeal"
                >
                  <v-row>
                    <v-col>
                      {{$t('loginForDiscussions')}}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-btn
                        class="elevation-1 customGrey--text"
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
                        class="elevation-1 ml-3 customGrey--text"
                        color="white"
                        :to="{ name: 'Login' }"
                      >
                        {{$t('loginButton')}}
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
                  color="customTeal"
                >
                  <v-row>
                    <v-col>
                      {{$t('applyForGroup')}}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-btn
                        class="elevation-1 customGrey--text"
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
                v-else
              >
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
                        color="customTeal"
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
  name: 'DiscussionReplies',

  mixins: [makeFindMixin({ service: 'discussion-messages', watch: true })],

  props: [
    'mainMessage',
    'discussion',
    'computedOwnSubscriberStatusContainer',
    'computedGroupStatus'
  ],
  components: {
    TiptapVuetify
  },

  data: () => ({
    isUpdating: false,
    isEditMessage: undefined,
    showRepliesObj: {},
    manualLoad: false,
    maxContainerHeight: 600,
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
    ...mapActions('discussion-messages', {
      createMessage: 'create',
      patchMessage: 'patch',
      removeMessage: 'remove'
    }),
    loadMoreReplies () {
      this.manualLoad = true
      this.page++
    },
    isOwnMessage (message) {
      if (this.user) {
        return message.author === this.user._id
      } else {
        return false
      }
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
                discussion: this.discussion._id,
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
      's3',
      'newTab'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('discussion-messages', {
      messages: 'list'
    }),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    discussionMessagesParams () {
      const query = {
        discussion: this.discussion._id,
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
    computedMessages (newValue, oldValue) {
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
    },
    isFindDiscussionMessagesPending () {
      if (!this.isFindDiscussionMessagesPending) {
        this.loading = false
        this.total = this.discussionMessagesPaginationData[this.mainMessage._id].mostRecent.total
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
