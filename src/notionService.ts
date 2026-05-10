import { NotionSettings, Project } from './types';

// Keep in sync with Notion's latest stable API version.
const NOTION_VERSION = '2026-03-11';

type NotionFetchOptions = RequestInit & {
  // When omitted, Content-Type is inferred:
  // - string body => application/json (default)
  // - FormData/Blob/etc => no explicit Content-Type (fetch sets it when needed)
  contentType?: string | null;
};

async function notionFetchUrl(url: string, settings: NotionSettings, options: NotionFetchOptions = {}) {
  const { contentType, headers: userHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${settings.token}`,
    'Notion-Version': NOTION_VERSION,
    ...(userHeaders as Record<string, string> | undefined),
  };

  if (typeof contentType === 'string') {
    headers['Content-Type'] = contentType;
  } else if (contentType === undefined) {
    if (typeof rest.body === 'string' && !('Content-Type' in headers)) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(url, {
    ...rest,
    headers,
  });

  if (!response.ok) {
    let message = `Notion API error (${response.status})`;
    try {
      const error = await response.json();
      message = error?.message || message;
    } catch {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch {
        // ignore
      }
    }
    throw new Error(message);
  }

  return response.json();
}

async function notionFetch(endpoint: string, settings: NotionSettings, options: NotionFetchOptions = {}) {
  return notionFetchUrl(`https://api.notion.com/v1${endpoint}`, settings, options);
}

export const notionService = {
  async createProject(title: string, settings: NotionSettings): Promise<Project> {
    const data = await notionFetch('/pages', settings, {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: settings.databaseId },
        properties: {
          Name: {
            title: [{ text: { content: title } }],
          },
        },
      }),
    });

    return {
      id: data.id,
      title,
      totalTime: 0,
      status: 'paused',
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
              rich_text: [{ type: 'text', text: { content: text } }],
            },
          },
        ],
      }),
    });
  },

  async saveScreenshot(pageId: string, imageDataUrl: string, settings: NotionSettings) {
    // Direct upload flow (Notion-Version: 2026-03-11+):
    // 1) Create a file_upload
    // 2) Send file contents (multipart/form-data) to upload_url
    // 3) Attach as an image block referencing the file_upload id

    const blob = await fetch(imageDataUrl).then((r) => r.blob());
    const contentType = blob.type || 'image/png';
    const extension = contentType.split('/')[1] || 'png';
    const filename = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;

    const fileUpload = await notionFetch('/file_uploads', settings, {
      method: 'POST',
      body: JSON.stringify({
        mode: 'single_part',
        filename,
        content_type: contentType,
      }),
    });

    const formData = new FormData();
    formData.append('file', blob, filename);

    // Send file upload expects multipart/form-data; do not set Content-Type manually.
    await notionFetchUrl(fileUpload.upload_url, settings, {
      method: 'POST',
      body: formData,
      contentType: null,
    });

    return notionFetch(`/blocks/${pageId}/children`, settings, {
      method: 'PATCH',
      body: JSON.stringify({
        children: [
          {
            type: 'image',
            image: {
              caption: [],
              type: 'file_upload',
              file_upload: { id: fileUpload.id },
            },
          },
        ],
      }),
    });
  },
};
