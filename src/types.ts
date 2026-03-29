export interface NotionSettings {
  token: string;
  databaseId: string;
}

export interface Project {
  id: string; // Notion Page ID
  title: string;
  totalTime: number; // in seconds
  lastStarted?: number; // timestamp
  status: 'active' | 'paused';
}

export interface AppState {
  settings: NotionSettings | null;
  projects: Project[];
  activeProjectId: string | null;
}
