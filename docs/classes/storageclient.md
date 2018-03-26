[@iota-pico/storage](../README.md) > [StorageClient](../classes/storageclient.md)



# Class: StorageClient


Default implementation of the IStorageClient.

## Implements

* [IStorageClient](../interfaces/istorageclient.md)

## Index

### Constructors

* [constructor](storageclient.md#constructor)


### Methods

* [delete](storageclient.md#delete)
* [retrieve](storageclient.md#retrieve)
* [store](storageclient.md#store)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new StorageClient**(transactionClient: *`ITransactionClient`*, logger?: *`ILogger`*): [StorageClient](storageclient.md)


*Defined in storage/storageClient.ts:15*



Create a new instance of the StorageClient.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| transactionClient | `ITransactionClient`   |  A transaction client to perform tangle operations. |
| logger | `ILogger`   |  Logger to send storage info to. |





**Returns:** [StorageClient](storageclient.md)

---


## Methods
<a id="delete"></a>

###  delete

► **delete**(address: *`Address`*): `Promise`.<`void`>



*Implementation of [IStorageClient](../interfaces/istorageclient.md).[delete](../interfaces/istorageclient.md#delete)*

*Defined in storage/storageClient.ts:55*



Delete the item stored at the address.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | `Address`   |  The address to delete the data. |





**Returns:** `Promise`.<`void`>





___

<a id="retrieve"></a>

###  retrieve

► **retrieve**T(address: *`Address`*): `Promise`.<`T`>



*Implementation of [IStorageClient](../interfaces/istorageclient.md).[retrieve](../interfaces/istorageclient.md#retrieve)*

*Defined in storage/storageClient.ts:44*



Retrieve the data stored at the address.


**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | `Address`   |  The address from which to retrieve the item. |





**Returns:** `Promise`.<`T`>
The item stored at the address.






___

<a id="store"></a>

###  store

► **store**T(address: *`Address`*, data: *`T`*): `Promise`.<`void`>



*Implementation of [IStorageClient](../interfaces/istorageclient.md).[store](../interfaces/istorageclient.md#store)*

*Defined in storage/storageClient.ts:33*



Store an item of data on the address.


**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | `Address`   |  The address to store the item. |
| data | `T`   |  The data to store. |





**Returns:** `Promise`.<`void`>





___


