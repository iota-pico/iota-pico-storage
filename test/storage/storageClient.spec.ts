/**
 * Tests for StorageClient.
 */
import { ITransactionClient } from "@iota-pico/business/dist/interfaces/ITransactionClient";
import * as chai from "chai";
import * as sinon from "sinon";
import { StorageClient } from "../../src/storage/storageClient";

describe("StorageClient", () => {
    let transactionClientStub: ITransactionClient;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        transactionClientStub = <ITransactionClient>{};
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("can be created", () => {
        const obj = new StorageClient(transactionClientStub);
        chai.should().exist(obj);
    });
});
