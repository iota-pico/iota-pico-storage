import { Hash } from "@iota-pico/data/dist/data/hash";
import { Trytes } from "@iota-pico/data/dist/data/trytes";

/**
 * Class to maintain an item stored on the tangle.
 */
export class StorageItem {
    public id: Hash;
    public data: Trytes;
    public attachmentTimestamp: number;

    constructor(id: Hash, data: Trytes, attachmentTimestamp: number) {
        this.id = id;
        this.data = data;
        this.attachmentTimestamp = attachmentTimestamp;
    }
}
