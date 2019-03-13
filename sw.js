
// self.enableSW = true;

console.log('ws js executed=====33333========');


self.addEventListener('install', function(event) {
  console.log('sw install callback');
  event.waitUntil(new Promise(function(resolve){
    setTimeout(function(){
      console.log('sw before install resolve 222');
      resolve();
    }, 1000);
  }));

    // Send a message to the client.
    self.clients.matchAll().then(function (clients) {
        console.log('clients in sw: ', clients);
        clients.forEach(function (client) {
            client.postMessage({
                hello: "word",
                yes: true,
                nest: {
                    obj: {age: 31},
                    num: -23,
                    bool: false,
                },
                req: event.request.url
            });
        });
    });

  // event.waitUntil(
  //   caches.open('v1').then(function(cache) {
  //     return cache.addAll([
  //       // '/sw-test/',
  //       // '/sw-test/index.html',
  //       '/sw-test/style.css',
  //       '/sw-test/app.js',
  //       '/sw-test/image-list.js',
  //       '/sw-test/star-wars-logo.jpg',
  //       '/sw-test/gallery/bountyHunters.jpg',
  //       '/sw-test/gallery/myLittleVader.jpg',
  //       '/sw-test/gallery/snowTroopers.jpg'
  //     ]);
  //   })
  // );

});

self.addEventListener('activate', function (event) {
   console.log('sw activate callback');
    clients.claim().then(function(result){
        console.log('sw clients.claim result', result);
    }).catch(function(result){
        console.error('sw clients.claim error', result);
    });

   // event.waitUntil(new Promise(function(resolve, reject){
   //   setTimeout(function(){
   //     console.log('sw resolve activate');
   //     resolve();
   //   }, 4000);
   // }));

   // const req = new Request('https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/wangqiushi/tanchuang/0122-MGM-PCFC.png', {
   //   mode: 'cors',
   // });
   // updateCache(req);
});

self.addEventListener('message', function (event) {
    console.log('message in sw: ', event.data);
    if( event.data === 'sw.delete'){
      // 删除缓存 并 注销SW
      //   self.enableSW = false;
        caches.delete('v1').then(function(result){
          console.log('caches delete v1 result: ', result);
        }).catch(function(err){
          console.error('删除缓存 v1 失败！', err);
        });
        self.registration.unregister().then(function(success){
            console.log('sw unregister result: ', success);
        }).catch(function(err){
            console.error('sw unregister error: ', err);
        });
    }else if( event.data === 'sw.claim'){
      clients.claim().then(function(result){
        console.log('sw clients.claim result', result);
      }).catch(function(result){
        console.error('sw clients.claim error', result);
      });
    }else if( event.data === 'sw.update'){
      console.log('before skipWaiting in sw 2222');
      self.skipWaiting();
    }
});

self.addEventListener('fetch', function(event) {
  // if( ! self.enableSW ){
  //   console.log('sw 已经被禁用，不再拦截请求， ', event);
  //   return;
  // }
    if(event.request.mode === 'navigate'){
        //页面级请求，优先使用缓存，但是需要延迟更新缓存
        console.log(`不缓存页面：`, event.request);
        return;
    }

  event.respondWith(caches.match(event.request).then(function(response) {
    // caches.match() always resolves
    // but in case of success response will have value
    if (response !== undefined) {
      //need to update cache
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        let responseClone = response.clone();
        
        caches.open('v1').then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        return caches.match('/sw-test/gallery/myLittleVader.jpg');
      });
    }
  }));
});

/**
 * fetch and save to cache
 * @param request
 */
function updateCache(request){
    return fetch(request).then(function (response) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        let responseClone = response;

        caches.open('v1').then(function (cache) {
            cache.put(request, responseClone);
        });
    }).catch(function (err) {
       console.error(`updateCache error: `, err);
    });
}
