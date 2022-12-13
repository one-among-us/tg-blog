import { Vue } from 'vue-class-component';
import { Image, Post } from "@/logic/models";
export default class PostView extends Vue {
    p: Post;
    postsUrl: string;
    get text(): string | undefined;
    getImageStyle(post: Post, i: Image): object;
    clickReply(): void;
    mounted(): void;
    replaceUrl(url: string): string;
    /**
     * Initialize custom emojis
     */
    initEmoji(): void;
}
