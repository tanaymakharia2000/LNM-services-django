/**
 * jCarousel - Riding carousels with jQuery
 *   http://sorgalla.com/jcarousel/
 *
 * Copyright (c) 2006 Jan Sorgalla (http://sorgalla.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Built on top of the jQuery library
 *   http://jquery.com
 *
 * Inspired by the "Carousel Component" by Bill Scott
 *   http://billwscott.com/carousel/
 */

(function($) {
    $.fn.jcarousel = function(o) {
        return this.each(function() {
            new r(this, o)
        })
    };
    var q = {
        vertical: false,
        start: 1,
        offset: 1,
        size: null,
        scroll: 3,
        visible: null,
        animation: 'normal',
        easing: 'swing',
        auto: 0,
        wrap: null,
        initCallback: null,
        reloadCallback: null,
        itemLoadCallback: null,
        itemFirstInCallback: null,
        itemFirstOutCallback: null,
        itemLastInCallback: null,
        itemLastOutCallback: null,
        itemVisibleInCallback: null,
        itemVisibleOutCallback: null,
        buttonNextHTML: '<div></div>',
        buttonPrevHTML: '<div></div>',
        buttonNextEvent: 'click',
        buttonPrevEvent: 'click',
        buttonNextCallback: null,
        buttonPrevCallback: null
    };
    $.jcarousel = function(e, o) {
        this.options = $.extend({}, q, o || {});
        this.locked = false;
        this.container = null;
        this.clip = null;
        this.list = null;
        this.buttonNext = null;
        this.buttonPrev = null;
        this.wh = !this.options.vertical ? 'width' : 'height';
        this.lt = !this.options.vertical ? 'left' : 'top';
        var a = '',
            split = e.className.split(' ');
        for (var i = 0; i < split.length; i++) {
            if (split[i].indexOf('jcarousel-skin') != -1) {
                $(e).removeClass(split[i]);
                var a = split[i];
                break
            }
        }
        if (e.nodeName == 'UL' || e.nodeName == 'OL') {
            this.list = $(e);
            this.container = this.list.parent();
            if (this.container.hasClass('jcarousel-clip')) {
                if (!this.container.parent().hasClass('jcarousel-container')) this.container = this.container.wrap('<div></div>');
                this.container = this.container.parent()
            } else if (!this.container.hasClass('jcarousel-container')) this.container = this.list.wrap('<div></div>').parent()
        } else {
            this.container = $(e);
            this.list = $(e).find('>ul,>ol,div>ul,div>ol')
        }
        if (a != '' && this.container.parent()[0].className.indexOf('jcarousel-skin') == -1) this.container.wrap('<div class=" ' + a + '"></div>');
        this.clip = this.list.parent();
        if (!this.clip.length || !this.clip.hasClass('jcarousel-clip')) this.clip = this.list.wrap('<div></div>').parent();
        this.buttonPrev = $('.jcarousel-prev', this.container);
        if (this.buttonPrev.size() == 0 && this.options.buttonPrevHTML != null) this.buttonPrev = this.clip.before(this.options.buttonPrevHTML).prev();
        this.buttonPrev.addClass(this.className('jcarousel-prev'));
        this.buttonNext = $('.jcarousel-next', this.container);
        if (this.buttonNext.size() == 0 && this.options.buttonNextHTML != null) this.buttonNext = this.clip.before(this.options.buttonNextHTML).prev();
        this.buttonNext.addClass(this.className('jcarousel-next'));
        this.clip.addClass(this.className('jcarousel-clip'));
        this.list.addClass(this.className('jcarousel-list'));
        this.container.addClass(this.className('jcarousel-container'));
        var b = this.options.visible != null ? Math.ceil(this.clipping() / this.options.visible) : null;
        var c = this.list.children('li');
        var d = this;
        if (c.size() > 0) {
            var f = 0,
                i = this.options.offset;
            c.each(function() {
                d.format(this, i++);
                f += d.dimension(this, b)
            });
            this.list.css(this.wh, f + 'px');
            if (!o || o.size === undefined) this.options.size = c.size()
        }
        this.container.css('display', 'block');
        this.buttonNext.css('display', 'block');
        this.buttonPrev.css('display', 'block');
        this.funcNext = function() {
            d.next()
        };
        this.funcPrev = function() {
            d.prev()
        };
        this.funcResize = function() {
            d.reload()
        };
        if (this.options.initCallback != null) this.options.initCallback(this, 'init');
        if ($.browser.safari) {
            this.buttons(false, false);
            $(window).bind('load', function() {
                d.setup()
            })
        } else this.setup()
    };
    var r = $.jcarousel;
    r.fn = r.prototype = {
        jcarousel: '0.2.3'
    };
    r.fn.extend = r.extend = $.extend;
    r.fn.extend({
        setup: function() {
            this.first = null;
            this.last = null;
            this.prevFirst = null;
            this.prevLast = null;
            this.animating = false;
            this.timer = null;
            this.tail = null;
            this.inTail = false;
            if (this.locked) return;
            this.list.css(this.lt, this.pos(this.options.offset) + 'px');
            var p = this.pos(this.options.start);
            this.prevFirst = this.prevLast = null;
            this.animate(p, false);
            $(window).unbind('resize', this.funcResize).bind('resize', this.funcResize)
        },
        reset: function() {
            this.list.empty();
            this.list.css(this.lt, '0px');
            this.list.css(this.wh, '10px');
            if (this.options.initCallback != null) this.options.initCallback(this, 'reset');
            this.setup()
        },
        reload: function() {
            if (this.tail != null && this.inTail) this.list.css(this.lt, r.intval(this.list.css(this.lt)) + this.tail);
            this.tail = null;
            this.inTail = false;
            if (this.options.reloadCallback != null) this.options.reloadCallback(this);
            if (this.options.visible != null) {
                var a = this;
                var b = Math.ceil(this.clipping() / this.options.visible),
                    wh = 0,
                    lt = 0;
                $('li', this.list).each(function(i) {
                    wh += a.dimension(this, b);
                    if (i + 1 < a.first) lt = wh
                });
                this.list.css(this.wh, wh + 'px');
                this.list.css(this.lt, -lt + 'px')
            }
            this.scroll(this.first, false)
        },
        lock: function() {
            this.locked = true;
            this.buttons()
        },
        unlock: function() {
            this.locked = false;
            this.buttons()
        },
        size: function(s) {
            if (s != undefined) {
                this.options.size = s;
                if (!this.locked) this.buttons()
            }
            return this.options.size
        },
        has: function(i, a) {
            if (a == undefined || !a) a = i;
            if (this.options.size !== null && a > this.options.size) a = this.options.size;
            for (var j = i; j <= a; j++) {
                var e = this.get(j);
                if (!e.length || e.hasClass('jcarousel-item-placeholder')) return false
            }
            return true
        },
        get: function(i) {
            return $('.jcarousel-item-' + i, this.list)
        },
        add: function(i, s) {
            var e = this.get(i),
                old = 0,
                add = 0;
            if (e.length == 0) {
                var c, e = this.create(i),
                    j = r.intval(i);
                while (c = this.get(--j)) {
                    if (j <= 0 || c.length) {
                        j <= 0 ? this.list.prepend(e) : c.after(e);
                        break
                    }
                }
            } else old = this.dimension(e);
            e.removeClass(this.className('jcarousel-item-placeholder'));
            typeof s == 'string' ? e.html(s) : e.empty().append(s);
            var a = this.options.visible != null ? Math.ceil(this.clipping() / this.options.visible) : null;
            var b = this.dimension(e, a) - old;
            if (i > 0 && i < this.first) this.list.css(this.lt, r.intval(this.list.css(this.lt)) - b + 'px');
            this.list.css(this.wh, r.intval(this.list.css(this.wh)) + b + 'px');
            return e
        },
        remove: function(i) {
            var e = this.get(i);
            if (!e.length || (i >= this.first && i <= this.last)) return;
            var d = this.dimension(e);
            if (i < this.first) this.list.css(this.lt, r.intval(this.list.css(this.lt)) + d + 'px');
            e.remove();
            this.list.css(this.wh, r.intval(this.list.css(this.wh)) - d + 'px')
        },
        next: function() {
            this.stopAuto();
            if (this.tail != null && !this.inTail) this.scrollTail(false);
            else this.scroll(((this.options.wrap == 'both' || this.options.wrap == 'last') && this.options.size != null && this.last == this.options.size) ? 1 : this.first + this.options.scroll)
        },
        prev: function() {
            this.stopAuto();
            if (this.tail != null && this.inTail) this.scrollTail(true);
            else this.scroll(((this.options.wrap == 'both' || this.options.wrap == 'first') && this.options.size != null && this.first == 1) ? this.options.size : this.first - this.options.scroll)
        },
        scrollTail: function(b) {
            if (this.locked || this.animating || !this.tail) return;
            var a = r.intval(this.list.css(this.lt));
            !b ? a -= this.tail : a += this.tail;
            this.inTail = !b;
            this.prevFirst = this.first;
            this.prevLast = this.last;
            this.animate(a)
        },
        scroll: function(i, a) {
            if (this.locked || this.animating) return;
            this.animate(this.pos(i), a)
        },
        pos: function(i) {
            if (this.locked || this.animating) return;
            if (this.options.wrap != 'circular') i = i < 1 ? 1 : (this.options.size && i > this.options.size ? this.options.size : i);
            var a = this.first > i;
            var b = r.intval(this.list.css(this.lt));
            var f = this.options.wrap != 'circular' && this.first <= 1 ? 1 : this.first;
            var c = a ? this.get(f) : this.get(this.last);
            var j = a ? f : f - 1;
            var e = null,
                l = 0,
                p = false,
                d = 0;
            while (a ? --j >= i : ++j < i) {
                e = this.get(j);
                p = !e.length;
                if (e.length == 0) {
                    e = this.create(j).addClass(this.className('jcarousel-item-placeholder'));
                    c[a ? 'before' : 'after'](e)
                }
                c = e;
                d = this.dimension(e);
                if (p) l += d;
                if (this.first != null && (this.options.wrap == 'circular' || (j >= 1 && (this.options.size == null || j <= this.options.size)))) b = a ? b + d : b - d
            }
            var g = this.clipping();
            var h = [];
            var k = 0,
                j = i,
                v = 0;
            var c = this.get(i - 1);
            while (++k) {
                e = this.get(j);
                p = !e.length;
                if (e.length == 0) {
                    e = this.create(j).addClass(this.className('jcarousel-item-placeholder'));
                    c.length == 0 ? this.list.prepend(e) : c[a ? 'before' : 'after'](e)
                }
                c = e;
                var d = this.dimension(e);
                if (d == 0) {
                    alert('jCarousel: No width/height set for items. This will cause an infinite loop. Aborting...');
                    return 0
                }
                if (this.options.wrap != 'circular' && this.options.size !== null && j > this.options.size) h.push(e);
                else if (p) l += d;
                v += d;
                if (v >= g) break;
                j++
            }
            for (var x = 0; x < h.length; x++) h[x].remove();
            if (l > 0) {
                this.list.css(this.wh, this.dimension(this.list) + l + 'px');
                if (a) {
                    b -= l;
                    this.list.css(this.lt, r.intval(this.list.css(this.lt)) - l + 'px')
                }
            }
            var n = i + k - 1;
            if (this.options.wrap != 'circular' && this.options.size && n > this.options.size) n = this.options.size;
            if (j > n) {
                k = 0, j = n, v = 0;
                while (++k) {
                    var e = this.get(j--);
                    if (!e.length) break;
                    v += this.dimension(e);
                    if (v >= g) break
                }
            }
            var o = n - k + 1;
            if (this.options.wrap != 'circular' && o < 1) o = 1;
            if (this.inTail && a) {
                b += this.tail;
                this.inTail = false
            }
            this.tail = null;
            if (this.options.wrap != 'circular' && n == this.options.size && (n - k + 1) >= 1) {
                var m = r.margin(this.get(n), !this.options.vertical ? 'marginRight' : 'marginBottom');
                if ((v - m) > g) this.tail = v - g - m
            }
            while (i-- > o) b += this.dimension(this.get(i));
            this.prevFirst = this.first;
            this.prevLast = this.last;
            this.first = o;
            this.last = n;
            return b
        },
        animate: function(p, a) {
            if (this.locked || this.animating) return;
            this.animating = true;
            var b = this;
            var c = function() {
                b.animating = false;
                if (p == 0) b.list.css(b.lt, 0);
                if (b.options.wrap == 'both' || b.options.wrap == 'last' || b.options.size == null || b.last < b.options.size) b.startAuto();
                b.buttons();
                b.notify('onAfterAnimation')
            };
            this.notify('onBeforeAnimation');
            if (!this.options.animation || a == false) {
                this.list.css(this.lt, p + 'px');
                c()
            } else {
                var o = !this.options.vertical ? {
                    'left': p
                } : {
                    'top': p
                };
                this.list.animate(o, this.options.animation, this.options.easing, c)
            }
        },
        startAuto: function(s) {
            if (s != undefined) this.options.auto = s;
            if (this.options.auto == 0) return this.stopAuto();
            if (this.timer != null) return;
            var a = this;
            this.timer = setTimeout(function() {
                a.next()
            }, this.options.auto * 1000)
        },
        stopAuto: function() {
            if (this.timer == null) return;
            clearTimeout(this.timer);
            this.timer = null
        },
        buttons: function(n, p) {
            if (n == undefined || n == null) {
                var n = !this.locked && this.options.size !== 0 && ((this.options.wrap && this.options.wrap != 'first') || this.options.size == null || this.last < this.options.size);
                if (!this.locked && (!this.options.wrap || this.options.wrap == 'first') && this.options.size != null && this.last >= this.options.size) n = this.tail != null && !this.inTail
            }
            if (p == undefined || p == null) {
                var p = !this.locked && this.options.size !== 0 && ((this.options.wrap && this.options.wrap != 'last') || this.first > 1);
                if (!this.locked && (!this.options.wrap || this.options.wrap == 'last') && this.options.size != null && this.first == 1) p = this.tail != null && this.inTail
            }
            var a = this;
            this.buttonNext[n ? 'bind' : 'unbind'](this.options.buttonNextEvent, this.funcNext)[n ? 'removeClass' : 'addClass'](this.className('jcarousel-next-disabled')).attr('disabled', n ? false : true);
            this.buttonPrev[p ? 'bind' : 'unbind'](this.options.buttonPrevEvent, this.funcPrev)[p ? 'removeClass' : 'addClass'](this.className('jcarousel-prev-disabled')).attr('disabled', p ? false : true);
            if (this.buttonNext.length > 0 && (this.buttonNext[0].jcarouselstate == undefined || this.buttonNext[0].jcarouselstate != n) && this.options.buttonNextCallback != null) {
                this.buttonNext.each(function() {
                    a.options.buttonNextCallback(a, this, n)
                });
                this.buttonNext[0].jcarouselstate = n
            }
            if (this.buttonPrev.length > 0 && (this.buttonPrev[0].jcarouselstate == undefined || this.buttonPrev[0].jcarouselstate != p) && this.options.buttonPrevCallback != null) {
                this.buttonPrev.each(function() {
                    a.options.buttonPrevCallback(a, this, p)
                });
                this.buttonPrev[0].jcarouselstate = p
            }
        },
        notify: function(a) {
            var b = this.prevFirst == null ? 'init' : (this.prevFirst < this.first ? 'next' : 'prev');
            this.callback('itemLoadCallback', a, b);
            if (this.prevFirst !== this.first) {
                this.callback('itemFirstInCallback', a, b, this.first);
                this.callback('itemFirstOutCallback', a, b, this.prevFirst)
            }
            if (this.prevLast !== this.last) {
                this.callback('itemLastInCallback', a, b, this.last);
                this.callback('itemLastOutCallback', a, b, this.prevLast)
            }
            this.callback('itemVisibleInCallback', a, b, this.first, this.last, this.prevFirst, this.prevLast);
            this.callback('itemVisibleOutCallback', a, b, this.prevFirst, this.prevLast, this.first, this.last)
        },
        callback: function(a, b, c, d, e, f, g) {
            if (this.options[a] == undefined || (typeof this.options[a] != 'object' && b != 'onAfterAnimation')) return;
            var h = typeof this.options[a] == 'object' ? this.options[a][b] : this.options[a];
            if (!$.isFunction(h)) return;
            var j = this;
            if (d === undefined) h(j, c, b);
            else if (e === undefined) this.get(d).each(function() {
                h(j, this, d, c, b)
            });
            else {
                for (var i = d; i <= e; i++)
                    if (i !== null && !(i >= f && i <= g)) this.get(i).each(function() {
                        h(j, this, i, c, b)
                    })
            }
        },
        create: function(i) {
            return this.format('<li></li>', i)
        },
        format: function(e, i) {
            var a = $(e).addClass(this.className('jcarousel-item')).addClass(this.className('jcarousel-item-' + i));
            a.attr('jcarouselindex', i);
            return a
        },
        className: function(c) {
            return c + ' ' + c + (!this.options.vertical ? '-horizontal' : '-vertical')
        },
        dimension: function(e, d) {
            var a = e.jquery != undefined ? e[0] : e;
            var b = !this.options.vertical ? a.offsetWidth + r.margin(a, 'marginLeft') + r.margin(a, 'marginRight') : a.offsetHeight + r.margin(a, 'marginTop') + r.margin(a, 'marginBottom');
            if (d == undefined || b == d) return b;
            var w = !this.options.vertical ? d - r.margin(a, 'marginLeft') - r.margin(a, 'marginRight') : d - r.margin(a, 'marginTop') - r.margin(a, 'marginBottom');
            $(a).css(this.wh, w + 'px');
            return this.dimension(a)
        },
        clipping: function() {
            return !this.options.vertical ? this.clip[0].offsetWidth - r.intval(this.clip.css('borderLeftWidth')) - r.intval(this.clip.css('borderRightWidth')) : this.clip[0].offsetHeight - r.intval(this.clip.css('borderTopWidth')) - r.intval(this.clip.css('borderBottomWidth'))
        },
        index: function(i, s) {
            if (s == undefined) s = this.options.size;
            return Math.round((((i - 1) / s) - Math.floor((i - 1) / s)) * s) + 1
        }
    });
    r.extend({
        defaults: function(d) {
            return $.extend(q, d || {})
        },
        margin: function(e, p) {
            if (!e) return 0;
            var a = e.jquery != undefined ? e[0] : e;
            if (p == 'marginRight' && $.browser.safari) {
                var b = {
                        'display': 'block',
                        'float': 'none',
                        'width': 'auto'
                    },
                    oWidth, oWidth2;
                $.swap(a, b, function() {
                    oWidth = a.offsetWidth
                });
                b['marginRight'] = 0;
                $.swap(a, b, function() {
                    oWidth2 = a.offsetWidth
                });
                return oWidth2 - oWidth
            }
            return r.intval($.css(a, p))
        },
        intval: function(v) {
            v = parseInt(v);
            return isNaN(v) ? 0 : v
        }
    })
})(jQuery);