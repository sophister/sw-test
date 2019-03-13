// register service worker

if ('serviceWorker' in navigator) {
    console.info('navigator.serviceWorker.controller', navigator.serviceWorker.controller, window.enableSW);
    navigator.serviceWorker.addEventListener('controllerchange', function(e){
      console.log('navigator.serviceWorker controllerchange ', e);
    });
    // 监听SW发送的事件
    navigator.serviceWorker.addEventListener('message', function(event){
        console.log('message from sw: ', event.data);
    });

    navigator.serviceWorker.ready.then(function(reg){
        console.log('navigator.serviceWorker.ready ', reg);
        reg.addEventListener('updatefound', function() {
            // If updatefound is fired, it means that there's
            // a new service worker being installed.
            var installingWorker = reg.installing;
            console.log('A new service worker is being installed:',
                installingWorker);

            // You can listen for changes to the installing service worker's
            // state via installingWorker.onstatechange
            var waitWorker = reg.waiting || reg.installing;
            waitWorker.postMessage('sw.update');
        });
        window.$reg = reg;
    });

    if( navigator.serviceWorker.controller ){

        // 向 SW 发送事件
      navigator.serviceWorker.controller.postMessage({
          name: 'hello',
          age: 30,
          deep: {
              arr: [ 1, 2, 3],
              test: true,
          }
      });
    }
  if( window.enableSW ){
      navigator.serviceWorker.register('/sw-test/sw.js', { scope: '/sw-test/' }).then(function(reg) {
console.log('reg: ', reg);
          if(reg.installing) {
              console.log('Service worker installing');
          } else if(reg.waiting) {
              console.log('Service worker installed');
          } else if(reg.active) {
              console.log('Service worker active');
          }

      }).catch(function(error) {
          // registration failed
          console.log('Registration failed with ' + error);
      });
  }else{

    // 取消 sw

      if( navigator.serviceWorker.controller ){
          navigator.serviceWorker.controller.postMessage('sw.delete');
      }
      // navigator.serviceWorker.getRegistrations().then(function(registrations) {
      //   console.log('sw registrations: ', registrations);
      //     for(let registration of registrations) {
      //         registration.unregister().then(function(success){
      //           console.log('sw unregister result: ', success);
      //         }).catch(function(err){
      //           console.error('sw unregister error: ', err);
      //         });
      //     } });
  }

}

// function for loading each image via XHR

function imgLoad(imgJSON) {
  // return a promise for an image loading
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', imgJSON.url);
    request.responseType = 'blob';

    request.onload = function() {
      if (request.status == 200) {
        var arrayResponse = [];
        arrayResponse[0] = request.response;
        arrayResponse[1] = imgJSON;
        resolve(arrayResponse);
      } else {
        reject(Error('Image didn\'t load successfully; error code:' + request.statusText));
      }
    };

    request.onerror = function() {
      reject(Error('There was a network error.'));
    };

    // Send the request
    request.send();
  });
}

var imgSection = document.querySelector('section');

window.onload = function() {

  // load each set of image, alt text, name and caption
  for(var i = 0; i<=Gallery.images.length-1; i++) {
    imgLoad(Gallery.images[i]).then(function(arrayResponse) {

      var myImage = document.createElement('img');
      var myFigure = document.createElement('figure');
      var myCaption = document.createElement('caption');
      var imageURL = window.URL.createObjectURL(arrayResponse[0]);

      myImage.src = imageURL;
      myImage.setAttribute('alt', arrayResponse[1].alt);
      myCaption.innerHTML = '<strong>' + arrayResponse[1].name + '</strong>: Taken by ' + arrayResponse[1].credit;

      imgSection.appendChild(myFigure);
      myFigure.appendChild(myImage);
      myFigure.appendChild(myCaption);

    }, function(Error) {
      console.log(Error);
    });
  }
};

var btn = document.querySelector('#btn');
btn.addEventListener('click', function(){
  var img = document.createElement('img');
  img.src = './gallery/snowTroopers.jpg?_=' + Math.random();
  document.body.insertBefore(img, btn);
});

