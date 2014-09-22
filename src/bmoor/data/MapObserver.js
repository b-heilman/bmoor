bMoor.make( 'bmoor.data.MapObserver', 
	['bmoor.flow.Interval',
	function( interval ){
		'use strict';
		
		var $snapMO = 0;

		return {
			construct : function MapObserver( model ){
				var dis = this,
					inst = interval;

				this.$snapMO = $snapMO++;

				this.checking = false;
				this.watching = {};
				this.observe( model );
				this.start();

				inst.set(function(){
					dis.check();
				}, 30);
			},
			properties : {
				observe : function( model ){
					if ( this.model ){
						delete this.model.$observers[ this.$snapMO ];
					}

					this.model = model;

					if ( !model.$observers ){
						model.$observers = {};
					}

					model.$observers[ this.$snapMO ] = this;
				},
				watch : function( variable, func ){
					var p, 
						t; // registers what the observe monitors
					
					if ( !this.watching[variable] ){
						p = variable.split('.');

						this.watching[variable] = {
							path : p,
							value : this.evaluate( p ),
							calls : []
						};
					}

					t = this.watching[ variable ];

					func( t.value, undefined ); // call when first inserted
					
					t.calls.push( func );
				},
				evaluate : function( path ){
					var i, c,
						val = this.model;

					if ( bMoor.isString(path) ){
						path = path.split('.');
					}

					for( i = 0, c = path.length; i < c && val !== undefined; i++ ){
						val = val[ path[i] ];
					}

					return val;
				},
				check : function(){
					var dis = this;

					// see if anything has changed in the model
					if ( this.active && !this.checking ){
						this.checking = true;
						
						bMoor.iterate( this.watching, function( watch ){
							var i, c,
								val = dis.evaluate( watch.path );

							if ( val !== watch.value ){
								for( i = 0, c = watch.calls.length; i < c; i++ ){
									watch.calls[ i ]( val, watch.value );
								}

								watch.value = val;
							}
						});
						this.checking = false;
					}
				},
				start : function(){
					this.active = true;
				},
				stop : function(){
					this.active = false;
				}
			}
		};
	}]
);
