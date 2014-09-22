bMoor.make('bmoor.flow.Batch', 
	[ 'bmoor.flow.Timeout',
	function( Timeout ){
		'use strict';
		
		return {
			construct : function(){
				this.content = null;
				this.timeoutId = null;
				this.notices = [];
			},
			properties : {
				wrap : function( func ){
					var dis = this;

					return function(){
						dis.set( func.apply(this,arguments) );
					};
				},
				set : function( content ){
					this.registerCall();

					this.content = bMoor.object.merge(
						this.content, 
						content
					);
				},
				notice : function( callback ){
					this.notices.push( callback );
				},
				registerCall : function(){
					var dis = this,	
						notices = this.notices;

					Timeout.clear( this.timeoutId );

					this.timeoutId = Timeout.set(function(){
						var content = dis.content,
							i, c;

						dis.content = null;
						for( i = 0, c = notices.length; i < c; i++ ){
							notices[ i ]( content );
						}
					}, 30);
				}
			}
		};
	}]
);