[@iota-pico/storage](../README.md) > [GoogleStorageConfigProvider](../classes/googlestorageconfigprovider.md)



# Class: GoogleStorageConfigProvider


Represents a config provider which uses google storage.

## Implements

* [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md)

## Index

### Constructors

* [constructor](googlestorageconfigprovider.md#constructor)


### Methods

* [load](googlestorageconfigprovider.md#load)
* [save](googlestorageconfigprovider.md#save)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new GoogleStorageConfigProvider**(bucketName: *`string`*, configName: *`string`*, serviceAccountKey?: *[IGoogleServiceAccountKey](../interfaces/igoogleserviceaccountkey.md)*, logger?: *`ILogger`*): [GoogleStorageConfigProvider](googlestorageconfigprovider.md)


*Defined in configProvider/googleStorageConfigProvider.ts:28*



Create a new instance of the GoogleStorageConfigProvider.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| bucketName | `string`   |  The name of the bucket object. |
| configName | `string`   |  The name of the configuration object. |
| serviceAccountKey | [IGoogleServiceAccountKey](../interfaces/igoogleserviceaccountkey.md)   |  The key to acccess the google api. |
| logger | `ILogger`   |  Logger to send info to. |





**Returns:** [GoogleStorageConfigProvider](googlestorageconfigprovider.md)

---


## Methods
<a id="load"></a>

###  load

► **load**(): `Promise`.<[IDataTableConfig](../interfaces/idatatableconfig.md)>



*Implementation of [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md).[load](../interfaces/idatatableconfigprovider.md#load)*

*Defined in configProvider/googleStorageConfigProvider.ts:55*



Load the configuration for the data table.




**Returns:** `Promise`.<[IDataTableConfig](../interfaces/idatatableconfig.md)>
The configuration.






___

<a id="save"></a>

###  save

► **save**(config: *[IDataTableConfig](../interfaces/idatatableconfig.md)*): `Promise`.<`void`>



*Implementation of [IDataTableConfigProvider](../interfaces/idatatableconfigprovider.md).[save](../interfaces/idatatableconfigprovider.md#save)*

*Defined in configProvider/googleStorageConfigProvider.ts:87*



Save the configuration for the data table.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| config | [IDataTableConfig](../interfaces/idatatableconfig.md)   |  The configuration to set. |





**Returns:** `Promise`.<`void`>





___


