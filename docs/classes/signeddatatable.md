[@iota-pico/storage](../README.md) > [SignedDataTable](../classes/signeddatatable.md)

# Class: SignedDataTable

Represents a table for storing data with signing.

## Type parameters
#### T 
## Hierarchy

**SignedDataTable**

## Implements

* [IDataTable](../interfaces/idatatable.md)<`T`>

## Index

### Constructors

* [constructor](signeddatatable.md#constructor)

### Methods

* [clearIndex](signeddatatable.md#clearindex)
* [index](signeddatatable.md#index)
* [remove](signeddatatable.md#remove)
* [removeMultiple](signeddatatable.md#removemultiple)
* [retrieve](signeddatatable.md#retrieve)
* [retrieveMultiple](signeddatatable.md#retrievemultiple)
* [setProgressCallback](signeddatatable.md#setprogresscallback)
* [store](signeddatatable.md#store)
* [storeMultiple](signeddatatable.md#storemultiple)
* [update](signeddatatable.md#update)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new SignedDataTable**(storageClient: *[IStorageClient](../interfaces/istorageclient.md)*, configProvider: *[IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md)*, tableName: *`string`*, publicKey: *`string`*, privateKey: *`string`*, logger?: *`ILogger`*): [SignedDataTable](signeddatatable.md)

*Defined in [dataTable/signedDataTable.ts:56](https://github.com/iota-pico/storage/blob/9579284/src/dataTable/signedDataTable.ts#L56)*

Create a new instance of the DataTable.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| storageClient | [IStorageClient](../interfaces/istorageclient.md) |  A storage client to perform storage operations. |
| configProvider | [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md) |  A provider to get the configuration for the table. |
| tableName | `string` |  The name of the table. |
| publicKey | `string` |  The public key to use for platform crypto functions. |
| privateKey | `string` |  The private key to use for platform crypto functions. |
| `Optional` logger | `ILogger` |  Logger to send storage info to. |

**Returns:** [SignedDataTable](signeddatatable.md)

___

## Methods

<a id="clearindex"></a>

###  clearIndex

▸ **clearIndex**(): `Promise`<`void`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[clearIndex](../interfaces/idatatable.md#clearindex)*

*Defined in [dataTable/signedDataTable.ts:131](https://github.com/iota-pico/storage/blob/9579284/src/dataTable/signedDataTable.ts#L131)*

Clear the index for the table.

**Returns:** `Promise`<`void`>

___
<a id="index"></a>

###  index

▸ **index**(): `Promise`<[DataTableIndex](../#datatableindex)>

*Implementation of [IDataTable](../interfaces/idatatable.md).[index](../interfaces/idatatable.md#index)*

*Defined in [dataTable/signedDataTable.ts:85](https://github.com/iota-pico/storage/blob/9579284/src/dataTable/signedDataTable.ts#L85)*

Get the index for the table.

**Returns:** `Promise`<[DataTableIndex](../#datatableindex)>
The table index.

___
<a id="remove"></a>

###  remove

▸ **remove**(id: *`Hash`*): `Promise`<`void`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[remove](../interfaces/idatatable.md#remove)*

*Defined in [dataTable/signedDataTable.ts:363](https://github.com/iota-pico/storage/blob/9579284/src/dataTable/signedDataTable.ts#L363)*

Remove an item of data from the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| id | `Hash` |  The id of the item to remove. |

**Returns:** `Promise`<`void`>

___
<a id="removemultiple"></a>

###  removeMultiple

▸ **removeMultiple**(ids: *`Hash`[]*): `Promise`<`void`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[removeMultiple](../interfaces/idatatable.md#removemultiple)*

*Defined in [dataTable/signedDataTable.ts:386](https://github.com/iota-pico/storage/blob/9579284/src/dataTable/signedDataTable.ts#L386)*

Remove multiple items of data from the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ids | `Hash`[] |  The ids of the items to remove. |

**Returns:** `Promise`<`void`>

___
<a id="retrieve"></a>

###  retrieve

▸ **retrieve**(id: *`Hash`*): `Promise`<`T`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[retrieve](../interfaces/idatatable.md#retrieve)*

*Defined in [dataTable/signedDataTable.ts:288](https://github.com/iota-pico/storage/blob/9579284/src/dataTable/signedDataTable.ts#L288)*

Retrieve the data stored in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| id | `Hash` |  Id of the item to retrieve. |

**Returns:** `Promise`<`T`>
The item stored in the table.

___
<a id="retrievemultiple"></a>

###  retrieveMultiple

▸ **retrieveMultiple**(ids?: *`Hash`[]*): `Promise`<`T`[]>

*Implementation of [IDataTable](../interfaces/idatatable.md).[retrieveMultiple](../interfaces/idatatable.md#retrievemultiple)*

*Defined in [dataTable/signedDataTable.ts:320](https://github.com/iota-pico/storage/blob/9579284/src/dataTable/signedDataTable.ts#L320)*

Retrieve all the data stored in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` ids | `Hash`[] |  Ids of all the items to retrieve, if empty will retrieve all items from index. |

**Returns:** `Promise`<`T`[]>
The items stored in the table.

___
<a id="setprogresscallback"></a>

###  setProgressCallback

▸ **setProgressCallback**(progressCallback: *`function`*): `void`

*Defined in [dataTable/signedDataTable.ts:419](https://github.com/iota-pico/storage/blob/9579284/src/dataTable/signedDataTable.ts#L419)*

Set the progress callback.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| progressCallback | `function` |  Callback supplied with progress details. |

**Returns:** `void`

___
<a id="store"></a>

###  store

▸ **store**(data: *`T`*, tag?: *`Tag`*): `Promise`<`Hash`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[store](../interfaces/idatatable.md#store)*

*Defined in [dataTable/signedDataTable.ts:145](https://github.com/iota-pico/storage/blob/9579284/src/dataTable/signedDataTable.ts#L145)*

Store an item of data in the table.

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| data | `T` | - |  The data to store. |
| `Default value` tag | `Tag` |  Tag.EMPTY |  The tag to store with the item. |

**Returns:** `Promise`<`Hash`>
The id of the stored item.

___
<a id="storemultiple"></a>

###  storeMultiple

▸ **storeMultiple**(data: *`T`[]*, tags?: *`Tag`[]*, clearIndex?: *`boolean`*): `Promise`<`Hash`[]>

*Implementation of [IDataTable](../interfaces/idatatable.md).[storeMultiple](../interfaces/idatatable.md#storemultiple)*

*Defined in [dataTable/signedDataTable.ts:188](https://github.com/iota-pico/storage/blob/9579284/src/dataTable/signedDataTable.ts#L188)*

Store multiple items of data in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| data | `T`[] |  The data to store. |
| `Optional` tags | `Tag`[] |  The tag to store with the items. |
| `Optional` clearIndex | `boolean` |  Clear the index so there is no data. |

**Returns:** `Promise`<`Hash`[]>
The ids of the stored items.

___
<a id="update"></a>

###  update

▸ **update**(originalId: *`Hash`*, data: *`T`*, tag?: *`Tag`*): `Promise`<`Hash`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[update](../interfaces/idatatable.md#update)*

*Defined in [dataTable/signedDataTable.ts:241](https://github.com/iota-pico/storage/blob/9579284/src/dataTable/signedDataTable.ts#L241)*

Update an item of data in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| originalId | `Hash` |  The id of the item to update. |
| data | `T` |  The data to update. |
| `Optional` tag | `Tag` |  The tag to store with the item. |

**Returns:** `Promise`<`Hash`>
The id of the updated item.

___

