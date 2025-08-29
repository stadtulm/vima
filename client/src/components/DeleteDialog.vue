<template>
  <div>
    <!-- Delete dialog -->
    <v-dialog
      max-width="600"
      persistent
      :model-value="showDeleteDialog"
      @click:outside="closeDialog()"
    >
      <v-card
        color="customGreyUltraLight"
        tile
      >
        <v-card-text
          class="pa-8"
        >
          <v-row>
            <v-col
              class="text-h5 font-weight-bold"
            >
              {{$t('deleteWarningHeadline')}}
            </v-col>
          </v-row>
          <v-card-actions
            class="mt-6 pa-0"
          >
            <v-btn
              variant="elevated"
              @click="$emit('update:closeDeleteDialog')"
            >
              {{$t('cancelDeleteButton')}}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              variant="elevated"
              @click="$emit('delete:executeDelete')"
              color="error"
            >
              {{$t('acceptDeleteButton')}}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

export default {
  name: 'DeleteDialog',

  props: [
    'showDeleteDialog'
  ],

  emits: ['update:closeDeleteDialog', 'delete:executeDelete'],

  methods: {
    closeDialog () {
      this.$emit('update:closeDeleteDialog')
    }
  }
}
</script>
