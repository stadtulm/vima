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
                                          v-if="!isOwnMessage(message)"
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
                                        <Lightbox
                                          :pic="pic"
                                        ></Lightbox>
                                      </v-col>
                                    </v-row>
                                  </v-col>
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
                  ref="messagesForm"
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
                        @click="uploadResetInput"
                      >
                        {{$t('cancelButton')}}
                      </v-btn>
                    </v-col>
                  </v-row>
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
                        color="customGreyUltraLight"
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
                  <v-row
                    v-if="dropzones.discussionReplyUpload && dropzones.discussionReplyUpload.pics.length > 0"
                  >
                    <v-col
                      v-for="(pic, i) of dropzones.discussionReplyUpload.pics"
                      :key="i"
                      cols="2"
                    >
                      <v-img
                        :src="pic.url ? s3 + pic.url : pic.dataURL"
                        @click="uploadShowDialog()"
                        class="pointer"
                        :class="pic.dataURL ? 'progress': ''"
                        aspect-ratio="1"
                        cover
                      >
                      </v-img>
                    </v-col>
                  </v-row>
                </v-form>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      eager
      persistent
      v-model="isUploadVisible"
    >
      <v-card>
        <v-container>
          <v-row>
            <v-col>
              <Upload
                ref="discussionReplyUpload"
                :pics="isEditMessage && isEditMessage.pics ? isEditMessage.pics : []"
                :key="dropzones.discussionReplyUpload.key"
                :optional="false"
                :label="$t('pics') + ' REPLY'"
                :maxFilesize="2"
                :maxFiles="5"
                resolutionString="1400x400"
                :resizeWidth="1080"
                resizeMethod="contain"
                :resizeQuality="0.5"
                :patchParentMethod="patchMessage"
                titleType="title"
                bgColor="white"
                @uploadHideDialog="(queuedPics) => { uploadHideDialog('discussionReplyUpload', queuedPics) }"
                @uploadRemovePic="(removedPic) => { uploadRemovePic('discussionReplyUpload', removedPic) }"
              ></Upload>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import { makeFindMixin } from 'feathers-vuex'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { TiptapVuetify, Bold, Blockquote, BulletList, OrderedList, ListItem, Link } from 'tiptap-vuetify'
import TranslatableText from '@/components/TranslatableText.vue'
import TranslatableTextInfo from '@/components/TranslatableTextInfo.vue'
import Upload from '@/components/Upload.vue'
import Vue from 'vue'
import UploadButton from '@/components/UploadButton.vue'
import Lightbox from '@/components/Lightbox.vue'

export default {
  name: 'DiscussionReplies',

  mixins: [makeFindMixin({ service: 'discussion-messages', watch: true })],

  props: [
    'mainMessage',
    'discussion',
    'computedOwnSubscriberStatusContainer',
    'computedGroupStatus',
    'dropzones',
    'uploadGetAllPics'
  ],
  components: {
    TiptapVuetify,
    TranslatableText,
    TranslatableTextInfo,
    Upload,
    Lightbox
  },

  data: () => ({
    isUploadVisible: false,
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
    this.$nextTick(() => {
      const ComponentClass = Vue.extend(UploadButton)
      const instance = new ComponentClass()
      instance.$mount()
      const el = document.querySelector('.tiptap-vuetify-editor__toolbar .v-toolbar__content div')
      el.appendChild(instance.$el)
      instance.$el.addEventListener('click', this.uploadShowDialog)
    })
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
    uploadRemovePic (name, pic) {
      this.patchMessage([
        this.isEditMessage._id,
        {
          $pull: {
            pics: {
              _id: pic._id
            }
          }
        }
      ])
    },
    uploadResetInput () {
      this.isEditMessage = undefined
      this.dropzones.discussionReplyUpload = {
        pics: [],
        key: Date.now()
      }
      this.$refs.messagesForm.reset()
      this.message = undefined
    },
    uploadShowDialog () {
      this.isUploadVisible = true
    },
    uploadHideDialog (name, queuedPics) {
      this.isUploadVisible = undefined
      if (!queuedPics) {
        this.dropzones[name] = {
          key: Date.now(),
          pics: []
        }
      } else {
        this.dropzones[name].pics = this.uploadGetAllPics(
          [
            this.isEditMessage ? this.isEditMessage.pics : [],
            queuedPics
          ]
        )
      }
    },
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
      this.isEditMessage = message
      this.message = message.text.value
      this.dropzones.discussionReplyUpload = {
        pics: this.uploadGetAllPics(
          [
            this.isEditMessage ? this.isEditMessage.pics : []
          ]
        ),
        key: Date.now()
      }
      document.querySelector('#replyInput' + this.mainMessage._id).scrollIntoView()
    },
    async sendMessage () {
      this.isSending = true
      if (!this.isEditMessage) {
        try {
          const pics = await this.$refs.discussionReplyUpload.processQueue()
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
                pics
              }
            ]
          )
          this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
          this.uploadResetInput()
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
          const pics = await this.$refs.discussionReplyUpload.processQueue()
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
                pics,
                editedAt: new Date()
              }
            ]
          )
          this.setSnackbar({ text: this.$t('snackbarEditSuccess'), color: 'success' })
          this.uploadResetInput()
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
