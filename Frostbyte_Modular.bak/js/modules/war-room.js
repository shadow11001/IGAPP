const WAR_ROOM_SYSTEM = {
        state: {
          isEnabled: false,
          assignedStores: [],
          currentStoreIndex: 0,
          storeResults: [],
          currentTemplate: null,
          sessionStartTime: null,
          sessionId: null,
          currentStoreWorkOrders: [], // Store-specific work orders for current store
        },

        templates: {
          presets: {
            detailed_format: {
              name: "Detailed Format",
              siteHeader: "*Site {STORE}",
              systemFormat: "Verified in {SYSTEM}:",
              rackFormat: "detailed",
              includeWorkOrders: true,
              includeSummary: true,
              customTemplate: `*Site {STORE}
Verified in {SYSTEM}:
{RACKS}

Open WorkOrders:

Site {STORE}:
{WORK_ORDERS}`,
            },

            condensed_format: {
              name: "Condensed Format",
              siteHeader: "Site {STORE}",
              systemFormat: "Verified in {SYSTEM}:",
              rackFormat: "condensed",
              includeWorkOrders: false,
              includeSummary: true,
              customTemplate: `Site {STORE}
Verified in {SYSTEM}:
{RACKS}`,
            },

            simple_format: {
              name: "Simple Format",
              siteHeader: "Site {STORE}",
              systemFormat: "verified in {SYSTEM}",
              rackFormat: "simple",
              includeWorkOrders: false,
              includeSummary: true,
              customTemplate: `Site {STORE}
verified in {SYSTEM}
{RACKS}`,
            },
          },
        },

        systemRacks: {
          Novar: [],
          "Opus Arch": [],
          "Opus Mag": [],
          CPC: ["CKTS"],
          AKA65: ["HVAC"],
          Danfoss: ["LTA", "LTB", "MTC", "MTD"],
          "Carel Boss": ["LTA", "LTB", "MTC", "MTD", "RCU"],
          Other: [],
        },

        // Predefined War Room sites with their systems
        warRoomSites: {
          4: "Carel Boss",
          1407: "Danfoss",
          5152: "CPC",
        },

        getSystemForSite(site) {
          return this.warRoomSites[site] || null;
        },

        generateSessionId() {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2);
          const userHash = localStorage.getItem("agentName") || "user";
          return `WR_${userHash.substring(0, 3)}_${timestamp}_${random}`;
        },

        generateVerificationCode() {
          const factors = [
            localStorage.getItem("agentName") || "unknown",
            this.state.sessionStartTime || Date.now(),
            this.state.sessionId || "no-session",
            this.state.storeResults.length.toString(),
            navigator.userAgent.slice(-10),
          ];
          return btoa(factors.join("")).slice(0, 12);
        },

        generateRackStatus(racks, format) {
          switch (format) {
            case "detailed":
              return racks
                .map((rack) => {
                  let line = `  ${rack.name}: ${rack.status}`;
                  if (rack.details && rack.details.trim()) {
                    line += ` - ${rack.details}`;
                  }
                  return line;
                })
                .join("\\n");

            case "condensed":
              const noAlarmRacks = racks.filter(
                (r) => r.status === "No Alarms",
              );
              const alarmRacks = racks.filter((r) => r.status !== "No Alarms");

              let result = "";
              if (noAlarmRacks.length > 0) {
                result += `${noAlarmRacks.map((r) => r.name).join("/")}-No Alarms on monitored assets\\n`;
              }
              if (alarmRacks.length > 0) {
                result += alarmRacks
                  .map((r) => {
                    let line = `${r.name} in alarm (${r.status})`;
                    if (r.details && r.details.trim()) {
                      line += ` - ${r.details}`;
                    }
                    return line;
                  })
                  .join("\\n");
              }
              return result;

            case "simple":
              const hasAlarms = racks.some((r) => r.status !== "No Alarms");
              if (hasAlarms) {
                const alarmDetails = racks
                  .filter((r) => r.status !== "No Alarms")
                  .map((r) => {
                    let line = `${r.name}: ${r.status}`;
                    if (r.details && r.details.trim()) {
                      line += ` - ${r.details}`;
                    }
                    return line;
                  })
                  .join(", ");
                return alarmDetails;
              }
              return "No Alarms Found";

            default:
              return racks
                .map((rack) => {
                  let line = `${rack.name}: ${rack.status}`;
                  if (rack.details && rack.details.trim()) {
                    line += ` - ${rack.details}`;
                  }
                  return line;
                })
                .join("\\n");
          }
        },

        applyTemplate(storeData, template) {
          let result = template.customTemplate;

          result = result.replace(/{STORE}/g, storeData.store);
          result = result.replace(/{SYSTEM}/g, storeData.system);
          result = result.replace(
            /{RACKS}/g,
            this.generateRackStatus(storeData.racks, template.rackFormat),
          );
          result = result.replace(
            /{WORK_ORDERS}/g,
            storeData.workOrders.length > 0
              ? storeData.workOrders.map((wo) => `  - ${wo}`).join("\\n")
              : "  - None",
          );

          return result;
        },
      };

