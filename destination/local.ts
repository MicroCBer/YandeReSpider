import { writeFile } from "fs/promises";
import { Destination, UploadImage } from "./interface";

export class LocalDestination implements Destination {
    constructor(private path: string) { }
    async upload(img: UploadImage) {
        const { id, scraper, data, ext } = img;
        console.log(`Saving ${id} to ${this.path}`);
        writeFile(`${this.path}/${scraper}-${id}.${ext}`, Buffer.from(data));
    }
}