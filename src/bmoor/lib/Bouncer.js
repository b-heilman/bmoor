(function( $, global, undefined ){
	
bMoor.constructor.singleton({
	name : 'Bouncer',
	namespace : ['bmoor','lib'],
	module : 'Schedule',
	construct: function(){
		this._stack = [];
		this._done = [];
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
		done : function( op ){
			this._done.push( op );
		},
		_run : function(){
			this._lock = false;
			
			if ( this._stack.length ){
				this.run();
			}else{
				if ( this._done.length ){
					while ( this._done.length ){
						this.add( this._done.shift() );
					}
					
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
				
				if ( this.runWindow === 0 ){
					// if no run window, just run everything as it comes in
					op();
					
					this._run();
				}else{
					if ( this._pauseAfter === null ){
						this._setTime();
					}
					
					op();
					
					if ( (new Date()).getTime() > this._pauseAfter ) {
						setTimeout( function(){ dis._pauseAfter = null; dis._run(); }, this.runPause );
					}else{
						this._run();
					}
				}
			}else{
				this._run(); // clear the done buffer
			}
		}
	}
});

}( jQuery, this ));
