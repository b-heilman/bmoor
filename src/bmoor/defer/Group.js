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

	bMoor.define( 'bmoor.defer.Group', {
		construct : function(){
			this.count = 0;
			this.loaded = false;
			this.errors = [];
			this.defer = new bmoor.defer.Basic();
			this.promise = this.defer.promise;
		},
		properties : {
			add : function( promise ){
				var dis = this;
				this.count++;

				promise.then(
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
		},
		plugins : {
			'allDone' : function(){
				var inst = this,
					group = new inst(),
					promises;

				if ( arguments.length > 1 ){
					promises = arguments;
				}else{
					promises = arguments[0];
				}

				bMoor.forEach(promises, function(p){
					group.add( p );
				});

				group.run();

				return group.promise;
			}
		}
	});

});