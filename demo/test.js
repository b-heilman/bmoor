bmoor.dom.triggerEvent( document.getElementById('bmoor'), 'click' );

var target = bmoor.dom.getDomCollection('#target')[0],
	positioned = bmoor.dom.getDomCollection('#positioned')[0];

console.log( bmoor.dom.getBoundryBox(positioned) );
bmoor.dom.centerOn( target, positioned );

setTimeout(function(){
	target.style.width = 50;
	target.style.height = 50;

	bmoor.dom.centerOn( target, positioned );
},3000);