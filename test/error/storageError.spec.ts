/**
 * Tests for StorageError.
 */
import * as chai from "chai";
import { StorageError } from "../../src/error/storageError";

describe("StorageError", () => {
    it("can be created", () => {
        const obj = new StorageError("message");
        chai.should().exist(obj);
    });
});
