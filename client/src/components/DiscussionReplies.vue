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
                      :color="isOwnMessage(message) ? (isEditMessage && isEditMessage._id === message._id ? '#ffeac2' : '#f0f0f0') : (computedOwnSubscriberStatusContainer && computedOwnSubscriberStatusContainer.unread.map(unread => unread.id).includes(message._id)) ? $settings.indicatorColor: '#f6f6f6'"
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
                      <v-row dense>
                        <v-col>
                          <v-divider></v-divider>
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
                                width="100%"
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

                                    <TranslatableText
                                      ownField="text"
                                      :allFields="['text']"
                                      :allIds="
                                        computedMessages
                                          .filter(m => !isOwnMessage(m))
                                          .map(m => { return { id: m._id, translationSum: m.translationSum } })
                                      "
                                      type="discussion-messages"
                                      :textParent="message"
                                    >
                                      <template
                                        v-slot:defaultLang="{ computedText, translateText }"
                                      >
                                        <v-sheet
                                          v-html="$sanitize(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />')))"
                                          color="transparent"
                                          class="pa-1"
                                        >
                                        </v-sheet>
                                        <TranslatableTextInfo
                                          :canTranslate="true"
                                          :canTranslateAll="computedMessages.filter(m => !isOwnMessage(m)).length > 1"
                                          @translateText="(data) => { translateText(data) }"
                                        ></TranslatableTextInfo>
                                      </template>

                                      <template
                                        v-slot:translatedLang="{ computedText, showOriginal, translateText }"
                                      >
                                        <v-sheet
                                          v-html="$sanitize(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />')))"
                                          color=""
                                          class="pa-2 mb-4"
                                        >
                                        </v-sheet>
                                        <TranslatableTextInfo
                                          :canShowOriginal="true"
                                          :needsUpdate="message.translationSum !== computedText.translationSum"
                                          @showOriginal="(data) => { showOriginal(data) }"
                                          @translateText="(data) => { translateText(data) }"
                                        ></TranslatableTextInfo>
                                      </template>
                                    </TranslatableText>
                                    <v-row
                                      v-if="message.pics && message.pics.length > 0"
                                      class="my-3"
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
                                <v-row dense>
                                  <v-col>
                                    <v-divider
                                      class="mt-4"
                                    ></v-divider>
                                  </v-col>
                                </v-row>
                                <v-row>
                                  <v-col
                                    cols="12"
                                  >
                                    <v-menu
                                      v-if="isOwnMessage(message)"
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
                                    <v-menu
                                      v-if="!isOwnMessage(message) && user"
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
                                      <v-list
                                        dense
                                        rounded
                                      >
                                        <!-- Report button -->
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
                  :color="$settings.modules.discussions.color"
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
                    class="align-start"
                  >
                    <v-col
                      class="text-left"
                      cols="11"
                    >
                      <tiptap-vuetify
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
                      </tiptap-vuetify>
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
                      class="px-0 text-center"
                      :class="$vuetify.breakpoint.smAndUp ? 'mt-11': 'mt-12'"
                    >
                      <v-btn
                        fab
                        :small="!$vuetify.breakpoint.mdAndUp"
                        :loading="isSending"
                        :disabled="!isValid || !message || message.replace(/(\r\n|\n|\r)/gm, '').replaceAll('<p>', '').replaceAll('</p>', '').replaceAll(' ', '') === ''"
                        @click="sendMessage()"
                        :color="$settings.modules.discussions.color"
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
import TranslatableText from '@/components/TranslatableText.vue'
import TranslatableTextInfo from '@/components/TranslatableTextInfo.vue'
import Lightbox from '@/components/Lightbox.vue'
import FileUpload from '@/components/FileUpload.vue'

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
    TiptapVuetify,
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
    ...mapMutations('translations', {
      updateTranslationItem: 'updateItem'
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
                discussion: this.discussion._id,
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
              this.isEditMessage._id,
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
      's3',
      'newTab'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('discussion-messages', {
      messages: 'list'
    }),
    ...mapGetters('translations', {
      getTranslation: 'get'
    }),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    discussionMessagesParams () {
      const query = {
        discussion: this.discussion._id,
        repliesTo: this.mainMessage._id,
        $limit: this.itemsPerPage,
        $skip: (this.page - 1) * this.itemsPerPage < 0 ? 0 : (this.page - 1) * this.itemsPerPage,
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
