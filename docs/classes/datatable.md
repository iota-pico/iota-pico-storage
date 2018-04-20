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

* [index](datatable.md#index)
* [remove](datatable.md#remove)
* [retrieve](datatable.md#retrieve)
* [store](datatable.md#store)
* [update](datatable.md#update)

---

## Constructors

<a id="constructor"></a>

### ⊕ **new DataTable**(storageClient: *[IStorageClient](../interfaces/istorageclient.md)*, configProvider: *[IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md)*, tableName: *`string`*, logger?: *`ILogger`*): [DataTable](datatable.md)

*Defined in dataTable/dataTable.ts:38*

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

<a id="index"></a>

###  index

▸ **index**(): `Promise`.<[DataTableIndex](../#datatableindex)>

*Implementation of [IDataTable](../interfaces/idatatable.md).[index](../interfaces/idatatable.md#index)*

*Defined in dataTable/dataTable.ts:61*

Get the index for the table.

**Returns:** `Promise`.<[DataTableIndex](../#datatableindex)>
The table index.

___

<a id="remove"></a>

###  remove

▸ **remove**(id: *`Hash`*): `Promise`.<`void`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[remove](../interfaces/idatatable.md#remove)*

*Defined in dataTable/dataTable.ts:205*

Remove an item of data from the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| id | `Hash`   |  The id of the item to remove. |

**Returns:** `Promise`.<`void`>

___

<a id="retrieve"></a>

###  retrieve

▸ **retrieve**(ids?: *`Hash`[]*): `Promise`.<`T`[]>

*Implementation of [IDataTable](../interfaces/idatatable.md).[retrieve](../interfaces/idatatable.md#retrieve)*

*Defined in dataTable/dataTable.ts:161*

Retrieve all the data stored in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ids | `Hash`[]   |  Ids of all the items to retrieve, if empty will retrieve all items from index. |

**Returns:** `Promise`.<`T`[]>
The items stored in the table.

___

<a id="store"></a>

###  store

▸ **store**(data: *`T`*, tag?: *`Tag`*): `Promise`.<`Hash`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[store](../interfaces/idatatable.md#store)*

*Defined in dataTable/dataTable.ts:93*

Store an item of data in the table.

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| data | `T`  | - |   The data to store. |
| tag | `Tag`  |  Tag.EMPTY |   The tag to store with the item. |

**Returns:** `Promise`.<`Hash`>
The id of the stored item.

___

<a id="update"></a>

###  update

▸ **update**(originalId: *`Hash`*, data: *`T`*, tag?: *`Tag`*): `Promise`.<`Hash`>

*Implementation of [IDataTable](../interfaces/idatatable.md).[update](../interfaces/idatatable.md#update)*

*Defined in dataTable/dataTable.ts:125*

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
