<template>
  <v-navigation-drawer
    v-if="!$vuetify.display.mobile"
    v-model="$app.themeEditor"
    :width="editor ? 450 : 256"
    class="unselectable"
    color="dark"
    floating
    location="right"
    permanent
  >
    <ThemeEngineSidebar @editor="editor = $event"></ThemeEngineSidebar>
  </v-navigation-drawer>
  <CoreDialog v-if="$vuetify.display.mobile" v-model="$app.themeEditor">
    <template v-slot:toolbar>
      <div></div>
    </template>
    <ThemeEngineSidebar @editor="editor = $event"></ThemeEngineSidebar>
  </CoreDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ThemeEngineSidebar from "@/components/Core/ThemeEngineSidebar.vue";
import CoreDialog from "@/components/Core/Dialogs/Dialog.vue";

export default defineComponent({
  name: "ThemeEngineWrapper",
  components: {
    CoreDialog,
    ThemeEngineSidebar
  },
  data() {
    return {
      editor: false
    };
  }
});
</script>

<style scoped></style>
