<template>
  <div>
    <v-row>
      <v-col>
        <v-select
          v-model="rawSortBy"
          :label="$t('orderLabel')"
          variant="outlined"
          density="compact"
          hide-details
          :items="[
            { title: $t('orderNewFirst'), value: { key: 'createdAt', order: 'asc' } },
            { title: $t('orderOldFirst'), value: { key: 'createdAt', order: 'desc' } }
          ]"
        ></v-select>
      </v-col>
    </v-row>
    <v-row
      v-if="sortDesc < 0"
    >
      <v-col cols="12">
        <v-btn
          v-if="!showSendBlock"
          block
          size="large"
          class="mt-4"
          :color="$settings.modules.discussions.color"
          @click="showSendBlock = true"
        >
          {{$t('writeNewPostTitle')}}
        </v-btn>
      </v-col>
      <DiscussionReply
        v-show="showSendBlock"
        :level="0"
        :user="user"
        :discussion="discussion"
        :computedGroupStatus="computedGroupStatus"
        :isEditMessage="isEditMessage"
        @update:resetInput="resetInput()"
        @update:message="triggerNewMessage = Date.now()"
      >
      </DiscussionReply>
    </v-row>
    <v-row>
      <v-col>
        <v-sheet
          id="messageContainer"
          min-height="100px"
          color="transparent"
          style="overflow-y: auto; overflow-x: hidden"
        >
          <template
            v-if="!computedDiscussionMessages || computedDiscussionMessages.length === 0"
          >
            <template v-if="isFindDiscussionMessagesPending || init">
              <v-progress-linear
                color="customGrey"
                indeterminate
              ></v-progress-linear>
              <v-col
                class="text-center text-customGrey text-body-1 mt-4"
              >
                {{$t('loadingPosts')}}
              </v-col>
            </template>
            <v-col
              v-else
              class="text-center text-customGrey text-body-1 mt-3"
            >
              {{$t('noPostsYet')}}
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
            <v-col
              v-for="message in computedDiscussionMessages"
              :key="message.updatedAt"
              cols="12"
              class="pa-0 my-8 elevation-4"
              :class="isOwnMessage(message) ? '': 'message'"
              :name="message._id"
              :id="'replyInput' + message._id"
            >
              <v-sheet
                class="pa-4 foreign-sheet"
                :class="showRepliesObj[message._id] ? 'elevation-12 my-4' : 'elevation-0'"
                :color="getBGColor(message)"
              >
                <!-- User -->
                <v-row
                  dense
                >
                  <v-col
                    :class="showRepliesObj[message._id] ? 'text-white' : 'text-black'"
                  >
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
                      <v-list-item-title
                        @click="!isOwnMessage(message) ? $router.push({name: 'User', params: { user: message.author}}) : ''"
                        :class="!isOwnMessage(message) ? 'pointer' : ''"
                      >
                        {{getUser(message.author).userName}}
                      </v-list-item-title>
                      <v-list-item-subtitle
                        class="text-black"
                      >
                        {{$moment(message.createdAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}} {{message.editedAt ? '(' + $t('editedAt') + ' ' + $moment(message.editedAt).format('DD.MM.YYYY, HH:mm') + ' ' + $t('oClock') + ')': ''}}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col>
                    <v-divider
                      class="mb-1"
                    ></v-divider>
                  </v-col>
                </v-row>
                <!-- Message and ellipsis-button -->
                <v-row
                  dense
                  class="align-center text-body-1"
                >
                  <v-col
                    cols="12"
                  >
                    <TranslatableText
                      ownField="text"
                      :allFields="['text']"
                      :allIds="
                        allDiscussionMessages
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
                          :canTranslateAll="allDiscussionMessages.filter(m => !isOwnMessage(m)).length > 1"
                          @update:translateText="(data) => { translateText(data) }"
                        ></TranslatableTextInfo>
                      </template>

                      <template
                        v-slot:translatedLang="{ computedText, showOriginal, translateText }"
                      >
                        <v-sheet
                          class="pa-2"
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
                <v-row
                  v-if="isOwnMessage(message) || (!isOwnMessage(message) && user)"
                  dense
                >
                  <v-col>
                    <v-divider
                      class="my-3"
                    ></v-divider>
                  </v-col>
                  <v-col
                    cols="12"
                    class="pl-0"
                  >
                    <v-menu
                      open-on-hover
                      v-if="isOwnMessage(message)"
                    >
                      <template v-slot:activator="{ props }">
                        <v-btn
                          icon
                          v-bind="props"
                          class="mb-2 ml-1 customGreyUltraLight elevation-1"
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
                      open-on-hover
                      v-else-if="!isOwnMessage(message) && user"
                    >
                      <template v-slot:activator="{ props }">
                        <v-btn
                          icon="fas fa-ellipsis-v"
                          class="mb-2 ml-1 customGreyUltraLight elevation-1"
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
                <!-- Replies -->
                <v-row>
                  <v-col
                    class="pt-0"
                  >
                    <DiscussionReplies
                      :mainMessage="message"
                      :discussion="discussion"
                      @update:checkVisibleMessages="checkVisibleMessages"
                      @update:report="openReportDialog"
                      @update:translateText="translateText"
                      :computedOwnSubscriberStatusContainer="computedOwnSubscriberStatusContainer"
                      :computedGroupStatus="computedGroupStatus"
                      :level="1"
                      :sort="sortDesc"
                    ></DiscussionReplies>
                  </v-col>
                </v-row>
              </v-sheet>
            </v-col>
          </template>
        </v-sheet>
      </v-col>
    </v-row>
    <v-btn
      style="bottom: 180px; right: calc(50% - 90px);"
      absolute
      dark
      :color="$settings.modules.discussions.color"
      @click="goToNewMessages()"
      v-if="hasNewMessages"
    >
      {{$t('newMultiple')[0].toUpperCase() + $t('newMultiple').substr(1)}} {{$t('posts')}}
      <v-icon
        class="ml-3"
        size="18"
      >
        fas fa-arrow-right
      </v-icon>
    </v-btn>
    <v-row
      v-if="sortDesc > 0"
    >
      <DiscussionReply
        :level="0"
        :user="user"
        :discussion="discussion"
        :computedGroupStatus="computedGroupStatus"
        :isEditMessage="isEditMessage"
        @update:resetInput="resetInput()"
        @update:message="triggerNewMessage = Date.now()"
      >
      </DiscussionReply>
    </v-row>
    <v-row>
      <v-col>
        <v-pagination
          :color="$settings.modules.discussions.color"
          v-model="queryObject.page"
          :length="Math.ceil(computedTotal / queryObject.itemsPerPage)"
          :total-visible="6"
        ></v-pagination>
      </v-col>
    </v-row>
    <ViolationDialog
      :type="discussion.group ? 'groups': 'discussions'"
      :discussion="discussion"
      :message="itemToReport"
      :showViolationDialog="showViolationDialog"
      :key="JSON.stringify(itemToReport)"
      @update:closeViolationDialog="closeReportDialog()"
    ></ViolationDialog>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import DiscussionReplies from '@/components/DiscussionReplies.vue'
import ViolationDialog from '@/components/ViolationDialog.vue'
import TranslatableText from '@/components/TranslatableText.vue'
import TranslatableTextInfo from '@/components/TranslatableTextInfo.vue'
import Lightbox from '@/components/Lightbox.vue'
import DiscussionReply from '@/components/DiscussionReply.vue'

export default {
  name: 'DiscussionCore',

  components: {
    DiscussionReplies,
    ViolationDialog,
    TranslatableText,
    TranslatableTextInfo,
    Lightbox,
    DiscussionReply
  },

  props: ['discussion'],

  data: () => ({
    showSendBlock: false,
    rawSortBy: undefined,
    discussionMessagesData: undefined,
    pics: [],
    itemToReport: undefined,
    showViolationDialog: false,
    checkForNewPage: false,
    hasNewMessages: false,
    triggerNewMessage: 1,
    isFindDiscussionMessagesPending: false,
    sortDesc: -1,
    isUpdating: false,
    isEditMessage: undefined,
    showRepliesObj: {},
    init: true,
    manualLoad: false,
    loading: true,
    queryObject: {
      page: 1,
      itemsPerPage: 10,
      sortBy: [{ key: 'createdAt', order: 'asc' }]
    }
  }),

  async mounted () {
    await this.adaptQuery()
    this.rawSortBy = this.queryObject.sortBy[0]
    await this.loadDataTableEntities()
    if (this.init) {
      // Init listeners
      this.$nextTick(() => {
        window.addEventListener('scroll', this.checkVisibleMessages)
        document.querySelector('#messageContainer').addEventListener('scroll', this.checkVisibleMessages)
      })
    }
    this.$nextTick(() => {
      this.$nextTick(() => {
        this.checkVisibleMessages()
      })
    })
  },

  beforeUnmout () {
    window.removeEventListener('scroll', this.checkVisibleMessages)
    if (document.querySelector('#messageContainer')) {
      document.querySelector('#messageContainer').removeEventListener('scroll', this.checkVisibleMessages)
    }
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapMutations('translator', {
      updateTranslationItem: 'updateItem'
    }),
    ...mapActions('translator', {
      createTranslation: 'create'
    }),
    ...mapActions('discussion-messages', {
      createMessage: 'create',
      patchMessage: 'patch',
      removeMessage: 'remove',
      findDiscussionMessages: 'find'
    }),
    ...mapActions('status-container-helper', {
      patchDiscussionMessageNotifications: 'patch'
    }),
    async loadDataTableEntities () {
      this.isFindDiscussionMessagesPending = true
      this.discussionMessagesData = await this.findDiscussionMessages(
        {
          query: {
            discussion: this.discussion._id,
            repliesTo: { $exists: false },
            $limit: this.queryObject.itemsPerPage,
            $skip: (this.queryObject.page - 1) * this.queryObject.itemsPerPage < 0 ? 0 : (this.queryObject.page - 1) * this.queryObject.itemsPerPage,
            $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
          }
        }
      )
    },
    resetInput () {
      this.isEditMessage = undefined
      this.pics = []
    },
    async translateText ({ texts, force }) {
      let textsToTranslate
      let textsToShow
      if (force) {
        textsToTranslate = texts
        textsToShow = []
      } else {
        textsToTranslate = texts.filter(text => !this.getTranslation(text.id + '_' + this.$i18n.locale))
        textsToShow = texts.filter(text => this.getTranslation(text.id + '_' + this.$i18n.locale))
      }
      if (textsToTranslate.length > 0) {
        await this.createTranslation([
          {
            type: 'discussion-messages',
            texts: textsToTranslate,
            target: this.$i18n.locale
          }
        ])
      }
      for (const text of textsToShow) {
        this.updateTranslationItem({ _id: text.id + '_' + this.$i18n.locale, show: true })
      }
    },
    openReportDialog (message) {
      this.itemToReport = message
    },
    async closeReportDialog () {
      await this.$nextTick()
      this.itemToReport = undefined
    },
    goToNewMessages () {
      this.queryObject.page = Math.ceil(this.computedTotal / this.queryObject.itemsPerPage)
      this.hasNewMessages = false
    },
    getBGColor (message) {
      if (this.showRepliesObj[message._id]) {
        return '#B0BEC5'
      } else {
        if (this.isOwnMessage(message)) {
          if (this.isEditMessage?._id === message._id) {
            return '#ffeac2'
          } else {
            return '#f0f0f0'
          }
        } else {
          if (this.computedOwnSubscriberStatusContainer?.unread.map(unread => unread.id).includes(message._id)) {
            return this.$settings.indicatorColor
          } else if (this.computedOwnMentionStatusContainer?.unread.map(unread => unread.id).includes(message._id)) {
            // TODO: Make colors work
            return '#eb34c6'
          } else {
            return '#f6f6f6'
          }
        }
      }
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
        this.manualLoad = 'delete'
        this.triggerNewMessage = Date.now()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
      }
    },
    async editMessage (message) {
      this.isEditMessage = message
      this.pics = message.pics
      await this.$nextTick()
      await this.$nextTick()
      const element = document.getElementById('messageInput_' + message._id)
      const y = element.getBoundingClientRect().top + window.pageYOffset - 180
      window.scrollTo({ top: y, behavior: 'smooth' })
    },
    async checkVisibleMessages () {
      document.querySelectorAll('.message').forEach(async message => {
        if (
          this.isVisibleInsideDocument(message) &&
          this.isVisibleInsideContainer(message, document.querySelector('#messageContainer'))
        ) {
          const tmpDiscussionMessage = this.allDiscussionMessages.find(obj => obj._id === message.getAttribute('name'))
          // Pull unread
          if (
            tmpDiscussionMessage &&
            !this.isUpdating &&
            !this.isOwnMessage(tmpDiscussionMessage) &&
            this.computedOwnSubscriberStatusContainer?.unread.map(unread => unread.id).includes(tmpDiscussionMessage._id)
          ) {
            this.isUpdating = true
            await this.patchDiscussionMessageNotifications(
              [
                'pullUnreadById',
                {
                  containerId: this.computedOwnSubscriberStatusContainer._id,
                  ids: [tmpDiscussionMessage._id]
                }
              ]
            )
            this.isUpdating = false
          }
          // Pull mentions
          if (
            tmpDiscussionMessage &&
            !this.isUpdating &&
            !this.isOwnMessage(tmpDiscussionMessage) &&
            this.computedOwnMentionStatusContainer?.unread.map(unread => unread.id).includes(tmpDiscussionMessage._id)
          ) {
            this.isUpdating = true
            await this.patchDiscussionMessageNotifications(
              [
                'pullUnreadById',
                {
                  containerId: this.computedOwnMentionStatusContainer._id,
                  ids: [tmpDiscussionMessage._id]
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
          const tmpDiscussionMessage = this.allDiscussionMessages.find(obj => obj._id === message.getAttribute('name'))
          // Pull unread
          if (
            tmpDiscussionMessage &&
            !this.isUpdating &&
            !this.isOwnMessage(tmpDiscussionMessage) &&
            this.computedOwnSubscriberStatusContainer?.unread.map(unread => unread.id).includes(tmpDiscussionMessage._id)
          ) {
            this.isUpdating = true
            await this.patchDiscussionMessageNotifications(
              [
                'pullUnreadById',
                {
                  containerId: this.computedOwnSubscriberStatusContainer._id,
                  ids: [tmpDiscussionMessage._id]
                }
              ]
            )
            this.isUpdating = false
          }
          // Pull mentions
          if (
            tmpDiscussionMessage &&
            !this.isUpdating &&
            !this.isOwnMessage(tmpDiscussionMessage) &&
            this.computedOwnMentionStatusContainer?.unread.map(unread => unread.id).includes(tmpDiscussionMessage._id)
          ) {
            this.isUpdating = true
            await this.patchDiscussionMessageNotifications(
              [
                'pullUnreadById',
                {
                  containerId: this.computedOwnMentionStatusContainer._id,
                  ids: [tmpDiscussionMessage._id]
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
      'relationItems',
      'newTab',
      'adaptQuery',
      'updateQueryPage',
      'updateQuerySortBy',
      'updateQuerySortOrder'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('translator', {
      getTranslation: 'get'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('discussion-messages', {
      allDiscussionMessages: 'list'
    }),
    computedTotal () {
      if (this.discussionMessagesData) {
        return this.discussionMessagesData.total
      } else {
        return 0
      }
    },
    computedSortOrder () {
      if (this.queryObject.sortBy[0].order === 'desc') {
        return 1
      } else {
        return -1
      }
    },
    computedOwnStatusContainers () {
      return this.statusContainers.filter(obj => obj.reference === this.discussion._id && obj.user === this.user._id)
    },
    computedOwnSubscriberStatusContainer () {
      return this.computedOwnStatusContainers.find(obj => obj.relation === 'subscriber')
    },
    computedOwnMentionStatusContainer () {
      return this.computedOwnStatusContainers.find(obj => obj.relation === 'mentions')
    },
    computedDiscussionMessages () {
      if (this.discussionMessagesData && this.discussionMessagesData.data) {
        return this.discussionMessagesData.data
      } else {
        return []
      }
    },
    computedGroupStatus () {
      if (this.computedStatusContainers) {
        if (this.computedStatusContainers.find(obj => obj.relation === 'owner')) {
          return this.relationItems.owner
        } if (this.computedStatusContainers.find(obj => obj.relation === 'moderator')) {
          return this.relationItems.moderator
        } else if (this.computedStatusContainers.find(obj => obj.relation === 'member')) {
          return this.relationItems.member
        } else if (this.computedStatusContainers.find(obj => obj.relation === 'applicant')) {
          return this.relationItems.applicant
        } else {
          return this.relationItems.apply
        }
      } else {
        return this.relationItems.apply
      }
    },
    computedStatusContainers () {
      return this.statusContainers.filter(obj => obj.reference === this.discussion.group && obj.user === this.user._id)
    }
  },
  watch: {
    rawSortBy () {
      this.queryObject.sortBy[0] = this.rawSortBy
    },
    'queryObject.sortBy': {
      deep: true,
      async handler () {
        this.updateQuerySortBy(this.queryObject.sortBy[0].key)
        this.updateQuerySortOrder(this.queryObject.sortBy[0].order)
        await this.loadDataTableEntities()
      }
    },
    async triggerNewMessage () {
      await this.loadDataTableEntities()
      this.hasNewMessages = false
    },
    async sortDesc () {
      await this.loadDataTableEntities()
    },
    async 'queryObject.page' () {
      this.updateQueryPage(this.queryObject.page)
      await this.loadDataTableEntities()
      if (this.queryObject.page === Math.ceil(this.computedTotal / this.queryObject.itemsPerPage)) {
        this.hasNewMessages = false
      }
    },
    allDiscussionMessages (newValue, oldValue) {
      const newDiscussionValue = newValue.filter(obj => obj.discussion === this.discussion._id)
      const oldDiscussionValue = oldValue.filter(obj => obj.discussion === this.discussion._id)
      if (
        !this.isFindDiscussionMessagesPending &&
        oldDiscussionValue.filter(obj => !obj.repliesTo).length !== newDiscussionValue.filter(obj => !obj.repliesTo).length &&
        !this.init &&
        !this.manualLoad
      ) {
        this.triggerNewMessage = Date.now()
        this.checkForNewPage = true
      }
    },
    computedDiscussionMessages (newValue, oldValue) {
      if (this.manualLoad === 'create') {
        this.queryObject.page = Math.ceil(this.computedTotal / this.queryObject.itemsPerPage)
      } else if (this.queryObject.page > Math.ceil(this.computedTotal / this.queryObject.itemsPerPage)) {
        this.queryObject.page = Math.ceil(this.computedTotal / this.queryObject.itemsPerPage)
      }
      //
      this.isFindDiscussionMessagesPending = false
      //
      if (document.querySelector('#messageContainer')) {
        this.$nextTick(() => {
          this.$nextTick(() => {
            this.checkVisibleMessages()
            this.manualLoad = false
          })
        })
      }
    },
    isFindDiscussionMessagesPending () {
      if (
        !this.isFindDiscussionMessagesPending &&
        this.discussionMessagesData
      ) {
        //
        if (this.checkForNewPage) {
          if (this.queryObject.page < Math.ceil(this.computedTotal / this.queryObject.itemsPerPage)) {
            this.hasNewMessages = true
          }
        }
        this.checkForNewPage = false
        //
        this.loading = false
      } else {
        this.loading = true
        setTimeout(() => {
          this.init = false
        }, 1000)
      }
    },
    showViolationDialog (a, b) {
      if (!this.showViolationDialog) {
        this.itemToReport = undefined
      }
    },
    itemToReport (a, b) {
      if (this.itemToReport) {
        this.showViolationDialog = true
      } else {
        this.showViolationDialog = false
      }
    }
  }
}
</script>

<style>
  .progress:after {
    content: '';
    display: block;
    position: absolute;
    width: calc(100% - 60px);
    height: 16px;
    background-color: rgba(255,255,255,0.7);
    top: calc(50% - 8px);
    left: 30px;
    border-radius: 10px;
  }
</style>
