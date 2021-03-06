var queryTemplate = require('./querySelector.tpl.html');
//Test for querySelector performance
var domArea;
var querySelectorSuite = {
    prep: function() {
        var itemDiv;
        domArea = document.getElementById('base-area');
        itemDiv = document.createElement('div');
        itemDiv.className = 'querySelector';
        itemDiv.innerHTML = queryTemplate;
        domArea.appendChild(itemDiv);

    },
    test: function() {
        var num = 40;
        for (var p = 0; p < num; p++) {
            var doc = document.querySelector('.querySelector');
            var queryDom;
            //complex descent====================================
            //console.log('-----------------');
            queryDom = doc.querySelectorAll("html body div>#complex-multi-rules1 .some-class li[data-bar].some-class");
            //console.log(queryDom);//ok
            assertEqual(queryDom.length, 1, 'query failed');
            // id tag.=============================================
            queryDom = doc.querySelectorAll("#complex-multi-rules2 acronym");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("[id='complex-multi-rules2'] a");
            assertEqual(queryDom.length, 1, 'query failed');
            //  id + selector=========================================
            //id + tag=============================================
            queryDom = doc.querySelectorAll("#complex-multi-rules3 source, #complex-multi-rules3 li, #complex-multi-rules3 td");
            assertEqual(queryDom.length, 11, 'query failed');
            queryDom = doc.querySelectorAll("[id='complex-multi-rules3'] source, [id='complex-multi-rules3'] li, [id='complex-multi-rules3'] td");
            assertEqual(queryDom.length, 11, 'query failed');
            // id + class===========================================
            queryDom = doc.querySelectorAll("#complex-multi-rules3 .some-class, #complex-multi-rules3 .other-class");
            assertEqual(queryDom.length, 7, 'query failed');
            queryDom = doc.querySelectorAll("[id='complex-multi-rules3'] .some-class, [id='complex-multi-rules3'] li, [id='complex-multi-rules3'] .other-class");
            assertEqual(queryDom.length, 7, 'query failed');

            //serveral Ids=========================================
            queryDom = doc.querySelectorAll("#complex-multi-rules4 #complex-multi-rules4-sub1 #complex-multi-rules4-sub2 #complex-multi-rules4-sub3");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("#complex-multi-rules4 [id='complex-multi-rules4-sub1'] #complex-multi-rules4-sub2 [id='complex-multi-rules4-sub3']");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("[id='complex-multi-rules4'] [id='complex-multi-rules4-sub1'] [id='complex-multi-rules4-sub2'] [id='complex-multi-rules4-sub3']");
            assertEqual(queryDom.length, 1, 'query failed');

            // Id sandwich: Multiple ids with selectors in between.======================================
            queryDom = doc.querySelectorAll("#complex-multi-rules5 div #complex-multi-rules5-left ul li.other-class #complex-multi-rules5-right table tr>td");
            assertEqual(queryDom.length, 2, 'query failed');
            queryDom = doc.querySelectorAll("div#complex-multi-rules5>div div#complex-multi-rules5-left ul .other-class p img#complex-multi-rules5-image");
            assertEqual(queryDom.length, 1, 'query failed');
            // Named form attribute under hierarchy.
            //根据层次寻找name属性值匹配的元素
            queryDom = doc.querySelectorAll("input[name='complex-multi-rules6-file-input']");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("form input[name='complex-multi-rules6-file-input']");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("form[name='complex-multi-rules6-form'] input[name='complex-multi-rules6-file-input']");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("form[name='complex-multi-rules6-form'] div input[name='complex-multi-rules6-file-input']");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("form[name='complex-multi-rules6-form'] div div input[name='complex-multi-rules6-file-input']");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("form[name='complex-multi-rules6-form']>div>div>input[name='complex-multi-rules6-file-input']");
            assertEqual(queryDom.length, 1, 'query failed');
            // Hierarchy of tag and class.======================================
            queryDom = doc.querySelectorAll("div div a div div p.result-class");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("div div.some-class a.other-class div.another-class div p.result-class");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("div>div>a div div p.result-class");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("div>div.some-class>a.other-class>div.another-class>div>p.result-class");
            assertEqual(queryDom.length, 1, 'query failed');
            queryDom = doc.querySelectorAll("div div a div div p.result-class, div div.some-class a div div p.result-class, div div.some-class a.other-class div div p.result-class, div div.some-class a.other-class div.another-class div p.result-class");
            assertEqual(queryDom.length, 1, 'query failed');
            // Hierarchy of class =================================
            queryDom = doc.querySelectorAll('.some-class .some-class');
            assertEqual(queryDom.length, 2, 'query failed');
            queryDom = doc.querySelectorAll('.some-class .other-class .another-class .result-class');
            assertEqual(queryDom.length, 1, 'query failed');

            // tag.class. About 10% of the queries===================================
            for (var i = 0; i < 5; ++i) {
                queryDom = doc.querySelectorAll("details.details-class");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("summary.summary-class");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("article.article-class");
                assertEqual(queryDom.length, 1, 'query failed');
            }

            // Single selector query, 75% of the queries.==============================================================
            for (var j = 0; j < 5; ++j) {
                // Tags.
                queryDom = doc.querySelectorAll("details");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("summary");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("article");
                assertEqual(queryDom.length, 1, 'query failed');
                // queryDom = doc.querySelectorAll("head");
                // assertEqual(queryDom.length, 1, 'query failed');
                // queryDom = doc.querySelectorAll("body");
                // assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("form");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("input");
                assertEqual(queryDom.length, 1, 'query failed');

                // Attributes exists.
                queryDom = doc.querySelectorAll("[data-foo]");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("[data-bar]");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("[title]");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("[href]");
                assertEqual(queryDom.length, 2, 'query failed');

                // Attribute = value.
                queryDom = doc.querySelectorAll("[data-foo=bar]");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("[data-bar=baz]");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("[title='WebKit Tempalte Framework']");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("[href='http://www.webkit.org/']");
                assertEqual(queryDom.length, 1, 'query failed');

                // Id.
                queryDom = doc.querySelectorAll("#complex-multi-rules1");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("#complex-multi-rules2");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("#complex-multi-rules3");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("#complex-multi-rules4");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("#complex-multi-rules5");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("#complex-multi-rules6");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("#complex-multi-rules7");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll("#complex-multi-rules8");
                assertEqual(queryDom.length, 1, 'query failed');

                // Id with duplicate.
                queryDom = doc.querySelectorAll("#duplicate-id");
                assertEqual(queryDom.length, 3, 'query failed');

                // .class.
                queryDom = doc.querySelectorAll(".details-class");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll(".summary-class");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll(".article-class");
                assertEqual(queryDom.length, 1, 'query failed');
                queryDom = doc.querySelectorAll(".result-class");
                assertEqual(queryDom.length, 1, 'query failed');
            }
        }
        //domArea.removeChild(document.querySelector('.querySelector'));
    },
    clear: function() {
        domArea.removeChild(document.querySelector('.querySelector'));
    }
};
module.exports = querySelectorSuite;