document.addEventListener( 'DOMContentLoaded', function () {
    var main = new Splide( '#main-slider', {
      type      : 'fade',
      rewind    : false,
      pagination: false,
      arrows    : false,
    } );
  
    var thumbnails = new Splide( '#thumbnail-slider', {
      fixedWidth  : 100,
      fixedHeight : 100,
      gap         : 10,
      rewind      : false,
      pagination  : false,
      cover       : false,
      isNavigation: true,
      breakpoints : {
        600: {
          fixedWidth : 60,
          fixedHeight: 44,
        },
      },
    } );
  
    main.sync( thumbnails );
    main.mount();
    thumbnails.mount();
  } );