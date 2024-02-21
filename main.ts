import levelup from 'levelup'
import leveldown from 'leveldown'
import { existsSync, readFileSync } from 'fs'
import { TaskPool } from './task-pool'
import { config } from "./config"

const db = levelup(leveldown('./database'))

!(async () => {

    const dbW = {
        getJSON: async (...key: (string | number)[]) => JSON.parse((await db.get(key.join('::'))).toString()),
        putJSON: async (value: any, ...key: (string | number)[]) => await db.put(key.join('::'), JSON.stringify(value)),
    }
    const ctx = {
        database: db
    };

    const downloadTaskPool = new TaskPool(5);

    while (1) {
        for (const scraper in config.scrapers) {
            const lastPage = await dbW.getJSON(scraper, 'lastPage').catch(v => 1);
            const inst = config.scrapers[scraper];
            const pageData = await inst.fetch(lastPage, ctx).catch(e => {
                console.error(`Failed to fetch ${scraper} page ${lastPage}`, e);
                return [];
            })

            if (pageData.length === 0) {
                console.log(`No new images found on ${scraper} page ${lastPage}`);
                continue;
            }

            const promises: Promise<void>[] = []

            console.log(`Scraping ${scraper} page ${lastPage}`);
            let failedCount = 0;
            for (const data of pageData) {
                const id = data.id;
                const tags = data.tags;
                const key = [scraper, 'images', id];
                const exists = await dbW.getJSON(...key).catch(v => false);
                if (exists) continue;
                promises.push(downloadTaskPool.add(async () => {
                    console.log(`Downloading ${id}`);
                    const buf = await data.fetch();
                    console.log(`Successfully downloaded ${id}`);
                    for (const dest in config.destinations) {
                        const destInst = config.destinations[dest];
                        console.log(`Uploading ${id} to ${dest}`);
                        await destInst.upload({
                            scraper,
                            id,
                            tags,
                            data: buf,
                            width: data.width,
                            height: data.height,
                            ext: data.ext
                        });
                    }

                    await dbW.putJSON({
                        tags,
                        width: data.width,
                        height: data.height
                    }, ...key);
                }).catch(e => {
                    console.error(`Failed to download ${id}`, e);
                    failedCount++;
                }) as any)
            }

            await Promise.all(promises);

            if (failedCount > 0) {
                console.log(`Failed to download ${failedCount} images, retrying...`);
            } else {
                console.log(`Finished scraping ${scraper} page ${lastPage}`);
                await dbW.putJSON(lastPage + 1, scraper, 'lastPage');
            }
        }

        await new Promise(rs => setTimeout(rs, 1000 * config.scrapeInterval));
    }
})()