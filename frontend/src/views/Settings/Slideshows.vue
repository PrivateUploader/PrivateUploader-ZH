<template>
  <v-card>
    <v-toolbar color="toolbar">
      <v-toolbar-title>
        {{ $t("settings.slideshows.title") }}
      </v-toolbar-title>
    </v-toolbar>
    <v-container>
      <v-card-title>
        {{ $t("settings.slideshows.my") }}
      </v-card-title>
      <v-expansion-panels>
        <v-expansion-panel v-for="slideshow in slideshows" :key="slideshow.id">
          <template v-slot:title>
            {{ slideshow.name }}
            <div style="float: right">
              <v-btn icon @click="deleteSlideshow(slideshow)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </template>
          <template v-slot:text>
            <v-card-text>
              <v-text-field
                :label="$t('settings.slideshows.shareLink')"
                :model-value="
                  'https://images.flowinity.com/slideshow/' +
                  slideshow.shareLink
                "
                disabled
              />
              <v-text-field
                v-model="slideshow.name"
                :label="$t('settings.slideshows.name')"
              />
              <v-text-field
                v-model="slideshow.speed"
                :label="$t('settings.slideshows.speed')"
              />
              <v-switch
                v-model="slideshow.includeGallery"
                :label="$t('settings.slideshows.includeGallery')"
                inset
              ></v-switch>
              <v-select
                v-model="slideshow.collectionIds"
                :items="$collections.items"
                :label="$t('settings.slideshows.collections')"
                chips
                deletable-chips
                item-title="name"
                item-value="id"
                multiple
              ></v-select>
            </v-card-text>

            <v-sheet class="rounded-xxl mt-3" outlined>
              <v-card
                color="white"
                elevation="0"
                height="50"
                max-width="100%"
                variant="outlined"
                @click="saveSlideshow(slideshow)"
              >
                <v-icon size="30" style="width: 100%; height: 100%">
                  mdi-content-save
                </v-icon>
              </v-card>
            </v-sheet>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-card-subtitle v-if="!slideshows.length">
        {{ $t("settings.slideshows.none") }}
      </v-card-subtitle>
      <v-sheet class="rounded-xxl mt-3" outlined>
        <v-card
          color="white"
          elevation="0"
          height="50"
          max-width="100%"
          variant="outlined"
          @click="createSlideshow()"
        >
          <v-icon size="50" style="width: 100%; height: 100%">mdi-plus</v-icon>
        </v-card>
      </v-sheet>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Slideshow } from "@/models/slideshow";

export default defineComponent({
  name: "Slideshows",
  data() {
    return {
      slideshows: [] as Slideshow[]
    };
  },
  methods: {
    async saveSlideshow(slideshow: Slideshow) {
      await this.axios.put("/slideshows/" + slideshow.id, slideshow);
    },
    async getSlideshows() {
      const { data } = await this.axios.get("/slideshows");
      this.slideshows = data;
    },
    async createSlideshow() {
      await this.axios.post("/slideshows", {
        name: "New Slideshow",
        includeGallery: true,
        collectionIds: []
      });
      await this.getSlideshows();
    },
    async deleteSlideshow(slideshow: Slideshow) {
      await this.axios.delete("/slideshows/" + slideshow.id);
      this.$toast.success("Slideshow deleted!");
      await this.getSlideshows();
    }
  },
  mounted() {
    this.getSlideshows();
  }
});
</script>

<style scoped></style>
