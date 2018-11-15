[@iota-pico/storage](../README.md) > [AmazonStorageConfigProvider](../classes/amazonstorageconfigprovider.md)

# Class: AmazonStorageConfigProvider

Represents a config provider which uses amazon storage.

## Hierarchy

**AmazonStorageConfigProvider**

## Implements

* [IConfigProvider](../interfaces/iconfigprovider.md)

## Index

### Constructors

* [constructor](amazonstorageconfigprovider.md#constructor)

### Methods

* [load](amazonstorageconfigprovider.md#load)
* [save](amazonstorageconfigprovider.md#save)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new AmazonStorageConfigProvider**(region: *`string`*, bucketName: *`string`*, configName: *`string`*, credentials?: *[IAmazonCredentials](../interfaces/iamazoncredentials.md)*, logger?: *`ILogger`*): [AmazonStorageConfigProvider](amazonstorageconfigprovider.md)

*Defined in [configProvider/amazonStorageConfigProvider.ts:30](https://github.com/iota-pico/storage/tree/master/src/configProvider/amazonStorageConfigProvider.ts#L30*

Create a new instance of the AmazonStorageConfigProvider.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| region | `string` |  The name of the region. |
| bucketName | `string` |  The name of the bucket object. |
| configName | `string` |  The name of the configuration object. |
| `Optional` credentials | [IAmazonCredentials](../interfaces/iamazoncredentials.md) |  The key to acccess the amazon api. |
| `Optional` logger | `ILogger` |  Logger to send info to. |

**Returns:** [AmazonStorageConfigProvider](amazonstorageconfigprovider.md)

___

## Methods

<a id="load"></a>

###  load

▸ **load**<`T`>(): `Promise`<`T`>

*Implementation of [IConfigProvider](../interfaces/iconfigprovider.md).[load](../interfaces/iconfigprovider.md#load)*

*Defined in [configProvider/amazonStorageConfigProvider.ts:62](https://github.com/iota-pico/storage/tree/master/src/configProvider/amazonStorageConfigProvider.ts#L62*

Load the configuration for the data table.

**Type parameters:**

#### T 

**Returns:** `Promise`<`T`>
The configuration.

___
<a id="save"></a>

###  save

▸ **save**<`T`>(config: *`T`*): `Promise`<`void`>

*Implementation of [IConfigProvider](../interfaces/iconfigprovider.md).[save](../interfaces/iconfigprovider.md#save)*

*Defined in [configProvider/amazonStorageConfigProvider.ts:94](https://github.com/iota-pico/storage/tree/master/src/configProvider/amazonStorageConfigProvider.ts#L94*

Save the configuration for the data table.

**Type parameters:**

#### T 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| config | `T` |  The configuration to set. |

**Returns:** `Promise`<`void`>

___

