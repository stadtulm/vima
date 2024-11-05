import app from '@/main'
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Store from '@/store'
import i18n from '@/i18n'
import Multiguard from 'vue-router-multiguard'
import Cookies from 'js-cookie'
import Vuetify from '@/plugins/vuetify'

import Home from '@/views/Home.vue'
import Site from '@/views/Site.vue'
import CategoryListAdmin from '@/views/CategoryListAdmin.vue'
import CategoryEditor from '@/views/CategoryEditor.vue'
import TranslationEditor from '@/views/TranslationEditor.vue'
import SettingsEditor from '@/views/SettingsEditor.vue'
import TagListAdmin from '@/views/TagListAdmin.vue'
import TagEditor from '@/views/TagEditor.vue'
import Login from '@/views/Login.vue'
import Signup from '@/views/Signup.vue'
import Verify from '@/views/Verify.vue'
import ResendVerify from '@/views/ResendVerify.vue'
import Confirm from '@/views/Confirm.vue'
import Unsubscribe from '@/views/Unsubscribe.vue'
import Reset from '@/views/Reset.vue'
import Renew from '@/views/Renew.vue'
import UserEditor from '@/views/UserEditor.vue'
import User from '@/views/UserCard.vue'
import PreferencesEditor from '@/views/PreferencesEditor.vue'
import ApiKeyEditor from '@/views/ApiKeyEditor.vue'
import Forbidden from '@/views/Forbidden.vue'
import NotFound from '@/views/NotFound.vue'
import UserList from '@/views/UserList.vue'
import UserListAdmin from '@/views/UserListAdmin.vue'
import SiteEditor from '@/views/SiteEditor.vue'
import SiteListAdmin from '@/views/SiteListAdmin.vue'
import News from '@/views/News.vue'
import NewsEditor from '@/views/NewsEditor.vue'
import NewsListAdmin from '@/views/NewsListAdmin.vue'
import Blog from '@/views/Blog.vue'
import BlogEditor from '@/views/BlogEditor.vue'
import BlogListAdmin from '@/views/BlogListAdmin.vue'
import ViolationListAdmin from '@/views/ViolationListAdmin.vue'
import Organisations from '@/views/Organisations.vue'
import Organisation from '@/components/OrganisationCard.vue'
import OrganisationListAdmin from '@/views/OrganisationListAdmin.vue'
import OrganisationEditor from '@/views/OrganisationEditor.vue'
import Sponsors from '@/views/Sponsors.vue'
import SponsorListAdmin from '@/views/SponsorListAdmin.vue'
import SponsorEditor from '@/views/SponsorEditor.vue'
import Participate from '@/views/Participate.vue'
import CategoriesListView from '@/views/CategoriesListView.vue'
import NewsEntry from '@/components/NewsCard.vue'
import BlogEntry from '@/components/BlogCard.vue'
import Ad from '@/components/AdCard.vue'
import AdsListView from '@/views/AdsListView.vue'
import AdEditor from '@/views/AdEditor.vue'
import Events from '@/views/Events.vue'
import Event from '@/components/EventCard.vue'
import EventEditor from '@/views/EventEditor.vue'
import EventList from '@/views/EventList.vue'
import EventListAdmin from '@/views/EventListAdmin.vue'
import AdList from '@/views/AdList.vue'
import AdListAdmin from '@/views/AdListAdmin.vue'
import Group from '@/components/GroupCard.vue'
import Groups from '@/views/Groups.vue'
import GroupList from '@/views/GroupList.vue'
import GroupListAdmin from '@/views/GroupListAdmin.vue'
import GroupEditor from '@/views/GroupEditor.vue'
import Discussion from '@/components/DiscussionCard.vue'
import Discussions from '@/views/Discussions.vue'
import DiscussionList from '@/views/DiscussionList.vue'
import DiscussionListAdmin from '@/views/DiscussionListAdmin.vue'
import DiscussionEditor from '@/views/DiscussionEditor.vue'
import ChatList from '@/views/ChatList.vue'
import Chat from '@/views/Chat.vue'
import TranslationList from '@/views/TranslationList.vue'
import helpItems from '@/data/help.js'
import ActivityListAdmin from '@/views/ActivityListAdmin.vue'

