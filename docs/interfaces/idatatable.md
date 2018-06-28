[@iota-pico/storage](../README.md) > [IDataTable](../interfaces/idatatable.md)

# Interface: IDataTable

Represents a table for storing data.
*__interface__*: 

## Type parameters
#### T :  [ISignedDataItem](isigneddataitem.md)
## Hierarchy

**IDataTable**

## Implemented by

* [DataTable](../classes/datatable.md)

## Index

### Methods

* [clearIndex](idatatable.md#clearindex)
* [index](idatatable.md#index)
* [remove](idatatable.md#remove)
* [removeMultiple](idatatable.md#removemultiple)
* [retrieve](idatatable.md#retrieve)
* [retrieveMultiple](idatatable.md#retrievemultiple)
* [setProgressCallback](idatatable.md#setprogresscallback)
* [store](idatatable.md#store)
* [storeMultiple](idatatable.md#storemultiple)
* [update](idatatable.md#update)

---

## Methods

<a id="clearindex"></a>

###  clearIndex

▸ **clearIndex**(retainHistory: *`boolean`*): `Promise`<`void`>

*Defined in [interfaces/IDataTable.ts:22](https://github.com/iota-pico/storage/blob/893ad8d/src/interfaces/IDataTable.ts#L22)*

Clear the index for the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| retainHistory | `boolean` |  Retains the lastIdx value in the index. |

**Returns:** `Promise`<`void`>

___
<a id="index"></a>

###  index

▸ **index**(): `Promise`<[IDataTableIndex](idatatableindex.md)>

*Defined in [interfaces/IDataTable.ts:16](https://github.com/iota-pico/storage/blob/893ad8d/src/interfaces/IDataTable.ts#L16)*

Get the index for the table.

**Returns:** `Promise`<[IDataTableIndex](idatatableindex.md)>
The table index.

___
<a id="remove"></a>

###  remove

▸ **remove**(id: *`Hash`*): `Promise`<`void`>

*Defined in [interfaces/IDataTable.ts:69](https://github.com/iota-pico/storage/blob/893ad8d/src/interfaces/IDataTable.ts#L69)*

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

*Defined in [interfaces/IDataTable.ts:75](https://github.com/iota-pico/storage/blob/893ad8d/src/interfaces/IDataTable.ts#L75)*

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

*Defined in [interfaces/IDataTable.ts:56](https://github.com/iota-pico/storage/blob/893ad8d/src/interfaces/IDataTable.ts#L56)*

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

*Defined in [interfaces/IDataTable.ts:63](https://github.com/iota-pico/storage/blob/893ad8d/src/interfaces/IDataTable.ts#L63)*

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

*Defined in [interfaces/IDataTable.ts:81](https://github.com/iota-pico/storage/blob/893ad8d/src/interfaces/IDataTable.ts#L81)*

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

*Defined in [interfaces/IDataTable.ts:30](https://github.com/iota-pico/storage/blob/893ad8d/src/interfaces/IDataTable.ts#L30)*

Store an item of data in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| data | `T` |  The data to store. |
| `Optional` tag | `Tag` |  The tag to store with the item. |

**Returns:** `Promise`<`Hash`>
The id of the stored item.

___
<a id="storemultiple"></a>

###  storeMultiple

▸ **storeMultiple**(data: *`T`[]*, tags?: *`Tag`[]*, clearIndex?: *`boolean`*, retainHistory?: *`boolean`*): `Promise`<`Hash`[]>

*Defined in [interfaces/IDataTable.ts:40](https://github.com/iota-pico/storage/blob/893ad8d/src/interfaces/IDataTable.ts#L40)*

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

*Defined in [interfaces/IDataTable.ts:49](https://github.com/iota-pico/storage/blob/893ad8d/src/interfaces/IDataTable.ts#L49)*

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

