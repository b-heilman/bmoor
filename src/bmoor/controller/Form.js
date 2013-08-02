;(function( $, global, undefined ){

bMoor.constructor.decorator({
	name : 'Form',
	namespace : ['bmoor','controller'],
	construct : function(){
		var 
			$root = $(this.element),
			dis = this,
			changes = {},
			model = this.model;
			errors = {},
			count = 0;

		if ( model.$isValid == undefined ){
			model.$errors = [];
			model.$messages = [];
			model.$isValid = false;

			model.$addError = function( node ){
				if ( !errors[node.nodeId] ){
					count++;
					errors[ node.nodeId ] = true;

					this.$isValid = false;
				}
			};

			model.$removeError = function( node ){
				if ( errors[node.nodeId] ){
					count--;
					delete errors[node.nodeId];

					if ( !count ){
						this.$isValid = true;
					}
				}
			};

			model.$addChange = function( node ){
				changes[ node.nodeId ] = node;

				if ( count == 0 ) {
					this.$isValid = true;
				}
			}

			model.$appoveChanges = function(){
				var key;

				for ( key in changes ) if ( changes.hasOwnProperty(key) ){
					changes[key].lockValue();
					changes[key].clearState();
				}
			}
		}

		// handle the reset requests
		$root.on( 'click', 'button[type="reset"]', function(){
			var key;

			for ( key in changes ) if ( changes.hasOwnProperty(key) ){
				changes[key].clearState();
			}

			setTimeout(function(){
				$root.find(':input').each(function(){
					if ( this.onchange ) { this.onchange(); }
				});
			},10);
		});

		// handle the submission
		$root.on( 'submit', function( event ){
			// clear the errors and messages
			model.$errors = [];
			model.$messages = [];

			dis.sendPush( function(){
				if ( model.$errors.length == 0 ){
					model.$appoveChanges();
					model.$isValid = false;
				}
			});
			
			return false;
		});
	}
});

}( jQuery, this ));