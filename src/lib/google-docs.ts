/**
 * Google Docs Blog Integration
 * 
 * Fetches blog posts from a Google Drive folder containing Google Docs.
 * - Title: Document filename
 * - Slug: Slugified document filename  
 * - Description: First paragraph of document
 * - Content: Rest of document as HTML
 * - Images: Downloaded locally during build
 */

import { google } from 'googleapis';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

// ============================================
// Types
// ============================================
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  modifiedAt: string;
  metadata: {
    author: { name: string; url?: string };
    image?: { url: string; alt: string };
    category: string;
  };
}

interface GoogleDocFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  mimeType: string;
}

// ============================================
// Configuration
// ============================================
const FOLDER_ID = import.meta.env.GOOGLE_DRIVE_FOLDER_ID || '1F9674HEl0LOYty3mO241oRIWdxWHJS83';
const IMAGES_DIR = path.join(process.cwd(), 'public/blog/images');
const CACHE_DIR = path.join(process.cwd(), '.cache/google-docs');

console.log('[Google Docs] Configuration loaded:');
console.log('[Google Docs]   FOLDER_ID:', FOLDER_ID);
console.log('[Google Docs]   Has GOOGLE_CLIENT_EMAIL:', !!import.meta.env.GOOGLE_CLIENT_EMAIL);
console.log('[Google Docs]   Has PRIVATE_KEY:', !!import.meta.env.GOOGLE_PRIVATE_KEY);

// ============================================
// Authentication
// ============================================
function getAuthClient() {
  console.log('[Google Docs] Creating auth client...');
  
  const email = import.meta.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = import.meta.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  console.log('[Google Docs]   Email:', email ? email.slice(0, 20) + '...' : 'MISSING');
  console.log('[Google Docs]   Private Key length:', privateKey?.length || 0);
  
  if (!email || !privateKey) {
    console.error('[Google Docs] ❌ Missing Google service account credentials!');
    console.error('[Google Docs]   GOOGLE_CLIENT_EMAIL:', email ? 'set' : 'MISSING');
    console.error('[Google Docs]   GOOGLE_PRIVATE_KEY:', privateKey ? 'set' : 'MISSING');
    return null;
  }
  
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: email,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    console.log('[Google Docs] ✓ Auth client created successfully');
    return auth;
  } catch (error) {
    console.error('[Google Docs] ❌ Failed to create auth client:', error);
    return null;
  }
}

// ============================================
// Utilities
// ============================================
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function hashUrl(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
}

// ============================================
// Image Handling
// ============================================
async function downloadImage(imageUrl: string, slug: string): Promise<string> {
  ensureDir(IMAGES_DIR);
  
  try {
    const hash = hashUrl(imageUrl);
    const extension = imageUrl.includes('.png') ? 'png' : 'jpg';
    const filename = `${slug}-${hash}.${extension}`;
    const localPath = path.join(IMAGES_DIR, filename);
    const publicPath = `/blog/images/${filename}`;
    
    // Check if already downloaded
    if (fs.existsSync(localPath)) {
      return publicPath;
    }
    
    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn(`Failed to download image: ${imageUrl}`);
      return imageUrl; // Return original URL as fallback
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(localPath, buffer);
    
    return publicPath;
  } catch (error) {
    console.warn('Error downloading image:', error);
    return imageUrl;
  }
}

// ============================================
// HTML Parsing & Cleaning
// ============================================
function cleanGoogleDocsHtml(html: string): { 
  content: string;
  firstImage?: string;
} {
  // Remove Google Docs wrapper styles and scripts
  let cleanHtml = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '')
    .replace(/class="[^"]*"/gi, '') // Remove class attributes
    .replace(/style="[^"]*"/gi, '') // Remove inline styles
    .replace(/id="[^"]*"/gi, '') // Remove id attributes
    .replace(/<span[^>]*>/gi, '') // Remove span tags
    .replace(/<\/span>/gi, '')
    .replace(/<a[^>]*name="[^"]*"[^>]*><\/a>/gi, '') // Remove empty anchor tags
    .replace(/&nbsp;/g, ' ')
    .trim();
  
  // Find first image for featured image
  let firstImage: string | undefined;
  const imgMatch = cleanHtml.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
  if (imgMatch) {
    firstImage = imgMatch[1];
  }
  
  // Add centering class to all images
  cleanHtml = cleanHtml.replace(/<img([^>]*)>/gi, '<img$1 class="blog-image">');
  
  // Clean up remaining HTML
  cleanHtml = cleanHtml
    .replace(/<p[^>]*>\s*<\/p>/gi, '') // Remove empty paragraphs
    .replace(/<div[^>]*>\s*<\/div>/gi, '') // Remove empty divs
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>') // Convert double br to paragraphs
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return { content: cleanHtml, firstImage };
}

