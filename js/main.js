(function ($) {
    // detect touch devices
    if ('ontouchstart' in document.documentElement) {
        $('body').addClass('is-touch');
    }

    // prepare photo urls
    for (var i = 0; i < app.images.length; i++)
    {
        app.images[i].after = 'photos/' + app.images[i].after;
        app.images[i].low = 'photos/' + app.images[i].low;

        if (app.images[i].hasOwnProperty('before')) {
            app.images[i].before = 'photos/' + app.images[i].before;
        }
    }

    var preloaderReadyToHide = false;
    var allImagesLoaded = false;

    var $gallery = $('.gallery');
    var $preloader = $('.preloader');

    var imageLoadIndex = 0;

    setTimeout(function() {
        preloaderReadyToHide = true;
        onAllImagesLoad();
    }, 500);

    var onAllImagesLoad = function() {
        if (!(preloaderReadyToHide && allImagesLoaded)) {
            return false;
        }

        app.images.forEach(function(image, i) {
            var priority = Math.floor(i / 3);
            $gallery.append(
                '<div class="gallery__item '+ (image.wide ? '_wide' : '') + ' loading" data-load-image="' + image.after + '" data-priority="' + priority + '">' +
                    '<img class="gallery__item__image" data-index="' + i + '" src="' + image.low + '" data-toggle-image="' + image.before + '">' +
                    '<div class="gallery__item__loader-cover"><img src="' + image.low + '"></div>' +
                '</div>'
            );
        });

        // Packery
        setTimeout(function() {
            $preloader.fadeOut(500);
            $gallery.show();

            $gallery.packery({
                itemSelector: '.gallery__item',
                gutter: 3
            });

            $gallery.css({
                opacity: 1,
                transform: 'translateY(0px)'
            });
            
            // dragabilly
/*
            $gallery.find('.gallery__item').each(function(i, el) {
                var draggie = new Draggabilly(el);
                $gallery.packery('bindDraggabillyEvents', draggie);

                $(el).on('dblclick', function() {
                   $(this).toggleClass('_wide');
                });
            });
*/
        }, 100);

        // preload original images without retouching
        // setTimeout(function() {
        //     app.images.forEach(function(image) {
        //         setTimeout(function() {
        //             var img = new Image();
        //             img.src = image.before;
        //         }, 0);
        //     });
        // }, 0);


        setTimeout(function() {
            app.modules.loader.findAndLoad(function($el) {
                $el.find('.gallery__item__image').attr('src', $el.data('load-image'));
                $el.removeClass('loading');

                setTimeout(function() {
                    $el.find('.gallery__item__loader-cover').remove();
                }, 1000);

                $gallery.packery('layout');
            });
        }, 0);
        
    };

    // preload gallery images
    for (i in app.images) {
        var image = app.images[i];

        var img = new Image();
        img.src = image.low;
        img.onload = function() {
            imageLoadIndex++;
            if (imageLoadIndex >= app.images.length) {
                allImagesLoaded = true;
                onAllImagesLoad();
            }
        }
    }

    // Subtitle animation
    $(function() {
        var images = ['img/healing-brush.svg', 'img/dodge.svg', /*'img/mixer-brush.svg',*/ 'img/sponge.svg', 'img/burn.svg'];
        var currentImageIndex = 0;
        var $captionSubtitle = $('.caption__subtitle');
        var originalBackgroundPositionY = $captionSubtitle.css('background-position-y');
        var speed = 350;
        var timeout = 2000;

        var animateToNext = function() {
            $captionSubtitle.animate({
                'background-position-y': '1.2em'
            }, speed, 'easeInBack', function() {
                currentImageIndex++;
                if (currentImageIndex > (images.length - 1)) {
                    currentImageIndex = 0;
                }

                $captionSubtitle.css({
                    'background-image': ('url(' + images[currentImageIndex] + ')'),
                    'background-position-y': '-1.2em'
                });

                $captionSubtitle.animate({
                    'background-position-y': originalBackgroundPositionY
                }, speed, 'easeOutBack', function() {
                    setTimeout(animateToNext, timeout);
                });
            });
        };

        setTimeout(animateToNext, timeout);
    });


    // Easing functions
    $.extend($.easing, {
        easeInBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 3.5;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 3.5;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        }
    });


    // Preview
    var $preview = $('.preview');
    var $previewImage = $('.preview__image__wrapper > img');
    var $previewCreditsWrapper = $('.preview__credits__wrapper');
    var $previewCredits = $('.preview__credits');
    var $previewToggle = $('.preview__toggle');
    var previewIsActive = false;
    var previewIndex = null;
    var $previewNext = $('.preview__next');
    var $previewPrev = $('.preview__prev');
    var $previewLoader = $('.preview__loader');
    var $previewLoaderFills = $('.preview__loader__fill');
    var $previewLoaderFullMask = $('.preview__loader__mask._full');
    var $previewLoaderFixFill = $('.preview__loader__fill._fix');

    $gallery.on('click', '.gallery__item > img', function() {
        previewIndex = $(this).data('index');

        setPreview(previewIndex);

        $preview.show().css({opacity: 1});

        previewIsActive = true;
    });

    var togglePreview = function () {
        var $toggleImage = $previewImage.data('toggleImage');
        var $currentImage = $previewImage.attr('src');

        if (!$toggleImage) {
            return;
        }

        $previewToggle.find('span').toggleClass('active');

        $previewLoader.hide();
        initPreviewLoader($toggleImage, function() {
            $previewImage.data('toggleImage', $currentImage);
            $previewImage.attr('src', $toggleImage);
        });
    };

    $previewImage.on('click', togglePreview);
    $previewToggle.on('click', togglePreview);

    $('.preview__close').on('click', function() {
        closePreview();
    });

    function closePreview() {
        $preview.css({opacity: 0});
        setTimeout(function() {
            $preview.hide();
        }, 300);
        previewIsActive = false;
    }

    function setPreview(i) {
        // $previewImage.css('background-image', 'url(' + app.images[i].after + ')');
        $previewLoader.hide();
        $previewImage.attr('src', app.images[i].after);
        $previewImage.data('toggleImage', app.images[i].before || false);

        $previewToggle.find('.before').removeClass('active');
        $previewToggle.find('.after').addClass('active');

        $previewCredits.text(app.images[i].credits);
        $previewCreditsWrapper.toggle(app.images[i].hasOwnProperty('credits'));

        $previewToggle.toggle(app.images[i].hasOwnProperty('before'));
        $previewImage.toggleClass('togglable', app.images[i].hasOwnProperty('before'));
    }

    function nextPreview() {
        previewIndex++;
        if (previewIndex >= app.images.length) {
            previewIndex = 0;
        }
        setPreview(previewIndex);
    }

    function prevPreview() {
        previewIndex--;
        if (previewIndex < 0) {
            previewIndex = app.images.length - 1;
        }
        setPreview(previewIndex);
    }

    function initPreviewLoader(src, cb) {
        var loaded = false;

        var req = new XMLHttpRequest();

        req.open('GET', src, true);
        req.responseType = 'arraybuffer';

        req.onloadstart = function() {
            previewLoader(0);
            window.setTimeout(function() {
                if (!loaded) {
                    $previewLoader.show();
                }
            }, 500);
        }
        req.onload = function() {
            loaded = true;
            $previewLoader.hide();
            if (cb) {
                cb(src);
            }
        }
        req.onprogress = function(e) {
            if (e.lengthComputable) {
                previewLoader(e.loaded / e.total);
            }
        };

        req.send();
    }

    function previewLoader(percent) {
        if (percent < 0.05) {
            percent = 0.05;
        }
        var degree = Math.round(percent * 180);
        $previewLoaderFills.css('transform', 'rotate(' + degree + 'deg)');
        $previewLoaderFullMask.css('transform', 'rotate(' + degree + 'deg)');
        $previewLoaderFixFill.css('transform', 'rotate(' + (degree * 2) + 'deg)')
    }

    window.$previewLoader = $previewLoader;
    window.previewLoader = previewLoader;

    $previewNext.on('click', function() {
        nextPreview();
    });
    $previewPrev.on('click', function() {
        prevPreview();
    });

    $('body').on('keydown keyup', function(ev) {
        if (previewIsActive) {
            if (ev.type === 'keydown') {
                if ([37,38,39,40].indexOf(ev.keyCode) > -1) {
                    ev.preventDefault();
                }
                return;
            }

            if (ev.keyCode === 39 || ev.keyCode === 40) { // right || down
                ev.preventDefault();
                return nextPreview();
            }

            if (ev.keyCode === 37 || ev.keyCode === 38) { // left || top
                ev.preventDefault();
                return prevPreview();
            }

            if (ev.keyCode === 13) { // enter
                return togglePreview();
            }

            if (ev.keyCode === 27) { // escape
                return closePreview();
            }
        }
    });
})(jQuery);
