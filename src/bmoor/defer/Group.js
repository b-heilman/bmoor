(function(){
	
	function check(){
		if ( this.count === 0 && this.loaded ){
			if ( this.errors.length ){
				this.defer.reject( errors );
			}else{
				this.defer.resolve( true );
			}
		}
	}

	function rtn(){
		this.count--;
		check.call( this );
	}

	bMoor.define({
		name : 'bmoor.defer.Group',
		construct : function(){
			this.count = 0;
			this.loaded = false;
			this.errors = [];
			this.defer = new bmoor.defer.Basic();
			this.promise = this.defer.promise;
		},
		properties : {
			add : function( defered ){
				var dis = this;
				this.count++;

				defered.then(
					function(){
						rtn.call( dis );
					},
					function( error ){
						dis.errors.push( error );
						rtn.call( dis );
					}
				);
			},
			run : function(){
				this.loaded = true;
				check.call( this );
			}
		}
	});

}());