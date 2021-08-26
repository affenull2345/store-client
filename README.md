# (Multi-)Store client

This is a WIP app store client for the
[b-hackers store](https://gitlab.com/banana-hackers/store-db) and the
[KaiStore](https://www.kaiostech.com/store).

It is designed to support multiple installation methods and multiple store
backends. Installing apps from KaiStore is currently not working.

## Backends:

### Installation

 - `mozapps-import`: using `mozApps.mgmt.import()`
 - `self-debug`: using `debugger-socket` connections

### Stores

 - `bhackers-v2`: B-Hackers Store
 - `kaistone`: KaiStore

## Download latest release:

Note: This is the latest released version, it might not include the newest
unreleased features

OmniSD package: <https://affenull2345.gitlab.io/store-client/store.zip>

Manifest: <https://affenull2345.gitlab.io/store-client/manifest.webapp>

## Source code for `debug-forwarder.bin`

See <https://gitlab.com/affenull2345/kaios-self-debug>.

## Icon credits

The icon is based on the B-Hackers Store icon by John-David Deubl (perry), see
<https://github.com/strukturart/bHacker-store-client>.
