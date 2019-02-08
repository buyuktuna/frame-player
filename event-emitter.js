

class EventEmitter {

    constructor () {
        console.log("cons emitter");
        this.events = {};
    };
    
    on = function (event, listener) {
        console.log("on ", event);
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }
        
        this.events[event].push(listener);
    };
    
    removeListener = function (event, listener) {
        var idx;
    
        if (typeof this.events[event] === 'object') {
            idx = indexOf(this.events[event], listener);
    
            if (idx > -1) {
                this.events[event].splice(idx, 1);
            }
        }
    };
    
    emit(event, ...args) {
        if (typeof this.events[event] === 'object') {
            this.events[event].forEach(listener => listener.apply(this, args));
        }
    }

}