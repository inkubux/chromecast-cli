# chromecast-cli
Command line interface for Google Chromecast

## Installation
```
npm install chromecast-cli
```

## Usage
Type the following to get a list of all commands and options:
```
node chromecast-cli.js
```

Please note that this tool does not discover Chromecast devices on your network for performance reasons. You have to specify an IP address via the `--host` option. Consider configuring your DHCP server to assign a fixed IP address to your Chromecast devices.

## Features
* Play multiple files/urls from command line
* Stop
* Mute
* Unmute
* Set volume
* Increase/decrease volume
* Display Chromecast status