<template>
  <v-col
    v-if="$settings.socialMediaUrls"
    cols="12"
    class="pb-2"
  >
    <v-toolbar
      height="120"
      color="transparent"
    >
      <v-spacer></v-spacer>
      <v-btn
        variant="outlined"
        rounded
        color="customGrey"
        elevation="6"
        :to="{ name: 'News' }"
        class="mr-4 pa-2"
      >
        {{$t("news")}}
      </v-btn>
      <a
        v-if="computedShowTalk"
        href="https://us02web.zoom.us/j/83818366876?pwd=QWFvRWR0S1RBcUh0TGp5UkNLS3FIZz09"
        target="_blank"
        class="text-white"
        style="text-decoration: none"
      >
        <v-btn
          variant="outlined"
          rounded
          color="customGrey"
          elevation="6"
          class="pa-2"
        >
          Danube Talk
        </v-btn>
      </a>
      <a
        class="mx-4 social-media-button"
        target="_blank"
        v-if="$settings.socialMediaUrls.fb"
        :href="$settings.socialMediaUrls.fb"
      >
        <v-img
          style="border-radius:100%"
          class="elevation-6"
          src="pics/fb.png"
          height="100px"
          width="100px"
        ></v-img>
      </a>
      <a
        class="mx-4 social-media-button"
        target="_blank"
        v-if="$settings.socialMediaUrls.instagram"
        :href="$settings.socialMediaUrls.instagram"
      >
        <v-img
          style="border-radius:30%"
          class="elevation-6"
          src="pics/ig.png"
          height="100px"
          width="100px"
        ></v-img>
      </a>
      <a
        class="mx-6 social-media-button"
        target="_blank"
        v-if="$settings.socialMediaUrls.twitter"
        :href="$settings.socialMediaUrls.twitter"
        height="100px"
        width="100px"
      >
        <v-img
        src="pics/twitter.png"
      ></v-img>
      </a>
    <v-spacer></v-spacer>
    </v-toolbar>
  </v-col>
</template>

<script>

const showTalkButton = import.meta.env.VITE_NAME

export default {
  name: 'SocialMedia',

  computed: {
    computedShowTalk () {
      if (showTalkButton.trim() === 'VIMA Danube') {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style>

.social-media-button {
  height:50px;
  width:50px;
}

</style>
