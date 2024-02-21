export interface Destination {
    upload(img: UploadImage): Promise<void>;
}

export interface UploadImage {
    id: string;
    tags: string[];
    data: ArrayBuffer;
    width: number;
    height: number;
    ext: string;
    scraper: string
}