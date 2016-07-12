define(['jQuery'], function($) {
    var clockModule = function () {
        var clockRadius;
        var time_sync_interval = 500;
        var time_sync_count = 5;
        var resync_interval = 10000;
        var time_sync_array = new Array();
        var time_sync_correction = 0;
        var time_sync_round_trip;
        var syncStartTime; 
        var interval_handle = null;
        var websocket = null; 
        this.init = function(socket, interval, count) {
            websocket = socket; 
            time_sync_interval = interval || time_sync_interval;
            time_sync_count = count || time_sync_count;
            websocket.onmessage = function(msg) {
                var data = JSON.parse(msg.data); 
                if (data.st == syncStartTime) { 
                    data.crt = new Date().getTime();
                    data.rtt = data.crt - data.ctt;
                    data.offset = data.stt - (data.ctt + (data.rtt / 2));
                    time_sync_array.push(data);
                    if (time_sync_array.length >= time_sync_count) {
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
                        time_sync_correction = time_sync_correction - (data.tz*60*1000);
                        time_sync_round_trip = (rt_total / i);
                    }
                }
            };
            this.resync();
        };
        this.resync = function() {
            time_sync_array = [];
            clearInterval(interval_handle);
            syncStartTime = Date.now();
            interval_handle = setInterval(function() {
                if(time_sync_array.length < time_sync_count) { 
                    var ctt = new Date().getTime();
                    websocket.send(JSON.stringify({"ctt":ctt, "st":syncStartTime})); 
                } else {
                    clearInterval(interval_handle);
                }
            }, time_sync_interval);
        };
        this.time = function get_time() {
            return Date.now() + time_sync_correction;
        };
        this.offset = function() {
            return time_sync_correction;
        };
        this.render = function(canvas, showSeconds, fgColour, dFont, sFont, tFont) {
            var ctx = canvas.getContext('2d');
            var date = new Date(Date.now() + time_sync_correction);
            var hours = date.getUTCHours();
            var minutes = date.getUTCMinutes();
            var seconds = date.getUTCSeconds();

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.beginPath();

            //Digital Clock
            ctx.font = dFont ? dFont : '12vw Sans-Serif';
            ctx.fillStyle = fgColour ? fgColour : '#f00';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(hours + ":" + (minutes < 10 ? "0" : "") + minutes, 0, clockRadius * -0.20);
            if (showSeconds) { 
                ctx.font = sFont ? sFont : '6vw Sans-Serif';
                ctx.fillText((seconds < 10 ? "0" : "") + seconds, 0, clockRadius * 0.50);
            }
            var timeString;
            //Text Time 
            if (minutes === 0) { 
                timeString = ((hours + 11) % 12 + 1) + " o'clock";
            } else if (minutes == 30) { 
                timeString = "Half past " + ((hours + 11) % 12 + 1);
            } else if (minutes == 15) { 
                timeString = "Quarter past " + ((hours + 11) % 12 + 1);
            } else if (minutes == 45) { 
                timeString = "Quarter to " + ((hours + 12) % 12 + 1);
            } else if (minutes > 30) {
                timeString = (60 - minutes) + " mins to " + ((hours + 12) % 12 + 1);
            } else { 
                timeString = minutes + " mins past " + ((hours + 11) % 12 + 1); 
            }
            ctx.font = tFont ? tFont : '4vw Sans-Serif';
            ctx.fillText(timeString, 0, clockRadius * 0.20); 
            var angle, x, y, i;
             //Hour Markers
            for (i = 1; i <= 12; i++) {
                angle = (i - 3) * (Math.PI * 2) / 12;
                x = clockRadius * 0.85 * Math.cos(angle);
                y = clockRadius * 0.85 * Math.sin(angle);
                ctx.beginPath();
                ctx.arc(x, y, clockRadius * 0.03, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.closePath();
                ctx.strokeStyle = fgColour ? fgColour : '#f00';
                ctx.stroke();
            }
            //Second Dots
            for (i = 0; i <= seconds; i++) {
                angle = (i - 15) * (Math.PI * 2) / 60;
                x = clockRadius * 0.95 * Math.cos(angle);
                y = clockRadius * 0.95 * Math.sin(angle);
                ctx.beginPath();
                ctx.arc(x, y, clockRadius * 0.03, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.closePath();
                ctx.stroke();
            }
            ctx.restore();
        };
        this.respondCanvas = function(canvas, container){ 
            canvas.width = $(container).width(); 
            canvas.height = $(container).height(); 
            if ($(container).width() < $(container).height()) {
                clockRadius = ($(container).width() * 0.5);
            } else {
                clockRadius = ($(container).height() * 0.5);
            }
        };
    };
    return clockModule;
});