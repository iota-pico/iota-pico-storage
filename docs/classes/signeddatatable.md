[@iota-pico/storage](../README.md) > [SignedDataTable](../classes/signeddatatable.md)



# Class: SignedDataTable


Represents a table for storing data with signing.

## Type parameters
#### T 
## Implements

* [IDataTable](../interfaces/idatatable.md)`T`

## Index

### Constructors

* [constructor](signeddatatable.md#constructor)


### Methods

* [index](signeddatatable.md#index)
* [remove](signeddatatable.md#remove)
* [retrieve](signeddatatable.md#retrieve)
* [store](signeddatatable.md#store)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new SignedDataTable**(storageClient: *[IStorageClient](../interfaces/istorageclient.md)*, configProvider: *[IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md)*, platformCrypto: *`IPlatformCrypto`*, logger?: *`ILogger`*): [SignedDataTable](signeddatatable.md)


*Defined in dataTable/signedDataTable.ts:46*



Create a new instance of the DataTable.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| storageClient | [IStorageClient](../interfaces/istorageclient.md)   |  A storage client to perform storage operations. |
| configProvider | [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md)   |  A provider to get the configuration for the table. |
| platformCrypto | `IPlatformCrypto`   |  The object to use for platform crypto functions. |
| logger | `ILogger`   |  Logger to send storage info to. |





**Returns:** [SignedDataTable](signeddatatable.md)

---


## Methods
<a id="index"></a>

###  index

► **index**(): `Promise`.<[DataTableIndex](../#datatableindex)>



*Implementation of [IDataTable](../interfaces/idatatable.md).[index](../interfaces/idatatable.md#index)*

*Defined in dataTable/signedDataTable.ts:69*



Get the index for the table.




**Returns:** `Promise`.<[DataTableIndex](../#datatableindex)>
The table index.






___

<a id="remove"></a>

###  remove

► **remove**(id: *`Hash`*): `Promise`.<`void`>



*Implementation of [IDataTable](../interfaces/idatatable.md).[remove](../interfaces/idatatable.md#remove)*

*Defined in dataTable/signedDataTable.ts:185*



Remove an item of data from the table.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| id | `Hash`   |  The id of the item to remove. |





**Returns:** `Promise`.<`void`>





___

<a id="retrieve"></a>

###  retrieve

► **retrieve**(ids?: *`Hash`[]*): `Promise`.<`T`[]>



*Implementation of [IDataTable](../interfaces/idatatable.md).[retrieve](../interfaces/idatatable.md#retrieve)*

*Defined in dataTable/signedDataTable.ts:144*



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

► **store**(data: *`T`*, tag?: *`Tag`*): `Promise`.<`Hash`>



*Implementation of [IDataTable](../interfaces/idatatable.md).[store](../interfaces/idatatable.md#store)*

*Defined in dataTable/signedDataTable.ts:107*



Store an item of data in the table.


**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| data | `T`  | - |   The data to store. |
| tag | `Tag`  |  Tag.EMPTY |   The tag to store with the item. |





**Returns:** `Promise`.<`Hash`>
The id of the stored item.






___


