<template>
  <CoreDialog v-model="importDoc.dialog" max-width="600px">
    <template v-slot:title>Import document</template>
    <v-container>
      <v-text-field
        label="Name"
        required
        :autofocus="true"
        v-model="importDoc.name"
      ></v-text-field>
      <v-file-input
        label="TPU Document (.TPUDOC or .HTML)"
        required
        :autofocus="true"
        v-model="importDoc.file"
        ref="importDocFile"
        accept=".tpudoc,.html"
      ></v-file-input>
    </v-container>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="doImportDoc" :loading="importDoc.loading">
        Import
      </v-btn>
    </v-card-actions>
  </CoreDialog>
  <WorkspaceDeleteDialog
    @submit="doDeleteNote"
    v-model="deleteNote.dialog"
    title="Delete note"
    :loading="deleteNote.loading"
  />
  <WorkspaceDeleteDialog
    @submit="doDeleteWorkspace"
    v-model="deleteWorkspace.dialog"
    title="Delete workspace"
    :loading="deleteWorkspace.loading"
  />
  <WorkspaceDeleteDialog
    @submit="doDeleteFolder"
    v-model="deleteFolder.dialog"
    title="Delete folder"
    :loading="deleteFolder.loading"
  />
  <WorkspaceDialog
    @submit="doCreateNote"
    v-model="createNote.dialog"
    title="Create note"
    :loading="createNote.loading"
  />
  <WorkspaceDialog
    @submit="doCreateWorkspace"
    v-model="createWorkspace.dialog"
    title="Create workspace"
    :loading="createWorkspace.loading"
  />
  <WorkspaceDialog
    @submit="doCreateFolder"
    v-model="createFolder.dialog"
    title="Create folder"
    :loading="createFolder.loading"
  />
  <WorkspaceDialog
    @submit="doRenameNote"
    v-model="renameNote.dialog"
    title="Rename note"
    btn-text="Rename"
    :loading="renameNote.loading"
  />
  <WorkspaceDialog
    @submit="doRenameWorkspace"
    v-model="renameWorkspace.dialog"
    title="Rename workspace"
    btn-text="Rename"
    :loading="renameWorkspace.loading"
  />
  <WorkspaceDialog
    @submit="doRenameFolder"
    v-model="renameFolder.dialog"
    title="Rename folder"
    btn-text="Rename"
    :loading="renameFolder.loading"
  />
  <v-menu v-model="contextMenu.dialog" :key="contextMenu.id" :style="menuStyle">
    <v-list v-if="!contextMenu.item?.children && !contextMenu.item?.folders">
      <v-list-item @click="renameNote.dialog = true">
        <v-list-item-title>Rename note</v-list-item-title>
      </v-list-item>
      <v-list-item @click="downloadItem">
        <v-list-item-title>Download</v-list-item-title>
      </v-list-item>
      <v-list-item @click="deleteNote.dialog = true">
        <v-list-item-title>Delete</v-list-item-title>
      </v-list-item>
    </v-list>
    <v-list v-else-if="!contextMenu.item?.folders">
      <v-list-item @click="importDoc.dialog = true">
        <v-list-item-title>Import TPUDOC</v-list-item-title>
      </v-list-item>
      <v-list-item @click="renameFolder.dialog = true">
        <v-list-item-title>Rename folder</v-list-item-title>
      </v-list-item>
      <v-list-item @click="deleteFolder.dialog = true">
        <v-list-item-title>Delete</v-list-item-title>
      </v-list-item>
    </v-list>
    <v-list v-else>
      <v-list-item @click="renameWorkspace.dialog = true">
        <v-list-item-title>Rename workspace</v-list-item-title>
      </v-list-item>
      <v-list-item @click="deleteWorkspace.dialog = true">
        <v-list-item-title>Delete</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
  <v-card-text
    style="color: rgb(var(--v-theme-primary)); cursor: pointer; font-size: 12px"
    class="mb-n4 unselectable"
    @click="$app.workspaceDrawer = false"
    v-if="!$workspaces.versionHistory && !$app.rail"
  >
    <v-icon size="20">mdi-close</v-icon>
    Close sidebar
  </v-card-text>
  <v-card-text
    v-else-if="!$app.rail"
    @click="
      $workspaces.versionHistory = false;
      $router.push(`/workspaces/notes/${$route.params.id}`);
    "
    style="color: #0190ea; cursor: pointer; font-size: 12px"
    class="mb-n4 unselectable"
  >
    <v-icon>mdi-arrow-left</v-icon>
    Leave version history
  </v-card-text>
  <v-list
    density="comfortable"
    nav
    class="mt-2"
    v-if="!$workspaces.versionHistory"
  >
    <v-list-item
      class="px-2 unselectable"
      id="workspace-select"
      style="cursor: pointer"
      @contextmenu.prevent="
        context($event, 'workspace-select', $workspaces.workspace)
      "
    >
      {{ $workspaces.workspace?.name || "None selected" }}
      <template v-slot:append>
        <v-list-item-action
          v-if="$workspaces.workspace"
          @click.stop="createFolder.dialog = true"
        >
          <v-icon>mdi-plus</v-icon>
        </v-list-item-action>
        <v-list-item-action>
          <v-icon>mdi-menu-down</v-icon>
        </v-list-item-action>
      </template>
    </v-list-item>
    <v-menu activator="#workspace-select">
      <v-list>
        <v-list-item
          v-for="item in $workspaces.items"
          :key="item.id"
          :value="item.id"
          @click="$workspaces.selectWorkspace(item.id)"
        >
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
        <v-list-item @click="createWorkspace.dialog = true">
          <v-list-item-title>
            <strong>Create workspace</strong>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <template v-if="$workspaces.workspace">
      <v-list-group
        v-for="item in $workspaces.workspace.folders"
        :key="item.id"
        :value="item.id"
        :title="item.name"
        :id="`folder-${item.id}`"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            @contextmenu.prevent="context($event, `folder-${item.id}`, item)"
          >
            <v-list-item-title>{{ props.title }}</v-list-item-title>
          </v-list-item>
        </template>
        <v-list-item
          v-for="note in item.children"
          :key="note.id"
          :to="'/workspaces/notes/' + note.id"
          :value="note.workspaceFolderId"
          :id="`note-${item.id}`"
          @contextmenu.prevent="context($event, `note-${note.id}`, note)"
        >
          <v-list-item-title style="text-overflow: ellipsis">
            {{ note.name }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="
            createNote.folderId = item.id;
            createNote.dialog = true;
          "
        >
          <v-list-item-title>
            <strong>Create a new note</strong>
          </v-list-item-title>
        </v-list-item>
      </v-list-group>
    </template>
  </v-list>
  <template v-else>
    <v-card-title>Version history</v-card-title>
    <v-list>
      <v-list-item
        v-for="version in versions"
        :key="version.id"
        :to="'/workspaces/notes/' + $route.params.id + '/' + version.id"
      >
        <v-list-item-title>
          {{ $date(version.createdAt).format("hh:mm:ss A DD/MM/YYYY") }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WorkspaceDialog from "@/components/Workspaces/Dialogs/Dialog.vue";
import WorkspaceDeleteDialog from "@/components/Workspaces/Dialogs/Delete.vue";
import { NoteVersion } from "@/models/noteVersion";
import CoreDialog from "@/components/Core/Dialogs/Dialog.vue";

export default defineComponent({
  name: "WorkspacesSidebarList",
  components: { CoreDialog, WorkspaceDeleteDialog, WorkspaceDialog },
  data() {
    return {
      versions: [] as NoteVersion[],
      importDoc: {
        dialog: false,
        loading: false,
        file: undefined as File[] | undefined,
        name: ""
      },
      contextMenu: {
        dialog: false,
        item: undefined as any,
        id: undefined as string | undefined,
        x: 0,
        y: 0
      },
      createNote: {
        dialog: false,
        folderId: undefined as number | undefined,
        loading: false
      },
      renameNote: {
        dialog: false,
        noteId: undefined as number | undefined,
        loading: false
      },
      createFolder: {
        dialog: false,
        loading: false
      },
      renameFolder: {
        dialog: false,
        folderId: undefined as number | undefined,
        loading: false
      },
      createWorkspace: {
        dialog: false,
        loading: false
      },
      renameWorkspace: {
        dialog: false,
        workspaceId: undefined as number | undefined,
        loading: false
      },
      deleteNote: {
        dialog: false,
        noteId: undefined as number | undefined,
        loading: false
      },
      deleteFolder: {
        dialog: false,
        folderId: undefined as number | undefined,
        loading: false
      },
      deleteWorkspace: {
        dialog: false,
        workspaceId: undefined as number | undefined,
        loading: false
      }
    };
  },
  computed: {
    menuStyle() {
      return `
        position: absolute;
        top: ${this.contextMenu.y}px;
        left: ${this.contextMenu.x}px;`;
    }
  },
  methods: {
    async doImportDoc() {
      try {
        this.importDoc.loading = true;
        const fileReader = new FileReader();
        //@ts-ignore
        fileReader.readAsText(this.$refs.importDocFile.files[0]);
        fileReader.onload = async () => {
          const text = fileReader.result as string;
          let json;
          try {
            json = JSON.parse(text);
          } catch {
            json = text;
          }
          const data = await this.doCreateNote(this.importDoc.name, true);
          await this.axios.patch(`/notes/${data?.id}`, {
            data: json
          });
          this.$router.push(`/workspaces/notes/${data.id}`);
          this.importDoc.dialog = false;
          this.importDoc.loading = false;
          this.importDoc.file = undefined;
          this.importDoc.name = "";
        };
      } catch (e) {
        console.error(e);
        this.$toast.error(
          "Failed to import document, are you sure it's a TPU document?"
        );
      }
    },
    async downloadItem() {
      const { data } = await this.axios.get(
        "/notes/" + this.contextMenu.item?.id
      );

      const blob = new Blob([JSON.stringify(data.data)], {
        type: "text/plain"
      });
      const e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
      a.download = this.contextMenu.item.name + ".tpudoc";
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
      e.initEvent("click", true, false);
      a.dispatchEvent(e);
    },
    context(e: any, id: string, item: any) {
      e.preventDefault();
      this.contextMenu.item = item;
      this.contextMenu.id = id;
      this.contextMenu.x = e.clientX;
      this.contextMenu.y = e.clientY;
      this.contextMenu.dialog = true;
    },
    async doCreateNote(name: string, internal: boolean = false) {
      this.createNote.loading = true;
      const { data } = await this.axios.post("/notes", {
        name,
        workspaceFolderId: this.createNote.folderId || this.contextMenu.item?.id
      });
      await this.$workspaces.refreshWorkspace();
      this.createNote.dialog = false;
      this.createNote.loading = false;
      if (internal) return data;
      this.$router.push(`/workspaces/notes/${data.id}`);
    },
    async doRenameNote(name: string) {
      this.renameNote.loading = true;
      const id = this.contextMenu.item?.id || this.renameNote.noteId;
      await this.axios.patch(`/notes/${id}`, {
        name
      });
      await this.$workspaces.refreshWorkspace();
      this.renameNote.dialog = false;
      this.renameNote.loading = false;
    },
    async doCreateFolder(name: string) {
      this.createFolder.loading = true;
      await this.axios.post("/notes/folder", {
        name: name,
        workspaceId: this.$workspaces.workspace?.id
      });
      await this.$workspaces.refreshWorkspace();
      this.createFolder.dialog = false;
      this.createFolder.loading = false;
    },
    async doRenameFolder(name: string) {
      const id = this.contextMenu.item?.id || this.renameFolder.folderId;
      this.renameFolder.loading = true;
      await this.axios.patch(`/notes/folder/${id}`, {
        name
      });
      await this.$workspaces.refreshWorkspace();
      this.renameFolder.dialog = false;
      this.renameFolder.loading = false;
    },
    async doCreateWorkspace(name: string) {
      this.createWorkspace.loading = true;
      const { data } = await this.axios.post("/notes/workspaces", {
        name: name
      });
      await this.$workspaces.init();
      await this.$workspaces.selectWorkspace(data.id);
      this.createWorkspace.dialog = false;
      this.createWorkspace.loading = false;
    },
    async doRenameWorkspace(name: string) {
      this.renameWorkspace.loading = true;
      const id = this.contextMenu.item?.id || this.renameWorkspace.workspaceId;
      await this.axios.patch(`/notes/workspaces/${id}`, {
        name
      });
      await this.$workspaces.init();
      this.renameWorkspace.dialog = false;
      this.renameWorkspace.loading = false;
    },
    doDeleteNote() {
      this.deleteNote.loading = true;
      const id = this.contextMenu.item?.id || this.deleteNote.noteId;
      this.axios.delete(`/notes/${id}`).then(async () => {
        await this.$workspaces.refreshWorkspace();
        this.deleteNote.dialog = false;
        this.deleteNote.loading = false;
        if (this.$route.params.id == id) this.$router.push("/workspaces");
      });
    },
    doDeleteFolder() {
      this.deleteFolder.loading = true;
      const id = this.contextMenu.item?.id || this.deleteFolder.folderId;
      this.axios.delete(`/notes/folder/${id}`).then(async () => {
        await this.$workspaces.refreshWorkspace();
        this.deleteFolder.dialog = false;
        this.deleteFolder.loading = false;
      });
    },
    doDeleteWorkspace() {
      this.deleteWorkspace.loading = true;
      const id = this.contextMenu.item?.id || this.deleteWorkspace.workspaceId;
      this.axios.delete(`/notes/workspace/${id}`).then(async () => {
        this.$workspaces.workspace = null;
        await this.$workspaces.init();
        this.deleteWorkspace.dialog = false;
        this.deleteWorkspace.loading = false;
      });
    },
    async getVersions() {
      const { data } = await this.axios.get("/notes/" + this.$route.params.id);
      this.versions = data.versions;
    }
  },
  mounted() {
    if (this.$route.params.version) {
      this.$workspaces.versionHistory = true;
      this.getVersions();
    }
  },
  watch: {
    "$workspaces.versionHistory"(val) {
      if (val && this.$route.name === "Workspace Item") {
        this.getVersions();
      }
    }
  }
});
</script>
