export type MediaType = "audio_file" | "animation" | "video_file" | "sticker" | "voice_message";
export interface Image {
    url: string;
    width: number;
    height: number;
}
export interface TGFile {
    url: string;
    mime_type: string;
    media_type?: MediaType;
    size: number;
    thumb?: string;
    duration?: number;
    width?: number;
    height?: number;
    sticker_emoji?: string;
    title?: string;
    performer?: string;
}
export interface Post {
    id: number;
    date: string;
    text?: string;
    forwarded_from?: string;
    type?: string;
    views?: string;
    author?: string;
    reply?: {
        id: number;
        text: string;
        thumb?: string;
    };
    images?: Image[];
    files?: TGFile[];
}
