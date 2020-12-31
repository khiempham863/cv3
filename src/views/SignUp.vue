<template>
  <div id="sign-up">
    <div class="content">
      <h1>Moodboard</h1>
      <button class="button" @click="signUpWithGoogle()">Sign-up with Google</button>
      <br />
      <br />
      <router-link to="/login">Go back to login page</router-link>
    </div>
  </div>
</template>

<script>
import * as Sentry from "@sentry/browser";

export default {
  methods: {
    async signUpWithGoogle() {
      try {
        var provider = new this.$firebase.auth.GoogleAuthProvider();
        await this.$auth.signInWithPopup(provider);
        this.$router.push("/app");
      } catch (error) {
        if (error.code !== "auth/popup-closed-by-user") {
          Sentry.captureException(error);
        }
        else {
          alert("You closed the popup. Try again");
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
#sign-up {
  width: 100%;
  height: 100%;

  .content {
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>