import { Telegraf } from "telegraf";
import { UploadImage } from "./interface";

const toTag = name => {
    // replace any symbol to · except _
    name = name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_]/g, "·");

    // add l if the first char is number
    if (/[0-9]/.test(name[0])) name = "l" + name;

    return '#' + name;
}

export class TelegramDestination {
    botToken: string;
    channel: string;
    enableSpoiler: boolean;
    generateCaption: (img: UploadImage) => string;
    disableNotification: boolean;
    bot: Telegraf;
    asFile: boolean;

    constructor({
        botToken,
        channel,
        enableSpoiler = true,
        generateCaption = (img) => {
            return `<b><i>From</i></b> ${img.scraper}\n<b><i>Tags</i></b> ${img.tags.map(toTag).join(' ')}`;
        },
        disableNotification = true,
        asFile = false
    }: {
        botToken: string,
        channel: string,
        enableSpoiler?: boolean,
        generateCaption?: (img: UploadImage) => string,
        disableNotification?: boolean,
        asFile?: boolean
    }) {
        this.botToken = botToken;
        this.channel = channel;
        this.enableSpoiler = enableSpoiler;
        this.generateCaption = generateCaption;
        this.disableNotification = disableNotification;
        this.bot = new Telegraf(this.botToken);
        this.asFile = asFile;
    }

    async upload(img: UploadImage) {
        const caption = this.generateCaption(img);
        if (this.asFile) {
            await this.bot.telegram.sendDocument(this.channel, { source: Buffer.from(img.data), filename: `${img.scraper}-${img.id}-${img.width}x${img.height}.${img.ext}` }, {
                caption,
                parse_mode: 'HTML',
                disable_notification: this.disableNotification
            });
        } else {
            await this.bot.telegram.sendPhoto(this.channel, { source: Buffer.from(img.data) }, {
                caption,
                parse_mode: 'HTML',
                disable_notification: this.disableNotification,
                has_spoiler: this.enableSpoiler
            });
        }
    }
}