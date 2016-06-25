var bmoor = require('../bmoor.js');

bmoor.dom.triggerEvent( bmoor.dom.getDomElement('#bmoor'), 'click' );

var target = bmoor.dom.getDomElement('#target'),
	positioned = bmoor.dom.getDomElement('#positioned');

bmoor.dom.centerOn( target, positioned );

setTimeout(function(){
	target.style.width = 50;
	target.style.height = 50;

	bmoor.dom.centerOn( target, positioned );
},2000);

setTimeout(function(){
	bmoor.dom.getDomCollection('#wrapper')[0].style.position='static';
	positioned.style.position = 'fixed';

	positioned.style.left = '20%';
	positioned.style.top = '20%';
	
	bmoor.dom.showOn( target, positioned );
},4000);

setTimeout(function(){
	positioned.style.left = '20%';
	positioned.style.top = '80%';
	
	bmoor.dom.showOn( target, positioned );
},6000);

setTimeout(function(){
	positioned.style.left = '80%';
	positioned.style.top = '80%';
	
	bmoor.dom.showOn( target, positioned );
},8000);

setTimeout(function(){
	positioned.style.left = '80%';
	positioned.style.top = '20%';
	
	bmoor.dom.showOn( target, positioned );
},10000);