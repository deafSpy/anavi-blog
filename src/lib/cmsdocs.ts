const BASE_URL = 'https://app.cmsdocs.com';

export interface Post {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  metadata: {
    author: {
      name: string;
      url?: string;
    };
    image?: {
      url: string;
      alt: string;
    };
    publisher: {
      name: string;
      logoUrl: string;
      url: string;
    };
    category: string;
  };
}

export const fallbackPost: Post = {
  slug: 'hello-world',
  title: 'Getting Started',
  description: 'Your first post will appear here',
  content:
    '<h1>Welcome to Your Blog</h1><p>Once you publish your first post, it will appear here automatically.</p><h2>Next Steps</h2><ol><li>Write your content in Google Docs</li><li>Use CMSDocs to publish it</li><li>Your content will appear here!</li></ol>',
  publishedAt: new Date().toISOString(),
  metadata: {
    author: {
      name: 'CMSDocs',
      url: 'https://cmsdocs.com',
    },
    image: {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzRiNTU2MyI+V2VsY29tZSB0byBZb3VyIEJsb2c8L3RleHQ+PC9zdmc+',
      alt: 'Welcome to Your Blog',
    },
    publisher: {
      name: 'Your Blog',
      logoUrl:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg==',
      url: '/',
    },
    category: 'Getting Started',
  },
};

const fallbackPosts: Post[] = [
  fallbackPost,
  {
    slug: 'solar-first-light',
    title: 'Solar First Light',
    description: 'Documenting the first array test for Anavi’s field project.',
    content:
      '<p>Morning haze, borrowed tools, and a checklist scribbled on kraft paper. Today I wired the first panel for the pilot site. We kept cables short to reduce loss, labeled everything with tape, and logged voltages every hour. Field notes like these keep the project honest and scrappy.</p>',
    publishedAt: new Date().toISOString(),
    metadata: {
      author: { name: 'Anavi' },
      image: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMmYzMjRmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMGIxMjFiIi8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9InVybCgjZykiIC8+PC9zdmc+',
        alt: 'Gradient duotone placeholder',
      },
      publisher: {
        name: 'Anavi',
        logoUrl:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZiOTIzYyIvPjwvc3ZnPg==',
        url: '/',
      },
      category: 'Field Notes',
    },
  },
  {
    slug: 'maps-and-people',
    title: 'Maps and People',
    description: 'A quick survey loop to map rooftops and listen before wiring.',
    content:
      '<p>Three kilometers on foot, six rooftop sketches, nine conversations over chai. I learned which homes have the best sun, which alleys flood, and whose courtyard hosts evening study circles. These notes shape the install plan more than any spreadsheet ever will.</p>',
    publishedAt: new Date().toISOString(),
    metadata: {
      author: { name: 'Anavi' },
      image: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJhZGlhbEdyYWRpZW50IGlkPSJnciIgcj0iNzUiIGN4PSI1MCUiIGN5PSI1MCUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzBiMTIxYiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzJmMzI0ZiIvPjwvcmFkaWFsR3JhZGllbnQ+PHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2dyKSIvPjwvc3ZnPg==',
        alt: 'Circular duotone placeholder',
      },
      publisher: {
        name: 'Anavi',
        logoUrl:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2ZiOTIzYyIvPjwvc3ZnPg==',
        url: '/',
      },
      category: 'Listening Tour',
    },
  },
  {
    slug: 'packing-list',
    title: 'Packing List',
    description: 'The lean kit for a week in the field without grid power.',
    content:
      '<p>One headlamp, two battery packs, analog multimeter, canvas roll of drivers, pre-crimped MC4s, a flask, and a paper notebook. I packed light to walk far and repair quickly. Every gram is a question: does it earn its place when networks drop?</p>',
    publishedAt: new Date().toISOString(),
    metadata: {
      author: { name: 'Anavi' },
      image: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGxpbmVhckdyYWRpZW50IGlkPSJnciIgeDE9IjAiIHkxPSIxIiB4Mj0iMSIgeTI9IjAiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzJmMzI0ZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzBiMTIxYiIvPjwvbGluZWFyR3JhZGllbnQ+PHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2dyKSIvPjwvc3ZnPg==',
        alt: 'Diagonal duotone placeholder',
      },
      publisher: {
        name: 'Anavi',
        logoUrl:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cG9seWdvbiBwb2ludHM9IjUwLDAgMTAwLDEwMCAwLDEwMCIgZmlsbD0iI2ZiOTIzYyIvPjwvc3ZnPg==',
        url: '/',
      },
      category: 'Logistics',
    },
  },
];

export async function fetchPublishedPosts(): Promise<Post[]> {
  const posts: Post[] = [...fallbackPosts];
  const projectId = import.meta.env.PROJECT_ID;
  if (!projectId) return posts;

  try {
    const response = await fetch(`${BASE_URL}/api/projects/${projectId}/published/posts`);
    if (!response.ok) return posts;
    const { data } = (await response.json()) as { data?: Post[] };
    if (Array.isArray(data)) {
      posts.push(...data.filter(Boolean));
    }
    return posts;
  } catch (err) {
    console.warn('Failed to fetch posts during build, using fallback', err);
    return posts;
  }
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  if (slug === 'hello-world') return fallbackPost;
  const projectId = import.meta.env.PROJECT_ID;
  if (!projectId) return null;
  try {
    const url = import.meta.env.VERCEL
      ? `${BASE_URL}/api/projects/${projectId}/published/${slug}`
      : `/api/projects/${projectId}/published/${slug}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const { data } = (await response.json()) as { data?: Post };
    if (!data) return null;
    data.metadata = data.metadata ?? {
      author: { name: 'Unknown' },
      image: { url: '', alt: 'Post image' },
      publisher: { name: 'Anavi', logoUrl: '', url: '/' },
      category: 'Notes',
    };
    return data;
  } catch (err) {
    console.error('[fetchPostBySlug] error', err);
    return null;
  }
}

export { BASE_URL };

