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

var Omega = _class({
	// identifies Omega objects
	__omega__: true,

	init: function (object) {
		if (object.__omega__)
			return object;

		// being called instead of instantiated
		if (this.constructor !== Omega)
			return new Omega(object);
	},

	toString: function () { return '[object Omega]' }
});

// Expose Omega main constructor to window scope
if (typeof window !== 'undefined') window.Omega = Omega;

}();
