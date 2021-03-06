[@iota-pico/storage](../README.md) > [StorageClient](../classes/storageclient.md)

# Class: StorageClient

Default implementation of the StorageClient.

## Hierarchy

**StorageClient**

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

###  constructor

⊕ **new StorageClient**(transactionClient: *`ITransactionClient`*, logger?: *`ILogger`*): [StorageClient](storageclient.md)

*Defined in [storage/storageClient.ts:25](https://github.com/iota-pico/storage/tree/master/src/storage/storageClient.ts#L25*

Create a new instance of the StorageClient.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| transactionClient | `ITransactionClient` |  A transaction client to perform tangle operations. |
| `Optional` logger | `ILogger` |  Logger to send storage info to. |

**Returns:** [StorageClient](storageclient.md)

___

## Methods

<a id="load"></a>

###  load

▸ **load**(ids: *`Hash`[]*): `Promise`<[StorageItem](storageitem.md)[]>

*Implementation of [IStorageClient](../interfaces/istorageclient.md).[load](../interfaces/istorageclient.md#load)*

*Defined in [storage/storageClient.ts:81](https://github.com/iota-pico/storage/tree/master/src/storage/storageClient.ts#L81*

Load the data stored with the given bundle hash ids.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| ids | `Hash`[] |  The ids of the items to load. |

**Returns:** `Promise`<[StorageItem](storageitem.md)[]>
The items stored at the hashes.

___
<a id="save"></a>

###  save

▸ **save**(address: *`Address`*, data: *`Trytes`*, tag?: *`Tag`*): `Promise`<[StorageItem](storageitem.md)>

*Implementation of [IStorageClient](../interfaces/istorageclient.md).[save](../interfaces/istorageclient.md#save)*

*Defined in [storage/storageClient.ts:44](https://github.com/iota-pico/storage/tree/master/src/storage/storageClient.ts#L44*

Save an item of data on the address.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| address | `Address` | - |  The address to store the item. |
| data | `Trytes` | - |  The data to store. |
| `Default value` tag | `Tag` |  Tag.EMPTY |  Tag to label the data with. |

**Returns:** `Promise`<[StorageItem](storageitem.md)>
The id of the item saved.

___

