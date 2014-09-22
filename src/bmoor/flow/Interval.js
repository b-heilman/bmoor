bMoor.make( 'bmoor.flow.Interval', 
	[
	function(){
		'use strict';

		return {
			construct : function Interval(){
				this.clearAll();
			},
			properties : {
				set : function( func, interval ){
					var list = this.timeouts[ interval ],
						hk = this._c++,
						lhk;

					if ( !list ){
						list = this.timeouts[interval] = { _c : 0 };

						if ( !bMoor.testMode ){
							list._hk = setInterval(function(){
								bMoor.iterate( list, function( f ){
									f();
								});
							}, interval);
						}
					}

					lhk = list._c++;
					list[ lhk ] = func;

					this.hash[ hk ] = { hk : list._c, val : interval };

					return hk;
				},
				flush : function(){
					bMoor.iterate(this.timeouts, function( list ){
						bMoor.iterate( list, function( f ){
							f();
						});
					});
				},
				clear : function( hk ){
					var lhk = this.hash[ hk ];
					if ( lhk ){
						delete this.timeouts[ lhk.val ][ lhk.hk ];
						delete this.hash[ hk ];
					}
				},
				clearAll : function(){
					this._c = 0;
					this.timeouts = {};
					this.hash = {};
				}
			},
			singleton : true
		};
	}]
);
