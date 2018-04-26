[@iota-pico/storage](../README.md) > [IConfigProvider](../interfaces/iconfigprovider.md)

# Interface: IConfigProvider

Represents a class that can get/set configuration.
*__interface__*: 

## Hierarchy

**IConfigProvider**

## Implemented by

* [AmazonStorageConfigProvider](../classes/amazonstorageconfigprovider.md)
* [GoogleStorageConfigProvider](../classes/googlestorageconfigprovider.md)

## Index

### Methods

* [load](iconfigprovider.md#load)
* [save](iconfigprovider.md#save)

---

## Methods

<a id="load"></a>

###  load

▸ **load**T(): `Promise`.<`T`>

*Defined in [interfaces/IConfigProvider.ts:10](https://github.com/iota-pico/storage/blob/761de37/src/interfaces/IConfigProvider.ts#L10)*

Load the configuration.

**Type parameters:**

#### T 

**Returns:** `Promise`.<`T`>
The configuration.

___

<a id="save"></a>

###  save

▸ **save**T(config: *`T`*): `Promise`.<`void`>

*Defined in [interfaces/IConfigProvider.ts:16](https://github.com/iota-pico/storage/blob/761de37/src/interfaces/IConfigProvider.ts#L16)*

Save the configuration.

**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| config | `T`   |  The configuration to set. |

**Returns:** `Promise`.<`void`>

___

