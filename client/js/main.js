require.config({
    paths: {
        'jQuery': 'vendor/jquery',
    },
    shim: {
        'jQuery': {
            exports: '$'
        }
    }
});
require(['vendor/reconnectWebsocket','modules/clock', 'modules/tally', 'modules/data', 'modules/ticker','jQuery'], function (reconnectWebsocket, clockModule, tallyModule, dataModule, tickerModule, $) {
    //Load required modules into local variables
    var dataModule = new dataModule(); 
    var tallyModule = new tallyModule(); 
    var tickerModule = new tickerModule(); 
    var clock = new clockModule();
    dataModule.init('#toptext','#bottomtext'); 
    tickerModule.init('#tickerData', 6000);
    $(document).ready(function() {
        function startClock() { 
            var clockTimer;
            var canvas = $('#canvas')[0];
            var container = $('#clock'); 
            var wsUri = "ws:";
            var loc = window.location;
            if (loc.protocol === "https:") { wsUri = "wss:"; }
            wsUri += "//" + loc.host + "/api/ws/timesync";
            var wsClock = new reconnectWebsocket(wsUri);
            wsClock.onopen = function (e) {
                clock.init(wsClock);
                clock.respondCanvas(canvas, container);
            };
            //Set timer to render the clock every half second
            clockTimer = setInterval(function() {
                clock.render(canvas, true)} 
            ,500);
            $(window).resize(function(){
                clock.respondCanvas(canvas,container);
            });
        }
        startClock(); 
        function startLogic() { 
            var wsUri = "ws:";
            var loc = window.location;
            if (loc.protocol === "https:") { wsUri = "wss:"; }
            wsUri += "//" + loc.host + "/api/ws/logic";
            var wsLogic = new reconnectWebsocket(wsUri);
            wsLogic.onopen = function (e) {
                tallyModule.respondTally();
                wsLogic.onmessage = function(msg) { 
                    var data = JSON.parse(msg.data); 
                        switch(data.topic) {
                            case "micLive": 
                                tallyModule.newMessage(data); 
                                break; 
                            case "tally": 
                                tallyModule.newMessage(data);
                                break;
                            case "nowNext": 
                                dataModule.newMessage(data);
                                break; 
                            case "currentShow":
                                dataModule.newMessage(data); 
                                break;
                            case "messages": 
                                tickerModule.updateMessages(data); 
                                break; 
                        } 
                };
            };
        }
        startLogic();
        $(window).resize(function(){
            tallyModule.respondTally();
        });
    });    
});