const appMode = import.meta.env.VITE_MODE
const serverDomain = import.meta.env.VITE_SERVER_DOMAIN

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      breadCrumbTextKey: 'welcomePage',
      breadCrumbPredecessors: []
    },
    beforeEnter: Multiguard([
      async (to, from, next) => {
        if (!from.name && localStorage.getItem('skipWelcome') && Store.getters.isDisconnected) {
          await new Promise(resolve => setTimeout(resolve, 500))
          if (!from.name && localStorage.getItem('skipWelcome') && !Store.getters.isDisconnected) {
            next({ name: 'Participate' })
          } else {
            next()
          }
        } else {
          localStorage.setItem('skipWelcome', true)
          next()
        }
      }
    ])
  },
  // Auth
  {
    path: '/einloggen',
    name: 'Login',
    component: Login,
    meta: {
      helpItems: [
        helpItems.resendVerify,
        helpItems.forgotPassword,
        helpItems.noAccount
      ],
      breadCrumbTextKey: 'login',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/registrieren',
    name: 'Signup',
    component: Signup,
    meta: {
      helpItems: [
        helpItems.resendVerify,
        helpItems.hasAccount
      ],
      breadCrumbTextKey: 'createAccount',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/verifizieren/:token',
    name: 'Verify',
    component: Verify,
    meta: {
      breadCrumbTextKey: 'confirmEmailAddress',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/verifizierung',
    name: 'ResendVerify',
    component: ResendVerify,
    meta: {
      breadCrumbTextKey: 'verificationMail',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/bestaetigen/:id/:token',
    name: 'Confirm',
    component: Confirm,
    meta: {
      breadCrumbTextKey: 'confirmEmailAddress',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/austragen/:id',
    name: 'Unsubscribe',
    component: Unsubscribe,
    meta: {
      breadCrumbTextKey: 'unsubscription',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/vergessen',
    name: 'Reset',
    component: Reset,
    meta: {
      breadCrumbTextKey: 'resetPassword',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/vergessen/:token/:isInvitationProcess?',
    name: 'Renew',
    component: Renew,
    meta: {
      breadCrumbTextKey: 'setNewPassword',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  //
  // Lists
  //
  {
    path: '/chats',
    name: 'ChatList',
    component: ChatList,
    meta: {
      breadCrumbTextKey: 'chats',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn
    ])
  },
  {
    path: '/chats/:chat?/user/:user?/username/:username?',
    name: 'UserNameChat',
    component: Chat,
    meta: {
      breadCrumbTextKey: 'chatDetail',
      breadCrumbPredecessors: [
        ['Participate'],
        ['ChatList']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn
    ])
  },
  {
    path: '/chats/:chat',
    name: 'IdChat',
    component: Chat,
    meta: {
      breadCrumbTextKey: 'chatDetail',
      breadCrumbPredecessors: [
        ['Participate'],
        ['ChatList']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn
    ])
  },
  //
  // Editors
  //
  {
    path: '/admin/mitglieder/editor/:user?',
    name: 'UserAdminEditor',
    component: UserEditor,
    meta: {
      breadCrumbTextKey: 'editProfile',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/mitglieder/editor/:user',
    name: 'UserEditor',
    component: UserEditor,
    meta: {
      breadCrumbTextKey: 'editProfile',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkOwn
    ])
  },
  {
    path: '/mitglieder/einstellungen/editor/:user',
    name: 'PreferencesEditor',
    component: PreferencesEditor,
    meta: {
      breadCrumbTextKey: 'editSettings',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdminOwn
    ])
  },
  {
    path: '/apischluessel/editor/:organisation',
    name: 'ApiKeyEditor',
    component: ApiKeyEditor,
    meta: {
      breadCrumbTextKey: 'editApiKey',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'events'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminPartner,
      checkOwnerModeratorMember
    ])
  },
  {
    path: '/admin/neuigkeiten/editor/:id?',
    name: 'NewsEditor',
    component: NewsEditor,
    meta: {
      breadCrumbTextKey: 'editNews',
      breadCrumbPredecessors: [
        ['Participate'],
        ['NewsListAdmin']
      ],
      step: 'news'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminVolunteer
    ])
  },
  {
    path: '/admin/blog/editor/:id?',
    name: 'BlogEditor',
    component: BlogEditor,
    meta: {
      breadCrumbTextKey: 'editBlog',
      breadCrumbPredecessors: [
        ['Participate'],
        ['BlogListAdmin']
      ],
      step: 'blog'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/admin/organisationen/editor/:organisation?',
    name: 'OrganisationAdminEditor',
    component: OrganisationEditor,
    meta: {
      breadCrumbTextKey: 'editOrganisation',
      breadCrumbPredecessors: [
        ['Participate'],
        ['OrganisationListAdmin']
      ],
      step: 'organisations'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminVolunteer
    ])
  },
  {
    path: '/organisationen/editor/:organisation',
    name: 'OrganisationEditor',
    component: OrganisationEditor,
    meta: {
      breadCrumbTextKey: 'editOrganisation',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'organisations'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminPartner,
      checkOwnerModeratorMember
    ])
  },
  {
    path: '/uebersetzungen',
    name: 'TranslationList',
    component: TranslationList,
    meta: {
      breadCrumbTextKey: 'translations',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'translations'
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdminTranslator
    ])
  },
  {
    path: '/admin/uebersetzungen/editor/:id?',
    name: 'TranslationEditor',
    component: TranslationEditor,
    meta: {
      breadCrumbTextKey: 'editTranslation',
      breadCrumbPredecessors: [
        ['Participate'],
        ['TranslationList']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdminTranslator
    ])
  },
  {
    path: '/sponsoren/editor/:sponsor?',
    name: 'SponsorEditor',
    component: SponsorEditor,
    meta: {
      breadCrumbTextKey: 'editSponsor',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'sponsors'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/admin/inhaltsseiten/editor/:site?',
    name: 'SiteEditor',
    component: SiteEditor,
    meta: {
      breadCrumbTextKey: 'editSite',
      breadCrumbPredecessors: [
        ['Participate'],
        ['SiteListAdmin']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/admin/kategorien/editor/:id?',
    name: 'CategoryEditor',
    component: CategoryEditor,
    meta: {
      breadCrumbTextKey: 'editCategory',
      breadCrumbPredecessors: [
        ['Participate'],
        ['CategoryListAdmin']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/admin/einstellungen/editor',
    name: 'SettingsEditor',
    component: SettingsEditor,
    meta: {
      breadCrumbTextKey: 'editSettings',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/admin/schlagwoerter/editor/:id?',
    name: 'TagEditor',
    component: TagEditor,
    meta: {
      breadCrumbTextKey: 'editTag',
      breadCrumbPredecessors: [
        ['Participate'],
        ['TagListAdmin']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/veranstaltungen/editor/:organisation/:event?',
    name: 'EventEditor',
    component: EventEditor,
    meta: {
      breadCrumbTextKey: 'editEvent',
      breadCrumbPredecessors: [
        ['Participate'],
        ['EventList', 'EventListAdmin']
      ],
      step: 'events'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminPartner,
      checkOwnerModeratorMemberOrNew
    ])
  },
  {
    path: '/suchebiete/editor/:id?',
    name: 'AdEditor',
    component: AdEditor,
    meta: {
      step: 'ads',
      breadCrumbTextKey: 'editAd',
      breadCrumbPredecessors: [
        ['Participate'],
        ['AdList', 'AdsListView']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkOwnerModeratorMemberOrNew
    ])
  },
  {
    path: '/gruppendiskussionen/editor/:group/:id?',
    name: 'GroupDiscussionEditor',
    component: DiscussionEditor,
    meta: {
      step: 'groups',
      breadCrumbTextKey: 'editGroupDiscussion',
      breadCrumbPredecessors: [
        ['Participate'],
        ['Groups', 'DiscussionList']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkOwnerModeratorMember
    ])
  },
  {
    path: '/diskussionsforen/editor/:id?',
    name: 'DiscussionEditor',
    component: DiscussionEditor,
    meta: {
      step: 'discussions',
      breadCrumbTextKey: 'editForumDiscussion',
      breadCrumbPredecessors: [
        ['Participate'],
        ['Discussions', 'DiscussionList']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/interessengruppen/editor/:id?',
    name: 'GroupEditor',
    component: GroupEditor,
    meta: {
      step: 'groups',
      breadCrumbTextKey: 'editInterestGroup',
      breadCrumbPredecessors: [
        ['Participate'],
        ['Groups', 'GroupList']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminOwnerModeratorOrNew
    ])
  },
  // Overviews
  {
    path: '/mitglieder/uebersicht',
    name: 'UserList',
    component: UserList,
    meta: {
      breadCrumbTextKey: 'membersOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn
    ])
  },
  {
    path: '/suchebiete/uebersicht',
    name: 'AdList',
    component: AdList,
    meta: {
      step: 'ads',
      breadCrumbTextKey: 'myAds',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn
    ])
  },
  {
    path: '/veranstaltungen/uebersicht/:organisation',
    name: 'EventList',
    component: EventList,
    meta: {
      breadCrumbTextKey: 'eventsOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'events'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminPartner,
      checkOwnerModeratorMember
    ])
  },
  {
    path: '/admin/veranstaltungen/uebersicht',
    name: 'EventListAdmin',
    component: EventListAdmin,
    meta: {
      breadCrumbTextKey: 'eventsOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'events'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/diskussionsthemen/uebersicht',
    name: 'DiscussionList',
    component: DiscussionList,
    meta: {
      breadCrumbTextKey: 'myDiscussions',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'discussions'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn
    ])
  },
  {
    path: '/interessengruppen/uebersicht',
    name: 'GroupList',
    component: GroupList,
    meta: {
      step: 'groups',
      breadCrumbTextKey: 'myInterestGroups',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn
    ])
  },
  // Admin lists
  {
    path: '/admin/aktivitaeten/uebersicht',
    name: 'ActivityListAdmin',
    component: ActivityListAdmin,
    meta: {
      step: 'activities',
      breadCrumbTextKey: 'activitiesAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/admin/suchebiete/uebersicht',
    name: 'AdListAdmin',
    component: AdListAdmin,
    meta: {
      step: 'ads',
      breadCrumbTextKey: 'adsAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminVolunteer
    ])
  },
  {
    path: '/admin/diskussionsthemen/uebersicht',
    name: 'DiscussionListAdmin',
    component: DiscussionListAdmin,
    meta: {
      step: 'discussions',
      breadCrumbTextKey: 'forumDiscussionsAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminVolunteer
    ])
  },
  {
    path: '/admin/interessengruppen/uebersicht',
    name: 'GroupListAdmin',
    component: GroupListAdmin,
    meta: {
      step: 'groups',
      breadCrumbTextKey: 'interestGroupsAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminVolunteer
    ])
  },
  {
    path: '/admin/mitglieder/uebersicht',
    name: 'UserListAdmin',
    component: UserListAdmin,
    meta: {
      breadCrumbTextKey: 'membersAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/admin/neuigkeiten/uebersicht',
    name: 'NewsListAdmin',
    component: NewsListAdmin,
    meta: {
      breadCrumbTextKey: 'newsAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'news'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminVolunteer
    ])
  },
  {
    path: '/admin/blog/uebersicht',
    name: 'BlogListAdmin',
    component: BlogListAdmin,
    meta: {
      breadCrumbTextKey: 'blogAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'blog'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/admin/verstoesse/uebersicht',
    name: 'ViolationListAdmin',
    component: ViolationListAdmin,
    meta: {
      breadCrumbTextKey: 'violationsAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdminVolunteer
    ])
  },
  {
    path: '/admin/organisationen/uebersicht',
    name: 'OrganisationListAdmin',
    component: OrganisationListAdmin,
    meta: {
      breadCrumbTextKey: 'organisationsAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'organisations'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdminVolunteer
    ])
  },
  {
    path: '/admin/sponsoren/uebersicht',
    name: 'SponsorListAdmin',
    component: SponsorListAdmin,
    meta: {
      breadCrumbTextKey: 'sponsorsAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'sponsors'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency,
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/admin/inhaltsseiten/uebersicht',
    name: 'SiteListAdmin',
    component: SiteListAdmin,
    meta: {
      breadCrumbTextKey: 'sitesAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/admin/kategorien/uebersicht',
    name: 'CategoryListAdmin',
    component: CategoryListAdmin,
    meta: {
      breadCrumbTextKey: 'categoriesAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdmin
    ])
  },
  {
    path: '/admin/schlagwoerter/uebersicht',
    name: 'TagListAdmin',
    component: TagListAdmin,
    meta: {
      breadCrumbTextKey: 'tagsAdminOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn,
      checkAdmin
    ])
  },
  // Allgemeine Überblicke
  {
    path: '/kategorien/:type?',
    name: 'CategoryList',
    component: CategoriesListView,
    meta: {
      breadCrumbTextKey: 'categories',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      (to, from, next) => {
        if (!to.params) {
          to.params = {}
        }
        if (!to.params.type) {
          to.params.type = from.meta.step
        }
        next()
      }
    ])
  },
  {
    path: '/mitmachen',
    name: 'Participate',
    component: Participate,
    meta: {
      breadCrumbTextKey: 'overview',
      breadCrumbPredecessors: [
      ]
    }
  },
  {
    path: '/kooperationspartner',
    name: 'Organisations',
    component: Organisations,
    meta: {
      breadCrumbTextKey: 'organisationsOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'organisations'
    },
    beforeEnter: Multiguard([
      checkModuleActive
    ])
  },
  {
    path: '/sponsoren',
    name: 'Sponsors',
    component: Sponsors,
    meta: {
      breadCrumbTextKey: 'sponsorsOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'sponsors'
    },
    beforeEnter: Multiguard([
      checkModuleActive
    ])
  },
  {
    path: '/veranstaltungen',
    name: 'Events',
    component: Events,
    meta: {
      breadCrumbTextKey: 'eventsOverview',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'events'
    },
    beforeEnter: Multiguard([
      checkModuleActive
    ])
  },
  {
    path: '/suchebiete',
    name: 'AdsListView',
    component: AdsListView,
    meta: {
      step: 'ads',
      breadCrumbTextKey: 'ads',
      breadCrumbPredecessors: [
        ['Participate'],
        ['CategoryList']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActive
    ])
  },
  {
    path: '/diskussionsforen',
    name: 'Discussions',
    component: Discussions,
    meta: {
      step: 'discussions',
      breadCrumbTextKey: 'discussionForums',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActive
    ])
  },
  {
    path: '/interessengruppen',
    name: 'Groups',
    component: Groups,
    meta: {
      step: 'groups',
      breadCrumbTextKey: 'interestGroups',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    },
    beforeEnter: Multiguard([
      checkModuleActive
    ])
  },
  {
    path: '/neuigkeiten',
    name: 'News',
    component: News,
    meta: {
      breadCrumbTextKey: 'news',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'news'
    },
    beforeEnter: Multiguard([
      checkModuleActive
    ])
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog,
    meta: {
      breadCrumbTextKey: 'blog',
      breadCrumbPredecessors: [
        ['Participate']
      ],
      step: 'blog'
    },
    beforeEnter: Multiguard([
      checkModuleActive
    ])
  },
  // Detail
  {
    path: '/suchebiete/:id',
    name: 'Ad',
    component: Ad,
    meta: {
      helpItems: [
        helpItems.answerAd,
        helpItems.answerOwnAd
      ],
      breadCrumbTextKey: 'adDetail',
      breadCrumbPredecessors: [
        ['Participate'],
        ['AdsListView', 'AdList', 'AdListAdmin']
      ],
      step: 'ads'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency
    ])
  },
  {
    path: '/diskussionsforen/:id',
    name: 'Discussion',
    component: Discussion,
    meta: {
      breadCrumbTextKey: 'discussionForumDetail',
      breadCrumbPredecessors: [
        ['Participate'],
        ['$Discussions', '$DiscussionList', '$DiscussionListAdmin']
      ],
      step: 'discussions'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency
    ])
  },
  {
    path: '/interessengruppen/:group/kategorie/:category',
    name: 'GroupSelection',
    component: Group,
    meta: {
      breadCrumbTextKey: 'interestGroupSelection',
      breadCrumbPredecessors: [
        ['Participate'],
        ['Groups', 'GroupList', 'GroupListAdmin'],
        ['Group']
      ],
      step: 'groups'
    }
  },
  {
    path: '/interessengruppen/:group',
    name: 'Group',
    component: Group,
    meta: {
      breadCrumbTextKey: 'interestGroupDetail',
      breadCrumbPredecessors: [
        ['Participate'],
        ['Groups', 'GroupList', 'GroupListAdmin']
      ],
      step: 'groups'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency
    ])
  },
  {
    path: '/kooperationspartner/:organisation',
    name: 'Organisation',
    component: Organisation,
    meta: {
      breadCrumbTextKey: 'organisationDetail',
      breadCrumbPredecessors: [
        ['Participate'],
        ['Organisations']
      ],
      step: 'organisations'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency
    ])
  },
  {
    path: '/veranstaltungen/:event',
    name: 'Event',
    component: Event,
    meta: {
      breadCrumbTextKey: 'eventDetail',
      breadCrumbPredecessors: [
        ['Participate'],
        ['Events']
      ],
      step: 'events'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency
    ])
  },
  {
    path: '/interessengruppen/:group/gruppendiskussionen/:id',
    name: 'GroupDiscussion',
    component: Discussion,
    meta: {
      breadCrumbTextKey: 'interestGroupForumDetail',
      breadCrumbPredecessors: [
        ['Participate'],
        ['Groups', '$DiscussionList', '$DiscussionListAdmin'],
        ['Group']
      ],
      step: 'groups'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency
    ])
  },
  {
    path: '/neuigkeiten/:id',
    name: 'NewsEntry',
    component: NewsEntry,
    meta: {
      breadCrumbTextKey: 'newsDetail',
      breadCrumbPredecessors: [
        ['Participate'],
        ['News']
      ],
      step: 'news'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency
    ])
  },
  {
    path: '/blog/:id',
    name: 'BlogEntry',
    component: BlogEntry,
    meta: {
      breadCrumbTextKey: 'blogDetail',
      breadCrumbPredecessors: [
        ['Participate'],
        ['Blog']
      ],
      step: 'blog'
    },
    beforeEnter: Multiguard([
      checkModuleActiveOrDependency
    ])
  },
  {
    path: '/mitglieder/:user',
    name: 'User',
    component: User,
    meta: {
      breadCrumbTextKey: 'memberDetail',
      breadCrumbPredecessors: [
        ['Participate'],
        ['UserList', 'UserListAdmin', 'ChatList', 'Chat', 'Discussion', 'AdList']
      ]
    },
    beforeEnter: Multiguard([
      checkLoggedIn
    ])
  },
  {
    path: '/impressum',
    name: 'Imprint',
    component: Site,
    meta: {
      breadCrumbTextKey: 'imprint',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/vima',
    name: 'Vima',
    component: Site,
    meta: {
      breadCrumbTextKey: 'aboutVima',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/ileu',
    name: 'Ileu',
    component: Site,
    meta: {
      breadCrumbTextKey: 'aboutIleu',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/team',
    name: 'Team',
    component: Site,
    meta: {
      breadCrumbTextKey: 'team',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/kommunikationsregeln',
    name: 'CommunicationRules',
    component: Site,
    meta: {
      breadCrumbTextKey: 'communicationRules',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/datenschutz',
    name: 'Privacy',
    component: Site,
    meta: {
      breadCrumbTextKey: 'privacy',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/kontakt',
    name: 'Contact',
    component: Site,
    meta: {
      breadCrumbTextKey: 'contact',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/haeufige-fragen',
    name: 'Faq',
    component: Site,
    meta: {
      breadCrumbTextKey: 'faq',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  // Special
  {
    path: '/403',
    name: 'Forbidden',
    component: Forbidden,
    meta: {
      breadCrumbTextKey: '403',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      breadCrumbTextKey: '404',
      breadCrumbPredecessors: [
        ['Participate']
      ]
    }
  }
]

/*
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}
*/

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior (to, from, savedPosition) {
    return new Promise((resolve, reject) => {
      nextTick(() => {
        setTimeout(() => {
          if (savedPosition) {
            resolve(savedPosition)
          } else {
            resolve({ top: 0 })
          }
        }, 250)
      })
    })
  }
})

router.beforeEach(async (to, from, next) => {
  Object.keys(to.params).forEach(key => to.params[key] === undefined && delete to.params[key])
  if (!router.prevRoutes) {
    router.prevRoutes = []
  }
  if (from.name && from.name !== to.name) {
    router.prevRoutes.push(from)
  }
  if (router.prevRoutes.length > 3) {
    router.prevRoutes.shift()
  }
  if (!Store.getters.cancelledTour && to.name === 'Participate' && !Store.getters.isDisconnected) {
    Store.commit('SET_SHOW_TOUR', true)
  } else {
    Store.commit('SET_SHOW_TOUR', false)
  }
  if (to.path !== '/') {
    await init(to, from, next)
  } else {
    init(to, from, next)
  }
  next()
})

async function init (to, from, next) {
  if (Store.getters.firstLoad) {
    // Not logged in - log in
    if (!Store.getters['auth/user']) {
      try {
        await Store.dispatch('auth/authenticate')
        await Store.dispatch('status-containers/find', { query: { user: Store.getters['auth/user']._id } })
        let i = 0
        const matomoInterval = setInterval(() => {
          if (app.config.globalProperties.$matomo) {
            app.config.globalProperties.$matomo.setUserId(Store.getters['auth/user']._id)
            app.config.globalProperties.$matomo.setCustomVariable(1, 'Rolle', Store.getters['auth/user'].role, 'visit')
            Store.commit('SET_HAS_MATOMO', true)
            clearInterval(matomoInterval)
          }
          if (i > 20) {
            clearInterval(matomoInterval)
          }
          ++i
        }, 100)
      } catch (e) {
        let i = 0
        const matomoInterval = setInterval(() => {
          if (app.config.globalProperties.$matomo) {
            app.config.globalProperties.$matomo.setUserId(undefined)
            app.config.globalProperties.$matomo.setCustomVariable(1, 'Rolle', 'anonymous', 'visit')
            Store.commit('SET_HAS_MATOMO', true)
            clearInterval(matomoInterval)
          }
          if (i > 20) {
            clearInterval(matomoInterval)
          }
          ++i
        }, 100)
        localStorage.removeItem('feathers-jwt')
      }
    }
    // Set language
    const langCookie = Cookies.get('clientLanguage', { path: '/' })
    // i18n
    if (Store.getters['auth/user'] && Store.getters['auth/user'].language) {
      i18n.global.locale.value = Store.getters['auth/user'].language
    } else if (langCookie) {
      i18n.global.locale.value = langCookie
    }
    // Cookie
    document.cookie = Cookies.set('clientLanguage', i18n.global.locale.value, {
      domain: serverDomain,
      path: '/',
      sameSite: appMode === 'production' ? 'None' : 'Lax',
      secure: appMode === 'production',
      expires: 365 * 100
    })
    // Vuetify
    Vuetify.locale.current.value = Store.getters.i18nMap[i18n.global.locale.value] || i18n.global.locale.value
    // Load stuff
    const settings = await Store.dispatch('settings/find')
    if (settings.length === 1) {
      i18n.global.fallbackLocale.value = settings[0].defaultLanguage
    } else {
      throw Error('No settings available on server')
    }
    await Store.dispatch('categories/find', { $paginate: false })
    await Store.dispatch('tags/find', { $paginate: false })
    // If logged in load stuff if not there
    if (Store.getters['auth/user']) {
      try {
        const userPreferences = await Store.dispatch('preferences/find', { query: { user: Store.getters['auth/user']._id } })
        if (userPreferences && userPreferences[0]) {
          Store.commit('SET_PREFERENCES', userPreferences[0])
        }
      } catch (e) {
        await Store.dispatch('logging/create', { type: 'error', route: window.location.pathname, user: (Store.getters['auth/user'] ? Store.getters['auth/user']._id : '-'), method: 'init', message: e.message })
      }
    }
    Store.commit('SET_FIRST_LOAD', false)
  }
}

function checkModuleActiveOrDependency (to, from, next) {
  if (!Store.getters.moduleVisibilities[to.meta.step]) {
    return next({ name: 'Forbidden', query: { redirect: from.path } })
  }
  next()
}

function checkModuleActive (to, from, next) {
  if (
    !Store.getters['settings/list'] ||
    !Store.getters['settings/list'][0] ||
    !Store.getters['settings/list'][0].modules[to.meta.step].isActive
  ) {
    return next({ name: 'Forbidden', query: { redirect: from.path } })
  }
  next()
}

function checkLoggedIn (to, from, next) {
  if (!Store.getters['auth/user']) {
    return next({ name: 'Login', query: { redirect: to.path } })
  }
  next()
}

function checkOwn (to, from, next) {
  if (to.params[Object.keys(to.params)[0]] !== Store.getters['auth/user']._id) {
    return next({ name: 'Forbidden', query: { redirect: from.path } })
  }
  next()
}

function checkAdminOwn (to, from, next) {
  if (
    Store.getters['auth/user'].role !== 'admins' &&
    to.params[Object.keys(to.params)[0]] !== Store.getters['auth/user']._id
  ) {
    return next({ name: 'Forbidden', query: { redirect: from.path } })
  }
  next()
}

function checkAdmin (to, from, next) {
  if (Store.getters['auth/user'].role !== 'admins') {
    return next({ name: 'Forbidden', query: { redirect: from.path } })
  }
  next()
}

function checkAdminVolunteer (to, from, next) {
  if (
    Store.getters['auth/user'].role !== 'admins' &&
    Store.getters['auth/user'].role !== 'volunteers'
  ) {
    return next({ name: 'Forbidden', query: { redirect: from.path } })
  }
  next()
}

function checkAdminPartner (to, from, next) {
  if (
    Store.getters['auth/user'].role !== 'admins' &&
    Store.getters['auth/user'].role !== 'partners'
  ) {
    return next({ name: 'Forbidden', query: { redirect: from.path } })
  }
  next()
}

function checkAdminTranslator (to, from, next) {
  if (
    Store.getters['auth/user'].role !== 'admins' &&
    !Store.getters['auth/user'].isTranslator
  ) {
    return next({ name: 'Forbidden', query: { redirect: from.path } })
  }
  next()
}

function checkAdminOwnerModeratorOrNew (to, from, next) {
  if (
    Store.getters['auth/user'].role !== 'admins' &&
    Object.keys(to.params)[Object.keys(to.params).length - 1] &&
    !Store.getters['status-containers/list'].find(
      obj =>
        obj.reference === to.params[Object.keys(to.params)[0]] &&
        obj.user === Store.getters['auth/user']._id &&
        (
          obj.relation === 'owner' ||
          obj.relation === 'moderator'
        )
    )
  ) {
    return next({ name: 'Forbidden', query: { redirect: from.path } })
  }
  next()
}

function checkOwnerModeratorMember (to, from, next) {
  if (
    !Store.getters['status-containers/list'].find(
      obj =>
        obj.reference === to.params[Object.keys(to.params)[0]] &&
          obj.user === Store.getters['auth/user']._id &&
          (
            obj.relation === 'member' ||
            obj.relation === 'moderator' ||
            obj.relation === 'owner'
          )
    )
  ) {
    return next({ name: 'Forbidden', query: { redirect: from.path } })
  }
  next()
}

function checkOwnerModeratorMemberOrNew (to, from, next) {
  if (
    // Object.keys(to.params)[Object.keys(to.params).length - 1] &&
    to.params[Object.keys(to.params)[Object.keys(to.params).length - 1]] &&
    !Store.getters['status-containers/list'].find(
      obj =>
        obj.reference === to.params[Object.keys(to.params)[0]] &&
          obj.user === Store.getters['auth/user']._id &&
          (
            obj.relation === 'member' ||
            obj.relation === 'moderator' ||
            obj.relation === 'owner'
          )
    )
  ) {
    return next({ name: 'Forbidden', query: { redirect: from.path } })
  }
  next()
}

export default router
