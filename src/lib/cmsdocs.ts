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
    image: {
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

export async function fetchPublishedPosts(): Promise<Post[]> {
  const posts: Post[] = [fallbackPost];
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
    return data ?? null;
  } catch (err) {
    console.error('[fetchPostBySlug] error', err);
    return null;
  }
}

export { BASE_URL };

