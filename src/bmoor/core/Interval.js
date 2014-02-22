(function(){
	
	bMoor.define( 'bmoor.core.Interval', {
		singleton : true,
		construct : function(){
			this._c = 0;
			this.timeouts = {};
			this.hash = {};
		},
		properties : {
			set : function( func,interval ){
				var list = this.timeouts[interval],
					hk = this._c++,
					lhk;

				if ( !list ){
					list = this.timeouts[interval] = { _c : 0 };

					list._hk = setInterval(function(){
						bmoor.iterate( list, function( f ){
							f();
						});
					}, interval);
				}

				lhk = list._c++;
				list[ lhk ] = func;

				this.hash[ hk ] = { hk : list._c, val : interval };

				return hk;
			},
			clear : function( hk ){
				var lhk = this.hash[ hk ];
				if ( lhk ){
					delete this.timeouts[ lhk.val ][ lhk.hk ];
					delete this.hash[ hk ];
				}
			}
		},
		plugins : {
			'setInterval' : 'set',
			'clearInterval' : 'clear'
		}
	});

}());