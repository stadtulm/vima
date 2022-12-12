<template>
  <div>
    <v-row
      class="mb-4"
    >
      <v-col
        class="text-h5 font-weight-bold customGrey--text text-uppercase"
      >
        {{$t('myDiscussionsDetail')}}
      </v-col>
      <v-col
        v-if="user.role === 'admins'"
        class="shrink align-self-center"
      >
        <v-btn
          dark
          :to="{ name: 'DiscussionEditor' }"
          :color="computedColor"
        >
          {{$t('newDiscussion')}}
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
      <v-col
        cols="12"
        sm="6"
      >
        <v-text-field
          v-model="search"
          :label="$t('filterByTitleLabel')"
          outlined
          dense
          hide-details
          color="black"
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-select
            v-model="discussionsType"
            color="black"
            :item-color="computedColor"
            :label="$t('discussionType')"
            outlined
            dense
            hide-details
            :items="computedDiscussionTypes"
          ></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          :item-class="itemRowBackground"
          item-key="_id"
          class="customGreyUltraLight elevation-3"
          :headers="headers"
          :items="computedDiscussions"
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
              :color="computedColor"
            ></v-progress-linear>
          </template>
          <template
            v-slot:[`item.title.value`]="{ item }"
          >
            <span
              class="font-weight-bold"
            >
              {{item.title.value}}
            </span>
          </template>
          <template
            v-slot:[`item.relation`]="{ item }"
          >
            <v-select
              :color="computedColor"
              :item-color="computedColor"
              multiple
              chips
              deletable-chips
              :items="computedRelationItems[item._id]"
              :value="computedDiscussionRelations[item._id]"
              @change="changeDiscussionRelation($event, item)"
            >
            </v-select>
          </template>
          <template
            v-slot:[`item.createdAt`]="{ item }"
          >
            {{ $moment(item.createdAt).format('DD.MM.YYYY, HH:mm') }} {{$t('oClock')}}
          </template>
          <template
            v-slot:[`item.group`]="{ item }"
          >
            <div>
              {{getGroup(item.group) ? getGroup(item.group).title.value : '-'}}
            </div>
          </template>
          <template
            v-slot:[`item.isActive`]="{ item }"
          >
            <v-btn
              icon
              :color="computedColor"
              :loading="loaders[item._id + 'isActive'] === true"
              :disabled="
                !isOwnDiscussion(item._id) ||
                (
                  item.group &&
                  !statusContainers.find(obj =>
                    obj.type === 'groups' &&
                    obj.reference === item.group &&
                    (
                      obj.relation === 'owner' ||
                      obj.relation === 'member'
                    )
                  )
                )
              "
              @click="changeDiscussionProperty(
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
              :color="computedColor"
              disabled
              :loading="loaders[item._id + 'accepted'] === true"
              @click="changeDiscussionProperty(
                item._id,
                'accepted',
                {
                  isAccepted: item.accepted && item.accepted.isAccepted ? false : true,
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
                {{item.accepted && item.accepted.isAccepted ? 'fas fa-check-square' : 'far fa-square'}}
              </v-icon>
            </v-btn>
          </template>
          <template
            v-slot:[`item.edit`]="{ item }"
          >
            <v-btn
              fab
              small
              :color="computedColor"
              class="my-4"
              :to="item.group ? {name: 'GroupDiscussionEditor', params: { group: item.group, id: item._id } } : {name: 'DiscussionEditor', params: { id: item._id } }"
              :disabled="
                !isOwnDiscussion(item._id) ||
                (
                  item.group &&
                  !statusContainers.find(obj =>
                    obj.type === 'groups' &&
                    obj.reference === item.group &&
                    (
                      obj.relation === 'owner' ||
                      obj.relation === 'member'
                    )
                  )
                )
              "
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
              :color="computedColor"
              class="my-4"
              :disabled="!isOwnDiscussion(item._id)"
              :loading="loaders[item._id + 'delete'] === true"
              @click="deleteDiscussion(item._id)"
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
            <v-badge
              :value="(getOwnStatusContainersOfDiscussion(item._id).find(obj => obj.relation === 'subscriber') ? true : false) && (getOwnStatusContainersOfDiscussion(item._id).find(obj => obj.relation === 'subscriber').unread.length > 0 ? true : false)"
              :color="$settings.indicatorColor"
              overlap
            >
              <template
                slot="badge"
                v-if="getOwnStatusContainersOfDiscussion(item._id).find(obj => obj.relation === 'subscriber')"
              >
                <span
                  class="customGrey--text font-weight-bold"
                >
                  {{getOwnStatusContainersOfDiscussion(item._id).find(obj => obj.relation === 'subscriber').unread.length}}
                </span>
              </template>
              <v-btn
                fab
                small
                :color="computedColor"
                :disabled="
                  !item.isActive ||
                  !item.accepted ||
                  item.accepted.isAccepted !== true ||
                  (
                    getGroup(item.group) &&
                    (
                      !getGroup(item.group).isActive ||
                      !getGroup(item.group).accepted ||
                      !getGroup(item.group).accepted.isAccepted
                    )
                  )
                "
                :to="item.group ? {name: 'GroupDiscussion', params: { group: item.group, id: item._id } } : {name: 'Discussion', params: { id: item._id } }"
              >
                <v-icon
                  color="white"
                  size="18"
                >
                  fa fa-arrow-right
                </v-icon>
              </v-btn>
            </v-badge>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'DiscussionList',

  components: {
  },

  data: () => ({
    discussionsType: undefined,
    isUpdating: false,
    isSending: false,
    loaders: {},
    search: '',
    page: 1,
    loading: true,
    itemsPerPage: 25,
    sortBy: ['createdAt'],
    sortDesc: [true]
  }),

  async mounted () {
    // Save current query
    this.$router.options.tmpQuery = this.$route.query
    this.initQuery()
    setTimeout(async () => {
      await this.checkAcceptedDiscussions()
    }, 1000)
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('discussions', {
      patchDiscussion: 'patch',
      removeDiscussion: 'remove',
      findDiscussions: 'find'
    }),
    ...mapActions('status-containers', {
      findStatusContainers: 'find'
    }),
    ...mapActions('status-container-helper', {
      createDiscussionSubscription: 'create',
      removeDiscussionSubscription: 'remove',
      patchDiscussionNotifications: 'patch'
    }),
    async deleteDiscussion (id) {
      this.$set(this.loaders, id + 'delete', true)
      try {
        await this.removeDiscussion(id)
        this.setSnackbar({ text: this.$t('snackbarDeleteSuccess'), color: 'success' })
        this.$set(this.loaders, id + 'delete', undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarDeleteError'), color: 'error' })
        this.$set(this.loaders, id + 'delete', undefined)
      }
    },
    async changeDiscussionRelation (newRelations, discussion) {
      const oldRelations = this.computedDiscussionRelations[discussion._id]
      // Add new relation
      if (newRelations.length > oldRelations.length) {
        const relation = newRelations.filter(e => !oldRelations.includes(e))[0]
        if (relation) {
          try {
            await this.createDiscussionSubscription(
              {
                type: 'createDiscussionSubscription',
                discussionId: discussion._id
              }
            )
            this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          } catch (e) {
            this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
          }
        }
      } else if (newRelations.length < oldRelations.length) {
        const relation = oldRelations.filter(e => !newRelations.includes(e))[0]
        if (relation) {
          try {
            await this.removeDiscussionSubscription(
              [
                discussion._id,
                {
                  query: {
                    type: 'removeDiscussionSubscription'
                  }
                }
              ]
            )
            this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
          } catch (e) {
            this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
          }
        }
      }
    },
    itemRowBackground (item) {
      if (this.statusContainers.find(
        obj =>
          obj.reference === item._id &&
          obj.user === this.user._id &&
          (
            (obj.relation === 'owner' && obj.customField === 'accepted')
          )
      )
      ) {
        return 'new'
      } else {
        if (this.discussionsType === 'all') {
          if (item.group) {
            return this.$settings.modules.groups.bgColor
          } else {
            return this.$settings.modules.discussions.bgColor
          }
        } else {
          return ''
        }
      }
    },
    async changeDiscussionProperty (discussionId, property, value) {
      this.$set(this.loaders, discussionId + property, true)
      const patchObj = {}
      patchObj[property] = value
      try {
        await this.patchDiscussion(
          [
            discussionId,
            patchObj
          ]
        )
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
        this.$set(this.loaders, discussionId + property, undefined)
      } catch (e) {
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
        this.$set(this.loaders, discussionId + property, undefined)
      }
    },
    getOwnStatusContainersOfDiscussion (discussionId) {
      return this.statusContainers.filter(obj => obj.reference === discussionId && obj.user === this.user._id)
    },
    isOwnDiscussion (discussionId) {
      return this.getOwnStatusContainersOfDiscussion(discussionId).map(obj => obj.relation).includes('owner')
    },
    async checkAcceptedDiscussions () {
      const visibleDiscussions = this.computedDiscussions.map(obj => obj._id)
      const acceptedStatusContainers = this.statusContainers.filter(obj =>
        obj.user === this.user._id &&
        obj.type === 'discussions' &&
        (
          (obj.relation === 'owner' && obj.customField === 'accepted')
        )
      ).map(obj => obj.reference)
      const discussionIds = visibleDiscussions.filter(e => acceptedStatusContainers.indexOf(e) !== -1)
      if (discussionIds.length > 0 && !this.isUpdating) {
        this.isUpdating = true
        await this.patchDiscussionNotifications(
          [
            'resetCustomField',
            {
              type: 'discussions',
              relation: 'owner',
              customField: 'accepted',
              references: discussionIds
            }
          ]
        )
        this.isUpdating = false
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
      if (this.$route.query.t) {
        this.discussionsType = this.$route.query.t
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
              d: this.sortDesc.join(','),
              t: this.discussionsType
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
              d: this.sortDesc.join(','),
              t: this.discussionsType
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
            d: this.sortDesc.join(','),
            t: this.discussionsType
          }
        })
      } else if (!data) {
        this.$router.replace({
          query: {
            p: this.page,
            i: this.itemsPerPage,
            d: this.sortDesc.join(','),
            t: this.discussionsType
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
            d: tmpData,
            t: this.discussionsType
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
      'itemsPerPageOptions'
    ]),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('groups', {
      getGroup: 'get'
    }),
    computedDiscussionTypes () {
      const tmpTypes = []
      if (this.$settings.modules.discussions.isActive) {
        tmpTypes.push({ text: this.$t('discussionForums'), value: 'discussions' })
      }
      if (this.$settings.modules.groups.isActive) {
        tmpTypes.push({ text: this.$t('groupDiscussions'), value: 'groups' })
      }
      if (tmpTypes.length > 1) {
        tmpTypes.unshift({ text: this.$t('allDiscussions'), value: 'all' })
      }
      return tmpTypes
    },
    computedColor () {
      if (this.$settings.modules[this.discussionsType] && this.$settings.modules[this.discussionsType].color) {
        return this.$settings.modules[this.discussionsType].color
      } else {
        return 'customGrey'
      }
    },
    headers () {
      return [
        { text: this.$t('title'), value: 'title.value' },
        { text: this.$t('role'), value: 'relation' },
        { text: this.$t('createdAt'), value: 'createdAt' },
        { text: this.$t('group'), value: 'group', sortable: false },
        { text: this.$t('accepted'), value: 'accepted.isAccepted', align: 'center' },
        { text: this.$t('active'), value: 'isActive', align: 'center' },
        { text: this.$t('editButton'), value: 'edit', align: 'center', sortable: false },
        { text: this.$t('deleteButton'), value: 'delete', align: 'center', sortable: false },
        { text: this.$t('viewButton'), value: 'link', align: 'center', sortable: false }
      ]
    },
    computedRelationItems () {
      const tmpRelationItems = {}
      for (const discussion of this.computedDiscussions) {
        const items = []
        const tmpItems = JSON.parse(JSON.stringify(this.relationItems))
        delete tmpItems.applicant
        delete tmpItems.member
        delete tmpItems.apply
        delete tmpItems.subscribe
        delete tmpItems.moderator
        delete tmpItems.invitation
        if (!this.isOwnDiscussion(discussion._id)) {
          delete tmpItems.owner
        }
        for (const key of Object.keys(tmpItems)) {
          items.push({
            value: key,
            text: this.$t(this.relationItems[key].textKey),
            disabled: key === 'owner'
          })
        }
        tmpRelationItems[discussion._id] = items
      }
      return tmpRelationItems
    },
    computedDiscussionRelations () {
      const tmpDiscussionRelations = {}
      for (const discussion of this.computedDiscussions) {
        tmpDiscussionRelations[discussion._id] = this.statusContainers.filter(obj => obj.user === this.user._id && obj.reference === discussion._id).map(obj => obj.relation)
      }
      return tmpDiscussionRelations
    },
    discussionsParams () {
      const query = {
        _id: {
          $in: this.statusContainers.filter(
            obj =>
              obj.user === this.user._id &&
              obj.type === 'discussions'
          ).map(obj => obj.reference)
        },
        $limit: this.computedLimit,
        $skip: (this.page - 1) * this.computedSkip,
        $sort: { [this.sortBy]: this.computedSortDesc }
      }
      if (this.discussionsType === 'discussions') {
        query.group = null
      } else if (this.discussionsType === 'groups') {
        query.group = { $exists: true, $ne: null }
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
      // Adapt query to show discussions if active and accepted and group active and accepted if user is member of hidden group
      return query
    },
    computedDiscussions () {
      if (this.discussionsResponse) {
        return this.discussionsResponse.data
      } else {
        return []
      }
    },
    total () {
      if (this.discussionsResponse) {
        return this.discussionsResponse.total
      } else {
        return 0
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
    async discussionsResponse () {
      this.loading = true
      const discussions = await this.findDiscussions(
        {
          query: this.discussionsParams
        }
      )
      this.loading = false
      return discussions
    }
  },

  watch: {
    computedDiscussionTypes () {
      this.discussionsType = this.computedDiscussionTypes[0].value
    },
    discussionsType (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$emit('setStep', this.discussionsType)
        if (this.$route.query.t !== newValue) {
          this.$router.replace(
            {
              query: {
                p: this.page,
                i: this.itemsPerPage,
                s: this.sortBy.join(','),
                d: this.sortDesc.join(','),
                t: this.discussionsType
              }
            }
          )
        }
      }
    },
    async discussions () {
      await this.checkAcceptedDiscussions()
    },
    statusContainers: {
      deep: true,
      async handler () {
        await this.checkAcceptedDiscussions()
      }
    }
  }
}
</script>
