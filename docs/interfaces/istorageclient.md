[@iota-pico/storage](../README.md) > [IStorageClient](../interfaces/istorageclient.md)



# Interface: IStorageClient


Represents a client for performing storage operations.
*__interface__*: 


## Implemented by

* [StorageClient](../classes/storageclient.md)


## Methods
<a id="delete"></a>

###  delete

► **delete**(address: *`Address`*): `Promise`.<`void`>



*Defined in interfaces/IStorageClient.ts:26*



Delete the item stored at the address.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | `Address`   |  The address to delete the data. |





**Returns:** `Promise`.<`void`>





___

<a id="retrieve"></a>

###  retrieve

► **retrieve**T(address: *`Address`*): `Promise`.<`T`>



*Defined in interfaces/IStorageClient.ts:20*



Retrieve the data stored at the address.


**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | `Address`   |  The address from which to retrieve the item. |





**Returns:** `Promise`.<`T`>
The item stored at the address.






___

<a id="store"></a>

###  store

► **store**T(address: *`Address`*, data: *`T`*): `Promise`.<`void`>



*Defined in interfaces/IStorageClient.ts:13*



Store an item of data on the address.


**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| address | `Address`   |  The address to store the item. |
| data | `T`   |  The data to store. |





**Returns:** `Promise`.<`void`>





___


