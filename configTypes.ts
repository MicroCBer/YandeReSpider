import { Destination } from "./destination/interface";
import { Scraper } from "./scraper/interface";

export interface Config {
    maxParallelDownloads: number;
    scrapers: {
        [key: string]: Scraper
    },
    destinations: {
        [key: string]: Destination
    },
    scrapeInterval: number;
}