;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Debug',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','snap','Node'],
	node : {
		singleClass : true,
		className : 'snap-debug'
	},
	properties: {
		_element : function( element ){
			this.__Node._element.call( this, element );
			
			this.vars = {};
		},
		_mapUpdate : function( map ){
			for( var key in map ) if ( map.hasOwnProperty(key) ){
				var el;
				
				if ( !this.vars[key] ){
					var t = document.createElement('div');
					t.innerHTML = key+' : ';
					el = document.createElement('span');
					t.appendChild( el );
					
					this.vars[key] = el;
					
					this.element.appendChild( t );
				}else{
					el = this.vars[key];
				}
				
				el.innerHTML = JSON.stringify( map[key] );
			}
		}
	}
});

}( jQuery, this ));