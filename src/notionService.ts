import { NotionSettings, Project } from './types';

const NOTION_VERSION = '2022-06-28';

async function notionFetch(endpoint: string, settings: NotionSettings, options: RequestInit = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${settings.token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Notion API error');
  }

  return response.json();
}

export const notionService = {
  async createProject(title: string, settings: NotionSettings): Promise<Project> {
    const data = await notionFetch('/pages', settings, {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: settings.databaseId },
        properties: {
          Name: {
            title: [{ text: { content: title } }]
          }
        }
      }),
    });

    return {
      id: data.id,
      title,
      totalTime: 0,
      status: 'paused'
    };
  },

  async saveHighlight(pageId: string, text: string, settings: NotionSettings) {
    return notionFetch(`/blocks/${pageId}/children`, settings, {
      method: 'PATCH',
      body: JSON.stringify({
        children: [
          {
            object: 'block',
            type: 'quote',
            quote: {
              rich_text: [{ type: 'text', text: { content: text } }]
            }
          }
        ]
      }),
    });
  },

  async saveScreenshot(pageId: string, imageUrl: string, settings: NotionSettings) {
    // Note: Notion API requires a hosted URL for images. 
    // For a simple extension, we'll add a callout or a link if we can't host the base64.
    // However, we can try to use external image blocks if the user has a way to host them.
    // For now, we'll save it as a text block with the data URL or a placeholder.
    return notionFetch(`/blocks/${pageId}/children`, settings, {
      method: 'PATCH',
      body: JSON.stringify({
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: "📸 Screenshot captured (Base64 data attached below as text due to API limits)" } }]
            }
          },
          {
            object: 'block',
            type: 'code',
            code: {
              language: 'text',
              rich_text: [{ type: 'text', text: { content: imageUrl.substring(0, 2000) + "..." } }]
            }
          }
        ]
      }),
    });
  }
};
