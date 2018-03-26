import { Hash } from "@iota-pico/data/dist/data/hash";
import { Trytes } from "@iota-pico/data/dist/data/trytes";
/**
 * Class to maintain an item stored on the tangle.
 */
export declare class TangleStorageItem {
    id: Hash;
    data: Trytes;
    constructor(id: Hash, data: Trytes);
}
