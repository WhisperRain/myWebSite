
function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 1000);
}

setupWebViewJavascriptBridge(function(bridge) {

    document.body.appendChild(document.createElement('br'))
    var callbackButton = document.getElementById('buttons').appendChild(document.createElement('button'))
    callbackButton.innerHTML = '调用app原生组件实现登录'
    callbackButton.onclick = function(e) {
        e.preventDefault()
        log('JS calling handler "testObjcCallback"')

        bridge.callHandler('login',
            {
                'blogURL': 'http://www.henishuo.com',
                'actionName':'login'
            },
            function(response) {
                log('JS got response', response)
            })

    }


    document.body.appendChild(document.createElement('br'))
    var callbackButton = document.getElementById('purchase').appendChild(document.createElement('button'))
    callbackButton.innerHTML = '调用app原生组件进行购买'
    callbackButton.onclick = function(e) {
        e.preventDefault()
        log('JS calling handler "purchaseCallback"')

        // <!--剔除空数据的话，参数就应该如下所示-->
        var params = {'subKind': 'QMProductInfoViewController','presentOrPush':'push','parameters':{'isModel':'1','showBackBtn':'1','QMProductInfo':{'productId':'3744'}}};


        bridge.callHandler('presentSub',
            params,
            function(response) {
                alert('切换到某一视图控制器:' + response);
                document.getElementById("returnValue").value = response;
            })

    }


    var uniqueId = 1
    function log(message, data) {
        var log = document.getElementById('log')
        var el = document.createElement('div')
        el.className = 'logLine'
        el.innerHTML = uniqueId++ + '. ' + message + ':<br/>' + JSON.stringify(data)
        if (log.children.length) { log.insertBefore(el, log.children[0]) }
        else { log.appendChild(el) }
    }

    bridge.callHandler('testObjcCallback', {'foo': 'bar'}, function(response) {
        log('JS responding with', response)
    })

    bridge.registerHandler('testJavascriptHandler', function(data, responseCallback) {

        alert('whisperRainSuccess')
        log('ObjC called testJavascriptHandler with', data)
        var responseData = { 'Javascript Says':'Right back atcha!' }
        log('JS responding with', responseData)
        responseCallback(responseData)
    })


    bridge.registerHandler('useJsModifyStorage', function(data, responseCallback) {
        // log('JS方法被调用:',data);
        // alert('userLoginState:' + data);
        eraseCookie('JSESSIONID');
        createCookie('JSESSIONID',data,2);
        window.location.reload()

        responseCallback('js执行过了');
    });

    function createCookie(name,value,days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            var expires = "; expires=" + date.toUTCString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function eraseCookie(name) {
        createCookie(name,"",-1);
    }

})
