<template>
  <v-tabs class="mb-4 mt-n3">
    <v-tab to="/settings/security">Home</v-tab>
    <v-tab to="/settings/security/audit">Pulse Log</v-tab>
  </v-tabs>
  <v-toolbar class="rounded-xl" color="toolbar">
    <CreateAPIKey
      v-model="dialogs.key"
      type="api"
      @create="getAPIKeys"
    ></CreateAPIKey>
    <v-toolbar-title>
      {{ $t("settings.security.apiKeys") }}
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn color="primary" @click="dialogs.key = true">
      <v-icon left>mdi-plus</v-icon>
      {{ $t("settings.security.addAPIKey") }}
    </v-btn>
  </v-toolbar>
  <v-data-table :headers="headers" :items="apiKeys">
    <template v-slot:item.actions="{ item }">
      <v-icon
        :disabled="!item.raw.info?.accessedFrom.length"
        class="mr-3"
        @click="
          ipHistory = item.raw.info?.accessedFrom;
          dialogs.ipHistory = true;
        "
      >
        <v-tooltip activator="parent" location="top">
          <span v-if="item.raw.info?.accessedFrom?.length">
            {{ $t("settings.security.ipHistory") }}
          </span>
          <span v-else>
            {{ $t("settings.security.noIPHistory") }}
          </span>
        </v-tooltip>
        mdi-web
      </v-icon>
      <v-icon class="mr-2" small @click="$functions.copy(item.raw.token)">
        mdi-content-copy
      </v-icon>
      <v-icon class="mr-2" small @click="deleteApiKey(item.raw.id)">
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
  <v-toolbar class="rounded-xl mt-5" color="toolbar">
    <CreateAPIKey
      v-model="dialogs.password"
      type="password"
      @create="getAlternatePasswords"
    ></CreateAPIKey>
    <v-toolbar-title>
      {{ $t("settings.security.alternatePasswords") }}
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn color="primary" @click="dialogs.password = true">
      <v-icon left>mdi-plus</v-icon>
      {{ $t("settings.security.addAlternatePassword") }}
    </v-btn>
  </v-toolbar>
  <v-data-table :headers="headers" :items="alternatePasswords.items">
    <template v-slot:item.actions="{ item }">
      <v-icon
        class="mr-2"
        small
        @click="deleteAlternatePassword(item.raw.name)"
      >
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
  <v-toolbar class="rounded-xl mt-5" color="toolbar">
    <v-toolbar-title>
      {{ $t("settings.security.recentLogins") }}
    </v-toolbar-title>
  </v-toolbar>
  <v-list subheader three-line>
    <IPHistory v-model="dialogs.ipHistory" :history="ipHistory" />
    <v-list-item v-for="login in sessions" :key="login.id">
      <v-list-item-title>
        {{
          login.info?.accessedFrom?.at(-1)?.location ||
          $t("settings.security.unknownLocation")
        }}
      </v-list-item-title>
      <v-list-item-subtitle class="mt-1">
        {{
          login.info?.accessedFrom?.at(-1)?.isp ||
          $t("settings.security.unknownISP")
        }}
        {{
          login.info?.accessedFrom?.at(-1)?.asn ||
          $t("settings.security.unknownASN")
        }}
        -
        {{
          login.info?.accessedFrom?.at(-1)?.ip ||
          $t("settings.security.unknownIP")
        }}
      </v-list-item-subtitle>
      <v-list-item-subtitle class="mt-1">
        {{
          $t("settings.security.lastSessionUsage", {
            date: $date().to(login.updatedAt)
          })
        }}
      </v-list-item-subtitle>
      <v-list-item-subtitle class="mt-1">
        {{
          $t("settings.security.sessionCreated", {
            date: $date().to(login.createdAt)
          })
        }}
      </v-list-item-subtitle>
      <v-list-item-subtitle class="mt-1">
        {{
          $t("settings.security.sessionExpiry", {
            date: login.expiredAt
              ? $date().to(login.expiredAt)
              : $t("generic.never")
          })
        }}
      </v-list-item-subtitle>
      <template v-slot:append>
        <v-btn color="red" icon @click="deleteApiKey(login.id)">
          <v-tooltip activator="parent" location="top">
            {{ $t("settings.security.deleteSession") }}
          </v-tooltip>
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-btn
          :disabled="!login.info?.accessedFrom?.length"
          color="blue"
          icon
          @click="
            ipHistory = login.info?.accessedFrom;
            dialogs.ipHistory = true;
          "
        >
          <v-tooltip activator="parent" location="top">
            <span v-if="login.info?.accessedFrom?.length">
              {{ $t("settings.security.ipHistory") }}
            </span>
            <span v-else>
              {{ $t("settings.security.noIPHistory") }}
            </span>
          </v-tooltip>
          <v-icon>mdi-web</v-icon>
        </v-btn>
      </template>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CreateAPIKey from "@/components/Settings/Dialogs/CreateAPIKey.vue";
import IPHistory from "@/components/Settings/Dialogs/IPHistory.vue";

export default defineComponent({
  name: "Security",
  components: { IPHistory, CreateAPIKey },
  data() {
    return {
      apiKeys: [],
      ipHistory: [],
      dialogs: {
        key: false,
        password: false,
        ipHistory: false
      },
      headers: [
        {
          title: "Name",
          key: "name"
        },
        {
          title: "Scopes",
          key: "scopes"
        },
        {
          title: "Expiry",
          key: "expiry"
        },
        {
          title: "Created At",
          key: "createdAt"
        },
        { title: "Actions", key: "actions" }
      ],
      alternatePasswords: {
        items: []
      },
      sessions: [] as any[]
    };
  },
  methods: {
    async getAPIKeys() {
      const { data } = await this.axios.get("/security/keys");
      this.apiKeys = data;
    },
    async getAlternatePasswords() {
      const { data } = await this.axios.get("/security/passwords");
      this.alternatePasswords.items = data;
    },
    async deleteApiKey(id: number) {
      await this.axios.delete(`/security/keys/${id}`);
      this.getAPIKeys();
      this.getSessions();
    },
    async deleteAlternatePassword(name: string) {
      await this.axios.patch(`/security/passwords`, {
        name
      });
      this.getAlternatePasswords();
    },
    async getSessions() {
      const { data } = await this.axios.get("/security/logins");
      this.sessions = data;
    }
  },
  mounted() {
    this.getAPIKeys();
    this.getAlternatePasswords();
    this.getSessions();
  }
});
</script>

<style scoped></style>
