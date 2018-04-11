import { Hash } from "@iota-pico/data/dist/data/hash";
import { Tag } from "@iota-pico/data/dist/data/tag";
import { Trytes } from "@iota-pico/data/dist/data/trytes";

/**
 * Class to maintain an item stored on the tangle.
 */
export class StorageItem {
    public id: Hash;
    public data: Trytes;
    public tag: Tag;
    public attachmentTimestamp: number;

    constructor(id: Hash, data: Trytes, tag: Tag, attachmentTimestamp: number) {
        this.id = id;
        this.data = data;
        this.tag = tag;
        this.attachmentTimestamp = attachmentTimestamp;
    }
}
