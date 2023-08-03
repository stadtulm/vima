<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('myAds')}}
      </v-col>
      <v-col
        class="shrink align-self-center"
      >
        <v-btn
          dark
          :to="{ name: 'AdEditor' }"
          :color="$settings.modules.ads.color"
        >
          {{$t('newAdButton')}}
          <v-icon
            class="ml-3"
            size="18"
          >
            fas fa-plus
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          :label="$t('filterByTitleLabel')"
          outlined
          dense
          hide-details
          color="black"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          :item-class="itemRowBackground"
          item-key="_id"
          class="customGreyUltraLight elevation-3"
          :headers="headers"
          :items="computedAds"
          :loading="loading"
          @update:page="updatePage"
          @update:items-per-page="updateItemsPerPage"
          @update:sort-by="updateSortBy"
          @update:sort-desc="updateSortDesc"
          :server-items-length="total"
          must-sort
          :page.sync="page"
          :items-per-page.sync="itemsPerPage"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :footer-props="{
            itemsPerPageText: '',
            itemsPerPageOptions
          }"
        >
          <template
            v-slot:progress
          >
            <v-progress-linear
              indeterminate
              :color="$settings.modules.ads.color"
            ></v-progress-linear>
          </template>
          <template
            v-slot:[`item.applicants`]="{ item }"
          >
            <v-badge
              :value="isOwnAd(item._id) && getOwnStatusContainerOfAd(item._id).unread.length > 0"
              :color="$settings.indicatorColor"
              overlap
            >
              <template slot="badge">
                <span
                  class="customGrey--text font-weight-bold"
                >
                  {{getOwnStatusContainerOfAd(item._id).unread.length}}
                </span>
              </template>
              <v-btn
                fab
                small
                :color="$settings.modules.ads.color"
                @click="applicantsDialogItem = item"
                :disabled="
                  !isOwnAd(item._id) ||
                  !item.accepted ||
                  !item.accepted.isAccepted
                "
              >
                <v-icon
                  color="white"
                  size="18"
                >
                  fas fa-list
                </v-icon>
              </v-btn>
            </v-badge>
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
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
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
                    class="white--text"
                  >
                    <v-row>
                      <v-col
                        cols="12"
                        v-html="item.text"
                      ></v-col>
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
            <v-btn
              icon
              :color="$settings.modules.ads.color"
              :loading="loaders[item._id + 'isActive'] === true"
              :disabled="!isOwnAd(item._id)"
              @click="changeAdProperty(
                item._id,
                'isActive',
                !item.isActive
              )"
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
              <v-icon>
                {{item.isActive ? 'fas fa-check-square' : 'far fa-square'}}
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.accepted.isAccepted`]="{ item }"
          >
            <v-btn
              icon
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
              <template
                slot="loader"
              >
                <v-progress-circular
                  color="white"
                  width="3"
                  indeterminate
                ></v-progress-circular>
              </template>
              <v-icon>
                {{item.accepted.isAccepted ? 'fas fa-check-square' : 'far fa-square'}}
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.edit`]="{ item }"
          >
            <v-btn
              fab
              small
              :color="$settings.modules.ads.color"
              class="my-4"
              :to="{name: 'AdEditor', params: { id: item._id } }"
              :disabled="!isOwnAd(item._id)"
            >
              <v-icon
                color="white"
                size="18"
              >
                fa fa-pen
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.delete`]="{ item }"
          >
            <v-btn
              fab
              small
              :color="$settings.modules.ads.color"
              class="my-4"
              :disabled="!isOwnAd(item._id)"
              :loading="loaders[item._id + 'delete'] === true"
              @click="deleteItem = item._id"
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
                color="white"
                size="18"
              >
                fa fa-trash
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.link`]="{ item }"
          >
            <v-btn
              fab
              small
              :color="$settings.modules.ads.color"
              class="my-4"
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
              <v-icon
                color="white"
                size="18"
              >
                fa fa-arrow-right
              </v-icon>
            </v-btn>
          </template>
        </v-data-table>
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
        <v-card-text
          class="pa-8"
        >
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
                :item-class="adItemRowBackground"
                :items="computedAdMessages.filter(obj => !obj.repliesTo)"
                :headers="[
                  { text: '', value: 'pic.url', width: 50, sortable: false },
                  { text: this.$t('userName'), value: 'userName' },
                  { text: this.$t('createdAt'), value: 'createdAt' },
                  { text: this.$t('message'), value: 'message' },
                  { text: this.$t('answer'), value: 'answer' },
                  { text: this.$t('goToChat'), value: 'goToChat', sortable: false, align: 'center' }
                ]"
                :footer-props="{
                  itemsPerPageText: '',
                  itemsPerPageOptions
                }"
              >
                <template
                  v-slot:[`item.pic.url`]="{ item }"
                >
                  <v-avatar
                    :class="$vuetify.breakpoint.smAndUp ? 'ma-3' : ''"
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
                      dark
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
                  <v-btn
                    fab
                    v-if="item.chat"
                    :to="{ name: 'IdChat', params: { chat: item.chat } }"
                    :color="$settings.modules.ads.color"
                    small
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
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
        <v-card-text
          class="pa-8"
        >
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('writeNewAnswer')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col>
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
                :placeholder="$t('enterText')"
                id="messageInput"
              >
              </tiptap-vuetify>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                block
                :loading="isSending"
                :dark="!(!message || message.replace(/(\r\n|\n|\r)/gm, '').replaceAll('<p>', '').replaceAll('</p>', '').replaceAll(' ', '') === '')"
                :disabled="!message || message.replace(/(\r\n|\n|\r)/gm, '').replaceAll('<p>', '').replaceAll('</p>', '').replaceAll(' ', '') === ''"
                @click="sendMessage(answerDialogItem)"
                :color="$settings.modules.ads.color"
              >
                {{$t('sendAnswer')}}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Delete dialog -->
    <v-dialog
      v-model="showDeleteDialog"
      persistent
      max-width="600"
    >
      <v-card
        color="customGreyUltraLight"
        tile
      >
        <v-card-text
          class="pa-8"
        >
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('deleteWarningHeadline')}}
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="body-1 font-weight-bold"
              v-html="$t('deleteWarningBody')"
            >
            </v-col>
          </v-row>
          <v-card-actions
            class="mt-6 pa-0"
          >
            <v-btn
              @click="showDeleteDialog = false"
            >
              {{$t('cancelDeleteButton')}}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              @click="deleteAd(deleteItem)"
              dark
              color="error"
              :loading="isDeleting"
            >
              {{$t('acceptDeleteButton')}}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import { makeFindMixin } from 'feathers-vuex'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { TiptapVuetify, Bold, Blockquote, BulletList, OrderedList, ListItem, Link } from 'tiptap-vuetify'
