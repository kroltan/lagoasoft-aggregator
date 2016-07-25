"use strict";
const angular = require("angular");

let app = angular.module("app", [
    require("angular-route"),
    require("./components"),
]);

app.controller("MainCtrl", ["$scope", "$http", function($scope, $http) {
    $scope.query = "";

    $scope.submit = function() {
        $scope.loading = true;
        $http({
            method: "GET",
            url: "/search",
            params: {
                name: $scope.query
            }
        }).then(res => {
            $scope.loading = false;
            Object.assign($scope, res.data);
        }, err => {
            $scope.loading = false;
        });
    };
}]);
