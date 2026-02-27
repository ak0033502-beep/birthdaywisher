import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/wish/'], // Do not index people's private generated wishes
        },
        sitemap: 'https://birthdaywisher.fun/sitemap.xml',
    }
}
