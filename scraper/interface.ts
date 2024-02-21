export interface ScraperImage {
    tags: string[];
    fetch(): Promise<ArrayBuffer>;
    id: string;
    width: number;
    height: number;
    ext: string;
}

export interface Scraper {
    fetch(page: number, ctx: ScraperContext): Promise<ScraperImage[]>;
}

export interface ScraperContext {
    database: ReturnType<typeof import('levelup')>;
}