[@iota-pico/storage](../README.md) > [DataTable](../classes/datatable.md)

# Class: DataTable

Represents a table for storing data.

## Type parameters
#### T :  [ISignedDataItem](../interfaces/isigneddataitem.md)
## Hierarchy

**DataTable**

## Implements

* [IDataTable](../interfaces/idatatable.md)<`T`>

## Index

### Constructors

* [constructor](datatable.md#constructor)

### Methods

* [clearIndex](datatable.md#clearindex)
* [index](datatable.md#index)
* [remove](datatable.md#remove)
* [removeMultiple](datatable.md#removemultiple)
* [retrieve](datatable.md#retrieve)
* [retrieveMultiple](datatable.md#retrievemultiple)
* [setProgressCallback](datatable.md#setprogresscallback)
* [store](datatable.md#store)
* [storeMultiple](datatable.md#storemultiple)
* [update](datatable.md#update)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new DataTable**(storageClient: *[IStorageClient](../interfaces/istorageclient.md)*, configProvider: *[IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md)*, tableName: *`string`*, privateKey?: *`string`*, logger?: *`ILogger`*): [DataTable](datatable.md)

*Defined in [dataTable/dataTable.ts:47](https://github.com/iota-pico/storage/blob/893ad8d/src/dataTable/dataTable.ts#L47)*

Create a new instance of the DataTable.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| storageClient | [IStorageClient](../interfaces/istorageclient.md) |  A storage client to perform storage operations. |
| configProvider | [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md) |  A provider to get the configuration for the table. |
| tableName | `string` |  The name of the table. |
| `Optional` privateKey | `string` |  Private key to add signature to data. |
| `Optional` logger | `ILogger` |  Logger to send storage info to. |

**Returns:** [DataTable](datatable.md)

___

## Methods

<a id="clearindex"></a>

###  clearIndex

▸ **clearIndex**(retainHistory: *`boolean`*): `Promise`<`void`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[clearIndex](../interfaces/idatatable.md#clearindex)*

*Defined in [dataTable/dataTable.ts:106](https://github.com/iota-pico/storage/blob/893ad8d/src/dataTable/dataTable.ts#L106)*

Clear the index for the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| retainHistory | `boolean` |  Retains the lastIdx value in the index. |

**Returns:** `Promise`<`void`>

___
<a id="index"></a>

###  index

▸ **index**(): `Promise`<[IDataTableIndex](../interfaces/idatatableindex.md)>

*Implementation of [IDataTable](../interfaces/idatatable.md).[index](../interfaces/idatatable.md#index)*

*Defined in [dataTable/dataTable.ts:73](https://github.com/iota-pico/storage/blob/893ad8d/src/dataTable/dataTable.ts#L73)*

Get the index for the table.

**Returns:** `Promise`<[IDataTableIndex](../interfaces/idatatableindex.md)>
The table index.

___
<a id="remove"></a>

###  remove

▸ **remove**(id: *`Hash`*): `Promise`<`void`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[remove](../interfaces/idatatable.md#remove)*

*Defined in [dataTable/dataTable.ts:333](https://github.com/iota-pico/storage/blob/893ad8d/src/dataTable/dataTable.ts#L333)*

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

*Defined in [dataTable/dataTable.ts:357](https://github.com/iota-pico/storage/blob/893ad8d/src/dataTable/dataTable.ts#L357)*

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

*Defined in [dataTable/dataTable.ts:262](https://github.com/iota-pico/storage/blob/893ad8d/src/dataTable/dataTable.ts#L262)*

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

*Defined in [dataTable/dataTable.ts:291](https://github.com/iota-pico/storage/blob/893ad8d/src/dataTable/dataTable.ts#L291)*

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

*Defined in [dataTable/dataTable.ts:389](https://github.com/iota-pico/storage/blob/893ad8d/src/dataTable/dataTable.ts#L389)*

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

*Defined in [dataTable/dataTable.ts:120](https://github.com/iota-pico/storage/blob/893ad8d/src/dataTable/dataTable.ts#L120)*

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

▸ **storeMultiple**(data: *`T`[]*, tags?: *`Tag`[]*, clearIndex?: *`boolean`*, retainHistory?: *`boolean`*): `Promise`<`Hash`[]>

*Implementation of [IDataTable](../interfaces/idatatable.md).[storeMultiple](../interfaces/idatatable.md#storemultiple)*

*Defined in [dataTable/dataTable.ts:163](https://github.com/iota-pico/storage/blob/893ad8d/src/dataTable/dataTable.ts#L163)*

Store multiple items of data in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| data | `T`[] |  The data to store. |
| `Optional` tags | `Tag`[] |  The tag to store with the items. |
| `Optional` clearIndex | `boolean` |  Clear the index so there is no data. |
| `Optional` retainHistory | `boolean` |  Retains the lastIdx value in the index. |

**Returns:** `Promise`<`Hash`[]>
The ids of the stored items.

___
<a id="update"></a>

###  update

▸ **update**(originalId: *`Hash`*, data: *`T`*, tag?: *`Tag`*): `Promise`<`Hash`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[update](../interfaces/idatatable.md#update)*

*Defined in [dataTable/dataTable.ts:216](https://github.com/iota-pico/storage/blob/893ad8d/src/dataTable/dataTable.ts#L216)*

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

