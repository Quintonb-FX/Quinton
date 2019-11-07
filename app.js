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

        $scope.render({info: "loading", site: $scope.domain, key: $scope.key});
        
        let url = rootUrl +
                '?apiKey=' + $scope.key +
                '&domainName=' + $scope.domain +
                '&type=' + $scope.type +
                '&outputFormat=JSON';

        $scope.arm = [];
        
        let trustedUrl = $sce.trustAsResourceUrl(url);
        $http.jsonp(trustedUrl, {jsonpCallbackParam: 'callback'}).then(function(data){
            if (data == undefined || data.data === undefined || data.data.DNSData === undefined || data.data.DNSData.dnsRecords === undefined)
            {
                $scope.render({error: "no data", site: $scope.domain});
                return;
            }

            $scope.data = data.data.DNSData.dnsRecords;

            let txtRecords, mxRecords, aRecords;

            $http.get('arm-root.json').then(function(response) {
                let root = response.data;
                root.name = $scope.domain;
                $scope.arm.push(root);

                $scope.render($scope.arm);
            });

            $scope.data.forEach(function(record){
                switch (record.dnsType){
                    case 'NS':
                    case 'SOA':
                        break;
                    default:
                        console.debug(record);
                        let url = 'arm-' + record.dnsType.toLowerCase() + '.json';

                        $http.get(url).then(function(response) {
                            let arm = response.data;
                            arm.name = $scope.domain + '/@';
                            arm.properties.TTL = record.ttl;
                            arm.dependsOn.push($scope.domain);
                            switch (record.dnsType){
                                case 'TXT':
                                    if (txtRecords === undefined)
                                    {
                                        record.strings.forEach(function (str)
                                        {
                                            arm.properties.TXTRecords.push({
                                                value: str
                                            });
                                        });
                                        txtRecords = arm.properties.TXTRecords;
                                        $scope.arm.push(arm);
                                    }
                                    else
                                    {
                                        record.strings.forEach(function (str)
                                        {
                                            txtRecords.push({
                                                value: str
                                            });
                                        });
                                    }
                                    break;
                                case 'A':
                                    if (aRecords === undefined)
                                    {
                                        arm.properties.ARecords.push({
                                            ipv4Address: record.address
                                        });
                                        aRecords = arm.properties.ARecords;
                                        $scope.arm.push(arm);
                                    }
                                    else
                                    {
                                        aRecords.push({
                                            ipv4Address: record.address
                                        });
                                    }
                                    break;
                                case 'CNAME':
                                    arm.properties.CNAMERecord.push({
                                        cname: record.address
                                    });
                                    $scope.arm.push(arm);
                                    break;
                                case 'MX':
                                    if (mxRecords === undefined)
                                    {
                                        arm.properties.MXRecords.push({
                                            preference: record.priority,
                                            exchange: record.target
                                        });
                                        mxRecords = arm.properties.MXRecords;
                                        $scope.arm.push(arm);
                                    }
                                    else
                                    {
                                        mxRecords.push({
                                            preference: record.priority,
                                            exchange: record.target
                                        });
                                    }
                                    break;
                                default:
                                    console.warn('unknown record type: ' + record.dnsType);
                                    break;
                            }

                            $scope.render($scope.arm);
                        });
                }
            });
        });
    };

    $scope.render = function(data){
        $scope.editor.setValue(JSON.stringify(data, null, 2));
    }
}]);