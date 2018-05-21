[@iota-pico/storage](../README.md) > [AmazonRequestSigner](../classes/amazonrequestsigner.md)

# Class: AmazonRequestSigner

Class to help with signing Amazon requests.

## Hierarchy

**AmazonRequestSigner**

## Index

### Constructors

* [constructor](amazonrequestsigner.md#constructor)

### Methods

* [sign](amazonrequestsigner.md#sign)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new AmazonRequestSigner**(request: *[IAmazonRequest](../interfaces/iamazonrequest.md)*, credentials: *[IAmazonCredentials](../interfaces/iamazoncredentials.md)*): [AmazonRequestSigner](amazonrequestsigner.md)

*Defined in [configProvider/amazonRequestSigner.ts:27](https://github.com/iota-pico/storage/blob/d99de76/src/configProvider/amazonRequestSigner.ts#L27)*

Create a new instance of AmazonRequestSigner.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| request | [IAmazonRequest](../interfaces/iamazonrequest.md) |  The request to be signed. |
| credentials | [IAmazonCredentials](../interfaces/iamazoncredentials.md) |  The credentials to use for signing. |

**Returns:** [AmazonRequestSigner](amazonrequestsigner.md)

___

## Methods

<a id="sign"></a>

###  sign

▸ **sign**(): [IAmazonRequest](../interfaces/iamazonrequest.md)

*Defined in [configProvider/amazonRequestSigner.ts:69](https://github.com/iota-pico/storage/blob/d99de76/src/configProvider/amazonRequestSigner.ts#L69)*

Signed the request.

**Returns:** [IAmazonRequest](../interfaces/iamazonrequest.md)
The signed request.

___

