[@iota-pico/storage](../README.md) > [DataTable](../classes/datatable.md)

# Class: DataTable

Represents a table for storing data.

## Type parameters
#### T 
## Hierarchy

**DataTable**

## Implements

* [IDataTable](../interfaces/idatatable.md)`T`

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

### ⊕ **new DataTable**(storageClient: *[IStorageClient](../interfaces/istorageclient.md)*, configProvider: *[IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md)*, tableName: *`string`*, logger?: *`ILogger`*): [DataTable](datatable.md)

*Defined in [dataTable/dataTable.ts:42](https://github.com/iota-pico/storage/blob/761de37/src/dataTable/dataTable.ts#L42)*

Create a new instance of the DataTable.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| storageClient | [IStorageClient](../interfaces/istorageclient.md)   |  A storage client to perform storage operations. |
| configProvider | [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md)   |  A provider to get the configuration for the table. |
| tableName | `string`   |  The name of the table. |
| logger | `ILogger`   |  Logger to send storage info to. |

**Returns:** [DataTable](datatable.md)

---

## Methods

<a id="clearindex"></a>

###  clearIndex

▸ **clearIndex**(): `Promise`.<`void`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[clearIndex](../interfaces/idatatable.md#clearindex)*

*Defined in [dataTable/dataTable.ts:97](https://github.com/iota-pico/storage/blob/761de37/src/dataTable/dataTable.ts#L97)*

Clear the index for the table.

**Returns:** `Promise`.<`void`>

___

<a id="index"></a>

###  index

▸ **index**(): `Promise`.<[DataTableIndex](../#datatableindex)>

*Implementation of [IDataTable](../interfaces/idatatable.md).[index](../interfaces/idatatable.md#index)*

*Defined in [dataTable/dataTable.ts:65](https://github.com/iota-pico/storage/blob/761de37/src/dataTable/dataTable.ts#L65)*

Get the index for the table.

**Returns:** `Promise`.<[DataTableIndex](../#datatableindex)>
The table index.

___

<a id="remove"></a>

###  remove

▸ **remove**(id: *`Hash`*): `Promise`.<`void`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[remove](../interfaces/idatatable.md#remove)*

*Defined in [dataTable/dataTable.ts:334](https://github.com/iota-pico/storage/blob/761de37/src/dataTable/dataTable.ts#L334)*

Remove an item of data from the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| id | `Hash`   |  The id of the item to remove. |

**Returns:** `Promise`.<`void`>

___

<a id="removemultiple"></a>

###  removeMultiple

▸ **removeMultiple**(ids: *`Hash`[]*): `Promise`.<`void`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[removeMultiple](../interfaces/idatatable.md#removemultiple)*

*Defined in [dataTable/dataTable.ts:359](https://github.com/iota-pico/storage/blob/761de37/src/dataTable/dataTable.ts#L359)*

Remove multiple items of data from the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ids | `Hash`[]   |  The ids of the items to remove. |

**Returns:** `Promise`.<`void`>

___

<a id="retrieve"></a>

###  retrieve

▸ **retrieve**(id: *`Hash`*): `Promise`.<`T`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[retrieve](../interfaces/idatatable.md#retrieve)*

*Defined in [dataTable/dataTable.ts:254](https://github.com/iota-pico/storage/blob/761de37/src/dataTable/dataTable.ts#L254)*

Retrieve the data stored in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| id | `Hash`   |  Id of the item to retrieve. |

**Returns:** `Promise`.<`T`>
The item stored in the table.

___

<a id="retrievemultiple"></a>

###  retrieveMultiple

▸ **retrieveMultiple**(ids?: *`Hash`[]*): `Promise`.<`T`[]>

*Implementation of [IDataTable](../interfaces/idatatable.md).[retrieveMultiple](../interfaces/idatatable.md#retrievemultiple)*

*Defined in [dataTable/dataTable.ts:288](https://github.com/iota-pico/storage/blob/761de37/src/dataTable/dataTable.ts#L288)*

Retrieve all the data stored in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ids | `Hash`[]   |  Ids of all the items to retrieve, if empty will retrieve all items from index. |

**Returns:** `Promise`.<`T`[]>
The items stored in the table.

___

<a id="setprogresscallback"></a>

###  setProgressCallback

▸ **setProgressCallback**(progressCallback: *`function`*): `void`

*Defined in [dataTable/dataTable.ts:392](https://github.com/iota-pico/storage/blob/761de37/src/dataTable/dataTable.ts#L392)*

Set the progress callback.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| progressCallback | `function`   |  Callback supplied with progress details. |

**Returns:** `void`

___

<a id="store"></a>

###  store

▸ **store**(data: *`T`*, tag?: *`Tag`*): `Promise`.<`Hash`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[store](../interfaces/idatatable.md#store)*

*Defined in [dataTable/dataTable.ts:111](https://github.com/iota-pico/storage/blob/761de37/src/dataTable/dataTable.ts#L111)*

Store an item of data in the table.

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| data | `T`  | - |   The data to store. |
| tag | `Tag`  |  Tag.EMPTY |   The tag to store with the item. |

**Returns:** `Promise`.<`Hash`>
The id of the stored item.

___

<a id="storemultiple"></a>

###  storeMultiple

▸ **storeMultiple**(data: *`T`[]*, tags?: *`Tag`[]*, clearIndex?: *`boolean`*): `Promise`.<`Hash`[]>

*Implementation of [IDataTable](../interfaces/idatatable.md).[storeMultiple](../interfaces/idatatable.md#storemultiple)*

*Defined in [dataTable/dataTable.ts:154](https://github.com/iota-pico/storage/blob/761de37/src/dataTable/dataTable.ts#L154)*

Store multiple items of data in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| data | `T`[]   |  The data to store. |
| tags | `Tag`[]   |  The tag to store with the items. |
| clearIndex | `boolean`   |  Clear the index so there is no data. |

**Returns:** `Promise`.<`Hash`[]>
The ids of the stored items.

___

<a id="update"></a>

###  update

▸ **update**(originalId: *`Hash`*, data: *`T`*, tag?: *`Tag`*): `Promise`.<`Hash`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[update](../interfaces/idatatable.md#update)*

*Defined in [dataTable/dataTable.ts:207](https://github.com/iota-pico/storage/blob/761de37/src/dataTable/dataTable.ts#L207)*

Update an item of data in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| originalId | `Hash`   |  The id of the item to update. |
| data | `T`   |  The data to update. |
| tag | `Tag`   |  The tag to store with the item. |

**Returns:** `Promise`.<`Hash`>
The id of the updated item.

___

