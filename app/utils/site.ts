export const SITE_URL = 'https://jaron.sh';
export const SITE_NAME = 'Jaron Pate';
export const SITE_HANDLE = 'jaronpate';

export const DEFAULT_TITLE = "Hey, I'm Jaron.";
// export const DEFAULT_DESCRIPTION = 'Developer. Reformed Rust enjoyer, Golang padawan.';
export const DEFAULT_DESCRIPTION = 'I build software for a living, but also other things.';
export const PERSON_DESCRIPTION =
    'I build software for a living, but also other things. Reformed Rust enjoyer, Golang padawan. Based in Austin, Texas.';

export const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`;

export const personId = `${SITE_URL}/#person`;
export const websiteId = `${SITE_URL}/#website`;

export const personSameAs = [
    'https://github.com/jaronpate',
    'https://www.linkedin.com/in/jaronp/',
] as const;

/** Person node Google expects inline on ProfilePage.mainEntity */
export function personSchema() {
    return {
        '@type': 'Person' as const,
        '@id': personId,
        name: SITE_NAME,
        alternateName: SITE_HANDLE,
        url: SITE_URL,
        email: 'yo@jp.wtf',
        jobTitle: 'Software Engineer',
        description: PERSON_DESCRIPTION,
        disambiguatingDescription: PERSON_DESCRIPTION,
        givenName: 'Jaron',
        familyName: 'Pate',
        knowsLanguage: 'en-US',
        homeLocation: {
            '@type': 'Place' as const,
            name: 'Austin, TX',
            address: {
                '@type': 'PostalAddress' as const,
                addressLocality: 'Austin',
                addressRegion: 'TX',
                addressCountry: 'US',
            },
        },
        sameAs: [...personSameAs],
        knowsAbout: [
            'Software engineering',
            'Frontend development',
            'Product engineering',
            'Web applications',
            'Developer tools',
            'Golang',
            'Rust',
            'TypeScript',
        ],
    };
}

export function websiteSchema() {
    return {
        '@type': 'WebSite' as const,
        '@id': websiteId,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: 'jaron.sh',
        description: PERSON_DESCRIPTION,
        inLanguage: 'en-US',
        about: { '@id': personId },
        author: { '@id': personId },
        publisher: { '@id': personId },
        image: {
            '@type': 'ImageObject' as const,
            '@id': `${SITE_URL}/#website-image`,
            url: DEFAULT_IMAGE,
            caption: 'Jaron Pate Logo',
        },
    };
}
