var myApp = angular.module('myApp', []);
myApp.controller('mainController', ['$scope', '$filter', '$http','$sce', function ($scope, $filter, $http, $sce) {
    $scope.isLoadingdata = false;
    $scope.friends = [];
    $scope.friends_reaction = [];
    $scope.friends_final = [];
    $scope.count_noaction = 0;
    $scope.showinfo = false;
    $scope.onShow = function () {
        if ($scope.friends.length <= 0) {
            $scope.getlistfriend();
        }
        let url = 'https://graph.fb.me/v2.6/me/posts?fields=id,created_time,reactions.limit(10000){id,type,name}&limit=1000&access_token=' + $scope.access_token;
        var req = {
            method: 'GET',
            url: url
        }
        $scope.isLoadingdata = true;
        $http(req).then(function sucess(res) {
            console.log('sucess');
            var rs = res.data.data;
            rs.forEach(function (element) {
                if (element.reactions !== undefined) {
                    var reacton = element.reactions.data;
                    reacton.forEach(function (element2) {
                        var obj = {
                            id: element2.id,
                            name: element2.name,
                            type: element2.type
                        }
                        $scope.friends_reaction.push(obj);
                    }, this);
                }
            }, this);
            console.log($scope.friends_reaction);
            $scope.friends.forEach(function (element) {
                var like = 0, haha = 0, angry = 0, love = 0, wow = 0, sad = 0, thankful = 0, pride = 0;
                var currend_id = element.id;
                $scope.friends_reaction.forEach(function (element2) {
                    if (currend_id == element2.id) {
                        switch (element2.type) {
                            case 'LIKE': like++; break;
                            case 'LOVE': love++; break;
                            case 'WOW': wow++; break;
                            case 'HAHA': haha++; break;
                            case 'SAD': sad++; break;
                            case 'ANGRY': angry++; break;
                            case 'THANKFUL': thankful++; break;
                            case 'PRIDE': pride++; break;
                        }
                    }
                }, this);
                debugger;
                var obj_new = {
                    id: element.id,
                    name: element.name,
                    picture: element.picture_url,
                    like: like,
                    haha: haha,
                    angry: angry,
                    love: love,
                    wow: wow,
                    sad: sad,
                    thankful: thankful,
                    pride: pride,
                    total_reactions : (like + haha + angry + love + wow + sad + thankful + pride)
                }
                if (obj_new.total_reactions > 0)
                    $scope.count_noaction++;
                $scope.friends_final.push(obj_new);
            }, this);
            $scope.message = $sce.trustAsHtml('<b>'+ $scope.count_noaction + '</b>/<b style="color:red;">' + $scope.friends_final.length + '</b> bạn bè tương tác với bạn trong 1000 bài posts trên tường bạn <br> chiếm ' + ($scope.count_noaction/$scope.friends_final.length)*100 + '%');
            $scope.showinfo = true;
            $scope.isLoadingdata = false;
        }, function error(res) {
            console.log('error');
            $log.info(res)
            $scope.isLoadingdata = false;
        });
    }
    $scope.getlistfriend = function () {
        listFriend = [];
        let url = 'https://graph.fb.me/v2.6/me/friends?fields=name,id,picture{url}&limit=5000&access_token=' + $scope.access_token;
        var req = {
            method: 'GET',
            url: url
        }
        $http(req).then(function sucess(res) {
            var rs = res.data.data;
            rs.forEach(function (element) {
                let obj_friend = {
                    name: element.name,
                    id: element.id,
                    picture_url: element.picture.data.url
                }
                $scope.friends.push(obj_friend);
            }, this);
        }, function error(res) {
            console.log('error');
            $log.info(res)
        });
    }
}]);