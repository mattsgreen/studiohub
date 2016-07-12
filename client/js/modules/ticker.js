define(['jQuery'], function($) {
    var tickerModule = function () {
        this.init = function(tickerElement, tickerTimeout) {
            setInterval(function () {
                $("#tickerData li:first-child").slideUp(function () {
                    $(this).appendTo(tickerElement).fadeIn();
                });                
            }, tickerTimeout);    
        };
        this.updateMessages = function (data) { 
            var html = "";
            $.each(data.payload.messages, function (index, item) {
                html += "<li>" + item + "</li>";
                $("#tickerData").html(html);
            });
        };
    };
    return tickerModule;
});