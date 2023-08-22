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
              403
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="text-h4"
            >
              {{$t('warningForbiddenContent')}}
            </v-col>
          </v-row>
          <v-row
            v-if="$route.query.redirect"
            class="mt-8"
          >
            <v-col>
              <v-btn
                dark
                large
                class="elevation-0 custom--text"
                :to="$route.query.redirect"
              >
                {{$t('back')}}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

export default {
  name: 'Forbidden'
}
</script>
