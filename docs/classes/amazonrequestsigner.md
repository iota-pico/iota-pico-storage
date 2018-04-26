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

### ⊕ **new AmazonRequestSigner**(request: *[IAmazonRequest](../interfaces/iamazonrequest.md)*, credentials: *[IAmazonCredentials](../interfaces/iamazoncredentials.md)*): [AmazonRequestSigner](amazonrequestsigner.md)

*Defined in configProvider/amazonRequestSigner.ts:27*

Create a new instance of AmazonRequestSigner.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| request | [IAmazonRequest](../interfaces/iamazonrequest.md)   |  The request to be signed. |
| credentials | [IAmazonCredentials](../interfaces/iamazoncredentials.md)   |  The credentials to use for signing. |

**Returns:** [AmazonRequestSigner](amazonrequestsigner.md)

---

## Methods

<a id="sign"></a>

###  sign

▸ **sign**(): [IAmazonRequest](../interfaces/iamazonrequest.md)

*Defined in configProvider/amazonRequestSigner.ts:69*

Signed the request.

**Returns:** [IAmazonRequest](../interfaces/iamazonrequest.md)
The signed request.

___

