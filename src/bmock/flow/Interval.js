bMoor.make('bmock.flow.Interval',
	['bmoor.flow.Interval',
	function( Interval ){
		'use strict';

		return {
			parent : Interval,
			construct : function MockInterval(){
				Interval.$constructor.call( this );
			},
			properties : {
				set : function( func, interval ){
					if ( jasmine.Clock.useMock ){
						jasmine.Clock.useMock();
					}else{
						jasmine.clock().install();
					}
					
					Interval.set.call( this, func, interval );
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