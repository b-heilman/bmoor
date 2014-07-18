bMoor.make('bmoor.flow.Regulator', 
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

					if ( !this.timeoutId ){
						this.timeoutId = Timeout.set(function(){
							var content = dis.content,
								i, c;

							dis.content = null;
							this.timeoutId = null;

							for( i = 0, c = notices.length; i < c; i++ ){
								notices[ i ]( content );
							}
						}, 30);
					}
				}
			}
		};
	}]
);