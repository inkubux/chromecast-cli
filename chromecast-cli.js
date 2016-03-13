#!/usr/bin/env node

var app = require('commander');
var async = require('async');
var lodash = require('lodash');
var Client = require('castv2-client').Client;
var Receiver = require('castv2-client').DefaultMediaReceiver;

var connect = function(host, cb) {
	var client = new Client();
	client.on('error', function(e) {
		console.error('Client error', e);
		client.close();
	});
	client.on('message', function(message) {
		console.log('Client message', message);
	});
	client.on('close', function() {
		console.error('Client closed');
	});

	return client.connect(host, function() {
		return cb(null, client);
	});
};

app
	.version('0.0.1')
	.option('-H, --host <host>', 'IP address or hostname of Chromecast (required)');

app
	.command('play <src>')
	.description('Play file at <src>')
	// TODO .option('-r, --repeat-mode <repeat-mode>', 'Set repeat mode (REPEAT_OFF, REPEAT_ONE or REPEAT_ALL)', /^(REPEAT_OFF|REPEAT_ONE|REPEAT_ALL)$/i, 'REPEAT_OFF')
	.option('-f, --force', 'Force play even if Chromecast is already casting')
	.action(function(src, options) {
		if (!app.host)
			throw new Error('--host option is required');

		return async.auto({
			client: function(cb) {
				return connect(app.host, cb);
			},
			status: ['client', function(cb, r) {
				return r.client.receiver.getStatus(cb);
			}],
			receiver: ['client', 'status', function(cb, r) {
				if (!options.force && lodash.get(r.status, 'applications.0'))
					return cb(new Error('Already casting. Use --force option to override.'));
				return r.client.launch(Receiver, cb);
			}],
			media: ['receiver', function(cb, r) {
				var media = {
					contentId: src
				};
				r.receiver.load(media, {autoplay: true, repeatMode: options.repeatMode}, cb);
			}]
		}, function(e, r) {
			if (e) {
				console.error(e);
				return process.exit(1);
			}
			console.log(r.media.playerState, r.media.media, r.media.repeatMode);
			return process.exit();
		});
	});

app
	.command('volume <volume>')
	.description('Set the volume to <volume>')
	.action(function(volume) {
		if (!app.host)
			throw new Error('--host option is required');

		volume = parseFloat(volume);
		if (!volume)
			throw new Error('Invalid volume parameter. Has to be float between 0.0 and 1.0.');

		return async.auto({
			client: function(cb) {
				return connect(app.host, cb);
			},
			volume: ['client', function(cb, r) {
				r.client.receiver.setVolume({level: volume, muted: false}, cb);
			}]
		}, function(e, r) {
			if (e) {
				console.error(e);
				return process.exit(1);
			}
			console.log(r.volume);
			return process.exit();
		});
	});

app
	.command('volumeStepUp <volumeStep>')
	.description('Set the volume <volumeStep> higher')
	.action(function(volumeStep) {
		if (!app.host)
			throw new Error('--host option is required');

		volumeStep = parseFloat(volumeStep);
		if (!volumeStep)
			throw new Error('Invalid volumeStep parameter. Has to be float between 0.0 and 1.0.');

		return async.auto({
			client: function(cb) {
				return connect(app.host, cb);
			},
			oldVolume: ['client', function(cb, r) {
				r.client.receiver.getVolume(cb);
			}],
			newVolume: ['client', 'oldVolume', function(cb, r) {
				var volume = r.oldVolume.level;
				volume += volumeStep;
				volume = volume > 1 ? 1 : volume;
				r.client.receiver.setVolume({level: volume, muted: false}, cb);
			}]
		}, function(e, r) {
			if (e) {
				console.error(e);
				return process.exit(1);
			}
			console.log(r.newVolume);
			return process.exit();
		});
	});

app
	.command('volumeStepDown <volumeStep>')
	.description('Set the volume <volumeStep> lower')
	.action(function(volumeStep) {
		if (!app.host)
			throw new Error('--host option is required');

		volumeStep = parseFloat(volumeStep);
		if (!volumeStep)
			throw new Error('Invalid volumeStep parameter. Has to be float between 0.0 and 1.0.');

		return async.auto({
			client: function(cb) {
				return connect(app.host, cb);
			},
			oldVolume: ['client', function(cb, r) {
				r.client.receiver.getVolume(cb);
			}],
			newVolume: ['client', 'oldVolume', function(cb, r) {
				var volume = r.oldVolume.level;
				volume -= volumeStep;
				volume = volume < 0 ? 0 : volume;
				r.client.receiver.setVolume({level: volume, muted: false}, cb);
			}]
		}, function(e, r) {
			if (e) {
				console.error(e);
				return process.exit(1);
			}
			console.log(r.newVolume);
			return process.exit();
		});
	});

app
	.command('mute')
	.description('Mute')
	.action(function() {
		if (!app.host)
			throw new Error('--host option is required');

		return async.auto({
			client: function(cb) {
				return connect(app.host, cb);
			},
			volume: ['client', function(cb, r) {
				r.client.receiver.setVolume({muted: true}, cb);
			}]
		}, function(e, r) {
			if (e) {
				console.error(e);
				return process.exit(1);
			}
			console.log(r.volume);
			return process.exit();
		});
	});

app
	.command('unmute')
	.description('Unmute')
	.action(function() {
		if (!app.host)
			throw new Error('--host option is required');

		return async.auto({
			client: function(cb) {
				return connect(app.host, cb);
			},
			volume: ['client', function(cb, r) {
				r.client.receiver.setVolume({muted: false}, cb);
			}]
		}, function(e, r) {
			if (e) {
				console.error(e);
				return process.exit(1);
			}
			console.log(r.volume);
			return process.exit();
		});
	});

app
	.command('stop')
	.description('Stop playback')
	.action(function() {
		if (!app.host)
			throw new Error('--host option is required');

		return async.auto({
			client: function(cb) {
				return connect(app.host, cb);
			},
			stop: ['client', function(cb, r) {
				return r.client.receiver.stop(null, cb);
			}]
		}, function(e, r) {
			if (e) {
				console.error(e);
				return process.exit(1);
			}
			return process.exit();
		});
	});

app
	.command('status')
	.description('Get Chromecast status')
	.action(function() {
		if (!app.host)
			throw new Error('--host option is required');

		return async.auto({
			client: function(cb) {
				return connect(app.host, cb);
			},
			status: ['client', function(cb, r) {
				return r.client.receiver.getStatus(cb);
			}]
		}, function(e, r) {
			if (e) {
				console.error(e);
				return process.exit(1);
			}
			console.log(r.status);
			return process.exit();
		});
	});

app
	.parse(process.argv);

if (!process.argv.slice(2).length) {
	app.help();
}