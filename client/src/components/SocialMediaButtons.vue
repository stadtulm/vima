<template>
  <v-col
    v-if="$settings.socialMediaUrls"
    cols="12"
  >
    <v-toolbar
      height="120"
      color="transparent"
    >
      <v-spacer></v-spacer>
      <a
        class="mx-6 social-media-button"
        target="_blank"
        v-if="$settings.socialMediaUrls.fb"
        :href="$settings.socialMediaUrls.fb"
      >
        <v-img
          src="pics/fb.png"
        ></v-img>
      </a>
      <a
        class="mx-6 social-media-button"
        target="_blank"
        v-if="$settings.socialMediaUrls.instagram"
        :href="$settings.socialMediaUrls.instagram"
      >
        <v-img
        src="pics/ig.png"
      ></v-img>
      </a>
      <a
        class="mx-6 social-media-button"
        target="_blank"
        v-if="$settings.socialMediaUrls.twitter"
        :href="$settings.socialMediaUrls.twitter"
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

export default {
  name: 'SocialMedia'
}
</script>

<style>

.social-media-button {
  height:50px;
  width:50px;
}

</style>