import TranslatableText from '@/components/TranslatableText.vue'

export default {
  name: 'AdList',

  mixins: [makeFindMixin({ service: 'ads', watch: true })],

  components: {
    TiptapVuetify,
    TranslatableText
  },

  data: () => ({
    isDeleting: false,
    deleteItem: undefined,
    showDeleteDialog: false,
    showAnswerDialog: false,
    answerDialogItem: undefined,
    showApplicantsDialog: false,
    applicantsDialogItem: undefined,
    isUpdating: false,
    triggerReload: 1,
    message: undefined,
    isSending: false,
    loaders: {},
    search: '',
    page: 1,
    loading: true,
    total: 0,
    itemsPerPage: 25,
    sortBy: ['createdAt'],
    sortDesc: [true],
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
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
    setTimeout(async () => {
      await this.checkAcceptedAds()
    }, 1000)
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('ads', {
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
    async deleteAd (id) {
      this.isDeleting = true
      this.$set(this.loaders, id + 'delete', true)
      try {
        this.deleteItem = undefined
        await this.removeAd(id)
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.$set(this.loaders, id + 'delete', undefined)
        this.isDeleting = false
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.$set(this.loaders, id + 'delete', undefined)
        this.isDeleting = false
      }
    },
    itemRowBackground (item) {
      if (
        this.statusContainers
          .find(
            obj =>
              obj.reference === item._id &&
              obj.relation === 'owner' &&
              obj.user === this.user._id &&
              obj.customField === 'accepted'
          )
      ) {
        return 'new'
      } else {
        return ''
      }
    },
    adItemRowBackground (item) {
      if (this.applicantsDialogItem) {
        const adStatusContainer = this.statusContainers
          .find(
            obj =>
              obj.reference === this.applicantsDialogItem._id &&
              obj.relation === 'owner' &&
              obj.user === this.user._id
          )
        if (
          adStatusContainer.unread.map(obj => obj.id).includes(item._id)
        ) {
          return 'new'
        } else {
          return ''
        }
      } else {
        return ''
      }
    },
    async changeAdProperty (adId, property, value) {
      this.$set(this.loaders, adId + property, true)
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchAd(
          [
            adId,
            patchObj
          ]
        )
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$set(this.loaders, adId + property, undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.$set(this.loaders, adId + property, undefined)
      }
    },
    getOwnStatusContainerOfAd (adId) {
      return this.statusContainers.find(obj => obj.reference === adId && obj.user === this.user._id)
    },
    isOwnAd (adId) {
      return this.getOwnStatusContainerOfAd(adId).relation === 'owner'
    },
    async checkAcceptedAds () {
      const visibleAds = this.ads.map(obj => obj._id)
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
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSendError'), color: 'error' })
        this.isSending = false
      }
    },
    initQuery () {
      // Process query
      if (this.$route.query.i) {
        this.itemsPerPage = parseInt(this.$route.query.i)
      }
      if (this.$route.query.p) {
        this.page = parseInt(this.$route.query.p)
      }
      if (this.$route.query.s) {
        this.sortBy = this.$route.query.s.split(',')
      }
      if (this.$route.query.d) {
        const tmpDesc = this.$route.query.d.split(',')
        for (let i = 0; i < tmpDesc.length; i++) {
          if (tmpDesc[i] === 'true') {
            tmpDesc[i] = true
          } else if (tmpDesc[i] === 'false') {
            tmpDesc[i] = false
          }
        }
        this.sortDesc = tmpDesc
      }
    },
    goToPage (i) {
      this.skip = this.itemsPerPage * (i - 1)
    },
    updatePage (data) {
      if (parseInt(this.$route.query.p) !== data) {
        this.$router.replace(
          {
            query: {
              p: data,
              i: this.itemsPerPage,
              s: this.sortBy.join(','),
              d: this.sortDesc.join(',')
            }
          }
        )
      }
    },
    updateItemsPerPage (data) {
      if (parseInt(this.$route.query.i) !== data) {
        this.$router.replace(
          {
            query: {
              p: this.page,
              i: data,
              s: this.sortBy.join(','),
              d: this.sortDesc.join(',')
            }
          }
        )
      }
    },
    updateSortBy (data) {
      let tmpData
      if (Array.isArray(data)) {
        tmpData = data.join(',')
      } else {
        tmpData = data
      }
      if (data && this.$route.query.s !== tmpData) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: tmpData,
            d: this.sortDesc.join(',')
          }
        })
      } else if (!data) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc.join(',')
          }
        })
      }
    },
    updateSortDesc (data) {
      let tmpData
      if (Array.isArray(data)) {
        tmpData = data.join(',')
      } else {
        tmpData = data
      }
      if (data && this.$route.query.d !== tmpData) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            s: this.sortBy.join(','),
            d: tmpData
          }
        })
      }
    }
  },

  computed: {
    ...mapGetters([
      's3',
      'relationItems',
      'deepSort',
      'newTab',
      'itemsPerPageOptions'
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
      return this.deepSort(
        this.sortBy[0],
        this.sortDesc[0],
        JSON.parse(JSON.stringify(this.ads))
      )
    },
    headers () {
      return [
        { text: this.$t('title'), value: 'title.value' },
        { text: this.$t('role'), value: 'relation' },
        { text: this.$t('createdAt'), value: 'createdAt' },
        { text: this.$t('accepted'), value: 'accepted.isAccepted', align: 'center' },
        { text: this.$t('active'), value: 'isActive', align: 'center' },
        { text: this.$t('applicants'), value: 'applicants', align: 'center', sortable: false },
        { text: this.$t('editButton'), value: 'edit', align: 'center', sortable: false },
        { text: this.$t('deleteButton'), value: 'delete', align: 'center', sortable: false },
        { text: this.$t('viewButton'), value: 'link', align: 'center', sortable: false }
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
        $skip: (this.page - 1) * this.computedSkip,
        $sort: { [this.sortBy]: this.computedSortDesc }
      }
      if (this.search && this.search !== '') {
        query.title = {
          $elemMatch: {
            $and: [
              { value: { $regex: this.search, $options: 'i' } },
              { type: 'default' }
            ]
          }
        }
      }
      return {
        query,
        debounce: 1000,
        qid: this.user._id
      }
    },
    computedLimit () {
      if (this.itemsPerPage === -1) {
        return 1000000
      } else {
        return this.itemsPerPage
      }
    },
    computedSkip () {
      if (this.itemsPerPage === -1) {
        return 0
      } else {
        return this.itemsPerPage
      }
    },
    computedSortDesc () {
      if (this.sortDesc[0] === true) {
        return 1
      } else {
        return -1
      }
    }
  },

  asyncComputed: {
    async computedAdMessages () {
      if (this.applicantsDialogItem && this.triggerReload) {
        return await this.findAdMessages(
          {
            query: {
              ad: this.applicantsDialogItem._id
            }
          }
        )
      } else {
        return []
      }
    }
  },

  watch: {
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
    adMessages () {
      this.triggerReload = Date.now()
    },
    showDeleteDialog () {
      if (!this.showDeleteDialog) {
        this.deleteItem = undefined
      }
    },
    async deleteItem (newValue, oldValue) {
      if (this.deleteItem) {
        this.showDeleteDialog = true
      } else {
        this.showDeleteDialog = false
      }
    },
    async ads () {
      await this.checkAcceptedAds()
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
    isFindAdsPending () {
      if (!this.isFindAdsPending) {
        this.loading = false
        this.total = this.adsPaginationData[this.user._id].mostRecent.total
      } else {
        this.loading = true
      }
    },
    async showApplicantsDialog () {
      if (!this.showApplicantsDialog) {
        this.applicantsDialogItem = undefined
      } else {
        this.triggerReload = Date.now()
      }
    },
    async applicantsDialogItem () {
      if (this.applicantsDialogItem) {
        this.showApplicantsDialog = true
      } else {
        this.showApplicantsDialog = false
      }
    },
    async showAnswerDialog () {
      if (!this.showAnswerDialog) {
        this.answerDialogItem = undefined
      } else {
        // this.triggerReload = Date.now()
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
