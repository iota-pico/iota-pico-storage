[@iota-pico/storage](../README.md) > [GoogleStorageConfigProvider](../classes/googlestorageconfigprovider.md)

# Class: GoogleStorageConfigProvider

Represents a config provider which uses google storage.

## Hierarchy

**GoogleStorageConfigProvider**

## Implements

* [IConfigProvider](../interfaces/iconfigprovider.md)

## Index

### Constructors

* [constructor](googlestorageconfigprovider.md#constructor)

### Methods

* [load](googlestorageconfigprovider.md#load)
* [save](googlestorageconfigprovider.md#save)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new GoogleStorageConfigProvider**(bucketName: *`string`*, configName: *`string`*, serviceAccountKey?: *[IGoogleServiceAccountKey](../interfaces/igoogleserviceaccountkey.md)*, logger?: *`ILogger`*): [GoogleStorageConfigProvider](googlestorageconfigprovider.md)

*Defined in [configProvider/googleStorageConfigProvider.ts:27](https://github.com/iota-pico/storage/blob/a72b6fc/src/configProvider/googleStorageConfigProvider.ts#L27)*

Create a new instance of the GoogleStorageConfigProvider.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| bucketName | `string` |  The name of the bucket object. |
| configName | `string` |  The name of the configuration object. |
| `Optional` serviceAccountKey | [IGoogleServiceAccountKey](../interfaces/igoogleserviceaccountkey.md) |  The key to acccess the google api. |
| `Optional` logger | `ILogger` |  Logger to send info to. |

**Returns:** [GoogleStorageConfigProvider](googlestorageconfigprovider.md)

___

## Methods

<a id="load"></a>

###  load

▸ **load**T(): `Promise`<`T`>

*Implementation of [IConfigProvider](../interfaces/iconfigprovider.md).[load](../interfaces/iconfigprovider.md#load)*

*Defined in [configProvider/googleStorageConfigProvider.ts:54](https://github.com/iota-pico/storage/blob/a72b6fc/src/configProvider/googleStorageConfigProvider.ts#L54)*

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

*Defined in [configProvider/googleStorageConfigProvider.ts:86](https://github.com/iota-pico/storage/blob/a72b6fc/src/configProvider/googleStorageConfigProvider.ts#L86)*

Save the configuration for the data table.

**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| config | `T` |  The configuration to set. |

**Returns:** `Promise`<`void`>

___

