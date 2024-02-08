<template>
  <div
    class="mx-0"
    style="width:100%"
    v-if="editor"
  >
    <v-row>
      <v-col
        class="pa-0"
      >
        <v-toolbar
          color="transparent"
          class="mx-1"
        >
          <v-btn
            class="mr-2"
            v-if="extensions.includes('bold')"
            size="small"
            variant="outlined"
            @click="editor.chain().focus().toggleBold().run()"
            :disabled="!editor.can().chain().focus().toggleBold().run()"
            :active="editor.isActive('bold')"
          >
            <v-icon>
              fas fa-bold
            </v-icon>
          </v-btn>
          <v-btn
            class="mr-2"
            v-if="extensions.includes('italic')"
            size="small"
            variant="outlined"
            @click="editor.chain().focus().toggleItalic().run()"
            :disabled="!editor.can().chain().focus().toggleItalic().run()"
            :active="editor.isActive('italic')"
          >
            <v-icon>
              fas fa-italic
            </v-icon>
          </v-btn>
          <v-btn
            class="mr-2"
            v-if="extensions.includes('underline')"
            size="small"
            variant="outlined"
            @click="editor.chain().focus().toggleUnderline().run()"
            :disabled="!editor.can().chain().focus().toggleUnderline().run()"
            :active="editor.isActive('underline')"
          >
            <v-icon>
              fas fa-underline
            </v-icon>
          </v-btn>
          <v-btn
            class="mr-2"
            v-if="extensions.includes('strikethrough')"
            size="small"
            variant="outlined"
            @click="editor.chain().focus().toggleStrike().run()"
            :disabled="!editor.can().chain().focus().toggleStrike().run()"
            :active="editor.isActive('strike')"
          >
            <v-icon>
              fas fa-strikethrough
            </v-icon>
          </v-btn>
          <v-btn
            class="mr-2"
            v-if="extensions.includes('blockquote')"
            size="small"
            variant="outlined"
            @click="editor.chain().focus().toggleBlockquote().run()"
            :disabled="!editor.can().chain().focus().toggleBlockquote().run()"
            :active="editor.isActive('blockquote')"
          >
            <v-icon>
              fas fa-quote-left
            </v-icon>
          </v-btn>
          <v-btn
            class="mr-2"
            v-if="extensions.includes('bulletList')"
            size="small"
            variant="outlined"
            @click="editor.chain().focus().toggleBulletList().run()"
            :disabled="!editor.can().chain().focus().toggleBulletList().run()"
            :active="editor.isActive('bulletList')"
          >
            <v-icon>
              fas fa-list
            </v-icon>
          </v-btn>
          <v-btn
            class="mr-2"
            v-if="extensions.includes('orderedList')"
            size="small"
            variant="outlined"
            @click="editor.chain().focus().toggleOrderedList().run()"
            :disabled="!editor.can().chain().focus().toggleOrderedList().run()"
            :active="editor.isActive('orderedList')"
          >
            <v-icon>
              fas fa-list-ol
            </v-icon>
          </v-btn>
          <v-btn
            class="mr-2"
            v-if="extensions.includes('link')"
            size="small"
            variant="outlined"
            @click="setLink"
            :disabled="!editor.can().chain().focus().toggleLink({ href: 'https://example.com', target: '_blank' }).run()"
            :active="editor.isActive('link')"
          >
            <v-icon>
              fas fa-link
            </v-icon>
          </v-btn>
          <v-btn
            class="mr-2"
            v-if="extensions.includes('h1')"
            size="small"
            variant="outlined"
            @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :disabled="!editor.can().chain().focus().toggleHeading({ level: 1 }).run()"
            :active="editor.isActive('heading', { level: 5 })"
          >
            H1
          </v-btn>
          <v-btn
            class="mr-2"
            v-if="extensions.includes('h2')"
            size="small"
            variant="outlined"
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :disabled="!editor.can().chain().focus().toggleHeading({ level: 2 }).run()"
            :active="editor.isActive('heading', { level: 6 })"
          >
            H2
          </v-btn>
          <v-btn
            class="mr-2"
            v-if="extensions.includes('h3')"
            size="small"
            variant="outlined"
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            :disabled="!editor.can().chain().focus().toggleHeading({ level: 3 }).run()"
            :active="editor.isActive('heading', { level: 7 })"
          >
            H3
          </v-btn>
        </v-toolbar>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        class="pt-0 pb-5"
      >
        <editor-content
          style="border: 1px solid black; background-color: #fff; padding-left: 10px; padding-right: 10px;"
          width="100%"
          :editor="editor"
        />
      </v-col>
    </v-row>
    <v-dialog
      v-model="showLinkDialog"
    >
      <v-card>
        <v-card-text>
          <v-text-field
            v-model="currentLink"
          ></v-text-field>
        </v-card-text>
        <v-toolbar>
          <v-btn
            variant="elevated"
            @click="closeLinkDialog()"
          >
            CANCEL
          </v-btn>
          <v-btn
            variant="elevated"
            @click="saveLink('')"
          >
            UNSET
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            variant="elevated"
            @click="saveLink(currentLink)"
          >
            SAVE
          </v-btn>
        </v-toolbar>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Mention from '@tiptap/extension-mention'
import Blockquote from '@tiptap/extension-blockquote'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading'
import { Editor, EditorContent } from '@tiptap/vue-3'

import suggestion from '@/plugins/tiptap/suggestion.js'

export default {
  components: {
    Editor,
    EditorContent
  },

  props: {
    modelValue: {
      type: String,
      default: ''
    },
    extensions: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:modelValue'],

  data () {
    return {
      editor: null,
      currentLink: undefined,
      showLinkDialog: false
    }
  },

  methods: {
    setLink () {
      this.currentLink = this.editor.getAttributes('link').href
      this.showLinkDialog = true
    },
    closeLinkDialog () {
      this.showLinkDialog = false
      this.currentLink = undefined
    },
    async saveLink (href) {
      if (href === '') {
        this.editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .unsetLink()
          .run()
      } else {
        this.editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href })
          .run()
      }
      this.closeLinkDialog()
    }
  },

  watch: {
    modelValue (value) {
      const isSame = this.editor.getHTML() === value
      if (isSame) {
        return
      }
      this.editor.commands.setContent(value, false)
    }
  },

  mounted () {
    const tmpExtensions = [
      StarterKit,
      Underline,
      Blockquote.configure({
        HTMLAttributes: {
          class: 'blockquote'
        }
      }),
      Link.configure({
        openOnClick: false,
        autolink: false
      }),
      Heading.configure({
        levels: [1, 2, 3]
      })
    ]
    if (this.extensions.includes('mentions')) {
      tmpExtensions.push(
        Mention.configure({
          HTMLAttributes: {
            class: 'mention'
          },
          renderLabel ({ options, node }) {
            return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
          },
          suggestion
        })
      )
    }
    this.editor = new Editor({
      content: this.modelValue,
      editorProps: {
        transformPastedText (text) {
          return text.replace(/\xA0/g, ' ')
        },
        transformPastedHTML (html) {
          return html.replace(/\xA0/g, ' ')
        },
        transformPasted (html) {
          return html.replace(/\xA0/g, ' ')
        }
      },
      onUpdate: () => {
        this.$emit('update:modelValue', this.editor.getHTML())
      },
      extensions: tmpExtensions
    })
  },

  beforeUnmount () {
    this.editor.destroy()
  }
}
</script>
