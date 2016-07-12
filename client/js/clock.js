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
require(['vendor/reconnectWebsocket','modules/clock', 'jQuery'], function (reconnectWebsocket, clockModule, $) {
    //Load required modules into local variables
    var clock = new clockModule();
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
    });
});