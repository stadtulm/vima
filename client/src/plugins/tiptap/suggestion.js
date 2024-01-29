import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import Store from '@/store'

import MentionList from '@/components/MentionList.vue'

const usersParams = {
  query: {
    _id: { $ne: null },
    role: { $ne: 'deleted' },
    isVerified: true,
    isActive: true,
    $limit: 480,
    $skip: 0,
    $sort: { userName: 1 }
  }
}

async function loadUsers () {
  usersParams.query._id.$ne = Store.getters['auth/user']?._id
  const result = await Store.dispatch('users/find', usersParams)
  let tmpUsers = result.data
  let reloads = 0
  while (tmpUsers.length < result.total) {
    reloads += 1
    usersParams.query.$skip = reloads * result.limit
    tmpUsers = tmpUsers.concat((await Store.dispatch('users/find', usersParams)).data)
  }
  usersParams.query.$skip = 0
  return tmpUsers.map(user => ({ _id: user._id, userName: user.userName }))
}

export default {
  items: async ({ query }) => {
    return [
      ...(await loadUsers())
    ].filter(item => item.userName.toLowerCase().startsWith(query.toLowerCase()))
  },

  render: () => {
    let component
    let popup

    return {
      onStart: props => {
        component = new VueRenderer(MentionList, {
          props,
          editor: props.editor
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start'
        })
      },

      onUpdate (props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect
        })
      },

      onKeyDown (props) {
        if (props.event.key === 'Escape') {
          popup[0].hide()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit () {
        popup[0].destroy()
        component.destroy()
      }
    }
  }
}
