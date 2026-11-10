import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// lastModified must reflect real content changes. A new Date() on every build
// teaches Google to ignore the field. Update a date only when that page's content changes.
const pages: Array<{ path: string; lastModified: string; changeFrequency: 'weekly' | 'monthly' | 'yearly'; priority: number }> = [
    { path: '', lastModified: '2026-11-09', changeFrequency: 'weekly', priority: 1 },
    { path: '/create', lastModified: '2026-11-09', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/anniversary', lastModified: '2026-11-09', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/blog', lastModified: '2026-03-07', changeFrequency: 'weekly', priority: 0.8 },

    // Games
    { path: '/birthday-wishes-game', lastModified: '2026-11-10', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/games/blow-the-candles', lastModified: '2026-11-10', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/games/birthday-prank-link', lastModified: '2026-11-10', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/games/birthday-quiz', lastModified: '2026-11-10', changeFrequency: 'monthly', priority: 0.8 },

    // Use cases
    { path: '/use-cases/unique-birthday-gift-online', lastModified: '2026-03-07', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/use-cases/digital-story-greeting-card', lastModified: '2026-03-07', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/use-cases/boyfriend-birthday-surprise', lastModified: '2026-03-07', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/use-cases/girlfriend-birthday-surprise', lastModified: '2026-03-07', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/use-cases/anniversary-wishes-for-couple', lastModified: '2026-03-07', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/use-cases/long-distance-birthday-surprise', lastModified: '2026-03-07', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/use-cases/colleague-birthday-wish', lastModified: '2026-03-07', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/use-cases/parents-birthday-surprise', lastModified: '2026-03-07', changeFrequency: 'monthly', priority: 0.9 },

    // Blog posts (dates = publish dates shown on each post)
    { path: '/blog/top-50-heart-touching-birthday-wishes-for-best-friend', lastModified: '2024-10-24', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/romantic-birthday-surprise-ideas-for-boyfriend', lastModified: '2024-10-15', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/how-to-create-a-gamified-birthday-card', lastModified: '2024-10-05', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/best-friend-quotes', lastModified: '2024-10-25', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/romantic-wishes', lastModified: '2024-10-22', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/happy-birthday-wishes-for-sister', lastModified: '2024-11-02', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/birthday-wishes-for-brother', lastModified: '2024-11-05', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/birthday-wishes-for-husband', lastModified: '2024-11-10', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/birthday-wishes-for-wife', lastModified: '2024-11-12', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/funny-birthday-wishes', lastModified: '2024-11-18', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/birthday-wishes-for-mom-dad', lastModified: '2024-11-22', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/wedding-anniversary-wishes-for-couple', lastModified: '2026-03-02', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/birthday-wishes-for-colleague', lastModified: '2026-03-05', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/birthday-wishes-for-crush', lastModified: '2026-03-06', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog/long-distance-birthday-ideas', lastModified: '2026-03-07', changeFrequency: 'monthly', priority: 0.8 },

    // Company / legal
    { path: '/about', lastModified: '2026-03-07', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/contact', lastModified: '2026-03-07', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/privacy', lastModified: '2024-10-01', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', lastModified: '2024-10-01', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/disclaimer', lastModified: '2026-07-01', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/dmca', lastModified: '2026-07-01', changeFrequency: 'yearly', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
    return pages.map((p) => ({
        url: `${SITE_URL}${p.path}`,
        lastModified: new Date(p.lastModified),
        changeFrequency: p.changeFrequency,
        priority: p.priority,
    }))
}
