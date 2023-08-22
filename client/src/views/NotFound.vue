<template>
  <v-row>
    <v-col>
      <v-card
        color="white"
        flat
      >
        <v-card-text
          class="text-body-1"
        >
          <v-row>
            <v-col
              class="text-h4 font-weight-bold"
            >
              404
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="text-h4"
            >
              {{$t('pageNotFound')}}
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

export default {
  name: 'NotFound'
}
</script>
