(function( $, global, undefined ){
	
bMoor.constructor.singleton({
	name : 'Bouncer',
	namespace : ['bmoor','snap'],
	construct: function(){
		this._stack = [];
		this._empty = [];
		this._pauseAfter = null;
		this._lock = false;
	},
	properties: {
		runPause : 30,
		runWindow : 300,
		_setTime : function(){
			this._pauseAfter = ( new Date() ).getTime() + this.runWindow;
		},
		add : function( op ){
			this._stack.push( op );
		},
		empty : function( op ){
			this._empty.push( op );
		},
		_run : function(){
			if ( this._stack.length ){
				this._lock = false;
				this.run();
			}else{
				if ( this._empty.length ){
					while ( this._empty.length ){
						this.add( this._empty );
					}
					
					this._lock = false;
					this.run();
				}else{
					this._pauseAfter = null;
				}
			}
		},
		run : function(){
			var 
				dis = this,
				op;
		
			if ( this._stack.length && !this._lock ){
				this._lock = true;
				
				op = this._stack.shift();
				
				if ( this.runWindow == 0 ){
					// if no run window, just run everything as it comes in
					op();
					
					this._run();
				}else{
					if ( this._pauseAfter == null ){
						this._setTime();
					}
					
					op();
					
					if ( this._stack.length ){
						if ( (new Date()).getTime() > this._pauseAfter ) {
							setTimeout( function(){ dis._pauseAfter = null; dis._run(); }, this.runPause );
						}else{
							this._run();
						}
					}
				}
			}
		}
	}
});

}( jQuery, this ));