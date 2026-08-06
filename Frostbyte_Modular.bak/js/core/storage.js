const SQLITE_STORAGE = {
        dbName: "FrostbyteNotesDB",
        version: 1,
        db: null,
        isEnabled: false,
        isSupported: true,
        fileHandle: null, // Keep for backward compatibility

        // Check IndexedDB support
        checkSupport() {
          this.isSupported = !!(
            window.indexedDB &&
            window.IDBTransaction &&
            window.IDBKeyRange
          );
          return this.isSupported;
        },

        // Initialize IndexedDB
        async init() {
          try {
            if (!this.checkSupport()) {
              console.warn("Database storage not supported in this browser");
              return false;
            }

            // Check if database is enabled in settings
            const enabled = localStorage.getItem("databaseEnabled") === "true";
            if (!enabled) {
              console.log("Database storage disabled in settings");
              return false;
            }

            // Open IndexedDB
            const db = await this.openDatabase();
            if (!db) {
              return false;
            }

            this.db = db;
            this.isEnabled = true;

            console.log("Database storage initialized successfully");
            return true;
          } catch (error) {
            console.error("Failed to initialize database storage:", error);
            this.isEnabled = false;
            return false;
          }
        },

        // Open IndexedDB database
        async openDatabase() {
          return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
              console.error("Failed to open IndexedDB:", request.error);
              resolve(null);
            };

            request.onsuccess = () => {
              console.log("IndexedDB opened successfully");
              resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
              const db = event.target.result;

              // Create object stores if they don't exist
              if (!db.objectStoreNames.contains("notes")) {
                const notesStore = db.createObjectStore("notes", {
                  keyPath: "id",
                });
                notesStore.createIndex("timestamp", "timestamp", {
                  unique: false,
                });
              }

              if (!db.objectStoreNames.contains("settings")) {
                db.createObjectStore("settings", { keyPath: "key" });
              }

              console.log("IndexedDB schema created/upgraded");
            };
          });
        },
        // Save note to IndexedDB
        async saveNote(noteData) {
          if (!this.isEnabled || !this.db) return false;

          try {
            return new Promise((resolve, reject) => {
              const transaction = this.db.transaction(["notes"], "readwrite");
              const store = transaction.objectStore("notes");

              const request = store.put({
                id: noteData.id,
                techName: noteData.techName || "",
                storeNumber: noteData.storeNumber || "",
                workOrder: noteData.workOrder || "",
                notes: noteData.notes || "",
                dae: noteData.dae || "",
                date: noteData.date || new Date().toLocaleDateString(),
                timestamp: noteData.timestamp || Date.now(),
                sessionInfractions: noteData.sessionInfractions || 0,
                totalInfractions: noteData.totalInfractions || 0,
                infractionLog: noteData.infractionLog || [],
              });

              request.onsuccess = () => {
                console.log("Note saved to IndexedDB:", noteData.id);
                resolve(true);
              };

              request.onerror = () => {
                console.error(
                  "Failed to save note to IndexedDB:",
                  request.error,
                );
                reject(request.error);
              };
            });
          } catch (error) {
            console.error("Failed to save note to IndexedDB:", error);
            return false;
          }
        },

        // Load all notes from IndexedDB
        async loadNotes() {
          if (!this.isEnabled || !this.db) return [];

          try {
            return new Promise((resolve, reject) => {
              const transaction = this.db.transaction(["notes"], "readonly");
              const store = transaction.objectStore("notes");
              const request = store.getAll();

              request.onsuccess = () => {
                const notes = request.result || [];
                console.log(`Loaded ${notes.length} notes from IndexedDB`);
                resolve(notes);
              };

              request.onerror = () => {
                console.error(
                  "Failed to load notes from IndexedDB:",
                  request.error,
                );
                resolve([]);
              };
            });
          } catch (error) {
            console.error("Failed to load notes from IndexedDB:", error);
            return [];
          }
        },

        // Save setting to IndexedDB
        async saveSetting(key, value) {
          if (!this.isEnabled || !this.db) return false;

          try {
            return new Promise((resolve, reject) => {
              const transaction = this.db.transaction(
                ["settings"],
                "readwrite",
              );
              const store = transaction.objectStore("settings");

              const request = store.put({
                key: key,
                value: value,
                updated_at: new Date().toISOString(),
              });

              request.onsuccess = () => {
                console.log(`Setting saved to IndexedDB: ${key} = ${value}`);
                resolve(true);
              };

              request.onerror = () => {
                console.error(
                  "Failed to save setting to IndexedDB:",
                  request.error,
                );
                reject(request.error);
              };
            });
          } catch (error) {
            console.error("Failed to save setting to IndexedDB:", error);
            return false;
          }
        },

        // Load setting from IndexedDB
        async loadSetting(key) {
          if (!this.isEnabled || !this.db) return null;

          try {
            return new Promise((resolve, reject) => {
              const transaction = this.db.transaction(["settings"], "readonly");
              const store = transaction.objectStore("settings");
              const request = store.get(key);

              request.onsuccess = () => {
                const result = request.result;
                const value = result ? result.value : null;
                resolve(value);
              };

              request.onerror = () => {
                console.error(
                  "Failed to load setting from IndexedDB:",
                  request.error,
                );
                resolve(null);
              };
            });
          } catch (error) {
            console.error("Failed to load setting from IndexedDB:", error);
            return null;
          }
        },

        // Sync data from localStorage to IndexedDB
        async syncFromLocalStorage() {
          if (!this.isEnabled || !this.db) return false;

          try {
            // Get notes from localStorage
            const notesJson = localStorage.getItem("Frostbyte_Notes");
            if (notesJson) {
              const notes = JSON.parse(notesJson);
              for (const note of notes) {
                await this.saveNote(note);
              }
              console.log(
                `Synced ${notes.length} notes from localStorage to IndexedDB`,
              );
            }

            // Get settings from localStorage
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith("Frostbyte_Setting_")) {
                const settingKey = key.replace("Frostbyte_Setting_", "");
                const value = localStorage.getItem(key);
                await this.saveSetting(settingKey, value);
              }
            }

            return true;
          } catch (error) {
            console.error("Failed to sync from localStorage:", error);
            return false;
          }
        },

        // Sync data from IndexedDB to localStorage
        async syncToLocalStorage() {
          if (!this.isEnabled || !this.db) return false;

          try {
            // Sync notes
            const notes = await this.loadNotes();
            localStorage.setItem("Frostbyte_Notes", JSON.stringify(notes));

            // Sync settings
            const transaction = this.db.transaction(["settings"], "readonly");
            const store = transaction.objectStore("settings");
            const request = store.getAll();

            return new Promise((resolve) => {
              request.onsuccess = () => {
                const settings = request.result || [];
                settings.forEach((setting) => {
                  localStorage.setItem(
                    `Frostbyte_Setting_${setting.key}`,
                    setting.value,
                  );
                });
                console.log("Synced data from IndexedDB to localStorage");
                resolve(true);
              };

              request.onerror = () => {
                console.error("Failed to sync settings to localStorage");
                resolve(false);
              };
            });
          } catch (error) {
            console.error("Failed to sync to localStorage:", error);
            return false;
          }
        },

        // Search notes in IndexedDB
        async searchNotes(searchTerm) {
          if (!this.isEnabled || !this.db) return [];

          try {
            const notes = await this.loadNotes();
            const searchLower = searchTerm.toLowerCase();

            return notes.filter(
              (note) =>
                (note.techName &&
                  note.techName.toLowerCase().includes(searchLower)) ||
                (note.storeNumber &&
                  note.storeNumber.toLowerCase().includes(searchLower)) ||
                (note.workOrder &&
                  note.workOrder.toLowerCase().includes(searchLower)) ||
                (note.notes &&
                  note.notes.toLowerCase().includes(searchLower)) ||
                (note.dae && note.dae.toLowerCase().includes(searchLower)),
            );
          } catch (error) {
            console.error("Failed to search notes:", error);
            return [];
          }
        },

        // Get database statistics
        async getStatistics() {
          if (!this.isEnabled || !this.db) return null;

          try {
            const notes = await this.loadNotes();

            return new Promise((resolve) => {
              const transaction = this.db.transaction(["settings"], "readonly");

              const settingsStore = transaction.objectStore("settings");
              const settingsRequest = settingsStore.count();

              settingsRequest.onsuccess = () => {
                resolve({
                  totalNotes: notes.length,
                  totalSettings: settingsRequest.result,
                  lastUpdated: new Date().toISOString(),
                });
              };

              settingsRequest.onerror = () => {
                resolve({
                  totalNotes: notes.length,
                  totalSettings: 0,
                  lastUpdated: new Date().toISOString(),
                });
              };
            });
          } catch (error) {
            console.error("Failed to get database statistics:", error);
            return null;
          }
        },
      };

