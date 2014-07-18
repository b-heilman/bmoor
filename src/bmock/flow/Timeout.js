bMoor.make('bmock.flow.Timeout',
	['bmoor.flow.Timeout',
	function( Timeout ){
		'use strict';

		return {
			parent : Timeout,
			construct : function MockTimeout(){
				Timeout.$constructor.call( this );
			},
			properties : {
				set : function( func, interval ){
					if ( jasmine.Clock.useMock ){
						jasmine.Clock.useMock();
					}else{
						jasmine.clock().install();
					}
					
					return Timeout.set.call( this, func, interval );
				},
				tick : function( interval ){
					if ( jasmine.Clock.tick ){
						jasmine.Clock.tick( interval ); 
					}else{
						jasmine.clock().tick( interval ); 
					}
				}
			},
			singleton : true
		};
	}]
);