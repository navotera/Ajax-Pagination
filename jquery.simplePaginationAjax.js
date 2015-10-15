/**
 * simplePagination.js v1.6
 * A simple jQuery pagination plugin.
 * http://flaviusmatis.github.com/simplePagination.js/
 *
 * Copyright 2012, Flavius Matis
 * Released under the MIT license.
 * http://flaviusmatis.github.com/license.html
 */


(function($) {

    var methods = {
        init: function(options) {
            var o = $.extend({
                items: 1,
                itemsOnPage: 1,
                pages: 0,
                displayedPages: 5,
                edges: 2,
                currentPage: 1,
                hrefTextPrefix: '#page-',
                hrefTextSuffix: '',
                prevText: 'Prev',
                nextText: 'Next',
                ellipseText: '&hellip;',
                cssStyle: 'light-theme',
                labelMap: [],
                selectOnClick: true,
                nextAtFront: false,

                //ajax
                pagination_link: '.simple-pagination',
                loading_div: '#loading_pagination_ajax',
                loadingClass: 'loading_pagination',
                targetUrl: '',
                user_data: '',
                page_class: '.paging',
                page_list: '#pagination_list', //parent page


                onPageClick: function(pageNumber, event) {
                    // Callback triggered when a page is clicked
                    // Page number is given as an optional parameter
                    methods.slide_page.call(self, pageNumber);
                },
                onInit: function() {
                    // Callback triggered immediately after initialization

                }
            }, options || {});

            var self = this;

            o.pages = o.pages ? o.pages : Math.ceil(o.items / o.itemsOnPage) ? Math.ceil(o.items / o.itemsOnPage) : 1;
            o.currentPage = o.currentPage - 1;
            o.halfDisplayed = o.displayedPages / 2;

            this.each(function() {
                self.addClass(o.cssStyle + ' simple-pagination').data('pagination', o);
                methods._draw.call(self);
            });


            //ajax
            //self.addClass('pagination-ajax');
            methods._create_page_list_div.call(self);
            methods._create_loading_div.call(self);


            methods.slide_page.call(self);


            o.onInit();

            return this;
        },

        selectPage: function(page) {
            methods._selectPage.call(this, page - 1);
            return this;
        },

        prevPage: function() {
            var o = this.data('pagination');
            if (o.currentPage > 0) {
                methods._selectPage.call(this, o.currentPage - 1);
            }
            return this;
        },

        nextPage: function() {
            var o = this.data('pagination');
            if (o.currentPage < o.pages - 1) {
                methods._selectPage.call(this, o.currentPage + 1);
            }
            return this;
        },

        getPagesCount: function() {
            return this.data('pagination').pages;
        },

        getCurrentPage: function() {
            return this.data('pagination').currentPage + 1;
        },

        destroy: function() {
            this.empty();
            return this;
        },

        drawPage: function(page) {
            var o = this.data('pagination');
            o.currentPage = page - 1;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        redraw: function() {
            methods._draw.call(this);
            return this;
        },

        disable: function() {
            var o = this.data('pagination');
            o.disabled = true;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        enable: function() {
            var o = this.data('pagination');
            o.disabled = false;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        updateItems: function(newItems) {
            var o = this.data('pagination');
            o.items = newItems;
            o.pages = methods._getPages(o);
            this.data('pagination', o);
            methods._draw.call(this);
        },

        updateItemsOnPage: function(itemsOnPage) {
            var o = this.data('pagination');
            o.itemsOnPage = itemsOnPage;
            o.pages = methods._getPages(o);
            this.data('pagination', o);
            methods._selectPage.call(this, 0);
            return this;
        },

        _draw: function() {
            var o = this.data('pagination'),
                interval = methods._getInterval(o),
                i,
                tagName;

            methods.destroy.call(this);

            tagName = (typeof this.prop === 'function') ? this.prop('tagName') : this.attr('tagName');

            var $panel = tagName === 'UL' ? this : $('<ul></ul>').appendTo(this);

            // Generate Prev link
            if (o.prevText) {
                methods._appendItem.call(this, o.currentPage - 1, {
                    text: o.prevText,
                    classes: 'prev'
                });
            }

            // Generate Next link (if option set for at front)
            if (o.nextText && o.nextAtFront) {
                methods._appendItem.call(this, o.currentPage + 1, {
                    text: o.nextText,
                    classes: 'next'
                });
            }

            // Generate start edges
            if (interval.start > 0 && o.edges > 0) {
                var end = Math.min(o.edges, interval.start);
                for (i = 0; i < end; i++) {
                    methods._appendItem.call(this, i);
                }
                if (o.edges < interval.start && (interval.start - o.edges != 1)) {
                    $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                } else if (interval.start - o.edges == 1) {
                    methods._appendItem.call(this, o.edges);
                }
            }

            // Generate interval links
            for (i = interval.start; i < interval.end; i++) {
                methods._appendItem.call(this, i);
            }

            // Generate end edges
            if (interval.end < o.pages && o.edges > 0) {
                if (o.pages - o.edges > interval.end && (o.pages - o.edges - interval.end != 1)) {
                    $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                } else if (o.pages - o.edges - interval.end == 1) {
                    methods._appendItem.call(this, interval.end++);
                }
                var begin = Math.max(o.pages - o.edges, interval.end);
                for (i = begin; i < o.pages; i++) {
                    methods._appendItem.call(this, i);
                }
            }

            // Generate Next link (unless option is set for at front)
            if (o.nextText && !o.nextAtFront) {
                methods._appendItem.call(this, o.currentPage + 1, {
                    text: o.nextText,
                    classes: 'next'
                });
            }
        },

        _getPages: function(o) {
            var pages = Math.ceil(o.items / o.itemsOnPage);
            return pages || 1;
        },

        _getInterval: function(o) {
            return {
                start: Math.ceil(o.currentPage > o.halfDisplayed ? Math.max(Math.min(o.currentPage - o.halfDisplayed, (o.pages - o.displayedPages)), 0) : 0),
                end: Math.ceil(o.currentPage > o.halfDisplayed ? Math.min(o.currentPage + o.halfDisplayed, o.pages) : Math.min(o.displayedPages, o.pages))
            };
        },

        _appendItem: function(pageIndex, opts) {
            var self = this,
                options, $link, o = self.data('pagination'),
                $linkWrapper = $('<li></li>'),
                $ul = self.find('ul');

            pageIndex = pageIndex < 0 ? 0 : (pageIndex < o.pages ? pageIndex : o.pages - 1);

            options = {
                text: pageIndex + 1,
                classes: ''
            };

            if (o.labelMap.length && o.labelMap[pageIndex]) {
                options.text = o.labelMap[pageIndex];
            }

            options = $.extend(options, opts || {});

            if (pageIndex == o.currentPage || o.disabled) {
                if (o.disabled) {
                    $linkWrapper.addClass('disabled');
                } else {
                    $linkWrapper.addClass('active');
                }
                $link = $('<span class="current">' + (options.text) + '</span>');
            } else {
                $link = $('<a href="' + o.hrefTextPrefix + (pageIndex + 1) + o.hrefTextSuffix + '" class="page-link">' + (options.text) + '</a>');
                $link.click(function(event) {
                    return methods._selectPage.call(self, pageIndex, event);
                });
            }

            if (options.classes) {
                $link.addClass(options.classes);
            }

            $linkWrapper.append($link);

            if ($ul.length) {
                $ul.append($linkWrapper);
            } else {
                self.append($linkWrapper);
            }
        },

        _selectPage: function(pageIndex, event) {
            var o = this.data('pagination');
            o.currentPage = pageIndex;
            if (o.selectOnClick) {
                methods._draw.call(this);
            }
            return o.onPageClick(pageIndex + 1, event);
        },


        //ajax
        //pagination-ajax method
        _create_page_list_div: function() {
            var o = this.data('pagination');

            page_list_div = '<div id="pagination_list"></div>';

            $(o.pagination_link).before(page_list_div);





        },


        _create_loading_div: function() {
            var o = this.data('pagination');

            var loading = '<div class="rect1"></div> <div class="rect2"></div>  <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div>';

            loading_div = '<div id="loading_pagination_ajax" class="spinner"> </div>';
            $('#pagination_list').after(loading_div);
            $('#loading_pagination_ajax').addClass(o.loadingClass);
            $('#loading_pagination_ajax').html(loading);

            //console.log(o.loadingClass);
        },




        //slide page
        slide_page: function(page_number) {

            var o = this.data('pagination');

            var loading = $(o.loading_div);
            var targetUrl = o.targetUrl;
            var page_class = o.page_class;
            var page_list = $(o.page_list);
            var pagination_class = $(o.pagination_link);

            //pagination_class.append('<div id="page_list"> </div>');




            // $('.pagination').pagination('nextPage');
            loading.show();
            //pagination_class.hide();

            var page_number = (page_number == undefined) ? 1 : page_number;
            // var page_number = $(this).attr('href').replace("laporan_harian/beranda/","")
            //alert(page_number);
            var page_id = '#page' + page_number;
            var current_page = page_list.find(page_class);


            // cari dulu halaman dengan id = page2
            var check_page = page_list.find(page_id).length;
            // console.log(check_page);
            if (check_page === 1) {
                //select active page number (page1 --> take 1)
                var active_page = page_list.find('.active').attr('id').replace("page", "");
                var direction = 'left';

                if (page_number > active_page) {
                    var direction = 'right';
                }

                //get_next_page so but hide it, so it would be lazy
                var next_page = parseInt(page_number) + 1;
                var check_next_page = page_list.find('#page' + next_page).length;
                if (check_next_page !== 1) {
                    //get_page(next_page, 'none');
                    methods.get_next_page.call(this, next_page);
                }


                current_page.hide();

                page_list.find('.active').removeClass('active');
                page_list.find(page_id).addClass('active');



                //scroll to top and show the page
                $("body, html").animate({
                    scrollTop: $('body').offset().top
                }, 2000);
                setTimeout(function() {
                    //page_list.find(page_id).show('slide',{direction: direction},900);
                    page_list.find(page_id).fadeIn(900);
                    pagination_class.show();
                    loading.hide();
                }, 1300);




            } else {

                methods.get_page.call(this, page_number, 'true');
                //methods.get_page(page_number);      

                //console.log(page_number);

                var next_page = parseInt(page_number) + 1;
                var next_page_id = '#page' + next_page;
                //get nextpage first if false then get next page
                var check_next_page = page_list.find(next_page_id).length;
                if (check_next_page === 0) {
                    //methods.get_page(next_page, 'none');
                    methods.get_next_page.call(this, next_page);

                } //end if

            }



        },

        //ajax to get page
        get_page: function(page_number, display) {

            var o = this.data('pagination');

            var loading = $(o.loading_div);
            var targetUrl = o.targetUrl;
            var page_class = o.page_class;
            var page_list = $(o.page_list);
            var pagination_class = $(o.pagination_link);

            page = page_number;
            page_number2 = (parseInt(page) - 1) * parseInt(o.itemsOnPage);
            //because it only send one digit, based on pagination and the 0,10 -> page 1, 10, 10 -> page 2 etc


            //prepare data for posting 
            display = display || 'true';
            var data_send = {
                user_data: o.user_data,
                per_page: o.itemsOnPage,
                total_page: o.items,
                current_page: page,
                page_number: page_number2,
                display: display
            };


            $.ajax({
                url: o.targetUrl,
                type: 'POST',
                data: data_send,
                beforeSend: function() {
                    //remove page_class active
                    loading.fadeIn();
                    if (display == 'true') {
                        //scroll to top

                        $("body, html").animate({
                            scrollTop: $('body').offset().top
                        }, 2000);
                        $(page_class).hide();
                        loading.fadeIn();

                        page_list.find('.active').removeClass('active');


                    }




                },
                success: function(html) {
                    loading.hide();
                    // $(page_class).fadeIn(); 
                    page_list.append(html);
                    page_list.find('#page' + page).addClass('paging');
                    page_list.find('#page' + page).addClass('swipe_page');
                    if (display == 'true') {


                        //page_list.find('#page'+page).show('slide',{direction: 'right'},1000).addClass('active'); 
                        page_list.find('#page' + page).fadeIn().addClass('active');
                        pagination_class.fadeIn();
                        // console.log(page);
                    }
                    if (display == 'none') {

                        page_list.find('#page' + page).hide();
                        pagination_class.fadeIn();


                    }



                },
                error: function() {
                    //call notification error
                    //noty_error();
                    page_list.append('<h3> Error koneksi terputus, coba refresh browser anda </h3>');

                }
            });
        },

        //get next page so it wil load fastly
        get_next_page: function(page_number) {

            var o = this.data('pagination');
            var page_list = $(o.page_list);
            var page = page_number;
            var page_number2 = (parseInt(page) - 1) * parseInt(o.itemsOnPage);

            var data_send = {
                user_data: o.user_data,
                per_page: o.itemsOnPage,
                current_page: page,
                page_number: page_number2
            };
            $.ajax({
                url: o.targetUrl,
                type: 'POST',
                data: data_send,
                success: function(html) {

                    page_list.append(html);
                    page_list.find('#page' + page).addClass('paging');
                    page_list.find('#page' + page).addClass('swipe_page');

                },
                error: function() {
                    console.log('<h3> Error koneksi terputus, coba refresh browser anda </h3>');

                }
            });
        }

    };

    $.fn.pagination = function(method) {

        // Method calling logic
        if (methods[method] && method.charAt(0) != '_') {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.pagination');
        }

    };

})(jQuery);
