var _id = 0;

function nextUid(){
	return ++_id;
}

export function setUid( obj ){
	var t = obj.$$bmoorUid;

	if ( !t ){
		t = obj.$$bmoorUid = nextUid();
	}

	return t;
}

export function getUid( obj ){
	if ( !obj.$$bmoorUid ){
		setUid( obj );
	}

	return obj.$$bmoorUid;
}