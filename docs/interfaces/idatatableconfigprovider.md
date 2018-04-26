[@iota-pico/storage](../README.md) > [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md)

# Interface: IDataTableConfigProvider

Represents a class that can get/set data table configuration.
*__interface__*: 

## Hierarchy

**IDataTableConfigProvider**

## Implemented by

* [DataTableConfigProvider](../classes/datatableconfigprovider.md)

## Index

### Methods

* [load](idatatableconfigprovider.md#load)
* [save](idatatableconfigprovider.md#save)

---

## Methods

<a id="load"></a>

###  load

▸ **load**(tableName: *`string`*): `Promise`.<[IDataTableConfig](idatatableconfig.md)>

*Defined in [interfaces/IDataTableConfigProvider.ts:13](https://github.com/iota-pico/storage/blob/761de37/src/interfaces/IDataTableConfigProvider.ts#L13)*

Load the configuration for the data table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| tableName | `string`   |  The table to load the configuration for. |

**Returns:** `Promise`.<[IDataTableConfig](idatatableconfig.md)>
The configuration.

___

<a id="save"></a>

###  save

▸ **save**(tableName: *`string`*, config: *[IDataTableConfig](idatatableconfig.md)*): `Promise`.<`void`>

*Defined in [interfaces/IDataTableConfigProvider.ts:20](https://github.com/iota-pico/storage/blob/761de37/src/interfaces/IDataTableConfigProvider.ts#L20)*

Save the configuration for the data table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| tableName | `string`   |  The table to save the configuration for. |
| config | [IDataTableConfig](idatatableconfig.md)   |  The configuration to set. |

**Returns:** `Promise`.<`void`>

___

