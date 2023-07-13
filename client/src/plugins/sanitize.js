import Vue from 'vue'

import VueSanitize from 'vue-sanitize'

Vue.use(VueSanitize, {
  allowedTags: ['p', 'strong', 'em', 'u', 's', 'blockquote', 'ul', 'li', 'ol', 'a', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'img'],
  allowedAttributes: { blockquote: ['class'], a: ['href', 'target'], img: ['src'] },
  allowedSchemesByTag: {
    img: ['data', 'http', 'https']
  }
})
