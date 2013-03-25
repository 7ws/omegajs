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

function _strip(string, target) {
	// remove trailing spaces or specified character from a string
	if (!target) target = '\\s';
	return string.replace(new RegExp('^['+target+']+|['+target+']+$', 'g'), '');
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
			var start_time = new Date,
			    groups = dom.parse_selector(selector),
			    results = [];

			for (var g = -1, group, curr_context; group = groups[++g];) {
				curr_context = new Omega(context || document);

				for (var p = -1, part; part = group.parts[++p];) {
					var elements = [];

					// collect context
					for (var i = -1, all; curr_context[++i];) {
						all = curr_context[i].getElementsByTagName(part.tag_name);

						for (var j = -1; all[++j];)
							dom.match(all[j], part) && elements.push(all[j]);
					}

					curr_context = elements;
				}

				_merge(results, elements);
			}

			this.results = [];

			for (var i = -1; results[++i];)
				// clean the result set to avoid duplicates
				if (this.results.indexOf(results[i]) === -1)
					this.results.push(results[i]);

			// records the spent time
			this.time = new Date - start_time;
		}
	}),

	parse_selector: function (selector) {
		// parse a complete CSS selector into groups of detailed parts

		selector = _strip(selector, '\\s,');

		var groups = [], group, g = 0,
		    part, p = 0,
		    pos = -1, c,
		    curr_token,
		    in_quote = false,

		    // placeholders for values being parsed
		    attr, pseudo;

		while (++pos < selector.length) {
			// shortcut to current character
			c = selector.charAt(pos);

			// create new group
			if (!groups[g])
				groups[g] = group = {
					parts: [],
					str: ''
				};

			// create new part
			if (!group.parts[p])
				group.parts[p] = part = {
					rel: ' ',
					tag_name: '',
					id: '',
					classes: [],
					attributes: [],
					pseudos: [],
					str: ''
				};

			// toggle "quote state"
			if (c === '"') {
				in_quote = !in_quote;
				continue;
			}

			// node relationship
			else
			if (!in_quote && !curr_token && '>+~'.indexOf(c) !== -1) {
				part.rel = c;
				continue;
			}

			// handle space
			else
			if (!in_quote && c === ' ') {
				// breaks into a new part
				if (curr_token !== 'attr' && part.str) {
					p++;
					console.log(g, p, part.str);
					curr_token = undefined;
				}

				// ignore trailing spaces
				continue;
			}

			// new group
			else
			if (!in_quote && c === ',') {
				p = 0;
				g++;
				continue;
			}

			// id
			else
			if (!in_quote && c === '#')
				curr_token = 'id';

			// class name
			else
			if (!in_quote && c === '.') {
				curr_token = 'class_name';
				part.classes.push('');
			}

			// attribute
			else
			if (!in_quote && c === '[') {
				// start attribute
				curr_token = 'attr';
				part.attributes.push(attr = {
					name: '',
					op: '',
					value: ''
				});
			}
			else
			if (!in_quote && curr_token === 'attr'
			&& '$*=]^~'.indexOf(c) !== -1) {
				// end attribute
				if (c === ']')
					curr_token = undefined;

				// attribute operator
				else
					attr.op += c;
			}

			// pseudo classes
			else
			if (!in_quote && c === ':' && curr_token !== 'attr') {
				curr_token = 'pseudo';
				part.pseudos.push(pseudo = {
					name: '',
					param: ''
				});
			}

			// append according to switch token, if any
			else {
				if (curr_token === 'id')
					part.id += c;

				else
				if (curr_token === 'class_name' && part.classes.length)
					part.classes[part.classes.length - 1] += c;

				else
				if (curr_token === 'attr')
					attr[attr.op ? 'value' : 'name'] += c;

				else
				if (curr_token === 'pseudo')
					pseudo.name += c;

				else
					part.tag_name += c;
			}

			// proceed adding the char
			part.str += c;
		}

		// clean the groups compile the complete selectors strings
		for (g = -1; group = groups[++g];) {
			for (p = -1; part = group.parts[++p];)
				group.str += (part.rel + ' ' + part.str + ' ');

			group.str = _strip(group.str).replace(/\s{2,}/g, ' ');
		}

		return groups;
	},

	match: function (element, token) {
		// test an element against a parsed selector

		// id
		if (token.id && element.getAttribute('id') !== token.id)
			return false;

		// class name filtering
		if (token.classes.length) {
			var el_classes = ' ' + element.className + ' ';

			for (var i = -1; token.classes[++i];)
				if (el_classes.indexOf(token.classes[i]) < 0)
					return false;
		}

		// attribute filtering
		for (var i = -1, attr; attr = token.attributes[++i];)
			if (
				// element doesn't have such attribute
				!element.hasAttribute(attr.name)

				// element has attribute but it doesn't match
				|| attr.op &&
					!dom._attr_match[attr.op](
						element.getAttribute(attr.name),
						attr.value, ' "')
			)
				return false;

		// pseudo classes filtering
		for (var i = -1, pseudo; pseudo = token.pseudos[++i];)
			if (!dom._pseudo_match[pseudo.name](element, pseudo.param))
				return false;

		return true;
	},

	_attr_match: {
		// collection of attribute matchers

		'=': function (actual_value, test) {  // matches exactly
			return actual_value === test;
		},
		'*=': function (actual_value, test) {  // contains
			return actual_value.indexOf(test) !== -1;
		},
		'~=': function (actual_value, test) {  // contains word
			return (' ' + actual_value + ' ').indexOf(' ' + test + ' ') !== -1;
		},
		'^=': function (actual_value, test) {  // starts with
			return !actual_value.indexOf(test);
		},
		'$=': function (actual_value, test) {  // ends with
			return actual_value.slice(-test.length) === test;
		}
	},

	_pseudo_match: {
		'first-child': function (element) {
			var first_child = element.parentNode.firstChild;
			while (first_child.nodeType !== 1)
				first_child = first_child.nextSibling;

			return element === first_child;
		},

		'last-child': function (element) {
			var last_child = element.parentNode.lastChild;
			while (last_child.nodeType !== 1)
				last_child = last_child.previousSibling;

			return element === last_child;
		},

		'only-child': function (element) {
			return (
				dom._pseudo_match['first-child'](element) &&
				dom._pseudo_match['last-child'](element));
		}
	}
};

}();
