<template>
  <div>
    <v-row
      class="d-flex mx-0 mb-4"
    >
      <span
        class="my-4 me-auto text-h5 font-weight-bold text-uppercase"
      >
        {{$t('preferences')}}
      </span>
    </v-row>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card
          color="customGreyUltraLight"
          tile
        >
          <v-card-text>
            <v-form
              v-model="isValid"
            >
              <v-row
                class="mt-8"
              >
                <v-col
                  class="text-h6 font-weight-bold"
                >
                  {{$t('languageButton')}}
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-card
                    flat
                    tile
                    color="white"
                  >
                    <v-card-text>
                      <v-row
                        dense
                      >
                        <v-col
                          cols="12"
                          sm="6"
                          class="text-body-1 align-self-center"
                        >
                            {{$t('instantTranslateAll')}}
                        </v-col>
                        <v-col
                          cols="12"
                          sm="6"
                        >
                          <v-select
                            density="compact"
                            :label="$t('preferences')"
                            class="min-width"
                            :items="[
                              { title: $t('yes'), value: true },
                              { title: $t('no'), value: false }
                            ]"
                            v-model="instantTranslateAll"
                          ></v-select>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-row
                class="mt-8"
              >
                <v-col
                  class="text-h6 font-weight-bold"
                >
                  {{$t('privateInformation')}}
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-card
                    flat
                    tile
                    color="white"
                  >
                    <v-card-text>
                      <v-row
                        dense
                      >
                        <v-col
                          cols="12"
                          sm="6"
                          class="text-body-1 align-self-center"
                        >
                            {{$t('publishAgeLabel')}}
                        </v-col>
                        <v-col
                          cols="12"
                          sm="6"
                        >
                          <v-select
                            density="compact"
                            :label="$t('visibility')"
                            class="min-width"
                            :items="[
                              { title: $t('administrators'), value: 'none' },
                              { title: $t('registratedUsers'), value: 'users' }
                            ]"
                            v-model="publishAge"
                          ></v-select>
                        </v-col>
                      </v-row>
                      <v-row
                        dense
                      >
                        <v-col
                          cols="12"
                          sm="6"
                          class="text-body-1 align-self-center"
                        >
                            {{$t('publishGenderLabel')}}
                        </v-col>
                        <v-col
                          cols="12"
                          sm="6"
                        >
                          <v-select
                            density="compact"
                            :label="$t('visibility')"
                            class="min-width"
                            :items="[
                              { title: $t('administrators'), value: 'none' },
                              { title: $t('registratedUsers'), value: 'users' }
                            ]"
                            v-model="publishGender"
                          ></v-select>
                        </v-col>
                      </v-row>
                      <v-row
                        dense
                      >
                        <v-col
                          cols="12"
                          sm="6"
                          class="text-body-1 align-self-center"
                        >
                            {{$t('publishResidenceLabel')}}
                        </v-col>
                        <v-col
                          cols="12"
                          sm="6"
                        >
                          <v-select
                            density="compact"
                            :label="$t('visibility')"
                            class="min-width"
                            :items="[
                              { title: $t('administrators'), value: 'none' },
                              { title: $t('registratedUsers'), value: 'users'}
                            ]"
                            v-model="publishResidence"
                          ></v-select>
                        </v-col>
                      </v-row>
                      <v-row
                        dense
                      >
                        <v-col
                          cols="12"
                          sm="6"
                          class="text-body-1 align-self-center"
                        >
                            {{$t('publishFavoriteCategoriesLabel')}}
                        </v-col>
                        <v-col
                          cols="12"
                          sm="6"
                        >
                          <v-select
                            density="compact"
                            :label="$t('visibility')"
                            class="min-width"
                            :items="[
                              { title: $t('administrators'), value: 'none' },
                              { title: $t('registratedUsers'), value: 'users'}
                            ]"
                            v-model="publishFavoriteCategories"
                          ></v-select>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-row
                class="mt-8"
              >
                <v-col
                  class="text-h6 font-weight-bold"
                >
                  {{$t('newsletter')}}
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-card
                    flat
                    tile
                    color="white"
                  >
                    <v-card-text>
                      <v-row
                        dense
                      >
                        <v-col
                          cols="12"
                          sm="6"
                          class="text-body-1 align-self-center"
                        >
                          {{$t('receiveNewsletterLabel')}}
                        </v-col>
                        <v-col
                          cols="12"
                          sm="6"
                        >
                          <v-select
                            density="compact"
                            :label="$t('preferences')"
                            class="min-width"
                            :items="[
                              { title: $t('yes'), value: true },
                              { title: $t('no'), value: false }
                            ]"
                            v-model="receiveNewsletter"
                          ></v-select>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-row
                class="mt-8"
              >
                <v-col
                  class="text-h6 font-weight-bold"
                >
                  {{$t('notifications')}}
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                <v-card>
                  <v-card-text>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newChatPreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newChats"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newChatMessagePreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newChatMessages"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newDiscussionMessagePreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newDiscussionMessages"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newGroupInvitationPreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newAcceptedGroupInvitations"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newGroupMembershipPreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newAcceptedGroupMemberships"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newGroupModeratorRolePreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newAcceptedGroupModeratorRoles"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newAcceptedAdPreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newAcceptedAds"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newAcceptedGroupPreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newAcceptedGroups"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newAcceptedDiscussionPreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newAcceptedDiscussions"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newAdApplicantPreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newAdApplicants"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newGroupApplicantPreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newGroupApplicants"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newGroupDiscussionToAcceptPreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newGroupDiscussionsToAccept"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newAcceptedGroupDiscussionsPreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newAcceptedGroupDiscussions"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newGroupViolationsToProvePreferencesLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newGroupViolationsToProve"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newMentionLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newMention"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row
                      dense
                    >
                      <v-col
                        cols="12"
                        sm="6"
                        class="text-body-1 align-self-center"
                      >
                        {{$t('newFavoriteCategoryContentLabel')}}
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-select
                          :label="$t('notification')"
                          density="compact"
                          class="min-width"
                          :items="items"
                          v-model="newFavoriteCategoryContent"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
                </v-col>
              </v-row>
              <!-- -->
              <template
                v-if="user.role === 'admins'"
              >
                <v-row
                  class="mt-8"
                >
                  <v-col
                    class="text-h6 font-weight-bold"
                  >
                    {{$t('notifications')}} {{$t('forAdministrators')[0].toLowerCase() + $t('forAdministrators').substr(1)}}
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-card
                      flat
                      color="white"
                      tile
                    >
                      <v-card-text>
                        <v-row
                          dense
                        >
                          <v-col
                            cols="12"
                            sm="6"
                            class="text-body-1 align-self-center"
                          >
                            {{$t('newAdToAcceptPreferencesLabel')}}
                          </v-col>
                          <v-col
                            cols="12"
                            sm="6"
                          >
                            <v-select
                              :label="$t('notification')"
                              density="compact"
                              class="min-width"
                              :items="items"
                              v-model="newAdsToAccept"
                            ></v-select>
                          </v-col>
                        </v-row>
                        <v-row
                          dense
                        >
                          <v-col
                            cols="12"
                            sm="6"
                            class="text-body-1 align-self-center"
                          >
                            {{$t('newDiscussionToAcceptPreferencesLabel')}}
                          </v-col>
                          <v-col
                            cols="12"
                            sm="6"
                          >
                            <v-select
                              :label="$t('notification')"
                              density="compact"
                              class="min-width"
                              :items="items"
                              v-model="newDiscussionsToAccept"
                            ></v-select>
                          </v-col>
                        </v-row>
                        <v-row
                          dense
                        >
                          <v-col
                            cols="12"
                            sm="6"
                            class="text-body-1 align-self-center"
                          >
                            {{$t('newGroupToAcceptPreferencesLabel')}}
                          </v-col>
                          <v-col
                            cols="12"
                            sm="6"
                          >
                            <v-select
                              :label="$t('notification')"
                              density="compact"
                              class="min-width"
                              :items="items"
                              v-model="newGroupsToAccept"
                            ></v-select>
                          </v-col>
                        </v-row>
                        <v-row
                          dense
                        >
                          <v-col
                            cols="12"
                            sm="6"
                            class="text-body-1 align-self-center"
                          >
                            {{$t('newTagsToAcceptPreferencesLabel')}}
                          </v-col>
                          <v-col
                            cols="12"
                            sm="6"
                          >
                            <v-select
                              :label="$t('notification')"
                              density="compact"
                              class="min-width"
                              :items="items"
                              v-model="newTagsToAccept"
                            ></v-select>
                          </v-col>
                        </v-row>
                        <v-row
                          dense
                        >
                          <v-col
                            cols="12"
                            sm="6"
                            class="text-body-1 align-self-center"
                          >
                            {{$t('newViolationsToProvePreferencesLabel')}}
                          </v-col>
                          <v-col
                            cols="12"
                            sm="6"
                          >
                            <v-select
                              :label="$t('notification')"
                              density="compact"
                              class="min-width"
                              :items="items"
                              v-model="newViolationsToProve"
                            ></v-select>
                          </v-col>
                        </v-row>
                        <v-row
                          dense
                        >
                          <v-col
                            cols="12"
                            sm="6"
                            class="text-body-1 align-self-center"
                          >
                            {{$t('newUserLabel')}}
                          </v-col>
                          <v-col
                            cols="12"
                            sm="6"
                          >
                            <v-select
                              :label="$t('notification')"
                              density="compact"
                              class="min-width"
                              :items="items.filter(item => item.value !== 'emailOffline')"
                              v-model="newUser"
                            ></v-select>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </template>
            </v-form>
            <v-divider
              class="my-9 mb-6"
            ></v-divider>
            <v-toolbar
              class="pa-0"
            >
              <v-btn
                block
                size="large"
                variant="elevated"
                color="customGrey"
                :loading="isLoading"
                :disabled="!isValid || !$route.params.user"
                @click="savePreferences()"
              >
                {{$t('saveDataButton')}}
              </v-btn>
            </v-toolbar>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'PreferencesEditor',

  data: () => ({
    publishAge: 'none',
    publishGender: 'none',
    publishResidence: 'none',
    publishFavoriteCategories: 'none',
    selectedPreferences: undefined,
    isLoading: false,
    isValid: false,
    receiveNewsletter: false,
    instantTranslateAll: false,
    newChats: 'emailOffline',
    newChatMessages: 'emailOffline',
    newDiscussionMessages: 'emailOffline',
    newAcceptedGroupMemberships: 'emailOffline',
    newAcceptedGroupInvitations: 'emailOffline',
    newAcceptedGroupModeratorRoles: 'emailOffline',
    newAdApplicants: 'emailOffline',
    newGroupApplicants: 'emailOffline',
    newGroupDiscussionsToAccept: 'emailOffline',
    newAdsToAccept: 'emailOffline',
    newDiscussionsToAccept: 'emailOffline',
    newGroupsToAccept: 'emailOffline',
    newTagsToAccept: 'emailOffline',
    newAcceptedAds: 'emailOffline',
    newAcceptedGroups: 'emailOffline',
    newAcceptedGroupDiscussions: 'emailOffline',
    newAcceptedDiscussions: 'emailOffline',
    newViolationsToProve: 'emailOffline',
    newGroupViolationsToProve: 'emailOffline',
    newMention: 'emailOffline',
    newFavoriteCategoryContent: 'emailOffline',
    newUser: 'emailOff'
  }),

  async mounted () {
    await this.adapt()
  },

  methods: {
    ...mapMutations([
      'SET_PREFERENCES'
    ]),
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('preferences', {
      patchPreferences: 'patch',
      createPreferences: 'create',
      fetchPreferences: 'find'
    }),
    async adapt () {
      if (this.$route.params.user) {
        let selectedPreferences = this.findPreferences({
          query: {
            user: this.$route.params.user
          }
        })
        if (selectedPreferences.data && selectedPreferences.data.length > 0) {
          selectedPreferences = selectedPreferences.data[0]
        } else {
          selectedPreferences = await this.fetchPreferences(
            {
              query: {
                user: this.$route.params.user
              }
            }
          )
          if (selectedPreferences.length > 0) {
            selectedPreferences = selectedPreferences[0]
          } else {
            selectedPreferences = undefined
          }
        }
        this.selectedPreferences = selectedPreferences
      }
      if (this.selectedPreferences) {
        this.instantTranslateAll = this.selectedPreferences.instantTranslateAll || this.instantTranslateAll
        this.receiveNewsletter = this.selectedPreferences.receiveNewsletter || this.receiveNewsletter
        this.publishAge = this.selectedPreferences.publishAge || this.publishAge
        this.publishGender = this.selectedPreferences.publishGender || this.publishGender
        this.publishResidence = this.selectedPreferences.publishResidence || this.publishResidence
        this.publishFavoriteCategories = this.selectedPreferences.publishFavoriteCategories || this.publishFavoriteCategories
        this.newChats = this.selectedPreferences.newChats || this.newChats
        this.newChatMessages = this.selectedPreferences.newChatMessages || this.newChatMessages
        this.newDiscussionMessages = this.selectedPreferences.newDiscussionMessages || this.newDiscussionMessages
        this.newAcceptedGroupMemberships = this.selectedPreferences.newAcceptedGroupMemberships || this.newAcceptedGroupMemberships
        this.newAcceptedGroupInvitations = this.selectedPreferences.newAcceptedGroupInvitations || this.newAcceptedGroupInvitations
        this.newAcceptedGroupModeratorRoles = this.selectedPreferences.newAcceptedGroupModeratorRoles || this.newAcceptedGroupModeratorRoles
        this.newAdApplicants = this.selectedPreferences.newAdApplicants || this.newAdApplicants
        this.newGroupApplicants = this.selectedPreferences.newGroupApplicants || this.newGroupApplicants
        this.newGroupDiscussionsToAccept = this.selectedPreferences.newGroupDiscussionsToAccept || this.newGroupDiscussionsToAccept
        this.newAdsToAccept = this.selectedPreferences.newAdsToAccept || this.newAdsToAccept
        this.newDiscussionsToAccept = this.selectedPreferences.newDiscussionsToAccept || this.newDiscussionsToAccept
        this.newGroupsToAccept = this.selectedPreferences.newGroupsToAccept || this.newGroupsToAccept
        this.newTagsToAccept = this.selectedPreferences.newTagsToAccept || this.newTagsToAccept
        this.newAcceptedAds = this.selectedPreferences.newAcceptedAds || this.newAcceptedAds
        this.newAcceptedGroups = this.selectedPreferences.newAcceptedGroups || this.newAcceptedGroups
        this.newAcceptedDiscussions = this.selectedPreferences.newAcceptedDiscussions || this.newAcceptedDiscussions
        this.newAcceptedGroupDiscussions = this.selectedPreferences.newAcceptedGroupDiscussions || this.newAcceptedGroupDiscussions
        this.newViolationsToProve = this.selectedPreferences.newViolationsToProve || this.newViolationsToProve
        this.newGroupViolationsToProve = this.selectedPreferences.newGroupViolationsToProve || this.newGroupViolationsToProve
        this.newMention = this.selectedPreferences.newMention || this.newMention
        this.newFavoriteCategoryContent = this.selectedPreferences.newFavoriteCategoryContent || this.newFavoriteCategoryContent
        this.newUser = this.selectedPreferences.newUser || this.newUser
      }
    },
    async savePreferences () {
      this.isLoading = true
      const map = {
        user: this.$route.params.user,
        receiveNewsletter: this.receiveNewsletter,
        instantTranslateAll: this.instantTranslateAll,
        publishAge: this.publishAge,
        publishGender: this.publishGender,
        publishResidence: this.publishResidence,
        publishFavoriteCategories: this.publishFavoriteCategories,
        newChats: this.newChats,
        newChatMessages: this.newChatMessages,
        newDiscussionMessages: this.newDiscussionMessages,
        newAcceptedGroupMemberships: this.newAcceptedGroupMemberships,
        newAcceptedGroupInvitations: this.newAcceptedGroupInvitations,
        newAcceptedGroupModeratorRoles: this.newAcceptedGroupModeratorRoles,
        newAdApplicants: this.newAdApplicants,
        newGroupApplicants: this.newGroupApplicants,
        newGroupDiscussionsToAccept: this.newGroupDiscussionsToAccept,
        newAdsToAccept: this.newAdsToAccept,
        newDiscussionsToAccept: this.newDiscussionsToAccept,
        newGroupsToAccept: this.newGroupsToAccept,
        newTagsToAccept: this.newTagsToAccept,
        newAcceptedAds: this.newAcceptedAds,
        newAcceptedGroups: this.newAcceptedGroups,
        newAcceptedDiscussions: this.newAcceptedDiscussions,
        newAcceptedGroupDiscussions: this.newAcceptedGroupDiscussions,
        newViolationsToProve: this.newViolationsToProve,
        newGroupViolationsToProve: this.newGroupViolationsToProve,
        newMention: this.newMention,
        newFavoriteCategoryContent: this.newFavoriteCategoryContent,
        newUser: this.newUser
      }
      try {
        let preferences
        if (this.selectedPreferences) {
          preferences = await this.patchPreferences([this.selectedPreferences._id, map, {}])
        } else {
          preferences = await this.createPreferences([map, {}])
        }
        this.SET_PREFERENCES = preferences
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveSuccess'), color: 'success' })
      } catch (e) {
        this.isLoading = false
        this.setSnackbar({ text: this.$t('snackbarSaveError'), color: 'error' })
      }
    }
  },

  computed: {
    ...mapGetters([
      'rules',
      's3',
      'preferences'
    ]),
    ...mapGetters('auth', [
      'user'
    ]),
    ...mapGetters('preferences', {
      findPreferences: 'find'
    }),
    items () {
      return [
        { title: this.$t('always'), value: 'emailAlways' },
        { title: this.$t('whenOffline'), value: 'emailOffline' },
        { title: this.$t('never'), value: 'emailOff' }
      ]
    }
  }
}
</script>
