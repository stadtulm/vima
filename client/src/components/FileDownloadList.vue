<template>
  <div>
    <v-card
      class="mb-6 collection"
    >
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(file, i) in files"
            :key="i"
            :disabled="!user || !groupStatus || !groupStatus.isMember"
            @click="prepareGetUpload(file.url)"
          >
              <v-list-item-title>
                {{file.name}}
              </v-list-item-title>
            <template
              v-slot:append
            >
              <v-btn
                icon="fas fa-download"
                size="small"
                :color="$settings.modules.groups.color"
                :disabled="!user || !groupStatus || !groupStatus.isMember"
                :loading="loaders[file.url] === true"
              >
              </v-btn>
            </template>
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
    })
  },

  computed: {
    ...mapGetters('auth', [
      'user',
      'prepareGetUpload'
    ])
  }
}
</script>
