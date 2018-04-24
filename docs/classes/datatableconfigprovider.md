[@iota-pico/storage](../README.md) > [DataTableConfigProvider](../classes/datatableconfigprovider.md)

# Class: DataTableConfigProvider

Represents a data table config provider which uses and IConfigProvider.

## Hierarchy

**DataTableConfigProvider**

## Implements

* [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md)

## Index

### Constructors

* [constructor](datatableconfigprovider.md#constructor)

### Methods

* [load](datatableconfigprovider.md#load)
* [save](datatableconfigprovider.md#save)

---

## Constructors

<a id="constructor"></a>

### ⊕ **new DataTableConfigProvider**(configProvider: *[IConfigProvider](../interfaces/iconfigprovider.md)*, logger?: *`ILogger`*): [DataTableConfigProvider](datatableconfigprovider.md)

*Defined in [configProvider/dataTableConfigProvider.ts:19](https://github.com/iota-pico/storage/blob/2e37eb2/src/configProvider/dataTableConfigProvider.ts#L19)*

Create a new instance of the DataTableConfigProvider.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| configProvider | [IConfigProvider](../interfaces/iconfigprovider.md)   |  The config provider to use. |
| logger | `ILogger`   |  Logger to send info to. |

**Returns:** [DataTableConfigProvider](datatableconfigprovider.md)

---

## Methods

<a id="load"></a>

###  load

▸ **load**(tableName: *`string`*): `Promise`.<[IDataTableConfig](../interfaces/idatatableconfig.md)>

*Implementation of [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md).[load](../interfaces/idatatableconfigprovider.md#load)*

*Defined in [configProvider/dataTableConfigProvider.ts:40](https://github.com/iota-pico/storage/blob/2e37eb2/src/configProvider/dataTableConfigProvider.ts#L40)*

Load the configuration for the data table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| tableName | `string`   |  The table to load the configuration for. |

**Returns:** `Promise`.<[IDataTableConfig](../interfaces/idatatableconfig.md)>
The configuration.

___

<a id="save"></a>

###  save

▸ **save**(tableName: *`string`*, config: *[IDataTableConfig](../interfaces/idatatableconfig.md)*): `Promise`.<`void`>

*Implementation of [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md).[save](../interfaces/idatatableconfigprovider.md#save)*

*Defined in [configProvider/dataTableConfigProvider.ts:66](https://github.com/iota-pico/storage/blob/2e37eb2/src/configProvider/dataTableConfigProvider.ts#L66)*

Save the configuration for the data table.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| tableName | `string`   |  The table to save the configuration for. |
| config | [IDataTableConfig](../interfaces/idatatableconfig.md)   |  The configuration to set. |

**Returns:** `Promise`.<`void`>

___

