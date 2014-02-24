bMoor.define( 'bmoor.core.Map', [function(){
	return {
		traits : [
			'bmoor.core.Model'
		],
		construct : function( content ){
			this.merge( this.inflate(content) );
		},
		properties : {
			simplify : function(){
				var key,
                    content = {};

				this._deflate();

				for( key in this ){
					if ( this.hasOwnProperty(key) && key.charAt(0) !== '&' ){
						content[ key ] = this[ key ];
					}
				}

				return content;
			},
			toJson : function(){
				return JSON.stringify( this.simplify() );
			}
		}
	};
}]);

