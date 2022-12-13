import { Vue } from 'vue-class-component';
import { TGFile } from "@/logic/models";
export default class FileView extends Vue {
    f: TGFile;
    hasHead: boolean;
    fileThumbClick(): void;
    play(): TGFile;
    get shouldDisplayDetail(): boolean;
    get isAudioOrVoice(): boolean;
    get fileTitle(): string | undefined;
    get duration(): string;
    get size(): string;
}
