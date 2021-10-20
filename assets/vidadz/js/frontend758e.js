jQuery(document).ready(function ($) {
    'use strict';
    $.wp_vid_ads = {
        handleAdCloseButton: function () {
            var self = $(this);
            self.parent().remove();

        }
    };
    //fire on event
    $(document).on('click', '.vid-ads-close', $.wp_vid_ads.handleAdCloseButton);

    var checkYT = setInterval(function () {
        if (YT.loaded) {
            jQuery('.vid-ads').each(function (index, el) {
                var config = jQuery(el).data('config');
                jQuery(el).vidAds(config);
            });
            clearInterval(checkYT);
        }
    }, 100);

});
