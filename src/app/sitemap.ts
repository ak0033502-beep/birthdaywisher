import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://birthdaywisher.in'

    // Dynamic routes could be fetched from a database here
    const blogPosts = [
        'top-50-heart-touching-birthday-wishes-for-best-friend',
        'romantic-birthday-surprise-ideas-for-boyfriend',
        'how-to-create-a-gamified-birthday-card',
        'best-friend-quotes',
        'romantic-wishes',
        'happy-birthday-wishes-for-sister',
        'birthday-wishes-for-brother',
        'birthday-wishes-for-husband',
        'birthday-wishes-for-wife',
        'funny-birthday-wishes',
        'birthday-wishes-for-mom-dad'
    ];

    const useCases = [
        'unique-birthday-gift-online',
        'digital-story-greeting-card',
        'boyfriend-birthday-surprise',
        'girlfriend-birthday-surprise'
    ];

    const blogUrls = blogPosts.map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const useCaseUrls = useCases.map((slug) => ({
        url: `${baseUrl}/use-cases/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.9,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: `${baseUrl}/create`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        ...useCaseUrls,
        ...blogUrls
    ]
}
