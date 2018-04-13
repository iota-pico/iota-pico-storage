[@iota-pico/storage](../README.md) > [StorageClient](../classes/storageclient.md)



# Class: StorageClient


Default implementation of the StorageClient.

## Implements

* [IStorageClient](../interfaces/istorageclient.md)

## Index

### Constructors

* [constructor](storageclient.md#constructor)


### Methods

* [load](storageclient.md#load)
* [save](storageclient.md#save)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new StorageClient**(transactionClient: *`ITransactionClient`*, logger?: *`ILogger`*): [StorageClient](storageclient.md)


*Defined in storage/storageClient.ts:24*



Create a new instance of the StorageClient.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| transactionClient | `ITransactionClient`   |  A transaction client to perform tangle operations. |
| logger | `ILogger`   |  Logger to send storage info to. |





**Returns:** [StorageClient](storageclient.md)

---


## Methods
<a id="load"></a>

###  load

► **load**(ids: *`Hash`[]*): `Promise`.<[StorageItem](storageitem.md)[]>



*Implementation of [IStorageClient](../interfaces/istorageclient.md).[load](../interfaces/istorageclient.md#load)*

*Defined in storage/storageClient.ts:74*



Load the data stored with the given bundle hash ids.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ids | `Hash`[]   |  The ids of the items to load. |





**Returns:** `Promise`.<[StorageItem](storageitem.md)[]>
The items stored at the hashes.






___

<a id="save"></a>

###  save

► **save**(address: *`Address`*, data: *`Trytes`*, tag?: *`Tag`*): `Promise`.<`Hash`>



*Implementation of [IStorageClient](../interfaces/istorageclient.md).[save](../interfaces/istorageclient.md#save)*

*Defined in storage/storageClient.ts:43*



Save an item of data on the address.


**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| address | `Address`  | - |   The address to store the item. |
| data | `Trytes`  | - |   The data to store. |
| tag | `Tag`  |  Tag.EMPTY |   Tag to label the data with. |





**Returns:** `Promise`.<`Hash`>
The id of the item saved.






___


