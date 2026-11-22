import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { INDEXNOW_KEY } from '@/lib/indexNow'

const PRIVATE_PATHS = ['/api/', '/admin', '/wish/', '/w/', '/dashboard/']
const PUBLIC_ALLOW = [
    '/',
    '/llms.txt',
    '/llms-full.txt',
    `/${INDEXNOW_KEY}.txt`,
    '/favicon.ico',
    '/favicon-48x48.png',
    '/favicon-96x96.png',
    '/favicon-144x144.png',
    '/favicon-192x192.png',
    '/icon-512x512.png',
    '/apple-touch-icon.png',
    '/icon.svg',
    '/logo.png',
    '/manifest.webmanifest',
]

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: PUBLIC_ALLOW,
                disallow: PRIVATE_PATHS,
            },
            {
                userAgent: [
                    'Googlebot',
                    'Googlebot-Image',
                    'Google-InspectionTool',
                    'Google-Extended',
                    'Bingbot',
                    'OAI-SearchBot',
                    'ChatGPT-User',
                    'GPTBot',
                    'PerplexityBot',
                    'Perplexity-User',
                    'ClaudeBot',
                    'Claude-Web',
                    'anthropic-ai',
                    'Applebot',
                    'Applebot-Extended',
                    'DuckAssistBot',
                    'Meta-ExternalAgent',
                    'YouBot',
                    'cohere-ai',
                ],
                allow: PUBLIC_ALLOW,
                disallow: PRIVATE_PATHS,
            },
            {
                userAgent: 'Mediapartners-Google',
                allow: '/',
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}
