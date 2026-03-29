import { notionService } from './notionService';
import { AppState, Project } from './types';

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-notion",
    title: "Save Highlight to Notion Project",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-notion" && info.selectionText) {
    const state = await chrome.storage.local.get('appState') as { appState?: AppState };
    if (state.appState?.activeProjectId && state.appState.settings) {
      try {
        await notionService.saveHighlight(
          state.appState.activeProjectId,
          info.selectionText,
          state.appState.settings
        );
        console.log("Highlight saved!");
      } catch (error) {
        console.error("Failed to save highlight:", error);
      }
    }
  }
});

// Timer logic
setInterval(async () => {
  const data = await chrome.storage.local.get('appState') as { appState?: AppState };
  if (!data.appState) return;

  const { projects, activeProjectId } = data.appState;
  if (!activeProjectId) return;

  const activeProject = projects.find(p => p.id === activeProjectId);
  if (activeProject && activeProject.status === 'active') {
    activeProject.totalTime += 1;
    await chrome.storage.local.set({ appState: data.appState });
  }
}, 1000);
