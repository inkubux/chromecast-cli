# chromecast-cli
Command line interface for Google Chromecast

## Installation
```
npm install -g chromecast-cli
```

## Usage
Type the following to get a list of all commands and options:
```
chromecast
```
Please note that this tool does not discover Chromecast devices on your network for performance reasons. You have to specify an IP address via the `--host` option. Consider configuring your DHCP server to assign a fixed IP address to your Chromecast devices.

### Examples
Play a song from a DLNA/UPnP source
```
chromecast
```

## Features
* Play multiple files/urls from command line
* Stop
* Mute
* Unmute
* Set volume
* Increase/decrease volume
* Display Chromecast status
