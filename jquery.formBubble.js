/*
 * FormBubble v0.1.2
 * Requires jQuery v1.32+
 * Created by Scott Greenfield
 *
 * Copyright 2010, Lyconic, LLC 
 * http://lyconic.com/
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Most functions can be called programatically enabling you to bind them to your own events.
 * These functions must be called *after* the the bubble has been initialized.
 *
 * Visit http://www.lyconic.com/resources/tools/formbubble for support and the most up to date version.
 *
 */
(function($) {
    $.fn.formBubble = function(params) {        
        p = $.extend({
            url: 'none',
            dataType: 'none',
            alignment: 'top-right',
            animationSpeed: 300,
            fadeOnBlur: true,
            cache: false,
            closeButton: true,
            slide: true,
            onOpenCallback: function(){ },
            onCloseCallback: function(){ },
            text: '',
            vOffset: 6,
            hOffset: 13
        }, params);
        $.fn.formBubble.bubbleObject = '.form-bubble';
        var objectCount = $(this).length;
        return this.each(function(i) {
            $.fn.formBubble.init(objectCount, i); //this will happen once and only once (even if you bind formbubble to your own events that can be triggered multiple times)
            $.fn.formBubble.alignTo($(this));
            if (p.url != 'none' && p.dataType != 'image' && $('.form-bubble' + ' #ajaxLoaded').length === 0){
                $.fn.formBubble.ajax();
            }
            $.fn.formBubble.open($(this));
        });
    };
    $.extend($.fn.formBubble, { //these functions can all be called programatically or overridden
        browser: '',
        ajax: function(){
            $.ajax({
                beforeSend: function() { $.fn.formBubble.beforeSend(); },
                cache: p.cache,
                type: 'GET',
                url: p.url,
                dataType: p.dataType,
                success: function(data) { $.fn.formBubble.success(data); },
                complete: function(data) { $.fn.formBubble.complete(); }
            });
        },
        beforeSend: function(){
            $('.form-bubble').find('.form-bubble-content').empty();
            $('.form-bubble').find('.form-bubble-content').append('<div id="bubble-loading"><img src="/images/loading.gif" alt="Loading..." title="Loading..." /></div>');
            
        },
        success: function(data) {
            var dataValue;
            if (p.dataType == 'json'){
                dataValue = data.html;
            }
            if (p.dataType == 'html'){
                dataValue = data;
            }
            $('.form-bubble').find('.form-bubble-content').append(dataValue);
        },
        complete: function(){
            $('.form-bubble' + ' #bubble-loading').remove();            
        },
        alignTo: function(bubbleTarget){
            var animate, position, top, left, hOffset, vOffset, bubbleObject;
            bubbleObject = $.fn.formBubble.bubbleObject;
            animate = function(){
                $(bubbleObject).stop().animate({'left' : left, 'top' : top}, p.animationSpeed);
            };
            position = bubbleTarget.offset();
            top = position.top;
            left = position.left;
            hOffset = p.hOffset;
            vOffset = p.vOffset;
            if (p.alignment == 'top-right'){ //doesn't need offsets supplied to work
                hOffset = hOffset + bubbleTarget.outerWidth(); //if the supplied an offset add it on to it
                top = top - vOffset;
                left = left + hOffset;
                if ($(bubbleObject).css("display") != "none"){
                    $(bubbleObject).fadeTo(0, 1);
                }
                if (p.slide && $(bubbleObject).css("display") != "none"){
                    animate();
                }else{
                    $(bubbleObject).css({'left' : left, 'top' : top});
                }
            }
            if (p.alignment == 'top'){
                hOffset = hOffset + $(bubbleObject).outerWidth()/-4; //if the supplied an offset add it on to it
                vOffset = vOffset + ($(bubbleObject).outerHeight());
                top = top - vOffset;
                left = left + hOffset;
                if ($(bubbleObject).css("display") != "none"){
                    var crappyBrowserVersion;
                    if (navigator.appName == 'Microsoft Internet Explorer'){
                        var ua = navigator.userAgent;
                        var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                        if (re.exec(ua) != null) crappyBrowserVersion = parseFloat( RegExp.$1 );
                        if (crappyBrowserVersion <= 7){
                            $.fn.formBubble.browser = 'lte ie7';
                        }else{
                            $(bubbleObject).fadeTo(0, 1);
                        }
                    }else{
                      $(bubbleObject).stop().fadeTo(0, 1);
                    }
                }
                if (p.slide && $(bubbleObject).css("display") != "none"){
                    animate();
                }else{
                    $(bubbleObject).css({'left' : left, 'top' : top});
                }
            }
        },
        bindings: function(bubbleObject){ //default bindings, these can be overridden and also called programatically, although they don't need to be.
            $(bubbleObject).find('.form-bubble-close').click(function() {
                $.fn.formBubble.close(bubbleObject);
            });
            $(bubbleObject).click(function() {
                return false;
            });
            if (!($.fn.formBubble.isBound)){ //ensures document-wide events are only bound once
                $(document).click(function(event) {
                    if ((event.button === 0) && (p.fadeOnBlur)){
                        $.fn.formBubble.close();
                    }
                });
            }
            $.fn.formBubble.isBound = true;
        },
        close: function(bubbleObject){
            var bubbleOpenNow = $($.fn.formBubble.bubbleObject).length;
            $.fn.formBubble.initialized = true;
            if (!(bubbleObject)){
                bubbleObject = $('.form-bubble');
            }
            if ($.fn.formBubble.initialized){
                if ($(bubbleObject).css("display") != "none"){ //bubble is visible
                    if ($.fn.formBubble.browser == 'lte ie7'){
                        if (bubbleOpenNow){
                            $(bubbleObject).remove();
                            $.fn.formBubble.initialized = false;
                            p.onCloseCallback();
                        }else{
                            $.fn.formBubble.initialized = false;
                        }
                    }else{
                        if (bubbleOpenNow){
                            $(bubbleObject).stop().fadeOut(p.animationSpeed, function(){
                                $(this).remove();
                                $.fn.formBubble.initialized = false;
                                p.onCloseCallback();
                            });
                        }else{
                            $.fn.formBubble.initialized = false;
                        }
                    }
                }
            }
            return false;
        },
        defaultBindings: true,
        init: function(objectCount, i){
            if (objectCount <= 1){
                if ($.fn.formBubble.initialized){
                    return true;
                }else{
                    $.fn.formBubble.initialized = true;
                }
            }else{
                $.fn.formBubble.initialized = true;    
            }
            $('body').append('<div class="form-bubble"></div>');
            var bubbleObject = $('.form-bubble:eq(' + i + ')');
            $.fn.formBubble.bubbleObject = bubbleObject;
            if (p.closeButton){
                $(bubbleObject).prepend('<div class="form-bubble-close"></div>');
            }
            $(bubbleObject).append('<div class="form-bubble-pointer-' + p.alignment + '"></div>');
            $(bubbleObject).append('<div class="form-bubble-content"></div>');
            if ($.fn.formBubble.defaultBindings){
                $.fn.formBubble.bindings(bubbleObject);
            }
            return true;
        },
        initialized: false,
        open: function(bubbleTarget){
            var bubbleObject = $.fn.formBubble.bubbleObject;
            if (p.dataType == 'image'){
                if ($(bubbleObject).find('.form-bubble-content img').length === 0){
                    $(bubbleObject).find('.form-bubble-content').append('<div class="image"><img src="' + p.url + '" /></div>');
                }
                $.fn.formBubble.beforeSend();
                $(bubbleObject).find('.form-bubble-content').append('<div class="image"><img src="' + p.url + '" /></div>');
                $.fn.formBubble.complete();
            }else if (p.text.length){
                $.fn.formBubble.text(p.text, bubbleTarget);
            }
            if ($(bubbleObject).css("display") == "none"){
                $(bubbleObject).stop().fadeIn(p.animationSpeed, function(){
                    p.onOpenCallback();
                });
            }
        },
        text: function(data, bubbleTarget){
            var bubbleObject = $.fn.formBubble.bubbleObject;
            if (data == 'targetText'){
                data = $(bubbleTarget).text();
            }
            $(bubbleObject).find('.form-bubble-content').remove();
            $(bubbleObject).append('<div class="form-bubble-content">' + data + '</div>');
        },
        destroy: function(){
            $('body').find('.form-bubble').fadeOut(p.animationSpeed).remove();
            $.fn.formBubble.initialized = false;
        }
    });
})(jQuery);
