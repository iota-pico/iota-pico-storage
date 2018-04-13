[@iota-pico/storage](../README.md) > [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md)



# Interface: IDataTableConfigProvider


Represents a class that can get/set data table configuration.
*__interface__*: 


## Implemented by

* [GoogleStorageConfigProvider](../classes/googlestorageconfigprovider.md)


## Methods
<a id="load"></a>

###  load

► **load**(): `Promise`.<[IDataTableConfig](idatatableconfig.md)>



*Defined in interfaces/IDataTableConfigProvider.ts:12*



Load the configuration for the data table.




**Returns:** `Promise`.<[IDataTableConfig](idatatableconfig.md)>
The configuration.






___

<a id="save"></a>

###  save

► **save**(config: *[IDataTableConfig](idatatableconfig.md)*): `Promise`.<`void`>



*Defined in interfaces/IDataTableConfigProvider.ts:18*



Save the configuration for the data table.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| config | [IDataTableConfig](idatatableconfig.md)   |  The configuration to set. |





**Returns:** `Promise`.<`void`>





___


