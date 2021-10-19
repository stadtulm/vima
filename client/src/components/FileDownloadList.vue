<template>
  <div>
    <v-card
      flat
      outlined
      class="mb-6 collection"
    >
      <v-card-title>
        {{$t('groupFilesForDownload')}}
      </v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(file, i) in files"
            :key="i"
            :disabled="!user || !groupStatus || !groupStatus.isMember"
            @click="prepareGetUpload(file.url)"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{file.name}}
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                fab
                :dark="user && groupStatus && groupStatus.isMember"
                small
                color="customPurple"
                :disabled="!user || !groupStatus || !groupStatus.isMember"
                :loading="loaders[file.url] === true"
              >
                <v-icon
                  size="18"
                >
                  fas fa-download
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'FileDownloadList',

  components: {
  },

  props: [
    'files',
    'groupStatus'
  ],

  data: () => ({
    loaders: {}
  }),

  async mounted () {
  },

  methods: {
    ...mapMutations({
      setSnackbar: 'SET_SNACKBAR'
    }),
    ...mapActions('uploads', {
      getUpload: 'get'
    }),
    async prepareGetUpload (id) {
      this.$set(this.loaders, id, true)
      try {
        const upload = await this.getUpload(id)
        const a = document.createElement('a')
        a.href = upload.uri
        a.download = upload.id || 'download'
        a.target = '_blank'
        const clickHandler = () => {
          setTimeout(() => {
            URL.revokeObjectURL(upload.uri)
            a.removeEventListener('click', clickHandler)
            this.$set(this.loaders, id, undefined)
          }, 150)
        }
        a.addEventListener('click', clickHandler, false)
        a.click()
      } catch (e) {
        this.setSnackbar({ text: this.$t('requestFailed'), color: 'error' })
        this.$set(this.loaders, id, undefined)
      }
    }
  },

  computed: {
    ...mapGetters('auth', [
      'user'
    ])
  }
}
</script>
