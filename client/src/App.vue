<template>
  <v-app
    :style="'background: linear-gradient(-45deg, ' + computedGradientLeft + ' 20%, ' + computedGradientRight + ' 100%);}'"
    :key="$settings ? $settings.updatedAt : $settings"
  >
    <template
      v-if="$settings"
    >
      <v-app-bar
        v-if="$route.name && $route.name !== 'Home'"
        app
        clipped-right
        height="80px"
      >
        <template v-slot:img="{ props }">
          <v-img
            v-bind="props"
            :gradient="'to right, ' + $settings.headerColor + ', ' + $settings.headerColor.substr(0, $settings.headerColor.length - 2) + '0.2)'"
          ></v-img>
        </template>
        <img
          v-if="$vuetify.display.smAndUp && $settings.headerLogo"
          class="py-2 mr-3 pointer"
          :height="$vuetify.display.mdAndUp ? '50px' : ($vuetify.display.smAndUp ? '30px': '30px')"
          :src="$settings && $settings.headerLogo ? s3 + $settings.headerLogo.url : ''"
          @click="$router.push({ name: 'Home' })"
          style="margin-bottom: -1px"
          alt="Vima Logo"
          :title="$settings && $settings.headerLogo ? $settings.headerLogo.credit : ''"
        />
        <span
          v-else
          @click="$router.push({ name: 'Home' })"
          class="pointer subtitle-2"
        >
          {{$settings.name}}
        </span>
        <v-toolbar-title
          v-if="$vuetify.display.lgAndUp"
          class="text-h4 font-weight-bold pointer align-self-center pt-3"
          @click="$router.push({ name: 'Home' })"
        >
          {{$t('slogan')}}
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-sheet
          class="pt-1"
          :class="$vuetify.display.smAndUp ? 'pr-2' : ''"
          color="transparent"
        >

          <LanguageSelect
            :isMainSwitch="true"
            :currentLanguage="$i18n.locale"
            @setLanguage="setLanguage"
          ></LanguageSelect>
        </v-sheet>

        <v-menu
          open-on-hover
          offset-y
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="customGrey--text"
              :class="!$vuetify.display.smAndUp ? 'ml-2': 'ml-1'"
              :large="$vuetify.display.mdAndUp"
              :small="!$vuetify.display.smAndUp"
              :icon="!$vuetify.display.smAndUp"
              v-bind="attrs"
              v-on="on"
              :title="$t('infoButton')"
              tour-step="7"
            >
              <v-icon
                color="customGrey"
                class="mr-1"
                :size="$vuetify.display.smAndUp ? 18: 24"
              >
                fa fa-question-circle
              </v-icon>
              <template
                v-if="$vuetify.display.mdAndUp"
              >
                {{$t('infoButton')}}
              </template>
              <v-icon
                v-if="$vuetify.display.smAndUp"
                color="customGrey"
                class="ml-1"
                size="18"
              >
                fa fa-chevron-down
              </v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              :to="{ name: 'Vima' }"
            >
              <v-list-item-title>
                {{$t('aboutVima')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              :to="{ name: 'Ileu' }"
            >
              <v-list-item-title>
                {{$t('aboutIleu')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              :to="{ name: 'Vives' }"
            >
              <v-list-item-title>
                {{$t('aboutVives')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="$settings.modules.team.isActive"
              :to="{ name: 'Team' }"
            >
              <v-list-item-title>
                <div
                  v-html="$t('teamTitle')"
                >
              </div>
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="$route && $route.name === 'Participate'"
              @click="$tours['app'].start()"
            >
              <v-list-item-title>
                {{$t('explainPageElements')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              :to="{ name: 'CommunicationRules' }"
            >
              <v-list-item-title>
                {{$t('communicationRules')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              :to="{ name: 'Faq' }"
            >
              <v-list-item-title>
                {{$t('faq')}}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu
          open-on-hover
          offset-y
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="customGrey--text"
              :class="!$vuetify.display.smAndUp ? 'ml-4': 'ml-3'"
              :large="$vuetify.display.mdAndUp"
              :small="!$vuetify.display.smAndUp"
              :icon="!$vuetify.display.smAndUp"
              v-bind="attrs"
              v-on="on"
              :title="$t('participate')"
            >
              <v-icon
                color="customGrey"
                class="mr-1"
                :size="$vuetify.display.smAndUp ? 18: 24"
              >
                fa fa-list
              </v-icon>
              <template
                v-if="$vuetify.display.mdAndUp"
              >
                {{$t('participate')}}
              </template>
              <v-icon
                v-if="$vuetify.display.smAndUp"
                color="customGrey"
                class="ml-1"
                size="18"
              >
                fa fa-chevron-down
              </v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              :to="{ name: 'Participate' }"
            >
              <v-list-item-title>
                {{ $t('overview') }}
              </v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item
              v-if="$settings.modules.ads.isActive"
              :color="$settings.modules.ads.color"
              :to="{ name: 'CategoryList', params: { type: 'ads' } }"
            >
              <v-list-item-title>
                <div
                  v-html="$t('adsTitle')"
                >
              </div>
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="$settings.modules.groups.isActive"
              :color="$settings.modules.groups.color"
              :to="{ name: 'Groups' }"
            >
              <v-list-item-title>
                <div
                  v-html="$t('groupsTitle')"
                >
                </div>
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="$settings.modules.discussions.isActive"
              :color="$settings.modules.discussions.color"
              :to="{ name: 'Discussions', params: { type: 'discussions' } }"
            >
              <v-list-item-title>
                <div
                  v-html="$t('discussionsTitle')"
                >
                </div>
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="$settings.modules.news.isActive"
              color="customGrey"
              :to="{ name: 'News' }"
            >
              <v-list-item-title>
                <div
                  v-html="$t('newsTitle')"
                >
                </div>
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="$settings.modules.events.isActive"
              color="customGrey"
              :to="{ name: 'Events' }"
            >
              <v-list-item-title>
                <div
                  v-html="$t('eventsTitle')"
                >
                </div>
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="$settings.modules.blog.isActive"
              color="customGrey"
              :to="{ name: 'Blog' }"
            >
              <v-list-item-title>
                <div
                  v-html="$t('blogTitle')"
                >
                </div>
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="$settings.modules.organisations.isActive"
              color="customGrey"
              :to="{ name: 'Organisations' }"
            >
              <v-list-item-title>
                <div
                  v-html="$t('organisationsTitle')"
                >
                </div
              >
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="$settings.modules.sponsors.isActive"
              color="customGrey"
              :to="{ name: 'Sponsors' }"
            >
              <v-list-item-title>
                <div
                  v-html="$t('sponsorsTitle')"
                >
                </div>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn
          v-if="!user"
          class="ml-3 elevation-1"
          :text="$vuetify.display.smAndUp"
          :icon="!$vuetify.display.smAndUp"
          :large="$vuetify.display.mdAndUp"
          color="customGrey"
          :to="{ name: 'Signup' }"
          tour-step="5"
          :title="$t('createProfileButton')"
        >
          {{$vuetify.display.smAndUp ? $t('createProfileButton') : ''}}
          <v-icon
            :class="$vuetify.display.smAndUp ? 'ml-3' : ''"
            size="18"
          >
            fa fa-user-plus
          </v-icon>
        </v-btn>
        <v-btn
          v-if="!user"
          class="ml-3 elevation-1"
          :text="$vuetify.display.smAndUp"
          :icon="!$vuetify.display.smAndUp"
          :large="$vuetify.display.mdAndUp"
          color="customGrey"
          :to="{ name: 'Login' }"
          tour-step="6"
          :title="$t('login')"
        >
          {{$vuetify.display.smAndUp ? $t('login') : ''}}
          <v-icon
            :class="$vuetify.display.smAndUp ? 'ml-3' : ''"
            size="18"
          >
            fa fa-sign-in-alt
          </v-icon>
        </v-btn>
        <v-badge
          color="customGrey"
          :value="computedUnreadNotifications"
          overlap
        >
          <template slot="badge">
            <v-icon
              size="12"
              :color="$settings.indicatorColor"
            >
              fas fa-exclamation
            </v-icon>
          </template>
          <v-btn
            v-if="user"
            class="ml-3 elevation-1"
            color="customGrey"
            text
            :large="$vuetify.display.mdAndUp"
            tour-step="5"
            @click=" isNavigationDrawer = !isNavigationDrawer"
            :title="isNavigationDrawer ? $t('myVimaToggleClose') : $t('myVimaToggleOpen')"
          >
            <v-icon
              size="18"
              :class="$vuetify.display.mdAndUp ? 'mr-3' : ''"
            >
              {{ isNavigationDrawer ? 'fas fa-times' : 'fas fa-user' }}
            </v-icon>
            <template
              v-if="$vuetify.display.mdAndUp"
            >
              {{isNavigationDrawer ? $t('myVimaToggleClose'): $t('myVimaToggleOpen')}}
            </template>
          </v-btn>
        </v-badge>

      </v-app-bar>

      <v-navigation-drawer
        v-if="user"
        v-model="isNavigationDrawer"
        right
        app
        clipped
        fixed
        width="290"
        temporary
        class="elevation-3"
        color="rgba(240, 244, 195, 1)"
        style="top: 80px; overflow-y: auto; max-height: calc(100% - 80px)"
      >
        <v-img
          height="100%"
          slot="img"
          :gradient="'to right, ' + $settings.headerColor.substr(0, $settings.headerColor.length - 2) + '0.2), rgba(255, 255, 255, 1)'"
        ></v-img>
        <v-list
          class="pt-0"
        >
          <v-list-item
            class="justify-center"
            v-if="user && user.pic && user.pic.url"
          >
            <v-badge
              :color="statusItems[user.status].color"
              offset-x="30"
              offset-y="30"
            >
              <v-img
                :src="user && user.pic ? s3 + user.pic.url : ''"
                position="center"
                width="290"
                height="100%"
                max-height="230"
                cover
                :alt="user ? $t('userPic') + ' ' + $t('by') + ' ' + user.userName : ''"
                :title="user && user.pic && user.pic.credit ? '© ' + user.pic.credit : ''"
              >
              </v-img>
            </v-badge>
          </v-list-item>
          <v-list-item
            v-else
            class="justify-center"
          >
            <v-badge
              :color="statusItems[user.status].color"
              offset-y="40"
            >
              <v-row>
                <v-col
                  class="text-center"
                >
                  <v-icon
                    size="100"
                    class="my-6"
                  >
                    fa fa-user
                  </v-icon>
                </v-col>
              </v-row>
            </v-badge>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item
            :to="{ name: 'UserEditor', params: { user: user._id } }"
          >
            <v-list-item-title
            class="font-weight-bold customGrey--text"
            >
              {{$t('myProfileButton')}}
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            :to="{ name: 'PreferencesEditor', params: { user: user._id } }"
          >
            <v-list-item-title
            class="font-weight-bold customGrey--text"
            >
              {{$t('myPreferencesButton')}}
            </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item
            :to="{ name: 'ChatList', params: { id: user._id } }"
          >
            <v-list-item-title
              class="font-weight-bold customGrey--text"
            >
              {{$t('myChatsButton')}}
            </v-list-item-title>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadChats > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadChats}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-comments
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newChats')}}
            </v-tooltip>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadChatMessages > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadChatMessages}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-envelope
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newChatMessages')}}
            </v-tooltip>
          </v-list-item>
          <v-list-item
            v-if="moduleVisibilities.ads"
            :to="{ name: 'AdList', params: { id: user._id } }"
          >
            <v-list-item-title
              class="font-weight-bold customGrey--text"
            >
            {{$t('myAds')}}
            </v-list-item-title>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadAdAccepts > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadAdAccepts}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-lock-open
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newAcceptedAds')}}
            </v-tooltip>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadAdMessages > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadAdMessages}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-user
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newAdApplicants')}}
            </v-tooltip>
          </v-list-item>
          <v-list-item
            v-if="moduleVisibilities.discussions"
            :to="{ name: 'DiscussionList', params: { id: user._id } }"
          >
            <v-list-item-title
              class="font-weight-bold customGrey--text"
            >
              {{$t('myDiscussions')}}
            </v-list-item-title>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadDiscussionAccepts > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadDiscussionAccepts}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-lock-open
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newAcceptedDiscussions')}}
            </v-tooltip>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadDiscussionModerator > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadDiscussionModerator}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-users
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newModeratorRole')}}
            </v-tooltip>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadDiscussionMessages > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadDiscussionMessages}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-comment-dots
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newDiscussionMessages')}}
            </v-tooltip>
          </v-list-item>
          <v-list-item
            v-if="moduleVisibilities.groups"
            :to="{ name: 'GroupList', params: { id: user._id } }"
          >
            <v-list-item-title
              class="font-weight-bold customGrey--text"
            >
              {{$t('myInterestGroups')}}
            </v-list-item-title>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadGroupAccepts > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadGroupAccepts}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-lock-open
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newAcceptedGroups')}}
            </v-tooltip>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadGroupModerator > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadGroupModerator}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-users
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newModeratorRole')}}
            </v-tooltip>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadGroupApplications > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadGroupApplications}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-users
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newGroupApplications')}}
            </v-tooltip>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadGroupDiscussionsToAccept > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadGroupDiscussionsToAccept}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-comments
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newGroupDiscussionsToAccept')}}
            </v-tooltip>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadGroupMemberships > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadGroupMemberships}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-user-plus
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newGroupMemberships')}}
            </v-tooltip>
            <v-tooltip
              left
              color="customGrey"
              v-if="computedUnreadGroupInvitations > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="$settings.indicatorColor"
                  offset-x="15"
                  offset-y="15"
                >
                  <template slot="badge">
                    <span
                      class="customGrey--text font-weight-bold"
                    >
                      {{computedUnreadGroupInvitations}}
                    </span>
                  </template>
                  <v-list-item-avatar
                    color="customGrey"
                    v-bind="attrs"
                    v-on="on"
                    size="34"
                    class="ma-1"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      fas fa-door-open
                    </v-icon>
                  </v-list-item-avatar>
                </v-badge>
              </template>
              {{$t('newGroupInvitations')}}
            </v-tooltip>
            <v-tooltip
                left
                color="customGrey"
                v-if="computedUnreadGroupViolationsToAccept > 0"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-badge
                    :color="$settings.indicatorColor"
                    offset-x="15"
                    offset-y="15"
                  >
                    <template slot="badge">
                      <span
                        class="customGrey--text font-weight-bold"
                      >
                        {{computedUnreadGroupViolationsToAccept}}
                      </span>
                    </template>
                    <v-list-item-avatar
                      color="customGrey"
                      v-bind="attrs"
                      v-on="on"
                      size="34"
                      class="ma-1"
                    >
                      <v-icon
                        size="18"
                        color="white"
                      >
                        fas fa-ban
                      </v-icon>
                    </v-list-item-avatar>
                  </v-badge>
                </template>
                {{$t('newViolationsToAccept')}}
              </v-tooltip>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item
            :to="{ name: 'UserList' }"
          >
            <v-list-item-title
              class="font-weight-bold customGrey--text"
            >
              {{$t('findMembersButton')}}
            </v-list-item-title>
          </v-list-item>
          <template
            v-if="
              (
                user.role === 'partners' ||
                user.role === 'admins'
              ) &&
              computedUserOrganisationId &&
              moduleVisibilities.organisations
            "
          >
            <v-divider></v-divider>
            <v-list-group
              :value="false"
              sub-group
              color="customGrey"
            >
              <template v-slot:activator>
                <v-badge
                  color="customGrey"
                  :value="false"
                  inline
                >
                  <v-list-item
                    class="pl-0"
                    color="customGrey"
                  >
                    <v-list-item-title
                      class="font-weight-bold customGrey--text"
                      color="customGrey"
                    >
                      {{$t('partnerFunctionsButton')}}
                    </v-list-item-title>
                  </v-list-item>
                </v-badge>
              </template>

              <v-list-item
                v-if="moduleVisibilities.organisations"
                :to="{
                  name: 'OrganisationEditor',
                  params: {
                    organisation: computedUserOrganisationId
                  }
                }"
              >
                <v-list-item-title
                  class="font-weight-bold customGrey--text"
                >
                  {{$t('myOrganisationButton')}}
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="moduleVisibilities.events"
                :to="{ name: 'EventList', params: { organisation: computedUserOrganisationId } }"
              >
                <v-list-item-title
                  class="font-weight-bold customGrey--text"
                >
                  {{$t('myEventsButton')}}
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="moduleVisibilities.events"
                :to="{
                  name: 'ApiKeyEditor',
                  params: {
                    organisation: computedUserOrganisationId
                  }
                }"
              >
                <v-list-item-title
                  class="font-weight-bold customGrey--text"
                >
                  {{$t('myApiKey')}}
                </v-list-item-title>
              </v-list-item>
            </v-list-group>
          </template>
          <v-divider></v-divider>
          <v-list-group
            v-if="user.role === 'admins'"
            :value="false"
            sub-group
            color="customGrey"
          >
            <template v-slot:activator>
              <v-badge
                color="customGrey"
                :value="computedUnreadAdminNotifications"
                inline
              >
                <template slot="badge">
                  <v-icon
                    size="12"
                    :color="$settings.indicatorColor"
                  >
                    fas fa-exclamation
                  </v-icon>
                </template>
                <v-list-item
                  color="customGrey"
                  class="pl-0"
                >
                  <v-list-item-title
                    class="font-weight-bold customGrey--text"
                    color="customGrey"
                  >
                    {{$t('adminFunctionsButton')}}
                  </v-list-item-title>
                </v-list-item>
              </v-badge>
            </template>

            <v-list-item
              :to="{ name: 'UserListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('manageMembersButton')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="moduleVisibilities.organisations"
              :to="{ name: 'OrganisationListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('manageOrganisationsButton')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="moduleVisibilities.sponsors"
              :to="{ name: 'SponsorListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('manageSponsorsButton')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="moduleVisibilities.blog"
              :to="{ name: 'BlogListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('blog')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="moduleVisibilities.news"
              :to="{ name: 'NewsListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('news')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="moduleVisibilities.events"
              :to="{ name: 'EventListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('manageEventsButton')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              :to="{ name: 'SiteListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('manageSitesButton')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="moduleVisibilities.ads"
              :to="{ name: 'AdListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('ads')}}
              </v-list-item-title>
              <v-tooltip
                left
                color="customGrey"
                v-if="computedUnreadAdsToAccept > 0"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-badge
                    :color="$settings.indicatorColor"
                    offset-x="15"
                    offset-y="15"
                  >
                    <template slot="badge">
                      <span
                        class="customGrey--text font-weight-bold"
                      >
                        {{computedUnreadAdsToAccept}}
                      </span>
                    </template>
                    <v-list-item-avatar
                      color="customGrey"
                      v-bind="attrs"
                      v-on="on"
                      size="34"
                      class="ma-1"
                    >
                      <v-icon
                        size="18"
                        color="white"
                      >
                        fas fa-lock
                      </v-icon>
                    </v-list-item-avatar>
                  </v-badge>
                </template>
                {{$t('newAdsToAccept')}}
              </v-tooltip>
            </v-list-item>
            <v-list-item
              v-if="moduleVisibilities.discussions"
              :to="{ name: 'DiscussionListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('discussionForums')}}
              </v-list-item-title>
              <v-tooltip
                left
                color="customGrey"
                v-if="computedUnreadDiscussionsToAccept > 0"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-badge
                    :color="$settings.indicatorColor"
                    offset-x="15"
                    offset-y="15"
                  >
                    <template slot="badge">
                      <span
                        class="customGrey--text font-weight-bold"
                      >
                        {{computedUnreadDiscussionsToAccept}}
                      </span>
                    </template>
                    <v-list-item-avatar
                      color="customGrey"
                      v-bind="attrs"
                      v-on="on"
                      size="34"
                      class="ma-1"
                    >
                      <v-icon
                        size="18"
                        color="white"
                      >
                        fas fa-lock
                      </v-icon>
                    </v-list-item-avatar>
                  </v-badge>
                </template>
                {{$t('newDiscussionsToAccept')}}
              </v-tooltip>
            </v-list-item>
            <v-list-item
              v-if="moduleVisibilities.groups"
              :to="{ name: 'GroupListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('interestGroups')}}
              </v-list-item-title>
              <v-tooltip
                left
                color="customGrey"
                v-if="computedUnreadGroupsToAccept > 0"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-badge
                    :color="$settings.indicatorColor"
                    offset-x="15"
                    offset-y="15"
                  >
                    <template slot="badge">
                      <span
                        class="customGrey--text font-weight-bold"
                      >
                        {{computedUnreadGroupsToAccept}}
                      </span>
                    </template>
                    <v-list-item-avatar
                      color="customGrey"
                      v-bind="attrs"
                      v-on="on"
                      size="34"
                      class="ma-1"
                    >
                      <v-icon
                        size="18"
                        color="white"
                      >
                        fas fa-lock
                      </v-icon>
                    </v-list-item-avatar>
                  </v-badge>
                </template>
                {{$t('newGroupsToAccept')}}
              </v-tooltip>
            </v-list-item>
            <v-list-item
              :to="{ name: 'CategoryListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('categories')}}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              :to="{ name: 'TagListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('tags')}}
              </v-list-item-title>
              <v-tooltip
                left
                color="customGrey"
                v-if="computedUnreadTagsToAccept > 0"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-badge
                    :color="$settings.indicatorColor"
                    offset-x="15"
                    offset-y="15"
                  >
                    <template slot="badge">
                      <span
                        class="customGrey--text font-weight-bold"
                      >
                        {{computedUnreadTagsToAccept}}
                      </span>
                    </template>
                    <v-list-item-avatar
                      color="customGrey"
                      v-bind="attrs"
                      v-on="on"
                      size="34"
                      class="ma-1"
                    >
                      <v-icon
                        size="18"
                        color="white"
                      >
                        fas fa-hashtag
                      </v-icon>
                    </v-list-item-avatar>
                  </v-badge>
                </template>
                {{$t('newTagsToAccept')}}
              </v-tooltip>
            </v-list-item>

            <v-list-item
              :to="{ name: 'ViolationListAdmin' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('violations')}}
              </v-list-item-title>
              <v-tooltip
                left
                color="customGrey"
                v-if="computedUnreadViolationsToAccept > 0"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-badge
                    :color="$settings.indicatorColor"
                    offset-x="15"
                    offset-y="15"
                  >
                    <template slot="badge">
                      <span
                        class="customGrey--text font-weight-bold"
                      >
                        {{computedUnreadViolationsToAccept}}
                      </span>
                    </template>
                    <v-list-item-avatar
                      color="customGrey"
                      v-bind="attrs"
                      v-on="on"
                      size="34"
                      class="ma-1"
                    >
                      <v-icon
                        size="18"
                        color="white"
                      >
                        fas fa-ban
                      </v-icon>
                    </v-list-item-avatar>
                  </v-badge>
                </template>
                {{$t('newViolationsToAccept')}}
              </v-tooltip>
            </v-list-item>

            <v-list-item
              :to="{ name: 'SettingsEditor' }"
            >
              <v-list-item-title
                class="font-weight-bold customGrey--text"
              >
                {{$t('settings')}}
              </v-list-item-title>
            </v-list-item>
          </v-list-group>
          <v-divider></v-divider>
          <v-list-item
            @click="triggerLogout()"
          >
            <v-list-item-title
              class="font-weight-bold customGrey--text"
            >
              {{$t('logout')}}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <span tour-step-container="1"></span>
      <span tour-step-container="2"></span>

      <v-main>
        <!-- Change margin-y when help-section is gone -->
        <v-container
          class="my-6 mt-1 main-container"
        >
          <template
            v-if="$route.name && $route.name !== 'Home'"
          >
            <v-alert
              dismissible
              class="mb-9 pl-0 pr-2"
              color="transparent"
              v-if="computedShowHelpButton"
            >
              <v-row>
                <v-col
                  class="py-1 text-h5 font-weight-bold blue--text text-right"
                >
                  <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        block
                        outlined
                      >
                        {{$t("help_title")}}
                        <v-icon
                          class="ml-3"
                          size="18"
                        >
                          fas fa-chevron-down
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item
                        :to="{ name: 'Group', params: { group: '622094013b8ba8046b7ab23c' } }"
                      >
                        <v-list-item-content>
                        <v-list-item-title>{{$t("help_vima_title")}}</v-list-item-title>
                        <v-list-item-subtitle>{{$t("help_vima_subtitle")}}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn
                            icon
                          >
                            <v-icon>
                              fas fa-arrow-right
                            </v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                      <v-list-item
                        target="_blank"
                        href="https://www.engagiert-in-ulm.de"
                      >
                        <v-list-item-content>
                        <v-list-item-title>{{$t("help_eiu_title")}}</v-list-item-title>
                        <v-list-item-subtitle>{{$t("help_eiu_subtitle")}}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn
                            icon
                          >
                            <v-icon>
                              fas fa-arrow-right
                            </v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                      <v-list-item
                        target="_blank"
                        href="https://www.ulm.de/leben-in-ulm/ukraine"
                      >
                        <v-list-item-content>
                        <v-list-item-title>{{$t("help_ulm_title")}}</v-list-item-title>
                        <v-list-item-subtitle>{{$t("help_ulm_subtitle")}}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn
                            icon
                          >
                            <v-icon>
                              fas fa-arrow-right
                            </v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-col>
              </v-row>
            </v-alert>
            <v-row>
              <v-col>
                <v-card
                  color="transparent"
                  flat
                >
                  <v-row>
                    <v-col
                      class="body-2 align-self-center"
                      :class="$vuetify.display.smAndUp ? 'mb-3' : 'pb-0'"
                      cols="12"
                      sm="2"
                    >
                      {{$t('youAreHere')}}:
                    </v-col>
                    <v-col
                      class="align-self-center"
                    >
                      <v-chip
                        v-for="(item, i) in computedBreadcrumbItems"
                        :key="i"
                        :disabled="i >= computedBreadcrumbItems.length - 1"
                        @click="$router.push({ name: item.to, params: item.params })"
                        color="rgba(255, 255, 255, 0.7)"
                        class="mx-1 black--text mb-3"
                        :tour-step="i === 0 ? 2 : -1"
                      >
                        <template
                          v-if="item.text && item.text.startsWith('fa')"
                        >
                          <v-icon
                            size="18"
                          >
                            {{item.text}}
                          </v-icon>
                        </template>
                        <template
                          v-else
                        >
                          {{item.text}}
                        </template>
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
            <v-divider
              class="mt-8 mb-12"
            ></v-divider>
          </template>
          <v-row>
            <v-col>
              <router-view
                @setStep="setStep"
              />
            </v-col>
          </v-row>
          <v-row
            v-if="$route.meta.helpItems"
          >
            <v-col>
              <v-card
                color="customGreyUltraLight"
                tile
              >
                <v-card-text>
                  <v-row>
                    <v-col
                      class="text-h5 font-weight-bold"
                    >
                      {{$t('help')}}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-list>
                        <v-list-item
                          v-for="(helpItem, i) in $route.meta.helpItems"
                          :key="i"
                          :to="helpItem.linkName ? { name: helpItem.linkName } : ''"
                        >
                          <v-list-item-avatar
                            color="customGreyLight"
                            size="34"
                          >
                            <v-icon
                              color="white"
                              size="18"
                            >
                              fa fa-question
                            </v-icon>
                          </v-list-item-avatar>
                          <v-list-item-content>
                            <div
                              class="body-1 font-weight-bold"
                            >
                              {{$t(helpItem.title)}}
                            </div>
                            <div class="body-2">
                              {{$t(helpItem.subTitle)}}
                            </div>
                          </v-list-item-content>
                          <v-list-item-action
                            v-if="helpItem.linkName"
                          >
                            <v-btn
                              fab
                              small
                              color="customGrey"
                              :title="$t('viewButton')"
                            >
                            <v-icon
                              size="18"
                              color="white"
                            >
                              fas fa-chevron-right
                            </v-icon>
                            </v-btn>
                          </v-list-item-action>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
      <v-footer
        v-if="$route.name && $route.name !== 'Home'"
        dark
        color="secondary"
      >
        <v-container
          fluid
        >
          <v-row>
            <v-col
              v-if="$settings.socialMediaUrls"
              class="text-center"
              cols="12"
            >
              <v-btn
                class="mx-4"
                icon
                target="_blank"
                v-if="$settings.socialMediaUrls.fb"
                :href="$settings.socialMediaUrls.fb"
              >
                <v-icon>
                  fab fa-facebook
                </v-icon>
              </v-btn>
              <v-btn
                class="mx-4"
                icon
                target="_blank"
                v-if="$settings.socialMediaUrls.instagram"
                :href="$settings.socialMediaUrls.instagram"
              >
                <v-icon>
                  fab fa-instagram
                </v-icon>
              </v-btn>
              <v-btn
                class="mx-4"
                icon
                target="_blank"
                v-if="$settings.socialMediaUrls.twitter"
                :href="$settings.socialMediaUrls.twitter"
              >
                <v-icon>
                  fab fa-twitter
                </v-icon>
              </v-btn>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-sheet
                class="pa-3"
                color="rgba(0,0,0,0.2)"
              >
                <v-row
                  dense
                  v-if="user"
                >
                  <v-col>
                    {{userCount}} {{userCount === 1 ? $t('member') : $t('manageMembersButton')}} {{$t('onlineLowercase')}}
                  </v-col>
                </v-row>
                <template
                  v-if="$settings && $settings.otherVimaLinks"
                >
                  <v-row
                    v-for="(link, i) in $settings.otherVimaLinks"
                    :key="i"
                  >
                    <v-col>
                      <a
                        :href="link.url"
                        target="_blank"
                        class="white--text"
                        style="text-decoration: none"
                      >
                        <v-icon
                          size="18"
                          class="mr-2 mb-1"
                        >
                          fas fa-external-link-alt
                        </v-icon>
                        {{link.name}}
                      </a>
                    </v-col>
                  </v-row>
                </template>
              </v-sheet>
            </v-col>
            <v-col
              cols="12"
              md="4"
              tour-step-container="4"
            >
              <v-sheet
                class="pa-3"
                color="rgba(0,0,0,0.2)"
              >
                <v-row
                  dense
                >
                  <v-col>
                    <v-btn
                      tour-step="4"
                      text
                      @click="showNewsletterDialog = true"
                    >
                      {{$t('receiveNewsletterLabel')}}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row
                  dense
                >
                  <v-col>
                    <v-btn
                      text
                      @click="showMatomoConsent = true"
                    >
                      {{$t('manageCookies')}}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-sheet>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-sheet
                class="pa-3"
                color="rgba(0,0,0,0.2)"
              >
                <v-row
                  dense
                >
                  <v-col>
                    <v-btn
                      :to="{ name: 'Imprint' }"
                      text
                    >
                      {{$t('imprint')}}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row
                  dense
                >
                  <v-col>
                    <v-btn
                      :to="{ name: 'Privacy' }"
                      text
                    >
                      {{$t('privacy')}}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row
                  dense
                >
                  <v-col>
                    <v-btn
                      :to="{ name: 'Contact' }"
                      text
                      tour-step="8"
                    >
                      {{$t('contact')}}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-sheet>
            </v-col>
          </v-row>
        </v-container>
      </v-footer>
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbar.color"
        multi-line
        :timeout="3000"
        @input="resetSnackbar()"
      >
        <template v-slot:action="{ attrs }">
          <v-btn
            icon
            v-bind="attrs"
            @click="showSnackbar = false"
            :title="$t('closeButton')"
          >
            <v-icon>fas fa-times</v-icon>
          </v-btn>
        </template>
        <v-list-item
          class="pl-0"
        >
          <v-list-item-avatar>
            <v-icon>
              {{ snackbar.color === 'error' ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle' }}
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            {{snackbar.text}}
          </v-list-item-content>
        </v-list-item>
      </v-snackbar>
      <!-- Newsletter dialog -->
      <NewsletterDialog
        :showNewsletterDialog="showNewsletterDialog"
        @closeNewsletterDialog="showNewsletterDialog = false"
      ></NewsletterDialog>
      <!-- Tour snackbar -->
      <v-snackbar
        v-model="showTour"
        right
        multi-line
        color="customGrey"
        :timeout="-1"
        width="200"
      >
        <v-card
          flat
          color="transparent"
          tile
        >
          <v-card-text>
            <v-row>
              <v-col
                class="body-1 white--text font-weight-bold"
              >
                {{$t('tourDescription')}}
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn
              text
              @click="closeTour()"
            >
              {{$t('closeButton')}}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              text
              @click="startTour()"
            >
              {{$t('explainPageElements')}}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-snackbar>
      <!-- Tour -->
      <v-tour name="app" :options="tourOptions" :steps="computedSteps"></v-tour>
    </template>
    <!-- Connection dialog -->
    <v-dialog
      v-model="computedShowConnectionDialog"
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
              class="text-h5 font-weight-bold text-center"
            >
              {{$t('connectingToServer')}} ...
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="text-center"
            >
              <v-progress-circular
                colore="customGrey"
                indeterminate
                size="80"
              ></v-progress-circular>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Matomo consent bottom sheet -->
    <v-dialog
      v-model="showMatomoConsent"
      style="z-index:10000"
      overlay-color="#000000"
      overlay-opacity="0.7"
      persistent
    >
      <v-sheet
        v-if="!hasMatomo"
        class="text-center pa-4 py-10"
      >
        <v-row>
          <v-col
            class="body-1 black--text"
          >
            <div
              v-html="$t('adBlockerHint')"
            ></div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              class="mr-4"
              color="customGreyUltraLight"
              @click="showMatomoConsent = false"
            >
              {{$t('understoodButton')}}
            </v-btn>
          </v-col>
        </v-row>
      </v-sheet>
      <v-sheet
        v-else
        class="text-center pa-4 py-10"
      >
        <v-row>
          <v-col
            class="body-1 black--text"
          >
            <div
              v-html="$t('askForConsent')"
            ></div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              class="mr-4"
              color="customGreyUltraLight"
              @click="removeConsent()"
            >
              {{$t('no')}}
            </v-btn>
            <v-btn
              color="success"
              @click="setConsent()"
            >
              {{$t('yes')}}
            </v-btn>
          </v-col>
        </v-row>
      </v-sheet>
    </v-dialog>
  </v-app>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { Tween } from '@createjs/tweenjs'
import NewsletterDialog from '@/components/NewsletterDialog.vue'
import LanguageSelect from '@/components/LanguageSelect.vue'
const showHelpButton = import.meta.env.VITE_SHOW_HELP_BUTTON

export default {
  name: 'App',

  components: {
    NewsletterDialog,
    LanguageSelect
  },

  data: () => ({
    showMatomoConsent: false,
    tourOptions: {
      labels: {
        buttonSkip: null,
        buttonPrevious: null,
        buttonNext: null,
        buttonStop: null
      },
      highlight: true
    },
    newsletterEmail: undefined,
    showNewsletterDialog: false,
    connectionDelay: true,
    gradient: {
      left: { r: 255, g: 255, b: 255 },
      right: { r: 207, g: 216, b: 220 }
    },
    statusContainerTrigger: 1,
    isNavigationDrawer: false,
    showSnackbar: false
  }),

  beforeMount () {
    this.tourOptions.labels.buttonSkip = this.$t('quit')
    this.tourOptions.labels.buttonPrevious = this.$t('back')
    this.tourOptions.labels.buttonNext = this.$t('next')
    this.tourOptions.labels.buttonStop = this.$t('done')
  },

  mounted () {
    // Set section color
    this.setStep()
    // Add storage handler
    window.addEventListener('storage', this.onStorageUpdate)
    // Set timeout for server connection dialog
    setTimeout(() => {
      this.connectionDelay = false
    }, 1000)
    // Check for matomo consent
    if (!localStorage.getItem('answeredConsent')) {
      this.showMatomoConsent = true
    }
    // Log common errors
    window.onerror = (msg) => {
      this.createLog({ type: 'error', route: window.location.pathname, user: (this.user ? this.user._id : '-'), method: 'window', message: msg })
    }
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapMutations({
      setShowTour: 'SET_SHOW_TOUR',
      setCancelledTour: 'SET_CANCELLED_TOUR'
    }),
    ...mapActions('logging', {
      createLog: 'create'
    }),
    ...mapActions('auth', [
      'logout'
    ]),
    ...mapActions('users', {
      patchUser: 'patch'
    }),
    ...mapActions('language', {
      switchLanguage: 'create'
    }),
    closeTour () {
      this.setCancelledTour(true)
      this.setShowTour(false)
      localStorage.setItem('hideTour', true)
    },
    startTour () {
      this.setShowTour(false)
      this.$tours.app.start()
      localStorage.setItem('hideTour', true)
    },
    setConsent () {
      if (this.$matomo && this.$matomo.isUserOptedOut()) {
        this.$matomo.forgetUserOptOut()
      }
      if (this.$matomo) {
        this.$matomo.rememberCookieConsentGiven()
      }
      localStorage.setItem('answeredConsent', true)
      this.showMatomoConsent = false
    },
    removeConsent () {
      if (this.$matomo) {
        this.$matomo.optUserOut()
      }
      localStorage.setItem('answeredConsent', true)
      this.showMatomoConsent = false
    },
    setStep (manualValue) {
      let step
      if (manualValue) {
        step = manualValue
      } else if (this.$route.meta.step) {
        step = this.$route.meta.step
      }
      if (step && this.stepColors[step]) {
        this.tween(this.stepColors[step])
      } else if (this.$route.params.type && this.stepColors[this.$route.params.type]) {
        this.tween(this.stepColors[this.$route.params.type])
      } else {
        this.tween(this.stepColors.default)
      }
    },
    tween (step) {
      Tween.get(this.gradient.left).to(step.left, 1000)
      Tween.get(this.gradient.right).to(step.right, 1000)
    },
    resetSnackbar () {
      if (!this.showSnackbar) {
        setTimeout(() => {
          this.setSnackbar(false)
        }, 500)
      }
    },
    async triggerLogout () {
      if (this.$matomo) {
        this.$matomo.setUserId(undefined)
        this.$matomo.setCustomVariable(1, 'Rolle', 'anonymous', 'visit')
      }
      localStorage.removeItem('feathers-jwt')
      this.processLogout()
    },
    async processLogout () {
      try {
        await this.logout()
      } catch (e) {}
      await this.$router.push({ name: 'Participate' })
      document.location.reload(true)
    },
    onStorageUpdate (event) {
      if (event.key === 'feathers-jwt' && event.newValue === null) {
        this.processLogout()
      }
    }
  },

  computed: {
    ...mapGetters([
      'moduleVisibilities',
      's3',
      'snackbar',
      'statusItems',
      'userCount',
      'isDisconnected',
      'rules',
      'userCount',
      'showTour',
      'cancelledTour',
      'hasMatomo',
      'setLanguage'
    ]),
    ...mapGetters('auth', [
      'isAuthenticated',
      'user'
    ]),
    ...mapGetters('settings', {
      settings: 'list'
    }),
    ...mapGetters('status-containers', {
      statusContainers: 'list'
    }),
    ...mapGetters('settings', {
      settings: 'list'
    }),
    $settings () {
      return this.settings[0]
    },
    computedShowHelpButton () {
      return showHelpButton
    },
    stepColors () {
      if (this.settings && this.settings.length === 1) {
        return {
          default: { left: { r: 255, g: 255, b: 255 }, right: { r: 207, g: 216, b: 220 } },
          ads: {
            left: {
              r: 255, g: 255, b: 255
            },
            right: {
              r: this.$settings.modules.ads.gradientColor.r,
              g: this.$settings.modules.ads.gradientColor.g,
              b: this.$settings.modules.ads.gradientColor.b
            }
          },
          discussions: {
            left: {
              r: 255, g: 255, b: 255
            },
            right: {
              r: this.$settings.modules.discussions.gradientColor.r,
              g: this.$settings.modules.discussions.gradientColor.g,
              b: this.$settings.modules.discussions.gradientColor.b
            }
          },
          groups: {
            left: {
              r: 255, g: 255, b: 255
            },
            right: {
              r: this.$settings.modules.groups.gradientColor.r,
              g: this.$settings.modules.groups.gradientColor.g,
              b: this.$settings.modules.groups.gradientColor.b
            }
          }
        }
      } else {
        return {
          default: { left: { r: 255, g: 255, b: 255 }, right: { r: 207, g: 216, b: 220 } },
          ads: {
            left: {
              r: 255, g: 255, b: 255
            },
            right: {
              r: 207,
              g: 216,
              b: 220
            }
          },
          discussions: {
            left: {
              r: 255, g: 255, b: 255
            },
            right: {
              r: 207,
              g: 216,
              b: 220
            }
          },
          groups: {
            left: {
              r: 255, g: 255, b: 255
            },
            right: {
              r: 207,
              g: 216,
              b: 220
            }
          }
        }
      }
    },
    computedSteps () {
      const steps = [
        {
          target: '[tour-step="1"]',
          content: this.$t('noteLanguage'),
          params: {
            enableScrolling: false,
            placement: 'bottom'
          },
          before: () => {
            document.querySelector('[tour-step-container="1"]').scrollIntoView({ block: 'start', behavior: 'smooth' })
          }
        },
        {
          target: '[tour-step="2"]',
          content: this.$t('noteNavigation'),
          params: {
            enableScrolling: false,
            placement: 'bottom'
          },
          before: () => {
            document.querySelector('[tour-step-container="2"]').scrollIntoView({ block: 'start', behavior: 'smooth' })
          }
        },
        {
          target: '[tour-step="3"]',
          content: this.$t('noteAdPosts'),
          params: {
            enableScrolling: false,
            placement: 'bottom'
          },
          before: () => {
            document.querySelector('[tour-step-container="3"]').scrollIntoView({ block: 'start', behavior: 'smooth' })
          }
        },
        {
          target: '[tour-step="4"]',
          content: this.$t('noteFooter'),
          params: {
            enableScrolling: false,
            placement: 'top'
          },
          before: () => {
            document.querySelector('[tour-step-container="4"]').scrollIntoView({ block: 'start', behavior: 'smooth' })
          }
        }
      ]
      if (this.user) {
        steps.push(
          {
            target: '[tour-step="5"]',
            content: this.$t('noteLoginOverview'),
            params: {
              placement: 'bottom'
            }
          }
        )
      } else {
        steps.push(
          {
            target: '[tour-step="5"]',
            content: this.$t('noteRegister'),
            params: {
              placement: 'bottom'
            }
          }
        )
        steps.push(
          {
            target: '[tour-step="6"]',
            content: this.$t('notePassword'),
            params: {
              placement: 'bottom'
            }
          }
        )
      }
      steps.push(
        {
          target: '[tour-step="7"]',
          content: this.$t('noteFAQ'),
          params: {
            placement: 'bottom'
          }
        }
      )
      steps.push(
        {
          target: '[tour-step="8"]',
          content: this.$t('noteContact'),
          params: {
            placement: 'top'
          }
        }
      )
      return steps
    },
    computedUserOrganisationId () {
      const organisationStatusContainer = this.statusContainers.find(
        obj =>
          obj.type === 'organisations' &&
                obj.user === this.user._id &&
                (
                  obj.relation === 'member' ||
                  obj.relation === 'owner'
                )
      )
      return organisationStatusContainer ? organisationStatusContainer.reference : undefined
    },
    computedShowConnectionDialog () {
      if (window.location.pathname !== '/' && this.isDisconnected && !this.connectionDelay) {
        return true
      } else {
        return false
      }
    },
    computedBreadcrumbItems () {
      try {
        const items = []
        if (this.$route.meta.breadCrumbPredecessors) {
          for (const crumbArray of this.$route.meta.breadCrumbPredecessors) {
            let params
            let indexOfMetaInPrev = -1
            let finalCrumb = crumbArray[0].startsWith('$') ? crumbArray[0].substr(1) : crumbArray[0]
            let isEnd = false
            let isEndItem = false
            for (let crumbItem of crumbArray) {
              if (crumbItem.startsWith('$')) {
                crumbItem = crumbItem.substr(1)
                isEndItem = true
              }
              const tmpIndex = this.$router.prevRoutes.map(obj => obj.name).indexOf(crumbItem)
              if (tmpIndex > indexOfMetaInPrev) {
                indexOfMetaInPrev = tmpIndex
                finalCrumb = crumbItem
                params = this.$router.prevRoutes[tmpIndex].params
                if (isEndItem) {
                  isEnd = true
                }
              }
            }
            items.push(
              {
                text: this.$t(this.$router.options.routes.find(obj => obj.name === finalCrumb).meta.breadCrumbTextKey),
                to: finalCrumb,
                params
              }
            )
            if (isEnd) {
              break
            }
          }
        }
        items.push(
          {
            text: this.$t(this.$route.meta.breadCrumbTextKey),
            to: this.$route.name
          }
        )
        return items
      } catch (e) {
        this.createLog({ type: 'error', route: window.location.pathname, user: (this.user ? this.user._id : '-'), method: 'computedBreadcrumbItems', message: e.message })
        return []
      }
    },
    computedUnreadNotifications () {
      if (
        this.computedUnreadChatMessages > 0 ||
        this.computedUnreadChats > 0 ||
        this.computedUnreadAdMessages > 0 ||
        this.computedUnreadAdAccepts > 0 ||
        this.computedUnreadAdsToAccept > 0 ||
        this.computedUnreadDiscussionAccepts > 0 ||
        this.computedUnreadDiscussionsToAccept > 0 ||
        this.computedUnreadDiscussionMessages > 0 ||
        this.computedUnreadDiscussionModerator > 0 ||
        this.computedUnreadGroupAccepts > 0 ||
        this.computedUnreadGroupsToAccept > 0 ||
        this.computedUnreadGroupModerator > 0 ||
        this.computedUnreadTagsToAccept > 0 ||
        this.computedUnreadViolationsToAccept > 0 ||
        this.computedUnreadGroupViolationsToAccept > 0 ||
        this.computedUnreadGroupApplications > 0 ||
        this.computedUnreadGroupDiscussionsToAccept > 0 ||
        this.computedUnreadGroupMemberships > 0 ||
        this.computedUnreadGroupInvitations > 0
      ) {
        return true
      } else {
        return false
      }
    },
    computedUnreadAdminNotifications () {
      if (
        this.computedUnreadAdsToAccept > 0 ||
        this.computedUnreadDiscussionsToAccept > 0 ||
        this.computedUnreadGroupsToAccept > 0 ||
        this.computedUnreadTagsToAccept > 0 ||
        this.computedUnreadViolationsToAccept > 0
      ) {
        return true
      } else {
        return false
      }
    },
    // New unread chat messages
    computedUnreadChatMessages () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        const containers = this.statusContainers
          .filter(obj => obj.user === this.user._id && obj.type === 'chats')
          .map(obj => obj.unread)
        let sum = 0
        for (const container of containers) {
          sum += container.length
        }
        return sum
      } else {
        return 0
      }
    },
    // New chats
    computedUnreadChats () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        return this.statusContainers
          .filter(obj => obj.user === this.user._id && obj.type === 'chats' && obj.customField === 'new').length
      } else {
        return 0
      }
    },
    // New discussion messages
    computedUnreadDiscussionMessages () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        const containers = this.statusContainers
          .filter(obj => obj.user === this.user._id && obj.type === 'discussions' && obj.relation === 'subscriber')
          .map(obj => obj.unread)
        let sum = 0
        for (const container of containers) {
          sum += container.length
        }
        return sum
      } else {
        return 0
      }
    },
    // New discussion moderator role
    computedUnreadDiscussionModerator () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        return this.statusContainers
          .filter(obj => obj.user === this.user._id && obj.type === 'discussions' && obj.customField === 'new' && obj.relation === 'moderator').length
      } else {
        return 0
      }
    },
    // New group moderator role
    computedUnreadGroupModerator () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        return this.statusContainers
          .filter(obj => obj.user === this.user._id && obj.type === 'groups' && obj.customField === 'new' && obj.relation === 'moderator').length
      } else {
        return 0
      }
    },
    // New group moderator memberships
    computedUnreadGroupMemberships () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        return this.statusContainers
          .filter(obj => obj.user === this.user._id && obj.type === 'groups' && obj.customField === 'new' && obj.relation === 'member').length
      } else {
        return 0
      }
    },
    // New group moderator memberships
    computedUnreadGroupInvitations () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        return this.statusContainers
          .filter(obj => obj.user === this.user._id && obj.type === 'groups' && obj.customField === 'new' && obj.relation === 'invitation').length
      } else {
        return 0
      }
    },
    // New group members to accept
    computedUnreadGroupApplications () {
      if (this.statusContainers && this.statusContainers.length > 0) {
        const containers = this.statusContainers
          .filter(obj => obj.user === this.user._id && obj.type === 'groups' && (obj.relation === 'owner' || obj.relation === 'moderator'))
          .map(obj => obj.unread)
        let sum = 0
        for (const container of containers) {
          sum += container.filter(obj => obj.type === 'users').length
        }
        return sum
      } else {
        return 0
      }
    },
    // New group members to accept
    computedUnreadGroupDiscussionsToAccept () {
      if (this.statusContainers && this.statusContainers.length > 0) {
        const containers = this.statusContainers
          .filter(obj => obj.user === this.user._id && obj.type === 'groups' && (obj.relation === 'owner' || obj.relation === 'moderator'))
          .map(obj => obj.unread)
        let sum = 0
        for (const container of containers) {
          sum += container.filter(obj => obj.type === 'discussions').length
        }
        return sum
      } else {
        return 0
      }
    },
    // New applicants for own ads
    computedUnreadAdMessages () {
      if (this.statusContainers && this.statusContainers.length > 0) {
        const containers = this.statusContainers
          .filter(obj => obj.user === this.user._id && obj.type === 'ads' && obj.relation === 'owner')
          .map(obj => obj.unread)
        let sum = 0
        for (const container of containers) {
          sum += container.length
        }
        return sum
      } else {
        return 0
      }
    },
    // New accepted own ads
    computedUnreadAdAccepts () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        return this.statusContainers.filter(obj => obj.user === this.user._id && obj.type === 'ads' && obj.relation === 'owner' && obj.customField === 'accepted').length
      } else {
        return 0
      }
    },
    // New accepted own discussions
    computedUnreadDiscussionAccepts () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        return this.statusContainers.filter(obj => obj.user === this.user._id && obj.type === 'discussions' && obj.relation === 'owner' && obj.customField === 'accepted').length
      } else {
        return 0
      }
    },
    // New accepted own groups
    computedUnreadGroupAccepts () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        return this.statusContainers.filter(obj => obj.user === this.user._id && obj.type === 'groups' && obj.relation === 'owner' && obj.customField === 'accepted').length
      } else {
        return 0
      }
    },
    // New ads to accept
    computedUnreadAdsToAccept () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        const adminAdStatusContainer = this.statusContainers.find(obj => obj.user === this.user._id && obj.type === 'ads' && obj.relation === 'admin')
        return adminAdStatusContainer && adminAdStatusContainer.unread ? adminAdStatusContainer.unread.length : 0
      } else {
        return 0
      }
    },
    // New discussions to accept
    computedUnreadDiscussionsToAccept () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        const adminDiscussionStatusContainer = this.statusContainers.find(obj => obj.user === this.user._id && obj.type === 'discussions' && obj.relation === 'admin')
        return adminDiscussionStatusContainer && adminDiscussionStatusContainer.unread ? adminDiscussionStatusContainer.unread.length : 0
      } else {
        return 0
      }
    },
    // New groups to accept
    computedUnreadGroupsToAccept () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        const adminGroupsStatusContainer = this.statusContainers.find(obj => obj.user === this.user._id && obj.type === 'groups' && obj.relation === 'admin')
        return adminGroupsStatusContainer && adminGroupsStatusContainer.unread ? adminGroupsStatusContainer.unread.length : 0
      } else {
        return 0
      }
    },
    // New tags to accept
    computedUnreadTagsToAccept () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        const adminTagStatusContainer = this.statusContainers.find(obj => obj.user === this.user._id && obj.type === 'tags' && obj.relation === 'admin')
        return adminTagStatusContainer && adminTagStatusContainer.unread ? adminTagStatusContainer.unread.length : 0
      } else {
        return 0
      }
    },
    // New violations to prove
    computedUnreadViolationsToAccept () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        const adminViolationStatusContainer = this.statusContainers.find(obj => obj.user === this.user._id && obj.type === 'violations' && obj.relation === 'admin')
        return adminViolationStatusContainer && adminViolationStatusContainer.unread ? adminViolationStatusContainer.unread.length : 0
      } else {
        return 0
      }
    },
    computedUnreadGroupViolationsToAccept () {
      if (this.statusContainerTrigger && this.statusContainers && this.statusContainers.length > 0) {
        const responsibleViolationStatusContainer = this.statusContainers.find(obj =>
          obj.user === this.user._id &&
          obj.type === 'groups' &&
          (
            obj.relation === 'owner' ||
            obj.relation === 'moderator'
          )
        )
        return responsibleViolationStatusContainer && responsibleViolationStatusContainer.unread ? responsibleViolationStatusContainer.unread.filter(obj => obj.type === 'violations').length : 0
      } else {
        return 0
      }
    },
    computedGradientLeft () {
      return 'rgba(' + this.gradient.left.r + ',' + this.gradient.left.g + ',' + this.gradient.left.b + ')'
    },
    computedGradientRight () {
      return 'rgba(' + this.gradient.right.r + ',' + this.gradient.right.g + ',' + this.gradient.right.b + ')'
    }
  },

  watch: {
    isDisconnected () {
      if (!this.cancelledTour && this.$route.name === 'Participate' && !this.isDisconnected && !localStorage.getItem('hideTour')) {
        this.setShowTour(true)
      } else {
        this.setShowTour(false)
      }
    },
    $route () {
      this.setStep()
      if (!this.cancelledTour && this.$route.name === 'Participate' && !this.isDisconnected && !localStorage.getItem('hideTour')) {
        this.setShowTour(true)
      } else {
        this.setShowTour(false)
      }
    },
    snackbar () {
      if (this.snackbar) {
        this.showSnackbar = true
      }
    },
    user: {
      deep: true,
      async handler (newValue, oldValue) {
        if (this.user && !this.user.isActive) {
          this.triggerLogout()
        }
        if (
          newValue &&
          oldValue &&
          newValue.role !== oldValue.role &&
          this.$matomo
        ) {
          this.$matomo.setCustomVariable(1, 'Rolle', newValue.role, 'visit')
        }
      }
    },
    statusContainers: {
      deep: true,
      handler () {
        this.statusContainerTrigger = Date.now()
      }
    }
  }
}
</script>

