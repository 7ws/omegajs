+function () { 'use strict';

/* Omega JavaScript Library
- Evan Myller, with care for a better web.
*/

function _class(body) {
	// a simple fake constructor factory.

	if (!body) body = {};

	// the real thing
	function init() {
		return body.init.apply(this, arguments);
	}

	// forces instances' .constructor to be init
	body.constructor = init;

	init.prototype = body;

	return init;
}

function _array(object) {
	// convert a iterable object into an array
	return Array.prototype.slice.call(object);
}

function _map(array, callback) {
	// maps array with callback, returning the processed result
	var results = [];
	for (var i = -1, l = array.length; ++i < l;)
		results.push(callback(array[i]));
	return results;
}

function _trim(string) {
	// remove trailing spaces from a string
	return string.replace(/^\s+|\s+$/g, '');
}

function _merge(array, extension) {
	// merge extension into array
	Array.prototype.push.apply(array, extension);
}

var Omega = _class({
	// identifies Omega objects
	__omega__: true,

	init: function (object, context) {
		if (object && object.__omega__)
			return object;

		// being called instead of instantiated
		if (this.constructor !== Omega)
			return new Omega(object, context);

		// "initialize" the object as an array
		this.length = 0;

		// fill the object with a Omega.DOM.QuerySet object
		if (typeof object === 'string')
			_merge(this, new dom.Query(object, context).results);

		// wrap a dom element or the Window object
		else
		if (object.nodeType && object.nodeName || object === window)
			_merge(this, [object]);
	},

	toString: function () { return '[object Omega]' },

	// Trick to make Consoles display an Omega object as an array
	splice: function () {}
});

Omega.extend = function (extension) {
	// a shortcut to extend the Omega prototype
	for (var key in extension)
		if (Object.prototype.hasOwnProperty.call(extension, key))
			Omega.prototype[key] = extension[key];
};

// Expose Omega main constructor to window scope
if (typeof window !== 'undefined') window.Omega = Omega;


/* The Omega DOM library */

var dom = Omega.DOM = {
	Query: _class({
		// a rapid element selector based on CSS selectors.

		init: function (selector, context) {
			var start_time = new Date;
			var results = [];

			// split and trim the selectors (if more than one)
			var selectors = _map(
				_trim(selector).split(','),
				function (selector) { return _trim(selector) });

			// process many selectors
			if (selectors.length > 1)
				for (var i = -1; selectors[++i];)
					_merge(results,
						new dom.Query(selectors[i], context).results);

			// process a single selector
			else {
				selector = selectors[0]
					.replace(/\s+/g, ' ')
					.replace(/([>+~]) /g, '$1')
					.split(' ');

				context = new Omega(context || document);

				while (selector.length) {
					var token = new dom.QueryToken(selector.shift());
					var elements = [];

					for (var i = -1, all = []; context[++i];)
						_merge(all, _array(
							context[i].getElementsByTagName(token.tag_name)));

					for (var i = -1; all[++i];)
						dom.match(all[i], token) && elements.push(all[i]);

					context = elements;
				}

				results = elements;
			}

			this.results = [];

			// clean the result set to avoid duplicates
			for (var i = -1; results[++i];)
				if (this.results.indexOf(results[i]) === -1)
					this.results.push(results[i]);

			// records the spent time
			this.time = new Date - start_time;
		}
	}),

	QueryToken: _class({
		// parse a CSS selector into a detailed object

		TAG: /^[a-z]+/i,
		ID: /#[\w-]+/,
		CLASS: /\.[\w-]+/g,

		init: function (selector) {
			this.tag_name = (selector.match(this.TAG) || ['*'])[0];
			this.id = (selector.match(this.ID) || [null])[0];
			this.classes = _array(selector.match(this.CLASS) || []);
		}
	}),

	match: function (dom_element, token) {
		// test an element against a QueryToken

		// id
		if (token.id && dom_element.getAttribute('id') !== token.id.slice(1))
			return false;

		// class name filtering
		if (token.classes.length) {
			var el_classes = ' ' + dom_element.className + ' ';

			for (var i = -1; token.classes[++i];)
				if (el_classes.indexOf(token.classes[i].slice(1)) < 0)
					return false;
		}

		return true;
	}
};

}();
