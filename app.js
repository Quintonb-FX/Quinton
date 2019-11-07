﻿'use strict';

var dnsApp = angular.module('dnsApp',
    []
);

dnsApp.controller('json', ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
    require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
    
    const rootUrl = 'https://www.whoisxmlapi.com/whoisserver/DNSService';

    $scope.type = '_all';

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
            
            $http.get("arm-root.json").then(function(response) {
                let root = response.data;
                root.name = $scope.domain;
                $scope.arm.push(root);

                $scope.render();
            });

            $scope.data.forEach(function(record){
                switch (record.dnsType){
                    case "NS":
                    case "SOA":
                        break;
                    default:
                        console.debug(record);
                        let url = "arm-" + record.dnsType.toLowerCase() + ".json";

                        $http.get(url).then(function(response) {
                            let arm = response.data;
                            arm.name = $scope.domain;
                            arm.properties.TTL = record.ttl;
                            arm.dependsOn.push($scope.domain);
                            switch (record.dnsType){
                                case "TXT":
                                    record.strings.forEach(function (txt)
                                    {
                                        arm.properties.TXTRecords.push({
                                            value: txt
                                        });
                                    });
                                    break;
                                case "A":
                                    arm.properties.ARecords.push({
                                        ipv4Address: record.address
                                    });
                                    break;
                                case "CNAME":
                                    arm.properties.CNAMERecord.push({
                                        cname: record.address
                                    });
                                    break;
                                case "MX":
                                    arm.properties.MXRecords.push({
                                        preference: record.priority,
                                        exchange: record.target
                                    });
                                    break;
                            }

                            $scope.arm.push(arm);

                            $scope.render();
                        });
                }
            });
        });
    };

    $scope.render = function(){
        $scope.editor.setValue(JSON.stringify($scope.arm, null, 2));
    }
}]);