<!-- TODO: Adapt settings and eliminate component -->
<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Mention } from '@tiptap/extension-mention'

import StarterKit from '@tiptap/starter-kit'

export default {
  components: {
    EditorContent
  },

  props: {
    value: {
      type: String,
      default: ''
    },
    mention: {}
  },

  data () {
    return {
      editor: null
    }
  },

  watch: {
    mention () {
      if (this.mention) {
        this.editor.commands.setContent(this.mention)
      }
    },
    value (value) {
      // HTML
      const isSame = this.editor.getHTML() === value

      // JSON
      // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)

      if (isSame) {
        return
      }

      this.editor.commands.setContent(value, false)
    }
  },

  mounted () {
    console.log(Paragraph)
    this.editor = new Editor({
      content: this.value,
      extensions: [
        StarterKit,
        Mention.configure({
          HTMLAttributes: {
            class: 'mention'
          },
          renderLabel ({ options, node }) {
            return `${node.attrs.label ?? node.attrs.id}`
          }
        })
      ],
      onUpdate: () => {
        this.$emit('input', this.editor.getHTML())
      }
    })
  },

  beforeUnmount () {
    this.editor.destroy()
  }
}
</script>
