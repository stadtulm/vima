<template>
  <div
    v-if="mainMessage && computedMessages"
  >
    <v-row v-if="level === 1">
      <DiscussionReply
        :level="level"
        :user="user"
        :discussion="discussion"
        :computedGroupStatus="computedGroupStatus"
        :selectedReplyToAnswer="selectedReplyToAnswer"
        :message="mainMessage"
        :isEditMessage="isEditMessage"
        @update:selectedReplyToAnswer="replyMessage"
        @update:resetInput="resetInput()"
      >
      </DiscussionReply>
    </v-row>
    <v-row
      id="replyContainer"
      v-if="computedMessages && computedMessages.length > 0"
    >
      <v-col
        v-for="(message, i) in computedMessages"
        :key="i"
        cols="12"
        class="pa-2 pl-12"
        :class="isOwnMessage(message) ? '': 'reply'"
        :name="message._id"
      >
        <v-sheet
          outlined
          style="border-left: 5px solid grey"
          class="px-4 my-2 ml-6 foreign-sheet elevation-5"
          :color="isOwnMessage(message) ?
            (
              isEditMessage?._id === message._id ?
                '#ffeac2' :
                replyColors[level - 1]
            ) :
            (computedOwnSubscriberStatusContainer?.unread.map(unread => unread.id).includes(message._id)) ?
              $settings.indicatorColor:
              replyColors[level - 1]
          "
        >
          <!-- User -->
          <v-row
            dense
          >
            <v-col>
              <v-list-item
                class="px-0"
              >
                <template
                  v-slot:prepend
                >
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
                </template>
                <v-row>
                  <v-col
                    cols="12"
                    class="text-subtitle-1 pb-0"
                    style="line-height:28px"
                    @click="!isOwnMessage(message) ? $router.push({name: 'User', params: { user: message.author}}) : ''"
                    :class="!isOwnMessage(message) ? 'pointer' : ''"
                  >
                    {{getUser(message.author).userName}}
                    <country-flag
                      v-if="getUser(message.author).nationality"
                      style="translate: -0px 5.5px;"
                      :country="getUser(message.author).nationality === 'en' ? 'gb': getUser(message.author).nationality"
                    ></country-flag>
                  </v-col>
                  <v-col
                    class="pt-0 text-subtitle-2 text-customGrey"
                  >
                  {{$moment(message.createdAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}} {{message.editedAt ? '(' + $t('editedAt') + ' ' + $moment(message.editedAt).format('DD.MM.YYYY, HH:mm') + ' ' + $t('oClock') + ')': ''}}
                  </v-col>
                </v-row>
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
            class="mb-2"
          >
            <v-col
              class="text-body-1"
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
                            allMessages
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
                              color="transparent"
                              class="pa-1"
                            >
                              <div
                                v-html="$sanitize(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />')))"
                              >
                              </div>
                            </v-sheet>
                            <TranslatableTextInfo
                              :canTranslate="true"
                              :canTranslateAll="allMessages.filter(m => !isOwnMessage(m)).length > 1"
                              @update:translateText="(data) => { translateText(data) }"
                            ></TranslatableTextInfo>
                          </template>

                          <template
                            v-slot:translatedLang="{ computedText, showOriginal, translateText }"
                          >
                            <v-sheet
                              color=""
                              class="pa-2 mb-4"
                            >
                              <div
                                v-html="$sanitize(newTab(computedText.value.replace(/(?:\r\n|\r|\n)/g, '<br />')))"
                              >
                              </div>
                            </v-sheet>
                            <TranslatableTextInfo
                              :canShowOriginal="true"
                              :needsUpdate="message.translationSum !== computedText.translationSum"
                              @update:showOriginal="(data) => { showOriginal(data) }"
                              @update:translateText="(data) => { translateText(data) }"
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
                              :key="message.updatedAt"
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
                        >
                          <template v-slot:activator="{ props }">
                            <v-btn
                              icon
                              v-bind="props"
                              class="mb-2 elevation-1 customGreyUltraLight"
                            >
                              <v-icon
                                size="14"
                                color="customGrey"
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
                              <template
                                v-slot:prepend
                              >
                                <v-icon>
                                  fas fa-pen
                                </v-icon>
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
                                <v-icon>
                                  fas fa-trash
                                </v-icon>
                              </template>
                              <v-list-item-title>
                                {{$t('deleteButton')}}
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                        <v-menu
                          v-if="!isOwnMessage(message) && user"
                        >
                          <template v-slot:activator="{ props }">
                            <v-btn
                              icon
                              v-bind="props"
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
                              @click="$emit('update:report', message)"
                            >
                              <template
                                v-slot:prepend
                              >
                                <v-icon>
                                  fas fa-exclamation-triangle
                                </v-icon>
                              </template>
                              <v-list-item-title>
                                {{$t('reportButton')}}
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </v-col>
                    </v-row>
                    <v-row>
                      <DiscussionReply
                        :level="level"
                        :user="user"
                        :discussion="discussion"
                        :computedGroupStatus="computedGroupStatus"
                        :selectedReplyToAnswer="selectedReplyToAnswer"
                        :message="message"
                        :isEditMessage="isEditMessage"
                        @update:selectedReplyToAnswer="replyMessage"
                        @update:resetInput="resetInput()"
                      >
                      </DiscussionReply>
                    </v-row>
                    <!-- Replies -->
                    <DiscussionReplies
                      :mainMessage="message"
                      :discussion="discussion"
                      @update:checkVisibleMessages="$emit('update:checkVisibleMessages')"
                      @update:report="$emit('update:report', $event)"
                      @update:closeViolationDialog="$emit('update:closeViolationDialog', $event)"
                      @update:translateText="$emit('update:translateText', $event)"
                      :computedOwnSubscriberStatusContainer="computedOwnSubscriberStatusContainer"
                      :computedGroupStatus="computedGroupStatus"
                      :level="level + 1"
                    ></DiscussionReplies>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import TranslatableText from '@/components/TranslatableText.vue'
import TranslatableTextInfo from '@/components/TranslatableTextInfo.vue'
import Lightbox from '@/components/Lightbox.vue'
import DiscussionReply from './DiscussionReply.vue'

export default {
  name: 'DiscussionReplies',

  props: [
    'mainMessage',
    'discussion',
    'computedOwnSubscriberStatusContainer',
    'computedGroupStatus',
    'level',
    'sort'
  ],

  emits: [
    'update:checkVisibleMessages',
    'update:report',
    'update:translateText',
    'update:resetInput'
  ],

  components: {
    TranslatableText,
    TranslatableTextInfo,
    Lightbox,
    DiscussionReply
  },

  data: () => ({
    selectedReplyToAnswer: undefined,
    isEditMessage: undefined,
    pics: [],
    manualLoad: false,
    messages: undefined
  }),

  async mounted () {
    await this.loadMessageReplies()
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapMutations('translator', {
      updateTranslationItem: 'updateItem'
    }),
    ...mapActions('discussion-messages', {
      createMessage: 'create',
      patchMessage: 'patch',
      removeMessage: 'remove',
      findMessages: 'find'
    }),
    replyMessage (message) {
      this.resetInput()
      this.selectedReplyToAnswer = message
    },
    isOwnMessage (message) {
      if (this.user) {
        return message.author === this.user._id
      } else {
        return false
      }
    },
    resetInput () {
      this.isEditMessage = undefined
      this.selectedReplyToAnswer = undefined
      this.pics = []
      this.$emit('update:resetInput')
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
      this.selectedReplyToAnswer = message._id
      this.isEditMessage = message
      await this.$nextTick()
      const element = document.getElementById('messageInput_' + message._id)
      const y = element.getBoundingClientRect().top + window.pageYOffset - 180
      window.scrollTo({ top: y, behavior: 'smooth' })
    },
    async loadMessageReplies () {
      this.messages = (await this.findMessages(
        this.discussionMessagesParams
      )).data
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'newTab',
      'replyColors'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('discussion-messages', {
      allMessages: 'list'
    }),
    discussionMessagesParams () {
      const query = {
        discussion: this.discussion._id,
        repliesTo: this.mainMessage._id,
        $sort: { createdAt: this.sort }
      }
      return {
        query,
        qid: this.mainMessage._id,
        debounce: 1000,
        $paginate: false
      }
    },
    computedMessages () {
      if (this.messages) {
        const tmpDiscussionReplies = JSON.parse(JSON.stringify(this.messages))
        return tmpDiscussionReplies
          .sort((b, a) => {
            if (this.sort > 0) {
              return new Date(b.createdAt) - new Date(a.createdAt)
            } else {
              return new Date(a.createdAt) - new Date(b.createdAt)
            }
          })
      } else {
        return []
      }
    }
  },

  watch: {
    async allMessages () {
      await this.loadMessageReplies()
    },
    computedMessages (newValue, oldValue) {
      if (document.querySelector('#replyContainer')) {
        this.$nextTick(() => {
          this.$nextTick(() => {
            if (oldValue.length < newValue.length && !this.manualLoad) {
              document.querySelector('#messageContainer').scrollTop = document.querySelector('#messageContainer').scrollTop + document.querySelector('[name="' + newValue[newValue.length - 1]._id + '"]').clientHeight
            }
            this.$emit('update:checkVisibleMessages')
            this.manualLoad = false
          })
        })
      }
    }
  }
}
</script>
