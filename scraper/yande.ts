import { Scraper, ScraperImage } from './interface';
export class YandeScraper implements Scraper {
    constructor(private baseUrl = "https://yande.re/") { }
    async fetch(page: number) {
        const res = await fetch(`${this.baseUrl}/post.json?page=${page}`);
        const json = await res.json();
        return json.map((post: any) => {
            return {
                id: post.id,
                tags: post.tags.split(' '),
                fetch: async () => {
                    const res = await fetch(post.file_url);
                    return await res.arrayBuffer();
                },
                width: post.width,
                height: post.height,
                ext: post.file_url.split('.').pop() || 'jpg'
            } as ScraperImage
        });
    }
}