import { Vue } from 'vue-class-component';
import { Post, TGFile } from "@/logic/models";
export default class TgBlog extends Vue {
    posts: Post[];
    postsUrl: string;
    audio?: TGFile;
    fail: string;
    get audios(): TGFile[];
    audioNext(off: number): void;
    replaceUrl(url: string): string;
    created(): void;
    updated(): void;
}
