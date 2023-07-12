import Vue from 'vue'
import VueMatomo from 'vue-matomo'
import router from '@/router'

Vue.use(VueMatomo, {
  // Configure your matomo server and site by providing
  host: 'https://statistik.vima-ulm.de',
  siteId: 2,

  // Changes the default .js and .php endpoint's filename
  // Default: 'matomo'
  trackerFileName: 'matomo',

  // Enables automatically registering pageviews on the router
  router,

  // Enables link tracking on regular links. Note that this won't
  // work for routing links (ie. internal Vue router links)
  // Default: true
  enableLinkTracking: true,

  // Require consent before sending tracking information to matomo
  // Default: false
  requireConsent: true,

  // Whether to track the initial page view
  // Default: true
  trackInitialView: false,

  // Run Matomo without cookies
  // Default: false
  disableCookies: false,

  // Require consent before creating matomo session cookie
  // Default: false
  requireCookieConsent: true,

  // Enable the heartbeat timer (https://developer.matomo.org/guides/tracking-javascript-guide#accurately-measure-the-time-spent-on-each-page)
  // Default: false
  enableHeartBeatTimer: true,

  // Set the heartbeat timer interval
  // Default: 15
  heartBeatTimerInterval: 15,

  // Whether or not to log debug information
  // Default: false
  debug: false,

  // UserID passed to Matomo (see https://developer.matomo.org/guides/tracking-javascript-guide#user-id)
  // Default: undefined
  userId: undefined,

  // Share the tracking cookie across subdomains (see https://developer.matomo.org/guides/tracking-javascript-guide#measuring-domains-andor-sub-domains)
  // Default: undefined, example '*.example.com'
  cookieDomain: 'localhost',

  // Tell Matomo the website domain so that clicks on these domains are not tracked as 'Outlinks'
  // Default: undefined, example: '*.example.com'
  domains: 'localhost',

  // A list of pre-initialization actions that run before matomo is loaded
  // Default: []
  // Example: [
  //   ['API_method_name', parameter_list],
  //   ['setCustomVariable','1','VisitorType','Member'],
  //   ['appendToTrackingUrl', 'new_visit=1'],
  //   etc.
  // ]
  preInitActions: [['setCustomVariable', 1, 'Rolle', 'anonymous', 'visit']],

  // A function to determine whether to track an interaction as a site search
  // instead of as a page view. If not a function, all interactions will be
  // tracked as page views. Receives the new route as an argument, and
  // returns either an object of keyword, category (optional) and resultsCount
  // (optional) to track as a site search, or a falsey value to track as a page
  // view.
  // Default: false, i.e. track all interactions as page views
  // Example: (to) => {
  //   if (to.query.q && to.name === 'search') {
  //     return { keyword: to.query.q, category: to.params.category }
  //   } else {
  //    return null
  //   }
  // }
  trackSiteSearch: false
})
