﻿'use strict';

var dnsApp = angular.module('dnsApp',
    []
);

dnsApp.controller('json', ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
    require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
    
    const rootUrl = 'https://www.whoisxmlapi.com/whoisserver/DNSService';

    $scope.type = '_all';
    $scope.domain - 'microsoft.com';

    require(['vs/editor/editor.main'], function () {
        $scope.editor = monaco.editor.create(document.getElementById('container'), {
            language: 'json',
            readOnly: true
        });
    });

    $scope.change = function () {
        if ($scope.key === undefined)
        {
            return;
        }
        if ($scope.domain === undefined)
        {
            return;
        }
        
        let url = rootUrl +
                '?apiKey=' + $scope.key +
                '&domainName=' + $scope.domain +
                '&type=' + $scope.type +
                '&outputFormat=JSON';

        $scope.arm = [];
        
        let trustedUrl = $sce.trustAsResourceUrl(url);
        $http.jsonp(trustedUrl, {jsonpCallbackParam: 'callback'}).then(function(data){
            $scope.data = data.data.DNSData.dnsRecords;
            
            $http.get("arm-a.json").then(function(response) {
                let root = response.data;
                root.name = $scope.domain;
                $scope.arm.push(root);

                $scope.render();
            });

            $scope.data.forEach(function(record){
                console.log(record);
                switch (record.dnsType){
                    case "NS":
                    case "SOA":
                        break;
                    default:
                        let url = "arm-" + record.dnsType.toLowerCase() + ".json";
                        console.log(url);
                        $http.get(url).then(function(response) {
                            let arm = response.data;
                            arm.name = $scope.domain;
                            $scope.arm.push(arm);

                            $scope.render();
                        });
                }
            });

            $scope.render();
        });
    };

    $scope.render = function(){
        $scope.editor.setValue(JSON.stringify($scope.arm, null, 2));
    }
}]);