// ============================================
// Process Images in Content
// ============================================
async function processContentImages(content: string, slug: string): Promise<string> {
  const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/gi;
  let processedContent = content;
  let match;
  
  const replacements: Array<{ original: string; replacement: string }> = [];
  
  while ((match = imgRegex.exec(content)) !== null) {
    const [fullMatch, src] = match;
    
    // Download Google-hosted images
    if (src.includes('googleusercontent.com') || src.includes('google.com')) {
      const localPath = await downloadImage(src, slug);
      const newImgTag = fullMatch.replace(src, localPath);
      replacements.push({ original: fullMatch, replacement: newImgTag });
    }
  }
  
  // Apply replacements
  for (const { original, replacement } of replacements) {
    processedContent = processedContent.replace(original, replacement);
  }
  
  return processedContent;
}

// ============================================
// Main API Functions
// ============================================

/**
 * Fetch all blog posts from Google Drive folder
 */
export async function fetchAllPosts(): Promise<BlogPost[]> {
  console.log('[Google Docs] fetchAllPosts() called');
  
  const auth = getAuthClient();
  if (!auth) {
    console.error('[Google Docs] ❌ No auth client - returning empty posts');
    return [];
  }
  
  try {
    console.log('[Google Docs] Creating Drive client...');
    const drive = google.drive({ version: 'v3', auth });
    
    console.log('[Google Docs] Listing files in folder:', FOLDER_ID);
    const query = `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`;
    console.log('[Google Docs] Query:', query);
    
    // List all Google Docs in the folder
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, createdTime, modifiedTime, mimeType)',
      orderBy: 'modifiedTime desc',
    });
    
    const files = (response.data.files || []) as GoogleDocFile[];
    console.log(`[Google Docs] ✓ Found ${files.length} documents in folder`);
    
    if (files.length > 0) {
      console.log('[Google Docs] Files found:');
      files.forEach((f, i) => console.log(`[Google Docs]   ${i + 1}. ${f.name} (${f.id})`));
    } else {
      console.log('[Google Docs] ⚠️ No documents found. Check:');
      console.log('[Google Docs]   1. Folder ID is correct');
      console.log('[Google Docs]   2. Service account has access to the folder');
      console.log('[Google Docs]   3. Folder contains Google Docs (not Word files)');
    }
    
    // Fetch content for each document
    const posts: BlogPost[] = [];
    
    for (const file of files) {
      try {
        console.log(`[Google Docs] Fetching content for: ${file.name}`);
        const post = await fetchPostById(file.id, file);
        if (post) {
          posts.push(post);
          console.log(`[Google Docs] ✓ Successfully loaded: ${file.name}`);
        }
      } catch (error) {
        console.error(`[Google Docs] ❌ Error fetching post ${file.name}:`, error);
      }
    }
    
    console.log(`[Google Docs] ✓ Total posts loaded: ${posts.length}`);
    return posts;
  } catch (error: any) {
    console.error('[Google Docs] ❌ Error fetching posts from Google Drive:');
    console.error('[Google Docs]   Message:', error?.message || error);
    if (error?.response?.data) {
      console.error('[Google Docs]   API Error:', JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
}

/**
 * Fetch a single post by document ID
 */
export async function fetchPostById(docId: string, fileInfo?: GoogleDocFile): Promise<BlogPost | null> {
  const auth = getAuthClient();
  if (!auth) return null;
  
  try {
    const drive = google.drive({ version: 'v3', auth });
    
    // Get file metadata if not provided
    if (!fileInfo) {
      const fileResponse = await drive.files.get({
        fileId: docId,
        fields: 'id, name, createdTime, modifiedTime',
      });
      fileInfo = fileResponse.data as GoogleDocFile;
    }
    
    // Export document as HTML
    const exportResponse = await drive.files.export({
      fileId: docId,
      mimeType: 'text/html',
    });
    
    const html = exportResponse.data as string;
    const slug = slugify(fileInfo.name);
    
    // Parse and clean HTML (all content, no title/description extraction)
    const { content, firstImage } = cleanGoogleDocsHtml(html);
    
    // Process images in content (download locally)
    const processedContent = await processContentImages(content, slug);
    
    // Download featured image if exists
    let featuredImage: { url: string; alt: string } | undefined;
    if (firstImage) {
      const localImagePath = await downloadImage(firstImage, slug);
      featuredImage = {
        url: localImagePath,
        alt: fileInfo.name,
      };
    }
    
    const post: BlogPost = {
      id: docId,
      slug,
      title: fileInfo.name, // Title from filename
      description: '', // No description
      content: processedContent,
      publishedAt: fileInfo.createdTime, // Creation date of the doc
      modifiedAt: fileInfo.modifiedTime,
      metadata: {
        author: { name: 'Anavi' },
        image: featuredImage,
        category: 'Notes',
      },
    };
    
    return post;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    return null;
  }
}

/**
 * Fetch a single post by slug
 */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchAllPosts();
  return posts.find(p => p.slug === slug) || null;
}
