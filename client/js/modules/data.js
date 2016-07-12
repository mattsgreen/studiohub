define(['jQuery'], function($) {
    var dataModule = function () {
        var show, now, next; 
        this.init = function(showElement, nowElement, nextElement) {
            show = showElement; 
            now = nowElement; 
            next = nextElement; 
        };
        this.newMessage = function(data) {
            if (data.topic == "nowNext") { 
                if (data.payload.now) { $(now).text(data.payload.now) }
                if (data.payload.next) {$(next).text(data.payload.next)}
                if (data.payload.show) {$(show).text(data.payload.show)} 
            } else if (data.topic == "currentShow") { 
                $(show).text(data.payload);
            } 
        };
    };
    return dataModule;
});