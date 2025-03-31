(function($){"use strict";$('.offer-slider').slick({slidesToShow:4,arrows:true,responsive:[{breakpoint:768,settings:{arrows:true,centerMode:true,centerPadding:'40px',slidesToShow:2}},{breakpoint:480,settings:{arrows:false,centerMode:true,centerPadding:'40px',slidesToShow:2}}]});$('.cat-slider').slick({slidesToShow:8,arrows:true,responsive:[{breakpoint:768,settings:{arrows:true,centerMode:true,centerPadding:'40px',slidesToShow:4}},{breakpoint:480,settings:{arrows:false,centerMode:true,centerPadding:'40px',slidesToShow:4}}]});$('.trending-slider').slick({slidesToShow:3,arrows:true,responsive:[{breakpoint:768,settings:{arrows:false,centerMode:true,centerPadding:'40px',slidesToShow:2}},{breakpoint:480,settings:{arrows:false,centerMode:true,centerPadding:'40px',slidesToShow:1}}]});$('.popular-slider').slick({centerMode:true,centerPadding:'30px',slidesToShow:1,arrows:false,responsive:[{breakpoint:768,settings:{arrows:false,centerMode:true,centerPadding:'40px',slidesToShow:2}},{breakpoint:480,settings:{arrows:false,centerMode:true,centerPadding:'40px',slidesToShow:1}}]});$('.osahan-slider').slick({centerMode:false,slidesToShow:1,arrows:false,dots:true});$('.osahan-slider-map').slick({autoplay:true,slidesToShow:5,arrows:true,responsive:[{breakpoint:768,settings:{arrows:false,autoplay:true,centerMode:true,centerPadding:'40px',slidesToShow:3}},{breakpoint:480,settings:{arrows:false,autoplay:true,centerMode:true,centerPadding:'40px',slidesToShow:3}}]});var $main_nav=$('#main-nav');var $toggle=$('.toggle');var defaultOptions={disableAt:false,customToggle:$toggle,levelSpacing:40,navTitle:'Askbootstrap',levelTitles:true,levelTitleAsBack:true,pushContent:'#container',insertClose:2};var Nav=$main_nav.hcOffcanvasNav(defaultOptions);

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('touchstart', () => {
            input.focus();
            setTimeout(() => input.focus(), 50); // Force keyboard on iOS PWA
        });
    });
});

$(document).ready(function () {
    if ($.fn.tooltip) {  
        $('[data-bs-toggle="tooltip"]').tooltip(); // ✅ Only runs if tooltip exists
    } else {
        console.error("Bootstrap tooltip function not found.");
    }
});

})(jQuery);