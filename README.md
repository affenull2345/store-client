# (Multi-)Store client

This is an app store client for the
[b-hackers store](https://gitlab.com/banana-hackers/store-db) and the
[KaiStore](https://www.kaiostech.com/store).

This store client supports multiple installation backends, using self-debug
and falling back to OmniSD's method.

## Reporting issues
If you don't want to use GitLab, you can report them on GitHub:
<https://github.com/affenull2345/store-client/issues>

Otherwise, report them here on GitLab.

## Known issues
 - Installation hangs when you are connected to PC via WebIDE. Please disconnect
   USB if you need to install an app.
 - Not all apps from KaiStore are recognized as installed because KaiStore
   does not provide the `origin` field in their generated update manifest.
 - If you can't exit the search page, clear the input box, press Enter and
   try exiting again.

Although it uses self-debugging, I've heard reports that this app does not work
on KaiOS 2.5.2.2. Since I do not have a device with those KaiOS
versions, I cannot confirm this bug and find out the cause.

## Backends:

### Installation

 - `mozapps-import`: "OmniSD method", using `mozApps.mgmt.import()`
 - `self-debug`: using `debugger-socket` connections

### Stores

 - `bhackers-v2`: B-Hackers Store
   - also supports [openGiraffes](https://store.opengiraffes.top)
 - `kaistone`: KaiStore

## Download latest release:

Note: This is the latest released version, it might not include the newest
unreleased features

OmniSD package: <https://affenull2345.gitlab.io/store-client/store.zip>

Manifest: <https://affenull2345.gitlab.io/store-client/manifest.webapp>

## Download nightly builds:

This is a link to the latest development version.
<https://gitlab.com/affenull2345/store-client/-/jobs/artifacts/main/download?job=build>

WARNING: The development version might be unstable.

## Source code for `debug-forwarder.bin`

See <https://gitlab.com/affenull2345/kaios-self-debug>.

## Icon credits

The icon is based on the B-Hackers Store icon by John-David Deubl (perry), see
<https://github.com/strukturart/bHacker-store-client>.
