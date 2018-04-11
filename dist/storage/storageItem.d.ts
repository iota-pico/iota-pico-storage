import { Hash } from "@iota-pico/data/dist/data/hash";
import { Tag } from "@iota-pico/data/dist/data/tag";
import { Trytes } from "@iota-pico/data/dist/data/trytes";
/**
 * Class to maintain an item stored on the tangle.
 */
export declare class StorageItem {
    id: Hash;
    data: Trytes;
    tag: Tag;
    attachmentTimestamp: number;
    constructor(id: Hash, data: Trytes, tag: Tag, attachmentTimestamp: number);
}
