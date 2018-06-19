[@iota-pico/storage](../README.md) > [MemoryCacheConfigProvider](../classes/memorycacheconfigprovider.md)

# Class: MemoryCacheConfigProvider

Represents a config provider which caches content from another provider.

## Hierarchy

**MemoryCacheConfigProvider**

## Implements

* [IConfigProvider](../interfaces/iconfigprovider.md)

## Index

### Constructors

* [constructor](memorycacheconfigprovider.md#constructor)

### Methods

* [load](memorycacheconfigprovider.md#load)
* [save](memorycacheconfigprovider.md#save)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new MemoryCacheConfigProvider**(configProvider: *[IConfigProvider](../interfaces/iconfigprovider.md)*): [MemoryCacheConfigProvider](memorycacheconfigprovider.md)

*Defined in [configProvider/memoryCacheConfigProvider.ts:13](https://github.com/iota-pico/storage/blob/a72b6fc/src/configProvider/memoryCacheConfigProvider.ts#L13)*

Create a new instance of the MemoryCacheConfigProvider.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| configProvider | [IConfigProvider](../interfaces/iconfigprovider.md) |  The config provider to cache. |

**Returns:** [MemoryCacheConfigProvider](memorycacheconfigprovider.md)

___

## Methods

<a id="load"></a>

###  load

▸ **load**T(): `Promise`<`T`>

*Implementation of [IConfigProvider](../interfaces/iconfigprovider.md).[load](../interfaces/iconfigprovider.md#load)*

*Defined in [configProvider/memoryCacheConfigProvider.ts:31](https://github.com/iota-pico/storage/blob/a72b6fc/src/configProvider/memoryCacheConfigProvider.ts#L31)*

Load the configuration for the data table.

**Type parameters:**

#### T 

**Returns:** `Promise`<`T`>
The configuration.

___
<a id="save"></a>

###  save

▸ **save**T(config: *`T`*): `Promise`<`void`>

*Implementation of [IConfigProvider](../interfaces/iconfigprovider.md).[save](../interfaces/iconfigprovider.md#save)*

*Defined in [configProvider/memoryCacheConfigProvider.ts:43](https://github.com/iota-pico/storage/blob/a72b6fc/src/configProvider/memoryCacheConfigProvider.ts#L43)*

Save the configuration for the data table.

**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| config | `T` |  The configuration to set. |

**Returns:** `Promise`<`void`>

___