<style>

  .v-chip--disabled {
    opacity: 0.8 !important;
  }

  .tiptap-vuetify-editor {
    width: 100%
  }

  .v-list-item__icon.v-list-group__header__prepend-icon * {
    color: #455A64 !important;
  }

  .v-list-group__header.v-list-item {
    margin-left: 0px !important;
    padding-left: 0px !important;
  }

  p {
    margin-bottom: 10px !important;
    margin-top: 10px !important;
    min-height: 1em;
  }

  blockquote.blockquote {
    line-height: 22px !important;
    border-left: 5px solid gray !important;
    padding-top: 1px !important;
    padding-bottom: 1px !important;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .foreign-sheet, .v-data-table tr {
    transition: background-color 3s !important;
  }

  .v-data-table tr.new, .foreign-sheet.new {
    background-color: #E6EE9C !important;
    transition: background-color 0s !important;
  }

  .word-wrap {
    word-break:break-word !important;
  }

  .main-container {
    max-width: 1440px !important;
  }

  .v-data-table__progress th {
    padding: 0px !important;
  }

  .responsive-video iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .responsive-video {
    position: relative;
    padding-bottom: 56.25%;
    padding-top: 0px;
    height: 0;
    overflow: hidden;
    border: 3px solid white;
    background-color: #fff;
  }

  .pointer {
    cursor: pointer;
  }

  .no-pointer {
    cursor: default !important;
  }

</style>
