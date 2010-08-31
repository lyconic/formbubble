/*
 * FormBubble v0.1.3
 * Requires jQuery v1.32+
 * Created by Scott Greenfield
 *
 * Copyright 2010, Lyconic, Inc.
 * http://www.lyconic.com/
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
            alignment: {
                bubble: 'right',
                pointer: 'top-left'
            },
            doPointer: true,
            animationSpeed: 300,
            fadeOnBlur: true,
            fadeOnBlurExceptions: ['.form-bubble', '.ui-datepicker-calendar', '.ui-datepicker-header', '#jstree-contextmenu'],  //selectors that will not cause the widget to close
            cache: false,
            closeButton: true,
            slide: true,
            unique: true,
            onOpenCallback: function(){},
            onCloseCallback: function(){},
            text: '',
            hOffset: 13,
            vOffset: 3
        }, params);
        
        $.fn.formBubble.bubbleObject = '.form-bubble';  //default

        return this.each(function(){
            $.fn.formBubble.init();
            if (p.url != 'none' && p.dataType != 'image') $.fn.formBubble.ajax();
            $.fn.formBubble.alignTo($(this), p.hOffset, p.vOffset);
            $.fn.formBubble.open($(this));
        });
    };
    
    $.extend($.fn.formBubble, { //these functions can all be called programatically or overridden
        alignTo: function(bubbleTarget, hOffset, vOffset){
            var bubbleObject = $.fn.formBubble.bubbleObject,
                position = bubbleTarget.offset(),
                top = position.top,
                left = position.left,
                right;
            
            if (hOffset==undefined) hOffset = p.hOffset;
            if (vOffset==undefined) vOffset = p.vOffset;

            if (p.alignment.bubble == 'top'){
                hOffset = hOffset + bubbleObject.outerWidth()/-4;
                vOffset = vOffset + bubbleObject.outerHeight();
            }else if (p.alignment.bubble === 'right'){
                hOffset = hOffset + bubbleTarget.outerWidth();
            }else if (p.alignment.bubble == 'left'){
                right = $(window).width() - left;
            }
            
            top = top - vOffset;
            left = left + hOffset;            

            if ($.browser.msie && parseInt($.browser.version) <= 7){
                $.fn.formBubble.browser = 'lte ie7';
            }else if ($(bubbleObject).css("display") != "none"){
                $(bubbleObject).stop().fadeTo(0, 1);
            }
            
            if (p.slide && $(bubbleObject).css("display") != "none"){
                $(bubbleObject).stop().animate({'left' : left, 'top' : top}, p.animationSpeed);
            }else{
                if (right === undefined){
                    $(bubbleObject).css({'left' : left, 'top' : top});
                }else{
                    $(bubbleObject).css({'right' : right, 'top' : top});
                }
            }
        },
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
            $.fn.formBubble.bubbleObject.find('.form-bubble-content')
                .empty()
                .append('<div id="bubble-loading"><img src="/images/loading.gif" alt="Loading..." title="Loading..." /></div>');
        },
        bindings: function(bubbleObject){ //default bindings, these can be overridden and also called programatically, although they don't need to be.
            $(bubbleObject).find('.form-bubble-close').click(function() {
                $.fn.formBubble.close(bubbleObject);
            });
            if (!($.fn.formBubble.isBound)){ //ensures document-wide events are only bound once
                $(document).click(function(event) {
                    if ((event.button === 0) && (p.fadeOnBlur)){
                        var len=p.fadeOnBlurExceptions.length;
                        var doClose = false;
                        for (var i=0; i<len; ++i){ //loop through close exceptions, determine if click causes bubble to close
                            if ($(event.target).parents(p.fadeOnBlurExceptions[i]).length || $(event.target).is(p.fadeOnBlurExceptions[i])){
                                doClose = false;
                                break;
                            }else{
                                doClose = true; //set it to true... for now
                            }
                        }
                        if (doClose){
                            $.fn.formBubble.close();
                        }
                    }
                });
            }
            $.fn.formBubble.isBound = true;
        },
        browser: '',
        close: function(bubbleObject){
            var bubbleOpenNow = $($.fn.formBubble.bubbleObject).length;
            $.fn.formBubble.initialized = true;
            if (!(bubbleObject)){
                bubbleObject = $('.form-bubble');
            }
            if ($.fn.formBubble.initialized){
                if ($(bubbleObject).is(':visible')){ //bubble is visible
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
        complete: function(){
            $.fn.formBubble.bubbleObject.find('#bubble-loading').remove();
        },
        defaultBindings: true,
        destroy: function(){ //destroys all formbubbles
            $('body').find('.form-bubble').fadeOut(p.animationSpeed).remove();
            $.fn.formBubble.initialized = false;
        },
        initialized: false,
        init: function(){
            var bubbleObject = $('<div class="form-bubble"><div class="form-bubble-content"></div></div>').appendTo('body');
            
            $.fn.formBubble.bubbleObject = bubbleObject;
            
            if (p.unique){
                $('.form-bubble.unique').remove(); //close other uniques
                bubbleObject.addClass('unique'); //add class unique to current object
            }
            
            if (p.closeButton) bubbleObject.prepend('<div class="form-bubble-close"></div>');
            if (p.doPointer) bubbleObject.append('<div class="form-bubble-pointer form-bubble-pointer-' + p.alignment.pointer + '"></div>');                
            if ($.fn.formBubble.defaultBindings) $.fn.formBubble.bindings(bubbleObject);
        },
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
        success: function(data) {
            var dataValue;
            
            if (p.dataType == 'json') dataValue = data.html;
            if (p.dataType == 'html') dataValue = data;
            
            $.fn.formBubble.bubbleObject.find('.form-bubble-content').append(dataValue);
        },
        text: function(data, bubbleTarget){
            var bubbleObject = $.fn.formBubble.bubbleObject;

            if (data == 'targetText') data = $(bubbleTarget).text();
            
            $(bubbleObject).find('.form-bubble-content').remove();
            $(bubbleObject).append('<div class="form-bubble-content">' + data + '</div>');
        }
    });
})(jQuery);