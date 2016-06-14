var _id = 0;

function nextUid(){
	return ++_id;
}

function setUid( obj ){
	var t = obj.$$bmoorUid;

	if ( !t ){
		t = obj.$$bmoorUid = nextUid();
	}

	return t;
}

function getUid( obj ){
	if ( !obj.$$bmoorUid ){
		setUid( obj );
	}

	return obj.$$bmoorUid;
}

module.exports = {
	setUid: setUid,
	getUid: getUid
};