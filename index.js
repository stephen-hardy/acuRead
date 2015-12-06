/* Copyright 2015 Stephen Hardy
	See the file LICENSE.txt for your rights

	Credits:
		*  Thanks to Matthew Wall: https://github.com/weewx/weewx/blob/master/bin/weewx/drivers/acurite.py
		*  Thanks to those listed by Matthew Wall, at the above link. This library stands on the shoulders of giants.
*/

/* jshint -W018, node: true, indent: false, forin: false, laxbreak: true, curly: true, eqeqeq: true, boss: true, latedef: nofunc, undef: true, trailing: true, maxcomplexity: 15 */

if (!Object.assign) {
	Object.defineProperty(Object, 'assign', {
		enumerable: false, configurable: true, writable: true,
		value: function(target, firstSource) {
			'use strict';
			if (target === undefined || target === null) { throw new TypeError('Cannot convert first argument to object'); }

			var to = Object(target);
			for (var i = 1; i < arguments.length; i++) {
				var nextSource = arguments[i];
				if (nextSource === undefined || nextSource === null) { continue; }
				nextSource = Object(nextSource);

				var keysArray = Object.keys(Object(nextSource));
				for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
					var nextKey = keysArray[nextIndex], desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
					if (desc !== undefined && desc.enumerable) { to[nextKey] = nextSource[nextKey]; }
				}
			}
			return to;
		}
	});
}

var HID = require('node-hid'), stations = [],
	windDir = ['NW', 'WSW', 'WNW', 'W', 'NNW', 'SW', 'N', 'SSW', 'ENE', 'SE', 'E', 'ESE', 'NE', 'SSE', 'NNE', 'S'],
	channels = { 0: 'C', 128: 'B', 192: 'A' },
	log = true, raw = false;

function refreshStations() {
	if (log) { console.log('Refreshing stations'); }
	HID.devices().forEach(function(d) { if (d.vendorId === 9408 && d.productId === 3 && !stations.some(function(s) { return d.path === s.path; })) { new Station(d); } });
	return stations;
}

function Station(hid) {
	if (log) { console.log('Creating new station'); }
	Object.assign(this, hid);
	this._device = new HID.HID(hid.path);
	this.data = {};
	this._events = { change: [] };
	stations.push(this); 
}
	Station.prototype.refresh = function(diff) {
		var r1 = this._device.getFeatureReport(1, 50), r2 = this._device.getFeatureReport(2, 50),
			out = {
				channel: channels[r1[1] & 0xf0],
				sensorID: ((r1[1] & 0x0f) << 8) | r1[2],
				battery: (r1[3] & 0xf0) >> 4 === 7 ? 'OK' : 'Low',
				speed: (((r1[4] & 0x1f) << 3) | ((r1[5] & 0x70) >> 4)) / 2,
				signal: r1[8] & 0x0f,

				pressure: ((r2[23] << 8) + r2[24]) / 16 - 208,
				inTemp: getInTemp(r2)
			};

		if ((r1[3] & 0x0f) === 1) {
			out.dir = windDir[r1[5] & 0x0f];
			out.rain = r1[7] & 0x7f;
		}
		if ((r1[3] & 0x0f) === 8) {
			out.outTemp = ((((r1[5] & 0x0f) << 7) | (r1[6] & 0x7f)) - 400) / 10;
			out.humidity = r1[7] & 0x7f;
		}

		if (log && raw) { console.log(toHex(r1)); console.log(toHex(r2)); }
		if (diff) { diff = getDiff(this.data, out); }
		Object.assign(this.data, out);
		return diff || this.data;
	};
		function getDiff(a, b) {
			var f, diff = {};
			for (f in b) { if (b[f] !== a[f]) { diff[f] = b[f]; } }
			return diff;
		}
		function getInTemp (r2) {
			var t = ((r2[21] & 0x0f) << 8) + r2[22];
			if (t >= 0x0800) { t -= 0x1000; }
			return 77 + 0.09 * t;
		}
		function toHex(arr) { return JSON.stringify(arr.map(function(v) { return ('0' + v.toString(16).toUpperCase()).slice(-2); })); }
	Station.prototype.on = function(t, evt) { if (typeof evt === 'function') {
		if (this._events[t].push(evt) === 1) { refreshInterval(this); this._refreshInterval = setInterval(refreshInterval, 18000, this); }
		if (log) { console.log('Registered event'); }
		return this;
	} };
		function refreshInterval(station) {
			var diff = station.refresh(1);
			console.log('Refreshing station data');
			if (Object.keys(diff).length) { station._events.change.forEach(function(evt) { evt(station.data, diff); }); }
		}


refreshStations();
module.exports = { refresh: refreshStations, stations: stations };