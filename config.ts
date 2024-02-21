import { Config } from "./configTypes";
import { LocalDestination } from "./destination/local";
import { TelegramDestination } from "./destination/telegram";
import { YandeScraper } from "./scraper/yande";

export const config: Config = {
    maxParallelDownloads: 5,
    scrapers: {
        yande: new YandeScraper('https://yande.re/'),
        konachan: new YandeScraper('https://konachan.com/')
    },
    destinations: {
        local: new LocalDestination('./images'),
        tg: new TelegramDestination({
            botToken: 'Your Token Here',
            channel: 'Your Channel Here',
            enableSpoiler: true,
        })
    },
    scrapeInterval: 10 * 60 // 10 minutes
}