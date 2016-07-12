define(['jQuery','vendor/jquery.textfill'], function($, textfill) {
    var tallyModule = function () {
        var intervalArray = [];
        this.newMessage = function(data) {
            if (data.topic == "micLive") { 
                switch(data.payload.state) {
                    case "on": 
                        $('#box1').addClass("on");
                        break; 
                    case "off":
                        if (data.payload.liveMics == "[]") { 
                            $('#box1').removeClass("on");
                        }
                        break; 
                }
            } else if (data.topic == "tally") { 
                var id = "box" + (parseInt(data.payload.id) + 1);
                switch(data.payload.state) {
                    case "flash":
                        clearInterval(intervalArray[id]);
                        intervalArray[id] = "";
                        intervalArray[id] = setInterval(function () {
                            $('#' + id).toggleClass("on");
                        }, 500);
                        break; 
                    case "on": 
                        clearInterval(intervalArray[id]);
                        intervalArray[id] = "";
                        $('#' + id).addClass("on");
                        break; 
                    case "off":
                        clearInterval(intervalArray[id]);
                        intervalArray[id] = "";
                        $('#' + id).removeClass("on");
                        break; 
                }
            }
        };
        this.respondTally = function() {
            $("li").each(function(index) {
                $(this).textfill({ maxFontPixels: 200, changeLineHeight:true });
            });
        };
    };
    return tallyModule;
})