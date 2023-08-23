export default {
  allowedTags: ['p', 'strong', 'em', 'u', 's', 'blockquote', 'ul', 'li', 'ol', 'a', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'img', 'span'],
  allowedAttributes: { blockquote: ['class'], a: ['href', 'target'], img: ['src'], span: ['data-id', 'data-label', 'data-type', 'class'] },
  allowedSchemesByTag: {
    img: ['data', 'http', 'https']
  }
}
