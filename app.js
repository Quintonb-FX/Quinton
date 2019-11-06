﻿'use strict';

var dnsApp = angular.module('dnsApp',
    []
);

dnsApp.controller('json', ['$scope', '$http', function ($scope, $http) {
    require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
    
    const rootUrl = 'https://www.whoisxmlapi.com/whoisserver/DNSService';

    $scope.typeDefault = '_all';

    $scope.change = function () {
        if (!$scope.key.$valid)
        {  
            console.log($scope.key);
            return;
        }
        if (!$scope.domain.$valid)
        {  
            console.log($scope.domain);
            return;
        }
        
        var url = rootUrl +
                '?apiKey=' + $scope.key +
                '&domainName=' + $scope.domain +
                '&type=' + $scope.type +
                '&outputFormat=JSON&callback=JSON_CALLBACK';

        $http.jsonp(url).success(function (response)
        {
            console.log(response);
    
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