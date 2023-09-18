<template>
  <div
  	class="mx-1"
	style="width:100%"
	v-if="editor"
  >
    <v-row>
		<v-col
			class="pa-0"
		>
			<v-toolbar>
				<v-btn
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
					size="small"
					variant="outlined"
					@click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
					:disabled="!editor.can().chain().focus().toggleHeading({ level: 1 }).run()"
					:active="editor.isActive('heading', { level: 1 })"
				>
					H1
				</v-btn>
				<v-btn
					size="small"
					variant="outlined"
					@click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
					:disabled="!editor.can().chain().focus().toggleHeading({ level: 2 }).run()"
					:active="editor.isActive('heading', { level: 2 })"
				>
					H2
				</v-btn>
				<v-btn
					size="small"
					variant="outlined"
					@click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
					:disabled="!editor.can().chain().focus().toggleHeading({ level: 3 }).run()"
					:active="editor.isActive('heading', { level: 3 })"
				>
					H3
				</v-btn>
			</v-toolbar>
		</v-col>
    </v-row>
    <v-row>
			<v-col
				class="pt-0"
				cols="12"
			>
				<editor-content
					style="border: 1px solid black; background-color: #fff;"
					class="px-3"
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
      default: '',
    },
    mention: {}
  },

  emits: ['update:modelValue'],

  // TODO: Check for "insert" Properties
  data() {
    return {
      editor: null,
			currentLink: undefined,
			showLinkDialog: false
    }
  },

	methods: {
		setLink() {
      this.currentLink = this.editor.getAttributes('link').href
			this.showLinkDialog = true
		},
		closeLinkDialog() {
			this.showLinkDialog = false
			this.currentLink = undefined
		},
		async saveLink(href) {
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
    modelValue(value) {
      const isSame = this.editor.getHTML() === value
      if (isSame) {
        return
      }
      this.editor.commands.setContent(value, false)
    },
  },

  mounted() {
    this.editor = new Editor({
      content: this.modelValue,
      onUpdate: () => {
        this.$emit('update:modelValue', this.editor.getHTML())
      },
      extensions: [
        StarterKit,
				Underline,
				Link.configure({
          openOnClick: false,
					autolink: false
        }),
        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
          suggestion
        }),
				Heading.configure({
					levels: [1, 2, 3],
				})
      ]
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.tiptap {
  > * + * {
    margin-top: 0.75em;
  }
}

.mention {
  border: 1px solid #000;
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
  box-decoration-break: clone;
}
</style>