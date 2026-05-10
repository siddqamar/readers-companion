import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Settings as SettingsIcon, 
  Play, 
  Pause, 
  Camera, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { notionService } from './notionService';
import { AppState, Project, NotionSettings } from './types';
import { cn } from './lib/utils';

export default function App() {
  const normalizeAppState = (value: unknown): AppState | null => {
    if (!value || typeof value !== 'object') return null;

    const maybe = value as Partial<AppState> & {
      projects?: unknown;
      settings?: unknown;
      activeProjectId?: unknown;
    };

    let settings: NotionSettings | null = null;
    if (maybe.settings && typeof maybe.settings === 'object') {
      const s = maybe.settings as Partial<NotionSettings>;
      if (typeof s.token === 'string' && typeof s.databaseId === 'string') {
        settings = { token: s.token, databaseId: s.databaseId };
      }
    }

    const projects: Project[] = Array.isArray(maybe.projects)
      ? maybe.projects
          .map((p): Project | null => {
            if (!p || typeof p !== 'object') return null;
            const proj = p as Partial<Project>;
            if (typeof proj.id !== 'string') return null;
            if (typeof proj.title !== 'string') return null;
            if (typeof proj.totalTime !== 'number') return null;
            const status = proj.status === 'active' || proj.status === 'paused' ? proj.status : 'paused';
            const lastStarted = typeof proj.lastStarted === 'number' ? proj.lastStarted : undefined;
            return { id: proj.id, title: proj.title, totalTime: proj.totalTime, status, lastStarted };
          })
          .filter((p): p is Project => p !== null)
      : [];

    const activeProjectId =
      typeof maybe.activeProjectId === 'string' ? maybe.activeProjectId : maybe.activeProjectId === null ? null : null;

    return { settings, projects, activeProjectId };
  };

  const [state, setState] = useState<AppState>({
    settings: null,
    projects: [],
    activeProjectId: null
  });
  const [activeTab, setActiveTab] = useState<'active' | 'projects' | 'settings'>('active');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load state from storage
  useEffect(() => {
    chrome.storage.local.get('appState', (data) => {
      if (data.appState) {
        const normalized = normalizeAppState(data.appState);
        if (normalized) setState(normalized);
        if (!normalized?.settings) {
          setActiveTab('settings');
        }
      } else {
        setActiveTab('settings');
      }
    });

    // Listen for storage changes (timer updates from background)
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.appState) {
        const normalized = normalizeAppState(changes.appState.newValue);
        if (normalized) setState(normalized);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const saveState = async (newState: AppState) => {
    setState(newState);
    await chrome.storage.local.set({ appState: newState });
  };

  const handleSaveSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const settings: NotionSettings = {
      token: formData.get('token') as string,
      databaseId: formData.get('databaseId') as string
    };
    saveState({ ...state, settings });
    setActiveTab('projects');
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim() || !state.settings) return;
    setIsCreating(true);
    setError(null);
    try {
      const newProject = await notionService.createProject(newProjectTitle, state.settings);
      const newState: AppState = {
        ...state,
        projects: [...state.projects, newProject],
        activeProjectId: newProject.id
      };
      await saveState(newState);
      setNewProjectTitle('');
      setActiveTab('active');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTimer = () => {
    if (!state.activeProjectId) return;
    const newState: AppState = {
      ...state,
      projects: state.projects.map(p => 
        p.id === state.activeProjectId 
          ? { ...p, status: p.status === 'active' ? 'paused' : 'active' } 
          : { ...p, status: 'paused' }
      )
    };
    saveState(newState);
  };

  const takeScreenshot = async () => {
    if (!state.activeProjectId || !state.settings) return;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      const dataUrl = await chrome.tabs.captureVisibleTab();
      await notionService.saveScreenshot(state.activeProjectId, dataUrl, state.settings);
      // Show success feedback
    } catch (err: any) {
      setError("Failed to capture screenshot: " + err.message);
    }
  };

  const activeProject = state.projects.find(p => p.id === state.activeProjectId);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-[360px] h-[500px] bg-white text-zinc-900 flex flex-col font-sans overflow-hidden shadow-xl">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center space-x-2">
          <div className="bg-zinc-900 p-1.5 rounded-lg">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-semibold text-sm tracking-tight">Reading Logs</h1>
        </div>
        <div className="flex space-x-1">
          <TabButton 
            active={activeTab === 'active'} 
            onClick={() => setActiveTab('active')} 
            icon={<Clock className="w-4 h-4" />} 
          />
          <TabButton 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')} 
            icon={<Plus className="w-4 h-4" />} 
          />
          <TabButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={<SettingsIcon className="w-4 h-4" />} 
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Notion Setup</h2>
                <p className="text-xs text-zinc-500">Connect your workspace to save progress.</p>
              </div>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Integration Token</label>
                  <input 
                    name="token" 
                    type="password" 
                    defaultValue={state.settings?.token}
                    placeholder="secret_..."
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Database ID</label>
                  <input 
                    name="databaseId" 
                    type="text" 
                    defaultValue={state.settings?.databaseId}
                    placeholder="32-char ID"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  Save Configuration
                </button>
              </form>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  <strong>How to get these?</strong> Create an integration at <a href="https://notion.so/my-integrations" target="_blank" className="underline">notion.so/my-integrations</a>, then share your database with that integration.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div 
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">New Project</h2>
                  <p className="text-xs text-zinc-500">Start tracking a new book or blog.</p>
                </div>
                <div className="flex space-x-2">
                  <input 
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    placeholder="e.g. Atomic Habits"
                    className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  />
                  <button 
                    onClick={handleCreateProject}
                    disabled={isCreating || !newProjectTitle.trim()}
                    className="p-2 bg-zinc-900 text-white rounded-lg disabled:bg-zinc-200 transition-colors"
                  >
                    {isCreating ? <Clock className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Recent Projects</label>
                <div className="space-y-2">
                  {state.projects.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-zinc-100 rounded-xl">
                      <p className="text-xs text-zinc-400">No projects yet.</p>
                    </div>
                  ) : (
                    state.projects.map(project => (
                      <button 
                        key={project.id}
                        onClick={() => {
                          saveState({ ...state, activeProjectId: project.id });
                          setActiveTab('active');
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                          state.activeProjectId === project.id 
                            ? "bg-zinc-900 border-zinc-900 text-white shadow-md" 
                            : "bg-white border-zinc-100 hover:border-zinc-300"
                        )}
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium truncate max-w-[180px]">{project.title}</p>
                          <p className={cn("text-[10px]", state.activeProjectId === project.id ? "text-zinc-400" : "text-zinc-500")}>
                            {formatTime(project.totalTime)} spent
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'active' && (
            <motion.div 
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col items-center justify-center space-y-8 py-4"
            >
              {!activeProject ? (
                <div className="text-center space-y-4">
                  <div className="bg-zinc-50 p-4 rounded-full inline-block">
                    <BookOpen className="w-8 h-8 text-zinc-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">No active project</p>
                    <p className="text-xs text-zinc-400">Select or create one to start tracking.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('projects')}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium"
                  >
                    Go to Projects
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold tracking-tight">{activeProject.title}</h2>
                    <div className="flex items-center justify-center space-x-2 text-zinc-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-mono">{formatTime(activeProject.totalTime)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={toggleTimer}
                      className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg",
                        activeProject.status === 'active' 
                          ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" 
                          : "bg-zinc-900 text-white hover:bg-zinc-800"
                      )}
                    >
                      {activeProject.status === 'active' ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                    
                    <button 
                      onClick={takeScreenshot}
                      className="w-14 h-14 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm"
                      title="Capture Screenshot"
                    >
                      <Camera className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                    <div className="flex items-center space-x-2 text-zinc-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Quick Tips</span>
                    </div>
                    <ul className="text-[11px] text-zinc-600 space-y-1.5 leading-relaxed">
                      <li>• Highlight text and right-click to save to Notion.</li>
                      <li>• Timer runs in background until you hit pause.</li>
                      <li>• Screenshots are appended to the project page.</li>
                    </ul>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="absolute bottom-6 left-6 right-6 bg-red-50 border border-red-100 p-3 rounded-lg flex items-start space-x-2 animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
            <p className="text-[10px] text-red-700 leading-tight">{error}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-zinc-100 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full", state.settings ? "bg-green-500" : "bg-red-500")} />
          <span className="text-[10px] text-zinc-400 font-medium">
            {state.settings ? "Notion Connected" : "Notion Disconnected"}
          </span>
        </div>
        <button 
          onClick={() => {
            if (confirm("Clear all local data?")) {
              chrome.storage.local.clear();
              window.location.reload();
            }
          }}
          className="text-[10px] text-zinc-300 hover:text-red-400 transition-colors"
        >
          Reset App
        </button>
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg transition-all",
        active ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
      )}
    >
      {icon}
    </button>
  );
}
