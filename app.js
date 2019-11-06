﻿'use strict';

var dnsApp = angular.module('dnsApp',
    []
);

dnsApp.controller('json', ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
    require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
    
    const rootUrl = 'https://www.whoisxmlapi.com/whoisserver/DNSService';

    $scope.type = '_all';

    $scope.change = function () {
        if ($scope.key === undefined)
        {
            return;
        }
        if ($scope.domain === undefined)
        {
            return;
        }
        
        var url = rootUrl +
                '?apiKey=' + $scope.key +
                '&domainName=' + $scope.domain +
                '&type=' + $scope.type +
                '&outputFormat=JSON';
        
        var trustedUrl = $sce.trustAsResourceUrl(url);
        $http.jsonp(trustedUrl, {jsonpCallbackParam: 'callback'}).then(function(data){
            console.log(data);
            require(['vs/editor/editor.main'], function () {
                $scope.editor = monaco.editor.create(document.getElementById('container'), {
                    value: JSON.stringify(data, null, 2),
                    language: 'json',
                    readOnly: true
                });
            });
        });
    };
}]);