+function () { 'use strict';

/* Omega JavaScript Library
- Evan Myller, with care for a better web.
*/

function _class(body) {
	// A simple fake constructor factory.
	if (!body) body = {};

	function constructor() {
		return body.init.apply(this, arguments);
	}

	body.constructor = constructor;
	constructor.prototype = body;
	return constructor;
}

var Omega = _class({
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
