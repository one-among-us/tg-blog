import { Vue } from 'vue-class-component';
import { TGFile } from "@/logic/models";
export default class AudioPlayer extends Vue {
    audio: TGFile;
    playing: HTMLAudioElement;
    duration: string;
    time: string;
    mounted(): void;
    pause(): void;
    play(): void;
    next(): void;
    prev(): void;
    unmounted(): void;
    init(): void;
}
