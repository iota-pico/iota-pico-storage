[@iota-pico/storage](../README.md) > [QueryString](../classes/querystring.md)

# Class: QueryString

Class for manipulating query string.

## Hierarchy

**QueryString**

## Index

### Methods

* [parse](querystring.md#parse)
* [stringify](querystring.md#stringify)

---

## Methods

<a id="parse"></a>

### `<Static>` parse

▸ **parse**(queryString: *`string`*, sep?: *`string`*, eq?: *`string`*): `object`

*Defined in [helpers/queryString.ts:33](https://github.com/iota-pico/storage/tree/master/src/helpers/queryString.ts#L33*

Parse the query string into an object.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| queryString | `string` | - |  The query string to parse. |
| `Default value` sep | `string` | &quot;&amp;&quot; |  The separator to look for. |
| `Default value` eq | `string` | &quot;&#x3D;&quot; |  The equals symbol to look for. |

**Returns:** `object`
The object.

___
<a id="stringify"></a>

### `<Static>` stringify

▸ **stringify**(obj: *`object`*, sep?: *`string`*, eq?: *`string`*): `string`

*Defined in [helpers/queryString.ts:15](https://github.com/iota-pico/storage/tree/master/src/helpers/queryString.ts#L15*

Stringify the object for use in a quesry string.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| obj | `object` | - |  The object to stringify. |
| `Default value` sep | `string` | &quot;&amp;&quot; |  The separator to use in the stringification. |
| `Default value` eq | `string` | &quot;&#x3D;&quot; |  The equals to use in the stringification. |

**Returns:** `string`
The stringified object.

___

