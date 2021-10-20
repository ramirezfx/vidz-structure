// window.onYouTubeIframeAPIReady = function() {};
;(function ($, window, document, undefined) {
    // our plugin constructor
    var vidAds = function (elem, options) {
        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;
    };

    // the plugin prototype
    vidAds.prototype = {
        defaults: {
            video_id: '',
            auto_close: true,
            pause_on_ad: false,
            start_after: 5,
            recurrence: 1,
            ad_played: 0,
            ad_duration: 5000,
            duration: 0,
            height: 315,
            width: 560,
            current_frame: 0,
            status: null,
            inter_val_func: null
        },

        init: function () {
            this.settings = $.extend({}, this.defaults, this.options);
            this.run_player();
            this.tick = this.tick.bind(this);
            this.should_play = this.should_play.bind(this);
            this.play_ad = this.play_ad.bind(this);
            this.close_ad = this.close_ad.bind(this);
            this.$elem.find('.vid-ads-close-button').on('click', this.close_ad);
            return this;
        },
        run_player: function () {
            console.log('run_player');
            var self = this;
            this.settings.player = new YT.Player(this.settings.video_id, {
                height: this.settings.height || 400,
                width: this.settings.width || 600,
                videoId: this.settings.video_id,
                playerVars: {rel: 0, showinfo: 0, ecver: 2},
                events: {
                    onReady: function (event) {
                        self.settings.status = 'ready';
                        self.settings.duration = event.target.getDuration();
                    },
                    onStateChange: function (event) {
                        self.$elem.toggleClass('playing');
                        if (event.data === 1) {
                            self.settings.inter_val_func = setInterval(self.tick, 1000);
                        } else {
                            clearInterval(self.settings.inter_val_func);
                        }
                    }
                }
            });
        },
        tick: function () {
            var current_frame = this.settings.player.getCurrentTime();
            this.settings.current_frame = current_frame;
            if (this.settings.start_after > current_frame) {
                console.log('wait....');
                return false;
            }

            if (this.should_play()) {
                console.log('playgin ad....');
                this.play_ad();
            }

        },
        should_play: function () {
            if (this.settings.ad_played >= this.settings.recurrence) {
                return false;
            }

            if($.cookie('vid_adz_disable')){
                return false;
            }
            //for first one as soon as passed
            if (!this.settings.ad_played) {
                return true;
            }

            var recurrence_every = Math.round(this.settings.duration / this.settings.recurrence);
            var current_frame = Math.round(this.settings.player.getCurrentTime());

            return current_frame % recurrence_every === 0;
        },
        play_ad: function () {
            console.log('playing ad');
            this.$elem.addClass('playing-ad');
            var eq = Math.floor(Math.random() * this.$elem.find('.vid-ads-item').length);
            this.$elem.find('.vid-ads-close-button').show();
            var checkBoard = this.$elem.find('.vid-ads-leaderboard').length;
            if(checkBoard){
                this.$elem.find('.vid-ads-item').eq(eq).css('display', 'flex');
            }else{
                this.$elem.find('.vid-ads-item').eq(eq).show();
            }

            this.settings.ad_played += 1;

            if (this.settings.pause_on_ad) {
                this.settings.player.pauseVideo();
            } else {
                this.$elem.addClass('no-background');
            }
            if (this.settings.auto_close) {
                setTimeout(this.close_ad, this.settings.ad_duration * 1000);
            }

        },
        close_ad: function () {
            this.$elem.removeClass('playing-ad');
            if(VIDADS.cookie_duration){
                var date = new Date();
                var hours = parseInt(VIDADS.cookie_duration, 10);
                date.setTime(date.getTime() + (hours * 60 * 1000));
                $.cookie('vid_adz_disable', 'yes', { expires: date })
            }
            this.$elem.find('.vid-ads-item, .vid-ads-close-button').hide();
            if (this.settings.pause_on_ad) {
                this.settings.player.playVideo();
            }

            return false;
        }

    };

    vidAds.defaults = vidAds.prototype.defaults;

    $.fn.vidAds = function (options) {
        return this.each(function () {
            new vidAds(this, options).init();
        });
    };
})(jQuery, window, document);
