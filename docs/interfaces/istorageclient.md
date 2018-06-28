[@iota-pico/storage](../README.md) > [IStorageClient](../interfaces/istorageclient.md)

# Interface: IStorageClient

Represents a client for performing storage operations.
*__interface__*: 

## Hierarchy

**IStorageClient**

## Implemented by

* [StorageClient](../classes/storageclient.md)

## Index

### Methods

* [load](istorageclient.md#load)
* [save](istorageclient.md#save)

---

## Methods

<a id="load"></a>

###  load

▸ **load**(ids: *`Hash`[]*): `Promise`<[StorageItem](../classes/storageitem.md)[]>

*Defined in [interfaces/IStorageClient.ts:26](https://github.com/iota-pico/storage/tree/master/src/interfaces/IStorageClient.ts#L26*

Load the data stored with the given bundle hash ids.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ids | `Hash`[] |  The ids of the items to load. |

**Returns:** `Promise`<[StorageItem](../classes/storageitem.md)[]>
The items stored at the hashes.

___
<a id="save"></a>

###  save

▸ **save**(address: *`Address`*, data: *`Trytes`*, tag?: *`Tag`*): `Promise`<[StorageItem](../classes/storageitem.md)>

*Defined in [interfaces/IStorageClient.ts:19](https://github.com/iota-pico/storage/tree/master/src/interfaces/IStorageClient.ts#L19*

Save an item of data on the address.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | `Address` |  The address to store the item. |
| data | `Trytes` |  The data to store. |
| `Optional` tag | `Tag` |  Tag to label the data with. |

**Returns:** `Promise`<[StorageItem](../classes/storageitem.md)>
The id of the item saved.

___

