<template>
  <div>
    <v-row>
      <v-col
        class="d-flex mx-3 mb-4"
      >
        <v-row>
          <span
            class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
          >
            {{$t('myAds')}}
          </span>
          <span
            v-if="user"
            class="my-3 mr-3"
          >
            <v-btn
              :to="{ name: 'AdEditor' }"
              :color="$settings.modules.ads.color"
              class="text-white"
            >
              {{$t('newAdButton')}}
              <v-icon
                class="ml-3"
                size="18"
                color="white"
              >
                fas fa-plus
              </v-icon>
            </v-btn>
          </span>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
      >
        <v-text-field
          v-model="queryObject.query"
          :label="$t('filterByTitleLabel')"
          hide-details
          density="compact"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table-server
          v-if="!initialView"
          v-model:items-per-page="queryObject.itemsPerPage"
          v-model:page="queryObject.page"
          :sort-by="queryObject.sortBy"
          :headers="headers"
          :items-length="computedTotal"
          :items="computedAds"
          :loading="isLoading"
          class="customGreyUltraLight pb-3 elevation-3"
          item-value="_id"
          @update:options="updateDataTableParams"
          sort-asc-icon="fas fa-caret-up"
          sort-desc-icon="fas fa-caret-down"
          :show-current-page="true"
          :must-sort="true"
          :row-props="itemRowBackground"
        >
          <template
            v-slot:[`item.applicants`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <v-badge
                  v-bind="props"
                  :model-value="isOwnAd(item._id) && getOwnStatusContainerOfAd(item._id)?.unread.length > 0"
                  :color="$settings.indicatorColor"
                >
                  <template v-slot:badge>
                    <span
                      class="text-customGrey font-weight-bold"
                    >
                      {{getOwnStatusContainerOfAd(item._id)?.unread.length}}
                    </span>
                  </template>
                  <v-btn
                    icon="fas fa-list"
                    size="small"
                    class="text-white"
                    :color="$settings.modules.ads.color"
                    @click="applicantsDialogItem = item"
                    :disabled="
                      !isOwnAd(item._id) ||
                      !item.accepted ||
                      !item.accepted.isAccepted
                    "
                  >
                  </v-btn>
                </v-badge>
              </template>
              {{$t('applicants')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.title.value`]="{ item }"
          >
            <span
              class="font-weight-bold"
            >
              {{item.title.value}}
              <v-tooltip
                right
                color="customGrey"
                max-width="800"
              >
                <template v-slot:activator="{ props }">
                  <v-icon
                    color="customGrey"
                    v-bind="props"
                    class="ml-3"
                  >
                    fas fa-info-circle
                  </v-icon>
                </template>
                <v-card
                  flat
                  color="transparent"
                  dark
                >
                  <v-card-title>
                    {{item.title.value}}
                  </v-card-title>
                  <v-card-text
                    class="text-white"
                  >
                    <v-row>
                      <v-col
                        cols="12"
                      >
                        <div
                          v-html="item.text.value"
                        >
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-tooltip>
            </span>
          </template>
          <template
            v-slot:[`item.relation`]="{ item }"
          >
            {{statusContainers.find(obj => obj.reference === item._id)
              ? $t(relationItems[statusContainers.find(obj => obj.user === user._id && obj.reference === item._id).relation].textKey)
              : '-'}}
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{ $moment(item.createdAt).format('DD.MM.YYYY, HH:mm') }} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.isActive`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    variant="text"
                    :icon="item.isActive ? 'fas fa-check-square' : 'far fa-square'"
                    :color="$settings.modules.ads.color"
                    :loading="loaders[item._id + 'isActive'] === true"
                    :disabled="!isOwnAd(item._id)"
                    @click="changeAdProperty(
                      item._id,
                      'isActive',
                      !item.isActive
                    )"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('active')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.accepted.isAccepted`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    variant="text"
                    :icon="item.accepted.isAccepted ? 'fas fa-check-square' : 'far fa-square'"
                    :color="$settings.modules.ads.color"
                    disabled
                    :loading="loaders[item._id + 'accepted'] === true"
                    @click="changeAdProperty(
                      item._id,
                      'accepted',
                      {
                        isAccepted: !item.accepted.isAccepted,
                        dt: new Date(),
                        user: user._id
                      }
                    )"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('accepted')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.edit`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fa fa-pen"
                    size="small"
                    :color="$settings.modules.ads.color"
                    class="my-4 text-white"
                    :to="{name: 'AdEditor', params: { id: item._id } }"
                    :disabled="!isOwnAd(item._id)"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('editButton')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fa fa-trash"
                    size="small"
                    :color="$settings.modules.ads.color"
                    class="my-4 text-white"
                    :disabled="!isOwnAd(item._id)"
                    :loading="loaders[item._id + 'delete'] === true"
                    @click="activateDeleteDialog(item._id)"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('deleteButton')}}
            </v-tooltip>
          </template>
          <template
            v-slot:[`item.link`]="{ item }"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                >
                  <v-btn
                    icon="fa fa-arrow-right"
                    size="small"
                    :color="$settings.modules.ads.color"
                    class="my-4 text-white"
                    :disabled="
                      !statusContainers.find(obj => obj.reference === item._id && obj.user === user._id && obj.relation === 'owner') &&
                      (
                        !item.isActive ||
                        !item.accepted ||
                        !item.accepted.isAccepted
                      )
                    "
                    :to="{name: 'Ad', params: { id: item._id } }"
                  >
                  </v-btn>
                </span>
              </template>
              {{$t('viewButton')}}
            </v-tooltip>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
    <v-dialog
      v-model="showApplicantsDialog"
      max-width="1200"
    >
      <v-card
        color="customGreyUltraLight"
        tile
        v-if="applicantsDialogItem"
      >
        <v-card-text>
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('applicants')}} {{$t('for')}} "{{applicantsDialogItem.title.value}}"
            </v-col>
          </v-row>
          <v-row
            v-if="!computedAdMessages || computedAdMessages.length === 0"
          >
            <v-col
              class="text-center"
            >
              <v-alert>
                {{$t('noApplicantsYet')}}
              </v-alert>
            </v-col>
          </v-row>
          <v-row
            v-else
          >
            <v-col>
              <v-data-table
                :items="computedAdMessages.filter(obj => !obj.repliesTo)"
                :headers="[
                  { title: '', key: 'pic.url', minWidth: 50, sortable: false },
                  { title: this.$t('userName'), key: 'userName' },
                  { title: this.$t('createdAt'), key: 'createdAt' },
                  { title: this.$t('message'), key: 'message', sortable: false },
                  { title: this.$t('answer'), key: 'answer' },
                  { title: this.$t('goToChat'), key: 'goToChat', sortable: false, align: 'center' }
                ]"
                sort-asc-icon="fas fa-caret-up"
                sort-desc-icon="fas fa-caret-down"
                :show-current-page="true"
                :must-sort="true"
                :sort-by="[{ key: 'createdAt', order: 'desc' }]"
                :row-props="adItemRowBackground"
              >
                <template
                  v-slot:[`item.pic.url`]="{ item }"
                >
                  <v-avatar
                    :class="$vuetify.display.smAndUp ? 'ma-3' : ''"
                    color="customGreyLight"
                  >
                    <v-img
                      v-if="getUser(item.author) && getUser(item.author).pic"
                      :src="s3 + getUser(item.author).pic.url"
                      :alt="$t('userPic')"
                      :title="getUser(item.author).pic.credit ? '© ' + getUser(item.author).pic.credit : ''"
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
                <template
                  v-slot:[`item.userName`]="{ item }"
                >
                  <span
                    v-if="getUser(item.author)"
                    class="font-weight-bold pointer"
                    @click="$router.push({name: 'User', params: { user: getUser(item.author)._id}})"
                  >
                    {{getUser(item.author).userName}}
                  </span>
                </template>
                <template
                  v-slot:[`item.createdAt`]="{ item }"
                >
                  {{$moment(item.createdAt).format('DD.MM.YYYY, HH:mm')}} {{$t('oClock')}}
                </template>
                <template
                  v-slot:[`item.message`]="{ item }"
                >
                  <TranslatableText
                    ownField="text"
                    :allFields="['text']"
                    type="ad-messages"
                    :textParent="item"
                  >
                    <template
                      v-slot:defaultLangText="{ computedText }"
                    >
                      <span
                        v-html="$sanitize(newTab(computedText.value))"
                      >
                      </span>
                    </template>
                    <template
                      v-slot:translatedLangText="{ computedText }"
                    >
                      <span
                        v-html="$sanitize(newTab(computedText.value))"
                      >
                      </span>
                    </template>
                  </TranslatableText>
                </template>
                <template
                  v-slot:[`item.answer`]="{ item }"
                >
                    <v-btn
                      v-if="!item.replies || item.replies.length === 0"
                      @click="answerDialogItem = item"
                      :color="$settings.modules.ads.color"
                      class="text-white"
                    >
                      {{$t('writeAnswer')}}
                    </v-btn>
                    <template
                      v-else
                    >
                      <TranslatableText
                        v-if="getAdMessage(item.replies[0])"
                        ownField="text"
                        :allFields="['text']"
                        type="ad-messages"
                        :textParent="getAdMessage(item.replies[0])"
                      >
                        <template
                          v-slot:defaultLangText="{ computedText }"
                        >
                          <span
                            v-html="$sanitize(newTab(computedText.value))"
                          >
                          </span>
                        </template>
                        <template
                          v-slot:translatedLangText="{ computedText }"
                        >
                          <span
                            v-html="$sanitize(newTab(computedText.value))"
                          >
                          </span>
                        </template>
                      </TranslatableText>
                    </template>
                </template>
                <template
                  v-slot:[`item.goToChat`]="{ item }"
                >
                  <!-- Refresh so that chat field is included in add message -->
                  <v-btn
                    icon
                    class="pr-1 text-white"
                    v-if="item.chat"
                    :to="{ name: 'IdChat', params: { chat: item.chat } }"
                    :color="$settings.modules.ads.color"
                    size="small"
                  >
                    <v-icon>
                      fas fa-comments
                    </v-icon>
                  </v-btn>
                </template>

              </v-data-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="showAnswerDialog"
      max-width="800"
    >
      <v-card
        color="customGreyUltraLight"
        tile
      >
        <v-card-text>
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('writeNewAnswer')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <custom-tiptap
                id="messageInput"
                v-model="message"
                :extensions="['bold', 'italic', 'underline', 'strikethrough', 'bulletList', 'orderedList']"
              ></custom-tiptap>
            </v-col>
          </v-row>
        </v-card-text>
        <v-toolbar
          class="mt-2 pa-3"
        >
          <v-btn
            variant="elevated"
            @click="() => { showAnswerDialog = false; message = ''}"
          >
            {{$t('cancelButton')}}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            variant="elevated"
            :disabled="!message || message.replace(/(\r\n|\n|\r)/gm, '').replaceAll('<p>', '').replaceAll('</p>', '').replaceAll(' ', '') === ''"
            @click="sendMessage(answerDialogItem)"
            :color="$settings.modules.ads.color"
            class="text-white"
          >
            {{$t('sendAnswer')}}
          </v-btn>
        </v-toolbar>
      </v-card>
    </v-dialog>
    <delete-dialog
      :showDeleteDialog="showDeleteDialog"
      @delete:executeDelete="deleteAd()"
      @update:closeDeleteDialog="deactivateDeleteDialog()"
    ></delete-dialog>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'
