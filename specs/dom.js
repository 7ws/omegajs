+function (w) {

describe('CSS Selector Parser (Omega.DOM.parse_selector)', function () {
// tests for Omega.DOM

	it('Separate groups and parts correctly',
	function () {
		var groups = w.DOM.parse_selector([
			'div > section ul',
			'a[href].highlight',
			'table tr:first-child',
			'form[class] input[type = "text"]  ,  '
		].join(', '));

		// groups
		expect(groups.length).toBe(4);

		// parts
		expect(groups[0].parts.length).toBe(3);
		expect(groups[1].parts.length).toBe(1);
		expect(groups[2].parts.length).toBe(2);

		// extra spaces and commas
		var groups = w.DOM.parse_selector('div ,div , div  ,  div  , ');
		expect(groups.length).toBe(4);
		var i = groups.length; while (--i) {
			expect(groups[i].parts.length).toBe(1);
			expect(groups[i].parts[0].rel).toBe(' ');
			expect(groups[i].parts[0].tag_name).toBe('div');
			expect(groups[i].parts[0].id).toBe('');
			expect(groups[i].parts[0].classes.length).toBe(0);
			expect(groups[i].parts[0].attributes.length).toBe(0);
			expect(groups[i].parts[0].pseudos.length).toBe(0);
		}
	});

	// auto parse the selector example
	var groups, part;
	beforeEach(function () {
		if (this.description.slice(0, 3) === '>> ') {
			groups = w.DOM.parse_selector(this.description.slice(3));
			parts = groups[0].parts;
		}
	});

	it('>> div',
	function () {
		expect(parts[0].rel).toBe(' ');
		expect(parts[0].tag_name).toBe('div');
		expect(parts[0].id).toBe('');
		expect(parts[0].classes.length).toBe(0);
		expect(parts[0].attributes.length).toBe(0);
		expect(parts[0].pseudos.length).toBe(0);
	});

	it('>> #content',
	function () {
		expect(parts[0].rel).toBe(' ');
		expect(parts[0].tag_name).toBe('');
		expect(parts[0].id).toBe('content');
		expect(parts[0].classes.length).toBe(0);
		expect(parts[0].attributes.length).toBe(0);
		expect(parts[0].pseudos.length).toBe(0);
	});

	it('>> .content_box',
	function () {
		expect(parts[0].rel).toBe(' ');
		expect(parts[0].tag_name).toBe('');
		expect(parts[0].id).toBe('');
		expect(parts[0].classes.length).toBe(1);
		expect(parts[0].classes[0]).toBe('content_box');
		expect(parts[0].attributes.length).toBe(0);
		expect(parts[0].pseudos.length).toBe(0);
	});

	it('>> .content-box.highlight',
	function () {
		expect(parts[0].rel).toBe(' ');
		expect(parts[0].tag_name).toBe('');
		expect(parts[0].id).toBe('');
		expect(parts[0].classes.length).toBe(2);
		expect(parts[0].classes[0]).toBe('content-box');
		expect(parts[0].classes[1]).toBe('highlight');
		expect(parts[0].attributes.length).toBe(0);
		expect(parts[0].pseudos.length).toBe(0);
	});

	it('>> a[href], a[ href ]',
	function () {
		var i = groups.length; while (--i) {
			expect(groups[i].parts[0].rel).toBe(' ');
			expect(groups[i].parts[0].tag_name).toBe('a');
			expect(groups[i].parts[0].id).toBe('');
			expect(groups[i].parts[0].classes.length).toBe(0);
			expect(groups[i].parts[0].attributes.length).toBe(1);
			expect(groups[i].parts[0].attributes[0].name).toBe('href');
			expect(groups[i].parts[0].attributes[0].op).toBe('');
			expect(groups[i].parts[0].attributes[0].value).toBe('');
			expect(groups[i].parts[0].pseudos.length).toBe(0);
		}
	});

	it('>> a[href^=http://], a[href^="http://"], a[ href ^= http:// ], a[ href^= "http://" ]',
	function () {
		var i = groups.length; while (--i) {
			expect(groups[i].parts[0].rel).toBe(' ');
			expect(groups[i].parts[0].tag_name).toBe('a');
			expect(groups[i].parts[0].id).toBe('');
			expect(groups[i].parts[0].classes.length).toBe(0);
			expect(groups[i].parts[0].attributes.length).toBe(1);
			expect(groups[i].parts[0].attributes[0].name).toBe('href');
			expect(groups[i].parts[0].attributes[0].op).toBe('^=');
			expect(groups[i].parts[0].attributes[0].value).toEqual('http://');
			expect(groups[i].parts[0].pseudos.length).toBe(0);
		}
	});

	it('>> tr:first-child',
	function () {
		expect(parts[0].rel).toBe(' ');
		expect(parts[0].tag_name).toBe('tr');
		expect(parts[0].id).toBe('');
		expect(parts[0].classes.length).toBe(0);
		expect(parts[0].attributes.length).toBe(0);
		expect(parts[0].pseudos.length).toBe(1);
		expect(parts[0].pseudos[0].name).toBe('first-child');
	});

	it('>> section#people_list > li.person div figure:first-child + a[href*="profile/"]',
	function () {
		expect(parts.length).toBe(5);

		// section#people_list
		expect(parts[0].rel).toBe(' ');
		expect(parts[0].tag_name).toBe('section');
		expect(parts[0].id).toBe('people_list');
		expect(parts[0].classes.length).toBe(0);
		expect(parts[0].attributes.length).toBe(0);
		expect(parts[0].pseudos.length).toBe(0);

		// > li.person
		expect(parts[1].rel).toBe('>');
		expect(parts[1].tag_name).toBe('li');
		expect(parts[1].id).toBe('');
		expect(parts[1].classes.length).toBe(1);
		expect(parts[1].classes[0]).toBe('person');
		expect(parts[1].attributes.length).toBe(0);
		expect(parts[1].pseudos.length).toBe(0);

		// div
		expect(parts[2].rel).toBe(' ');
		expect(parts[2].tag_name).toBe('div');
		expect(parts[2].id).toBe('');
		expect(parts[2].classes.length).toBe(0);
		expect(parts[2].attributes.length).toBe(0);
		expect(parts[2].pseudos.length).toBe(0);

		// figure:first-child
		expect(parts[3].rel).toBe(' ');
		expect(parts[3].tag_name).toBe('figure');
		expect(parts[3].id).toBe('');
		expect(parts[3].classes.length).toBe(0);
		expect(parts[3].attributes.length).toBe(0);
		expect(parts[3].pseudos.length).toBe(1);
		expect(parts[3].pseudos[0].name).toBe('first-child');

		// a[href*="profile/"]
		expect(parts[4].rel).toBe('+');
		expect(parts[4].tag_name).toBe('a');
		expect(parts[4].id).toBe('');
		expect(parts[4].classes.length).toBe(0);
		expect(parts[4].attributes.length).toBe(1);
		expect(parts[4].attributes[0].name).toBe('href');
		expect(parts[4].attributes[0].op).toBe('*=');
		expect(parts[4].attributes[0].value).toBe('profile/');
		expect(parts[4].pseudos.length).toBe(0);
	});

	it('>> form[action*="user/"] label > input[type="text"].error ~ .error_message',
	function () {
		expect(parts.length).toBe(4);

		// form[ action *= "user/" ]
		expect(parts[0].rel).toBe(' ');
		expect(parts[0].tag_name).toBe('form');
		expect(parts[0].id).toBe('');
		expect(parts[0].classes.length).toBe(0);
		expect(parts[0].attributes.length).toBe(1);
		expect(parts[0].attributes[0].name).toBe('action');
		expect(parts[0].attributes[0].op).toBe('*=');
		expect(parts[0].attributes[0].value).toBe('user/');
		expect(parts[0].pseudos.length).toBe(0);

		// label
		expect(parts[1].rel).toBe(' ');
		expect(parts[1].tag_name).toBe('label');
		expect(parts[1].id).toBe('');
		expect(parts[1].classes.length).toBe(0);
		expect(parts[1].attributes.length).toBe(0);
		expect(parts[1].pseudos.length).toBe(0);

		// input[type="text"].error
		expect(parts[2].rel).toBe('>');
		expect(parts[2].tag_name).toBe('input');
		expect(parts[2].id).toBe('');
		expect(parts[2].classes.length).toBe(1);
		expect(parts[2].classes[0]).toBe('error');
		expect(parts[2].attributes.length).toBe(1);
		expect(parts[2].attributes[0].name).toBe('type');
		expect(parts[2].attributes[0].op).toBe('=');
		expect(parts[2].attributes[0].value).toBe('text');
		expect(parts[2].pseudos.length).toBe(0);

		// ~ .error_message
		expect(parts[3].rel).toBe('~');
		expect(parts[3].tag_name).toBe('');
		expect(parts[3].id).toBe('');
		expect(parts[3].classes.length).toBe(1);
		expect(parts[3].classes[0]).toBe('error_message');
		expect(parts[3].attributes.length).toBe(0);
		expect(parts[3].pseudos.length).toBe(0);
	});

	it('>> [attr $= "$*+[]^~ " ]',
	function () {
		expect(parts[0].rel).toBe(' ');
		expect(parts[0].tag_name).toBe('');
		expect(parts[0].id).toBe('');
		expect(parts[0].classes.length).toBe(0);
		expect(parts[0].attributes.length).toBe(1);
		expect(parts[0].attributes[0].name).toBe('attr');
		expect(parts[0].attributes[0].op).toBe('$=');
		expect(parts[0].attributes[0].value).toBe('$*+[]^~ ');
		expect(parts[0].pseudos.length).toBe(0);
	});
});

}(Omega);
