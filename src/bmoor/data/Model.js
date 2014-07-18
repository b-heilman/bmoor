bMoor.define( 'bmoor.data.Model', 
	[
	function(){
		'use strict';

		return {
			// TODO : readd merge
			override : function( from ){
				if ( bMoor.isArrayLike(from) ){
					bMoor.array.override( this, from );
				}else{
					bMoor.object.override( this, from );
				}

				return this;
			},
			validate : function(){ 
				return true; 
			},
			inflate : function( content ){
				return content;
			},
			deflate : function(){
				return this.simplify(); 
			},
			update : function( content ){
				return bMoor.object.merge( this, content );
			},
			simplify : function(){
				var rtn = {};

                bMoor.iterate( this, function( value, key ){
                	if ( !bMoor.isFunction(value) ){
                		rtn[ key ] = value;
                	}
                });
				
				return rtn;
			},
			toJson : function(){
				return JSON.stringify( this.simplify() );
			}
		};
	}]
);

