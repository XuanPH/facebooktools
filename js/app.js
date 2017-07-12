
var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(function($routeProvider){
    $routeProvider.when('/',{
        templateUrl: 'view/fb.html',
        controller: 'fbController'
    }).when('/getlinku2be/:passtype',{
        templateUrl : 'view/yotube.html',
        controller: 'youtubeController'
    });
});
myApp.service('author',function (){
    this.realname = 'Phạm Hoàng Xuân';
    this.nickname = 'Azar';
    this.fblink = 'https://www.facebook.com/only.you.381';
    this.website = 'http://xuanphuong.xyz/';
    this.logname = function(){
        return {
            name : this.realname,
            nick : this.nickname,
            fb : this.fblink,
            website : this.website
        };
    }
});
myApp.controller('fbController', ['$scope', '$filter', '$http', '$sce','author', function ($scope, $filter, $http, $sce,author) {
    $scope.author = author.logname();
    $scope.isLoadingdata = false;
    $scope.friends = [];
    $scope.friends_reaction = [];
    $scope.friends_final = [];
    $scope.count_noaction = 0;
    $scope.showinfo = false;
    $scope.info_user = {};
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
        $http(req).then(function success(res) {
            console.log('sucess');
            var rs = res.data.data;
            rs.forEach(function (element) {
                if (element.reactions !== undefined) {
                    var reacton = element.reactions.data;
                    reacton.forEach(function (element2) {
                        var obj = {
                            id: element2.id,
                            name: element2.name,
                            type: element2.type,
                            id_post: element.id
                        }
                        $scope.friends_reaction.push(obj);
                    }, this);
                }
            }, this);
            console.log($scope.friends_reaction);
            $scope.friends.forEach(function (element) {
                var like = 0, haha = 0, angry = 0, love = 0, wow = 0, sad = 0, thankful = 0, pride = 0;
                var postsId = [];
                var postId_template = "";
                var currend_id = element.id;
                $scope.friends_reaction.forEach(function (element2) {
                    if (currend_id == element2.id) {
                        postsId.push({ id: element2.id_post, type: element2.type });
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
                    total_reactions: (like + haha + angry + love + wow + sad + thankful + pride),
                    id_posts_list: postsId
                }
                if (obj_new.total_reactions > 0)
                    $scope.count_noaction++;
                $scope.friends_final.push(obj_new);
            }, this);
            $scope.message = $sce.trustAsHtml('<b>' + $scope.count_noaction + '</b>/<b style="color:red;">' + $scope.friends_final.length + '</b> bạn bè tương tác với bạn trong 1000 bài posts trên tường bạn <br> chiếm ' + ($scope.count_noaction / $scope.friends_final.length) * 100 + '%');
            $scope.showinfo = true;
            $scope.isLoadingdata = false;
        }, function error(res) {
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
        });
    }
    $scope.onUnfriend = function () {
        new AsyncRequest().setURI('https://www.facebook.com/ajax/profile/removefriendconfirm.php').setData({ uid: $scope.facebook_id, norefresh: true }).send();
    }
    $scope.listPost = function (id, type) {
        var listPost = [];
        var postId_template = "";
        $scope.friends_final.forEach(function (element) {
            if (element.id == id) {
                listPost = element.id_posts_list;
            }
        }, this);
        var count_id = 1;
        console.log(type);
        listPost.forEach(function (element) {
            if (element.type == type) {
                postId_template += "<b>" + count_id + ", </b><a target='_blank' href='https://fb.com/" + element.id + "'>" + element.id.split('_')[1] + " - " + element.type + "</a></br>";
                count_id++;
            }
        }, this);
        var template = '<html>' + postId_template + '</html>';
        console.log(template);
        var w = window.open('');
        w.document.write($sce.trustAsHtml(template));
    }
    $scope.infomation = function () {
        var request = {
            method: 'GET',
            url: 'https://graph.fb.me/v2.6/me/?fields=about,age_range,birthday,name,picture{url},gender,hometown,id'
        };
        $http(request).then(function success(response) {

        }, function error(response) {

        });
    }
}]);
myApp.controller('youtubeController', ['$scope', '$http', '$sce', '$log','$routeParams','author', 
function ($scope, $http, $sce, $log, $routeParams, author) {
    $scope.author = author.logname();
    $scope.correcttype = 'xuandeptrai';
    $scope.isCorrect = $routeParams.passtype === $scope.correcttype;
    console.log($scope.isCorrect);
    console.log($routeParams === $scope.correcttype);    
    console.log($routeParams);
    console.log($scope.correcttype);
    $scope.success = false;
    $scope.error = false;
    $scope.isLoadingdata = false;
    $scope.message = $sce.trustAsHtml('<i class="fa fa-hand-o-left faa-horizontal animated" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Nhập link youtube ở input kế bên nha');
    $scope.listDownload = [];
    $scope.onGet = function () {
        $scope.isLoadingdata = true;
        $scope.success = false;
        $log.info($scope);
        var linkApi = 'http://mapla.pe.hu/getlink/u.php?u=' + $scope.link;
        var req = {
            method: 'GET',
            url: linkApi
        };
        $http(req).then(function s(res) {
            $scope.listDownload = res.data;
            $scope.isLoadingdata = false;
            $scope.success = true;
            $scope.error = false;
            $scope.message = $sce.trustAsHtml('Thành công! chọn link phía dưới để tải nha');
        }, function e(res) {
            $scope.message = $sce.trustAsHtml('Lỗi: '+res.data);
            $scope.isLoadingdata = false;
            $scope.success = false;
            $scope.error = true;
        });
    };
    $scope.openNewtab = function (link) {
        window.open(link, '_blank');
    }
    //remove footer of somee.com
    setTimeout(function () {
        document.getElementsByTagName('center')[0].outerHTML = "";
    }, 500);
}]);