<template>
  <v-card class="text-center justify-center">
    <v-container>
      <span>
        <strong class="text-gradient" style="font-size: 24px">
          {{ $t("dashboard.announcements") }}
        </strong>
        <v-btn
          icon
          size="x-small"
          v-if="$user.user?.administrator"
          style="margin-top: -0.25rem"
          class="ml-1"
          @click="newAnnouncement"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </span>
      <v-card
        v-for="announcement in announcements"
        :color="$vuetify.theme.global.name === 'amoled' ? undefined : 'toolbar'"
        :variant="
          $vuetify.theme.global.name === 'amoled' ? 'outlined' : undefined
        "
        class="my-3 pt-3 hover"
        elevation="0"
        :key="announcement.id"
      >
        <UserAvatar
          :user="announcement.user"
          size="58"
          style="cursor: pointer"
          @click="$router.push(`/u/${announcement.user.username}`)"
        ></UserAvatar>
        <v-card-title
          style="cursor: pointer"
          @click="$router.push(`/u/${announcement.user.username}`)"
        >
          {{ announcement.user.username }}
        </v-card-title>
        <v-card-text>
          <v-textarea
            auto-grow
            variant="underlined"
            color="primary"
            label="Content"
            v-if="announcement.editing"
            v-model="announcement.content"
            autofocus
          >
            <template v-slot:append>
              <div class="d-flex flex-column">
                <v-btn
                  icon
                  size="x-small"
                  :loading="loading"
                  @click="
                    announcement.new
                      ? createAnnouncement(announcement)
                      : submitEdit(announcement)
                  "
                >
                  <v-icon>mdi-check</v-icon>
                </v-btn>
                <v-btn
                  icon
                  class="mt-1"
                  size="x-small"
                  :loading="loading"
                  @click="
                    announcement.editing = false;
                    $app.init();
                  "
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </template>
            <template v-slot:details>
              May take a few seconds for changes to appear for everyone.
            </template>
          </v-textarea>
          <p
            class="mb-1 mt-n1"
            v-if="!announcement.editing"
            v-html="$functions.markdown(announcement.content)"
          />
          <small>
            {{
              $date(announcement.createdAt).format("Do of MMMM YYYY, h:mm A")
            }}
          </small>
          <template v-if="!announcement.editing && $user.user?.administrator">
            <v-btn
              icon
              size="x-small"
              class="ml-1"
              @click="announcement.editing = true"
              v-if="announcement.userId === $user.user?.id"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              size="x-small"
              class="ml-2"
              :loading="loading"
              @click="deleteAnnouncement(announcement)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-card-text>
      </v-card>
      <v-pagination v-model="page" :length="pages"></v-pagination>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UserAvatar from "@/components/Users/UserAvatar.vue";
import { Announcement } from "@/models/announcement";

export default defineComponent({
  name: "AnnouncementsWidget",
  components: { UserAvatar },
  data() {
    return {
      page: 1,
      loading: false,
      demo: [
        {
          id: 1,
          userId: 1,
          content: "Welcome to TroploPrivateUploader.",
          type: null,
          createdAt: "2023-01-21T15:36:45.000Z",
          updatedAt: "2023-01-21T15:36:45.000Z",
          user: {
            id: 1,
            username: "Troplo",
            avatar: "3c0926363bc9.png",
            moderator: false,
            administrator: true
          }
        }
      ]
    };
  },
  computed: {
    announcements() {
      // limit 3 per page, get pages
      const announcements = this.$app.demo
        ? this.demo
        : this.$app.site.announcements;
      return announcements.slice((this.page - 1) * 3, this.page * 3);
    },
    pages() {
      const announcements = this.$app.demo
        ? this.demo
        : this.$app.site.announcements;
      return Math.ceil(announcements.length / 3);
    }
  },
  methods: {
    newAnnouncement() {
      this.$app.site.announcements.unshift({
        id: new Date().getTime(),
        userId: this.$user.user?.id,
        content: "",
        type: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: this.$user.user,
        editing: true,
        new: true
      });
    },
    async submitEdit(announcement: Announcement) {
      this.loading = true;
      const { data } = await this.axios.patch(`/admin/announcement`, {
        content: announcement.content,
        id: announcement.id
      });
      announcement.editing = false;
      announcement.content = data.content;
      this.loading = false;
    },
    async deleteAnnouncement(announcement: Announcement) {
      this.loading = true;
      await this.axios.delete(`/admin/announcement/${announcement.id}`);
      this.$app.site.announcements.splice(
        this.$app.site.announcements.indexOf(announcement),
        1
      );
      this.loading = false;
    },
    async createAnnouncement(announcement: Announcement) {
      this.loading = true;
      await this.axios.post("/admin/announcement", {
        content: announcement.content
      });
      announcement.editing = false;
      announcement.new = false;
      this.loading = false;
    }
  }
});
</script>

<style scoped>
.hover {
  background: transparent !important;
}

.hover:hover {
  background: rgba(0, 0, 0, 0.1) !important;
}
</style>