import TranslatableText from '@/components/TranslatableText.vue'
import CustomTiptap from '@/components/CustomTiptap.vue'
import DeleteDialog from '@/components/DeleteDialog.vue'

export default {
  name: 'AdList',

  components: {
    TranslatableText,
    CustomTiptap,
    DeleteDialog
  },

  data: () => ({
    initialView: true,
    isDeleting: false,
    deleteItem: undefined,
    showDeleteDialog: false,
    showAnswerDialog: false,
    answerDialogItem: undefined,
    showApplicantsDialog: false,
    applicantsDialogItem: undefined,
    adMessagesResponse: undefined,
    isUpdating: false,
    message: undefined,
    isSending: false,
    loaders: {},
    isLoading: true,
    adsResponse: undefined,
    queryObject: {
      query: '',
      page: 1,
      itemsPerPage: 25,
      sortBy: [{ key: 'createdAt', order: 'desc' }]
    }
  }),

  async mounted () {
    await this.adaptQuery()
    setTimeout(async () => {
      await this.checkAcceptedAds()
    }, 1000)
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('ads', {
      findAds: 'find',
      patchAd: 'patch',
      removeAd: 'remove'
    }),
    ...mapActions('status-container-helper', {
      patchAdNotifications: 'patch'
    }),
    ...mapActions('ad-messages', {
      findAdMessages: 'find',
      createAdMessage: 'create'
    }),
    async updateDataTableParams (e) {
      if (!this.initialView) {
        this.queryObject = {
          ...e,
          query: this.queryObject.query
        }
        this.updateQueryQuery(this.queryObject.query)
        this.updateQueryPage(this.queryObject.page)
        this.updateQueryItemsPerPage(e.itemsPerPage)
        if (e.sortBy[0]) {
          this.updateQuerySortBy(e.sortBy[0].key)
          this.updateQuerySortOrder(e.sortBy[0].order)
        }
      }
    },
    async loadDataTableEntities () {
      this.loading = true
      this.adsResponse = await this.findAds(
        this.adsParams
      )
      this.isLoading = false
      setTimeout(async () => {
        await this.checkAcceptedAds()
      }, 1000)
    },
    async deleteAd () {
      this.showDeleteDialog = false
      this.isDeleting = true
      this.loaders[this.deleteItem + 'delete'] = true
      try {
        if (!this.deleteItem) throw new Error('Id to delete must be set')
        await this.removeAd(this.deleteItem)
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.loaders[this.deleteItem + 'delete'] = undefined
        this.isDeleting = false
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.loaders[this.deleteItem + 'delete'] = undefined
        this.isDeleting = false
      } finally {
        this.deleteItem = undefined
      }
    },
    itemRowBackground (props) {
      if (
        this.statusContainers
          .find(
            obj =>
              obj.reference === props.item._id &&
              obj.relation === 'owner' &&
              obj.user === this.user._id &&
              obj.customField === 'accepted'
          )
      ) {
        return { class: 'new' }
      } else {
        return {}
      }
    },
    adItemRowBackground (props) {
      if (this.applicantsDialogItem) {
        const adStatusContainer = this.statusContainers
          .find(
            obj =>
              obj.reference === this.applicantsDialogItem._id &&
              obj.relation === 'owner' &&
              obj.user === this.user._id
          )
        if (
          adStatusContainer.unread.map(obj => obj.id).includes(props.item._id)
        ) {
          return { class: 'new' }
        } else {
          return {}
        }
      } else {
        return ''
      }
    },
    async changeAdProperty (adId, property, value) {
      this.loaders[adId + property] = true
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchAd(
          [
            adId,
            patchObj
          ]
        )
        await this.loadDataTableEntities()
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.loaders[adId + property] = undefined
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.loaders[adId + property] = undefined
      }
    },
    getOwnStatusContainerOfAd (adId) {
      return this.statusContainers.find(obj => obj.reference === adId && obj.user === this.user._id)
    },
    isOwnAd (adId) {
      return this.getOwnStatusContainerOfAd(adId)?.relation === 'owner'
    },
    async checkAcceptedAds () {
      const visibleAds = this.computedAds.map(obj => obj._id)
      const acceptedStatusContainers = this.statusContainers.filter(obj => obj.user === this.user._id && obj.type === 'ads' && obj.relation === 'owner' && obj.customField === 'accepted').map(obj => obj.reference)
      const adIds = visibleAds.filter(e => acceptedStatusContainers.indexOf(e) !== -1)
      if (adIds.length > 0 && !this.isUpdating) {
        this.isUpdating = true
        await this.patchAdNotifications(
          [
            'resetCustomField',
            {
              type: 'ads',
              relation: 'owner',
              customField: 'accepted',
              references: adIds
            }
          ]
        )
        this.isUpdating = false
      }
    },
    async sendMessage (adMessage) {
      this.isSending = true
      try {
        await this.createAdMessage(
          {
            ad: adMessage.ad,
            author: this.user._id,
            text: [{
              value: this.message,
              type: 'default'
            }],
            repliesTo: adMessage._id
          }
        )
        this.setSnackbar({ text: this.$t('snackbarSendSuccess'), color: 'success' })
        this.message = undefined
        this.answerDialogItem = undefined
        this.isSending = false
        await this.loadAdMessages()
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
        this.isSending = false
      }
    },
    async loadAdMessages () {
      if (this.applicantsDialogItem) {
        this.adMessagesResponse = await this.findAdMessages(
          this.adMessagesParams
        )
      } else {
        this.adMessagesResponse = []
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'relationItems',
      'newTab',
      'adaptQuery',
      'updateQueryQuery',
      'updateQueryPage',
      'updateQueryItemsPerPage',
      'updateQuerySortBy',
      'updateQuerySortOrder',
      'activateDeleteDialog',
      'deactivateDeleteDialog'
    ]),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('ad-messages', {
      adMessages: 'list',
      getAdMessage: 'get'
    }),
    ...mapGetters('auth', {
      user: 'user'
    }),
    computedAds () {
      if (this.adsResponse && this.adsResponse.data) {
        return this.adsResponse.data
      } else {
        return []
      }
    },
    headers () {
      return [
        { title: this.$t('title'), key: 'title.value' },
        { title: this.$t('role'), key: 'relation' },
        { title: this.$t('createdAt'), key: 'createdAt' },
        { title: this.$t('accepted'), key: 'accepted.isAccepted', align: 'center' },
        { title: this.$t('active'), key: 'isActive', align: 'center' },
        { title: this.$t('applicants'), key: 'applicants', align: 'center', sortable: false },
        { title: this.$t('editButton'), key: 'edit', align: 'center', sortable: false },
        { title: this.$t('deleteButton'), key: 'delete', align: 'center', sortable: false },
        { title: this.$t('viewButton'), key: 'link', align: 'center', sortable: false }
      ]
    },
    adsParams () {
      const query = {
        _id: {
          $in: this.statusContainers.filter(
            obj =>
              obj.user === this.user._id &&
              obj.type === 'ads'
          ).map(obj => obj.reference)
        },
        $limit: this.computedLimit,
        $skip: this.computedSkip,
        $sort: { [this.queryObject.sortBy[0].key]: this.computedSortOrder }
      }
      if (this.queryObject.query) {
        query.title = {
          $elemMatch: {
            $and: [
              { value: { $regex: this.queryObject.query, $options: 'i' } },
              { type: 'default' }
            ]
          }
        }
      }
      return {
        query
      }
    },
    computedTotal () {
      if (this.adsResponse) {
        return this.adsResponse.total
      } else {
        return 0
      }
    },
    computedLimit () {
      if (this.queryObject.itemsPerPage === -1) {
        return 1000000
      } else {
        return this.queryObject.itemsPerPage
      }
    },
    computedSkip () {
      let tmpSkip = 0
      if (this.queryObject.itemsPerPage !== -1) {
        tmpSkip = this.queryObject.itemsPerPage
      }
      return (this.queryObject.page - 1) * tmpSkip
    },
    computedSortOrder () {
      if (this.queryObject.sortBy[0].order === 'desc') {
        return 1
      } else {
        return -1
      }
    },
    adMessagesParams () {
      return {
        query: {
          ad: this.applicantsDialogItem._id
        }
      }
    },
    computedAdMessages () {
      if (this.adMessagesResponse) {
        return this.adMessagesResponse
      } else {
        return []
      }
    }
  },

  watch: {
    'queryObject.query' () {
      this.updateQueryQuery(this.queryObject.query)
    },
    adsParams: {
      deep: true,
      async handler (newValue, oldValue) {
        if (
          !this.initialView &&
          JSON.stringify(newValue) !== JSON.stringify(oldValue)
        ) {
          await this.loadDataTableEntities()
        }
      }
    },
    async computedAdMessages () {
      if (this.applicantsDialogItem) {
        const adStatusContainer = this.statusContainers
          .find(obj =>
            obj.user === this.user._id &&
            obj.type === 'ads' &&
            obj.relation === 'owner' &&
            obj.reference === this.applicantsDialogItem._id
          )
        const adIds = this.computedAdMessages.map(obj => obj._id)
        // Remove unread
        await this.patchAdNotifications(
          [
            'pullUnreadById',
            {
              containerId: adStatusContainer._id,
              ids: adIds
            }
          ]
        )
      }
    },
    statusContainers: {
      deep: true,
      async handler () {
        await this.checkAcceptedAds()
      }
    },
    message () {
      if (this.message) {
        this.message = this.$sanitize(this.message)
      }
    },
    async showApplicantsDialog () {
      if (!this.showApplicantsDialog) {
        this.applicantsDialogItem = undefined
      }
    },
    async applicantsDialogItem () {
      if (this.applicantsDialogItem) {
        await this.loadAdMessages()
        this.showApplicantsDialog = true
      } else {
        this.showApplicantsDialog = false
      }
    },
    async showAnswerDialog () {
      if (!this.showAnswerDialog) {
        this.answerDialogItem = undefined
      }
    },
    answerDialogItem () {
      if (this.answerDialogItem) {
        this.showAnswerDialog = true
      } else {
        this.showAnswerDialog = false
      }
    }
  }
}
</script>
