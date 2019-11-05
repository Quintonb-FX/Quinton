﻿'use strict';

var dnsApp = angular.module('dnsApp',
    []
);

dnsApp.controller('json', ['$scope', '$http', function ($scope, $http) {
    require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
    
    const rootUrl = 'https://www.whoisxmlapi.com/whoisserver/DNSService';

    $scope.change = function () {
        var url = rootUrl +
                '?apiKey=' + scope.key +
                'domainName=' + scope.domain +
                '&type=' + scope.type +
                '&outputFormat=JSON&callback=JSON_CALLBACK';
        console.log(url);

        $http.get(url).then(function (response)
        {
            console.log(response);
    
            require(['vs/editor/editor.main'], function () {
            // $scope.editor = monaco.editor.create(document.getElementById('container'), {
            //     value: JSON.stringify(response, null, 2),
            //     language: 'json',
            //     readOnly: true
            // });
            });
        });
    };
}]);