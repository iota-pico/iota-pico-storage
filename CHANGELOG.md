# Changelog

## v1.0.1

* Refactored NetworkClient to make it more versatile
* Webpack bundling switch from Uglify to Terser

## v1.0.0

* Final 1.0.0 Release
* Lib files shrunk with different WebPack options and babel removal
* Updated dependencies and README

## v0.9.9

* Reduced umd module size with externals

## v0.9.8

* Added timestamp to index data
* Remove old string[] support from index

## v0.9.7

* Added MemoryCacheConfigProvider
* Added optional sig member to DataTableIndex
* DataTable index renamed to IDataTableIndex

## v0.9.6

* Fixed storageClient to always pick first entry from bundle which avoids reattachment duplicates

## v0.9.5

* Change DataTableIndex format, added lastIdx to facilitate audit trail
* Fixed setting of unsafe headers on Amazon AWS signer

## v0.9.4

* Fixed repo links in readme and coverage config

## v0.9.3

* First public release
