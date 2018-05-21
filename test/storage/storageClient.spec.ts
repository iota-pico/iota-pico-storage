/**
 * Tests for StorageClient.
 */
import { ITransactionClient } from "@iota-pico/business/dist/interfaces/ITransactionClient";
import * as chai from "chai";
import { StorageClient } from "../../src/storage/storageClient";

describe("StorageClient", () => {
    let transactionClientStub: ITransactionClient;

    beforeEach(() => {
        transactionClientStub = <ITransactionClient>{};
    });

    it("can be created", () => {
        const obj = new StorageClient(transactionClientStub);
        chai.should().exist(obj);
    });
});
