/**
 * Array helper functions
 * @module bmoor.string
 **/

function trim(str, chr) {
	if (!chr) {
		chr = '\\s';
	}
	return str.replace(new RegExp('^' + chr + '+|' + chr + '+$', 'g'), '');
}

function ltrim(str, chr) {
	if (!chr) {
		chr = '\\s';
	}
	return str.replace(new RegExp('^' + chr + '+', 'g'), '');
}

function rtrim(str, chr) {
	if (!chr) {
		chr = '\\s';
	}
	return str.replace(new RegExp(chr + '+$', 'g'), '');
}

function skewerToCamel(str) {
	const arr = str.split('-');
	const capital = arr.map((item, index) =>
		index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item
	);

	return capital.join('');
}

module.exports = {
	trim,
	ltrim,
	rtrim,
	skewerToCamel
};
