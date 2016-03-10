define('suites/base/dom', [
    'suites/base/dom.tpl.html'
], function(domTemplate) {
    //Test for DOM Core Performance: InnerHTML, Appending, Prepending, Inserting, Querying, Removing
    var domArea;
    var domSuite = {
        prep: function() {
            domArea = document.getElementById('base-area');
        },
        test: function() {
            var num = 40,
                nodeAry = [],
                itemDiv, queryDom;
            //InnerHTML
            for (var i = 0; i < num; i++) {
                itemDiv = document.createElement('div');
                itemDiv.className = 'testA' + i;
                itemDiv.id = 'A' + i;
                itemDiv.innerHTML = domTemplate;
                nodeAry.push(itemDiv);
            }

            //Appending
            for (var j = 0; j < num; j++) {
                domArea.appendChild(nodeAry[j]);
            }

            //Prepending&Insert  means insertBefore
            //注意这样并不会创建出80个DIV
            //因为这里是对已经存在元素操作
            //前面的Appending执行完后是
            //A0 A1  A2....
            for (var m = 0; m < num; m++) {
                var first = domArea.firstChild;
                domArea.insertBefore(nodeAry[m], first);
            }
            //现在倒回来了
            //A39  A38 ...只是改变了顺序而已
            //除非是新的元素insertBefore才会添加

            //Querying
            for (var z = 0; z < num; z++) {
                queryDom = document.getElementsByClassName('testA' + z);
                queryDom = document.getElementById('A' + z);
                queryDom = document.getElementsByClassName('testB' + z); //找不到
                queryDom = document.getElementById('B' + z); //找不到
                queryDom = document.querySelector('#A' + z);
                queryDom = document.querySelector('#B' + z); //找不到
            }

            //Removing
            for (var q = 0; q < num; q++) {
                queryDom = document.getElementsByClassName('testA' + q)[0];
                domArea.removeChild(queryDom);
            }
        }
    };
    return domSuite;
});
