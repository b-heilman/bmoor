export function trim( str, chr ){
	if ( !chr ){
		chr = '\\s';
	}
	return str.replace( new RegExp('^'+chr+'+|'+chr+'+$','g'), '' );
}

export function ltrim( str, chr ){
	if ( !chr ){
		chr = '\\s';
	}
	return str.replace( new RegExp('^'+chr+'+','g'), '' );
}

export function rtrim( str, chr ){
	if ( !chr ){
		chr = '\\s';
	}
	return str.replace( new RegExp(chr+'+$','g'), '' );
}