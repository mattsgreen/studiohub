/* global localStorage */ 
define([], function() {
    var clockSync = function () {
        var time_sync_interval = 500;
        var time_sync_count = 5;
        var time_sync_array = new Array();
        var time_sync_correction = localStorage.ntpLastOffset || 0;
        var time_sync_round_trip = localStorage.ntpLastRoundTrip || Infinity;
        var interval_handle = null;
        var websocket = null; 

        this.newSync = function () {
            var offset_total = 0;
            var rt_total = 0;
            for(var i = 0; i < time_sync_array.length; i++) {
                if(time_sync_array[i]) {
                    offset_total += time_sync_array[i].offset;
                    rt_total += time_sync_array[i].rtt;
                } else {
                    break;
                }
            }
            time_sync_correction = (offset_total / i);
            time_sync_round_trip = (rt_total / i);
            localStorage.ntpLastOffset = time_sync_correction;
            localStorage.ntpLastRoundTrip = time_sync_round_trip;
        };
        this.resync = function() {
            time_sync_array = [];
            clearInterval(interval_handle);
            interval_handle = setInterval(function() {
                if(time_sync_array.length < time_sync_count) { 
                    console.log("sending message");
                    var ctt = new Date().getTime();
                    websocket.send(JSON.stringify({"ctt":ctt})); 
                } else {
                    clearInterval(interval_handle);
                }
            }, time_sync_interval);
        };
        this.init = function(socket, interval, count) {
            websocket = socket; 
            time_sync_interval = interval || time_sync_interval;
            time_sync_count = count || time_sync_count;
            websocket.onmessage = function(msg) {
                var data = JSON.parse(msg.data); 
                data.crt = new Date().getTime();
                data.rtt = data.crt - data.ctt;
                data.offset = data.stt - (data.ctt + (data.rtt / 2));
                time_sync_array.push(data);
                if (time_sync_array.length >= time_sync_count) {
                    this.newSync();
                }
            };
            this.resync();
        };
        this.time = function get_time() {
            return Date.now() + time_sync_correction;
        };
        this.offset = function() {
            return time_sync_correction;
        };
        this.round_trip = function() {
            return time_sync_round_trip;
        };    
    };
    return clockSync;
});