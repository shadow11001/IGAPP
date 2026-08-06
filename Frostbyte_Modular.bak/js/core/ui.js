function switchTab(tabName) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll(".tab-content");
        tabContents.forEach((content) => {
          content.classList.remove("active");
        });

        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll(".tab-btn");
        tabButtons.forEach((button) => {
          button.classList.remove("active");
        });

        // Show selected tab content
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
          selectedTab.classList.add("active");
        }

        // Add active class to clicked button
        if (event && event.target) {
          event.target.classList.add("active");
        } else {
          // Fallback: find button by tab name
          const targetButton = document.querySelector(
            `button[onclick="switchTab('${tabName}')"]`,
          );
          if (targetButton) {
            targetButton.classList.add("active");
          }
        }

        // Special handling for war room tab
        if (
          tabName === "war-room" &&
          typeof WAR_ROOM_SYSTEM !== "undefined" &&
          !WAR_ROOM_SYSTEM.state.isEnabled
        ) {
          showNotification(
            "🎯 War Room is disabled. Enable it in settings first.",
            "info",
            3000,
          );
          setTimeout(() => switchTab("quick-notes"), 100);
          return;
        }
      }
function toggleTheme() {
        try {
          const body = document.body;
          const button = document.getElementById("theme-toggle-btn");

          body.classList.toggle("light-mode");
          body.classList.toggle("dark-mode");
          const isDark = body.classList.contains("dark-mode");

          localStorage.setItem("theme", isDark ? "dark" : "light");
          updateThemeIcon(isDark);

          // Update button aria-label
          button.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode",
          );

          showNotification(
            `Switched to ${isDark ? "dark" : "light"} mode`,
            "success",
            1500,
          );
        } catch (error) {
          console.error("Theme toggle failed:", error);
          showNotification("Failed to toggle theme", "error");
        }
      }
function updateThemeIcon(isDark) {
        const icon = document.getElementById("theme-toggle-icon");
        if (icon) {
          if (isDark) {
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
          } else {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
          }
        }
      }
function showModal(options) {
        return new Promise((resolve) => {
          modalResolve = resolve;

          // Create modal if it doesn't exist
          let modalOverlay = document.getElementById("custom-modal-overlay");
          if (!modalOverlay) {
            modalOverlay = document.createElement("div");
            modalOverlay.id = "custom-modal-overlay";
            modalOverlay.className = "modal-overlay";
            document.body.appendChild(modalOverlay);
          }

          // Build modal content
          const modalContent = document.createElement("div");
          modalContent.className = "modal-content";

          const modalHeader = document.createElement("div");
          modalHeader.className = "modal-header";
          modalHeader.textContent = options.title || "Input Required";

          const modalBody = document.createElement("div");
          modalBody.className = "modal-body";

          // Format message with proper list formatting
          const message = options.message || "";

          // Always process messages that contain line breaks
          const parts = message.split("\n\n");
          parts.forEach((part, index) => {
            const lines = part.split("\n");
            let listContainer = null;
            let isNumberedList = false;

            lines.forEach((line) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return; // Skip empty lines

              // Detect if this is a numbered list item (1. or 1 - or 1) formats)
              const isNumbered = /^\d+[\.\-\)]\s/.test(trimmedLine);
              const isBulleted =
                trimmedLine.startsWith("• ") ||
                (trimmedLine.startsWith("- ") && !/^\d+\s*-/.test(trimmedLine));

              if (isNumbered || isBulleted) {
                // This is a list item
                if (!listContainer || isNumbered !== isNumberedList) {
                  // Create new list container (ol for numbered, ul for bullets)
                  listContainer = document.createElement(
                    isNumbered ? "ol" : "ul",
                  );
                  listContainer.style.marginLeft = "20px";
                  listContainer.style.marginTop = "8px";
                  listContainer.style.marginBottom = "8px";
                  modalBody.appendChild(listContainer);
                  isNumberedList = isNumbered;
                }
                const listItem = document.createElement("li");
                // Remove number/bullet prefix (handles 1. or 1 - or 1) or • or - formats)
                listItem.textContent = trimmedLine
                  .replace(/^[•\-]\s+/, "")
                  .replace(/^\d+[\.\-\)]\s+/, "");
                listItem.style.marginBottom = "4px";
                listContainer.appendChild(listItem);
              } else {
                // Regular text line
                listContainer = null; // Reset list container
                const textNode = document.createElement("p");
                textNode.textContent = trimmedLine;
                textNode.style.margin = "0 0 8px 0";
                modalBody.appendChild(textNode);
              }
            });

            // Add spacing between sections
            if (index < parts.length - 1 && part.trim()) {
              const spacer = document.createElement("div");
              spacer.style.height = "8px";
              modalBody.appendChild(spacer);
            }
          });

          const modalButtons = document.createElement("div");
          modalButtons.className = "modal-buttons";

          let inputElement = null;

          // Add input field if needed (for prompt-style modals)
          if (options.input) {
            inputElement = document.createElement("input");
            inputElement.type = "text";
            inputElement.className = "modal-input";
            inputElement.placeholder = options.placeholder || "";
            inputElement.value = options.defaultValue || "";
            modalBody.appendChild(inputElement);

            // Focus input after modal shows
            setTimeout(() => inputElement.focus(), 100);

            // Allow Enter key to submit
            inputElement.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmBtn.click();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelBtn.click();
              }
            });
          }

          // Create buttons
          const confirmBtn = document.createElement("button");
          confirmBtn.className = "modal-btn modal-btn-primary";
          confirmBtn.textContent = options.confirmText || "OK";
          confirmBtn.onclick = () => {
            const result = inputElement ? inputElement.value : true;
            hideModal(result);
          };

          const cancelBtn = document.createElement("button");
          cancelBtn.className = "modal-btn modal-btn-secondary";
          cancelBtn.textContent = options.cancelText || "Cancel";
          cancelBtn.onclick = () => {
            hideModal(options.input ? null : false);
          };

          modalButtons.appendChild(cancelBtn);
          modalButtons.appendChild(confirmBtn);

          // Assemble modal
          modalContent.appendChild(modalHeader);
          modalContent.appendChild(modalBody);
          modalContent.appendChild(modalButtons);

          modalOverlay.innerHTML = "";
          modalOverlay.appendChild(modalContent);

          // Show modal
          setTimeout(() => modalOverlay.classList.add("show"), 10);

          // Close on overlay click
          modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) {
              hideModal(options.input ? null : false);
            }
          };

          currentModal = modalOverlay;
        });
      }
function showNotification(message, type = "success", duration = 3000) {
        // Create notification container if it doesn't exist
        let notificationContainer = document.querySelector(
          ".notification-container",
        );
        if (!notificationContainer) {
          notificationContainer = document.createElement("div");
          notificationContainer.className = "notification-container";
          document.body.appendChild(notificationContainer);
        }

        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.setAttribute("role", "alert");
        notification.setAttribute("aria-live", "polite");

        // Insert at the beginning (top) to push others down
        notificationContainer.insertBefore(
          notification,
          notificationContainer.firstChild,
        );

        // Trigger animation
        setTimeout(() => notification.classList.add("show"), 100);

        // Auto remove
        setTimeout(() => {
          if (notification.parentNode) {
            notification.classList.remove("show");
            setTimeout(() => {
              notification.remove();
              // Remove container if empty
              if (notificationContainer.children.length === 0) {
                notificationContainer.remove();
              }
            }, 300);
          }
        }, duration);
      }
