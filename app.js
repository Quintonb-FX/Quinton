﻿'use strict';

var dnsApp = angular.module('dnsApp',
    []
);

dnsApp.controller('json', ['$scope', '$http', function ($scope, $http) {
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
                '&outputFormat=JSON&callback=JSON_CALLBACK';

        $http.jsonp(url).then(function (response)
        {
            console.debug(response);
    
            require(['vs/editor/editor.main'], function () {
                $scope.editor = monaco.editor.create(document.getElementById('container'), {
                    value: JSON.stringify(response.data, null, 2),
                    language: 'json',
                    readOnly: true
                });
            });
        });
    };
}]);