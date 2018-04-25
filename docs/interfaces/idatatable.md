[@iota-pico/storage](../README.md) > [IDataTable](../interfaces/idatatable.md)

# Interface: IDataTable

Represents a table for storing data.
*__interface__*: 

## Type parameters
#### T 
## Hierarchy

**IDataTable**

## Implemented by

* [DataTable](../classes/datatable.md)
* [SignedDataTable](../classes/signeddatatable.md)

## Index

### Methods

* [index](idatatable.md#index)
* [remove](idatatable.md#remove)
* [retrieve](idatatable.md#retrieve)
* [store](idatatable.md#store)
* [update](idatatable.md#update)

---

## Methods

<a id="index"></a>

###  index

▸ **index**(): `Promise`.<[DataTableIndex](../#datatableindex)>

*Defined in [interfaces/IDataTable.ts:14](https://github.com/iota-pico/storage/blob/64cdce9/src/interfaces/IDataTable.ts#L14)*

Get the index address for the table.

**Returns:** `Promise`.<[DataTableIndex](../#datatableindex)>
The table index.

___

<a id="remove"></a>

###  remove

▸ **remove**(id: *`Hash`*): `Promise`.<`void`>

*Defined in [interfaces/IDataTable.ts:44](https://github.com/iota-pico/storage/blob/64cdce9/src/interfaces/IDataTable.ts#L44)*

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

*Defined in [interfaces/IDataTable.ts:38](https://github.com/iota-pico/storage/blob/64cdce9/src/interfaces/IDataTable.ts#L38)*

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

*Defined in [interfaces/IDataTable.ts:22](https://github.com/iota-pico/storage/blob/64cdce9/src/interfaces/IDataTable.ts#L22)*

Store an item of data in the table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| data | `T`   |  The data to store. |
| tag | `Tag`   |  The tag to store with the item. |

**Returns:** `Promise`.<`Hash`>
The id of the stored item.

___

<a id="update"></a>

###  update

▸ **update**(originalId: *`Hash`*, data: *`T`*, tag?: *`Tag`*): `Promise`.<`Hash`>

*Defined in [interfaces/IDataTable.ts:31](https://github.com/iota-pico/storage/blob/64cdce9/src/interfaces/IDataTable.ts#L31)*

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

