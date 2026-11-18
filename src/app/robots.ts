import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

const PRIVATE_PATHS = ['/api/', '/admin', '/wish/', '/w/', '/dashboard/']

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/llms.txt'],
                disallow: PRIVATE_PATHS,
            },
            {
                userAgent: [
                    'Googlebot',
                    'Google-Extended',
                    'Bingbot',
                    'OAI-SearchBot',
                    'ChatGPT-User',
                    'GPTBot',
                    'PerplexityBot',
                    'ClaudeBot',
                    'Applebot-Extended',
                ],
                allow: ['/', '/llms.txt'],
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
