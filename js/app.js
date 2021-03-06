
var myApp = angular.module('myApp', ['ngRoute', 'angularSoundManager']);
myApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'view/fb.html',
        controller: 'fbController'
    }).when('/getlinku2be/:passtype', {
        templateUrl: 'view/yotube.html',
        controller: 'youtubeController'
    }).when('/mp3media', {
        templateUrl: 'view/mp3zing.html',
        controller: 'musicController'
    }).when('/login', {
        templateUrl: 'view/login.html',
        controller: 'loginController'
    });
}]);
myApp.config(['$httpProvider', function ($httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);
// myApp.service('author', function () {
//     this.realname = 'Phạm Hoàng Xuân';
//     this.nickname = 'Azar';
//     this.fblink = 'https://www.facebook.com/only.you.381';
//     this.website = 'http://xuanphuong.xyz/';
//     this.logname = function () {
//         return {
//             name: this.realname,
//             nick: this.nickname,
//             fb: this.fblink,
//             website: this.website
//         };
//     }
// });
function author() {
    this.realname = 'Phạm Hoàng Xuân';
    this.nickname = 'Azar';
    this.fblink = 'https://www.facebook.com/only.you.381';
    this.website = 'http://xuanphuong.xyz/';
    return {
        name: this.realname,
        nick: this.nickname,
        fb: this.fblink,
        website: this.website
    };
}
myApp.controller('fbController', ['$scope', '$filter', '$http', '$sce', function ($scope, $filter, $http, $sce) {
    $scope.author = author();
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
        var url = 'https://graph.fb.me/v2.6/me/posts?fields=id,created_time,reactions.limit(10000){id,type,name}&limit=1000&access_token=' + $scope.access_token;
        var req = {
            method: 'GET',
            url: url
        }
        $scope.isLoadingdata = true;
        $http(req).then(function success(res) {
            //console.log('sucess');
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
            //console.log($scope.friends_reaction);
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
        var url = 'https://graph.fb.me/v2.6/me/friends?fields=name,id,picture&limit=5000&access_token=' + $scope.access_token;
        var req = {
            method: 'GET',
            url: url
        }
        $http(req).then(function sucess(res) {
            var rs = res.data.data;
            rs.forEach(function (element) {
                var obj_friend = {
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
        //console.log(type);
        listPost.forEach(function (element) {
            if (element.type == type) {
                postId_template += "<b>" + count_id + ", </b><a target='_blank' href='https://fb.com/" + element.id + "'>" + element.id.split('_')[1] + " - " + element.type + "</a></br>";
                count_id++;
            }
        }, this);
        var template = '<html>' + postId_template + '</html>';
        //console.log(template);
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
myApp.controller('youtubeController', ['$scope', '$http', '$sce', '$log', '$routeParams', function ($scope, $http, $sce, $log, $routeParams) {
    $scope.author = author();
    $scope.correcttype = 'xuandeptrai';
    $scope.isCorrect = $routeParams.passtype === $scope.correcttype;
    //console.log($scope.isCorrect);
    //console.log($routeParams === $scope.correcttype);
    //console.log($routeParams);
    //console.log($scope.correcttype);
    $scope.success = false;
    $scope.error = false;
    $scope.isLoadingdata = false;
    $scope.message = $sce.trustAsHtml('<i class="fa fa-hand-o-left faa-horizontal animated" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Nhập link youtube ở input kế bên nha');
    $scope.listDownload = [];
    $scope.onGet = function () {
        $scope.isLoadingdata = true;
        $scope.success = false;
        $log.info($scope);
        var linkApi = 'http://xuanphuong.xyz/api/u.php?u=' + $scope.link;
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
            $scope.message = $sce.trustAsHtml('Lỗi: ' + res.data);
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
        //document.getElementsByTagName('center')[0].outerHTML = "";
    }, 1000);
}]);
myApp.controller('musicController', ['$scope', '$sce', '$http', function ($scope, $sce, $http) {
    $scope.basefatrat_url = 'http://mapla.pe.hu/f/';
    $scope.author = author();
    $scope.songs = [];//initSong($scope.basefatrat_url);
    $scope.song_search = [];
    $scope.vipdev = false;
    $scope.server = 'nct';
    $scope.isLoading = false;
    $scope.isLoadingSearch = false;
    $scope.findsuccess = false;
    $scope.localStorageSongs = [];
    var key = 'xuandeptraikhoaito';
    var dev = 'http://ss.net:88/';
    var pro = 'http://xuanphuong.xyz/api/';
    var url_api = pro + 'bv2.php?url={url}&keyapi=' + key + '&type={type}';
    var url_api_nct = pro + 'nct_getlink.php?url={url}&a=' + key
    var url_api_search = pro + 'searchzing.php?q={key}&a=' + key;
    var url_api_search_nct = pro + 'searchnct.php?q={key}&a=' + key;
    var url_api_search_u2b = pro + 'searchu2be.php?q={key}&a=' + key;
    $scope.loadLocalstorage = function () {
        if (localStorage.getItem('songs') !== undefined) {
            $scope.localStorageSongs = JSON.parse(localStorage.getItem('songs'));
        }
    }
    $scope.fatratInit = function () {
        var fatrat = initSong($scope.basefatrat_url);
        fatrat.forEach(function (element) {
            $scope.songs.push(element);
        }, this);
    }
    $scope.clearSongs = function () {
        $scope.songs = [];
    };
    $scope.removeSong = function (e) {
        $scope.songs = removeByValue($scope.songs, e.song.id);
    };
    $scope.save_localstorage = function (type, name) {
        if (type == 'new') {
            if (typeof (Storage) !== "undefined") {
                var nameList = prompt("Nhập tên của bản lưu", "Muzik xuân");
                var listSong = JSON.parse(localStorage.getItem('songs'));
                var newsong = JSON.stringify($scope.songs);
                var obj = {
                    name: nameList,
                    data: newsong
                };
                if (listSong !== undefined && listSong != null) {
                    var list_check = listSong.filter(function (el) {
                        return el.name == name
                    });
                    if (list_check.length > 0) {
                        alert('Tên đã  tồn tại');
                        return;
                    }
                    listSong.push(obj);
                } else {
                    listSong = [];
                    listSong.push(obj);
                }
                var string_json = JSON.stringify(listSong);
                $scope.del_localstorage();
                localStorage.setItem('songs', string_json);
            } else {
                alert('Xin lỗi, Trình duyện này không hỗ trợ lưu');
            }
        }
        else if (type == 'update') {
            if (typeof (Storage) !== "undefined") {
                var list = JSON.parse(localStorage.getItem('songs'));
                var obj = {
                    name: name.song_local.name,
                    data: JSON.stringify($scope.songs)
                };
                list = list.filter(function (el) {
                    return el.name !== name
                });
                list.push(obj);
                var string_json = JSON.stringify(list);
                $scope.del_localstorage();
                localStorage.setItem('songs', string_json);
            } else {
                alert('Xin lỗi, Trình duyện này không hỗ trợ lưu');
            }
        }
    };
    $scope.open_localstorage = function (e) {
        if (typeof (Storage) !== "undefined") {
            if (localStorage.getItem('songs') !== undefined && localStorage.getItem('songs') != null) {
                var name = e.song_local.name;
                var lstSongs = JSON.parse(localStorage.getItem('songs'));
                lstSongs = lstSongs.filter(function (el) {
                    return el.name == name;
                });
                $scope.songs = JSON.parse(lstSongs[0].data);
            }
        } else {
            alert('Xin lỗi, Trình duyện này không hỗ trợ lưu');
        }
    };
    $scope.del_localstorage = function () {
        if (typeof (Storage) !== "undefined") {
            localStorage.removeItem('songs');
        } else {
            alert('Xin lỗi, Trình duyện này không hỗ trợ lưu');
        }
    };
    $scope.convert = function () {
        $scope.isLoading = true;
        //console.log($scope.urlzing);
        if ($scope.urlzing == "" || $scope.urlzing === undefined) {
            $scope.isLoading = false;
            return;
        }

        var req = {
            method: 'GET',
            url: url_api.replace(/{url}/g, $scope.urlzing).replace(/{type}/, 1)
        };
        $http(req).then(function success(res) {
            var url_taking = res.data.url;
            var req2 = {
                method: 'GET',
                url: url_api.replace(/{url}/g, url_taking).replace(/{type}/, 2)
            };
            $http(req2).then(function success(res2) {
                var json_data = JSON.parse(res2.data);
                var rs_json = JSON.parse(json_data);
                rs_json.data.forEach(function (element) {
                    var obj = {
                        id: element.id,
                        title: element.name,
                        error: element.source_list[0] === undefined ? true : false,
                        msg: element.source_list[0] === undefined ? element.msg : "",
                        artist: element.artist,
                        url: element.source_list[0] || 'http://mp3.zing.vn' + element.link, // 128kps
                        url320: 'http://mp3.zing.vn',
                        urllossless: 'http://mp3.zing.vn',
                        server: 'zing'
                    };
                    $scope.songs.push(obj);
                }, this);
                $scope.isLoading = false;
                //console.log('----- songs ------');
                //console.log($scope.songs);
            }, function errror(res2) {
                console.log(res2);
            }).catch(function (e) {
                {
                    $scope.isLoading = false;
                    //alert('LỖI!!!! - Link bạn đưa không đúng\nChi tiết: ' + e.message);
                    $.notify("LỖI!!!! - Link bạn đưa không đúng\nChi tiết: " + e.message, {
                        animate: {
                            enter: 'animated bounceInDown',
                            exit: 'animated bounceOutUp'
                        },
                        type: 'danger'
                    });
                    throw e;
                }
            });
        }, function error(res) {
            //console.log('Lỗi');
            console.log(res);
        });
    }
    $scope.convert_nct = function () {
        $scope.isLoading = true;
        var req = {
            method: 'GET',
            url: url_api_nct.replace(/{url}/g, $scope.urlzing)
        };
        $http(req).then(function success(res) {
            var element = res.data;
            var obj = {
                id: element.id,
                title: element.title,
                error: element.error,
                msg: element.error == 0 ? element.message : "",
                artist: element.artist,
                url: element.url,
                url320: element.url320,
                urllossless: element.urllossless,
                server: 'nct'
            };
            $scope.songs.push(obj);
            $scope.isLoading = false;
        }, function errror(res) {
            console.log(res);
        }).catch(function (e) {
            {
                $scope.isLoading = false;
                //alert('LỖI!!!! - Link bạn đưa không đúng\nChi tiết: ' + e.message);
                $.notify("LỖI!!!! - Link bạn đưa không đúng\nChi tiết: " + e.message, {
                    animate: {
                        enter: 'animated bounceInDown',
                        exit: 'animated bounceOutUp'
                    },
                    type: 'danger'
                });
                throw e;
            }
        });
    }
    $scope.convert_ytb = function () {
        //var api_utb_2_mp3 = 'http://www.youtubeinmp3.com/fetch/?video=https://www.youtube.com/watch?v=WAT-Gy6QsTY';
        var api_utb_2_mp3 = 'http://www.youtubeinmp3.com/fetch/?format=JSON&video={url}';
        $scope.isLoading = true;

        var req = {
            method: 'GET',
            url: api_utb_2_mp3.replace(/{url}/g, $scope.urlzing)
        };
        console.log(api_utb_2_mp3.replace(/{url}/g, $scope.urlzing));
        $http(req).then(function success(res) {
            var element = res.data;
            var obj = {
                id: 1,
                title: element.title,
                artist: '',
                url: element.link,
                url320: 'https://youtube.com',
                urllossless: 'https://youtube.com',
                server: 'youtube'
            };
            if (element.title === undefined) {
                $.notify("LỖI!!!! - Không thể lấy link này, vui lòng thử lại link khác ", {
                    animate: {
                        enter: 'animated bounceInDown',
                        exit: 'animated bounceOutUp'
                    },
                    type: 'danger'
                });
                $scope.isLoading = false;
                return;
            }
            $scope.songs.push(obj);
            $scope.isLoading = false;
        }, function errror(res) {
            console.log(res);
        }).catch(function (e) {
            {
                $scope.isLoading = false;
                //alert('LỖI!!!! - Link bạn đưa không đúng\nChi tiết: ' + e.message);
                $.notify("LỖI!!!! - Link bạn đưa không đúng\nChi tiết: " + e.message, {
                    animate: {
                        enter: 'animated bounceInDown',
                        exit: 'animated bounceOutUp'
                    },
                    type: 'danger'
                });
                throw e;
            }
        });
    }
    $scope.search = function () {
        $scope.song_search = [];
        $scope.isLoadingSearch = true;
        var url_search = url_api_search.replace(/{key}/g, $scope.keyword);
        if ($scope.server == 'zing') {
            url_search = url_api_search.replace(/{key}/g, $scope.keyword);
        } else if ($scope.server == 'nct') {
            url_search = url_api_search_nct.replace(/{key}/g, $scope.keyword);
        } else if ($scope.server = 'youtube') {
            url_search = url_api_search_u2b.replace(/{key}/g, $scope.keyword)
        }

        if ($scope.keyword == "" || $scope.keyword === undefined) {
            $scope.isLoadingSearch = false;
            return;
        }
        var req = {
            method: 'GET',
            url: url_search
        };
        $http(req).then(function success(res) {
            res.data.forEach(function (element) {
                var obj = {
                    url: element.url,
                    title: element.title,
                    server: $scope.server
                };
                $scope.song_search.push(obj);
            }, this);
            console.log($scope.song_search);
            $scope.isLoadingSearch = false;
        }, function error(res) {
        }).catch(function (e) {
            {
                $scope.isLoadingSearch = false;
                alert('Lỗi');
                throw e;
            }
        });
    }
    $scope.showError = function (data) {
        //1 : khong tim thay source_list
        switch (data) {
            case 1:
                $.notify("Lỗi 1: Không tìm thấy source_list \n- Chi tiết: \nVui lòng thử lại bài khác nha.", {
                    animate: {
                        enter: 'animated bounceInDown',
                        exit: 'animated bounceOutUp'
                    },
                    type: 'danger'
                });
                //alert('Lỗi 1: Không tìm thấy source_list \n- Chi tiết: \nVui lòng thử lại bài khác nha.'); 
                break;
        }
    }
    $scope.addSong = function (e) {
        $scope.urlzing = e.item.url;
        if ($scope.server == 'zing') {
            $scope.convert();
        } else if ($scope.server == 'nct') {
            $scope.convert_nct();
        } else {
            $scope.convert_ytb();
        }

    }
}]);
myApp.controller('authController', ['$scope', '$location', function ($scope, $location) {

    $scope.logedUser = 'chưa đăng nhập';
    $scope.isLoged = false;
    $scope.level = 'member';
    $scope.listUser = [];
    // const dbRefObject = firebase.database().ref().child('thong_bao');
    // const dbRefChild = dbRefObject.child('messager');  
    // $scope.pushThem = function(){
    //     dbRefChild.push('Test push now');
    // }
    // //muon truy cap vào thằng  con nữa thì dbRefObject.child('')
    // dbRefObject.on('value', snap => {
    //     if (snap.val() != null && snap.val() !== undefined) {
    //         $.notify("<b>Thông báo</b> " + snap.val().content, {
    //             animate: {
    //                 enter: 'animated bounceInDown',
    //                 exit: 'animated bounceOutUp'
    //             },
    //             type: 'success'
    //         });
    //     }
    // });
    // dbRefChild.on('child_added', snap => {
    //      $.notify("<b>Thông báo</b> " + snap.val() + '/' + snap.key, {
    //             animate: {
    //                 enter: 'animated bounceInDown',
    //                 exit: 'animated bounceOutUp'
    //             },
    //             type: 'success'
    //         });
    // });
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            $scope.$apply(function () {
                $scope.logedUser = firebaseUser.email.toString();
                $scope.isLoged = true;
                const dbRefObject = firebase.database().ref('/user/' + firebaseUser.uid);
                const dbMesg = dbRefObject.child('message');
                dbMesg.on('child_added', snap => {
                    if (snap.val().isRead == 0) {
                        $.notify("Thông báo từ Admin: " + snap.val().content, {
                            animate: {
                                enter: 'animated bounceInDown',
                                exit: 'animated bounceOutUp'
                            },
                            type: 'success'
                        });;
                    } else {

                    }
                    var link = 'user/' + firebaseUser.uid + '/message';
                    var data = {
                        content : snap.val().content,
                        isRead : 1
                    }
                    update_firebase(link,snap.key,data);
                });
                dbMesg.on('value', snap => {
                    //console.log(snap.val());
                });
                dbRefObject.on('value', snap => {
                    $scope.$apply(function () {
                        $scope.level = snap.val().level;
                    });
                    if (snap.val().level == 'sAdmin') {
                        var dbref = firebase.database().ref('user');
                        dbref.on('value', snap => {
                            console.log('doc');
                            if ($scope.listUser.length == 0) {
                                $scope.$apply(function () {
                                    Object.keys(snap.val()).forEach(key => {
                                        var obj = {
                                            id: key,
                                            email: snap.val()[key].email
                                        }
                                        $scope.listUser.push(obj);
                                    });
                                });
                            }
                        });
                    }
                });
            });
        } else {
            $scope.$apply(function () {
                $scope.isLoged = false;
            });
        }
    });
    $scope.sendMsg = function () {
        console.log($scope.email);
        console.log($scope.msg);
        if ($scope.email != "" && $scope.email !== undefined && $scope.msg != "" && $scope.msg !== undefined) {
            var msgUser = firebase.database().ref('user/' + $scope.email + '/message');
            var newMsg = {
                content: $scope.msg,
                isRead: 0
            };
            var link = 'user/' + $scope.email +'/message';
            insert_firebase(link,newMsg);
            // var newMsgKey = firebase.database().ref('user/' + $scope.email).child('message').push().key;
            // var update = {};
            // update['/user/' + $scope.email + '/message/' + newMsgKey] = newMsg;
            // firebase.database().ref().update(update);
        }
    }
    $scope.logout = function () {
        firebase.auth().signOut();
        $location.path('/login');
    }
    $scope.updatePassword = function () {
        var user = firebase.auth().currentUser;
        var oldPassword = $scope.regold_user_pwd;
        var res = firebase.auth().signInWithEmailAndPassword(user.email, $scope.regold_user_pwd);
        res.then(function () {
            if ($scope.regnew_user_pwd == $scope.regnewre_user_pwd) {
                user.updatePassword($scope.regnew_user_pwd).then(function () {
                    //alert('Cập nhật mật khẩu thành công');
                    $.notify("Cập nhật mật khẩu thành công", {
                        animate: {
                            enter: 'animated bounceInDown',
                            exit: 'animated bounceOutUp'
                        },
                        type: 'success'
                    });
                }, function (error) {
                    $.notify("Cập nhật mật khẩu không thành công\nChi tiết: " + error, {
                        animate: {
                            enter: 'animated bounceInDown',
                            exit: 'animated bounceOutUp'
                        },
                        type: 'danger'
                    });
                    //alert('Cập nhật mật khẩu không thành công\nChi tiết: ' + error);
                });
            } else {
                $.notify("Nhập lại mật khẩu mới không chính xác", {
                    animate: {
                        enter: 'animated bounceInDown',
                        exit: 'animated bounceOutUp'
                    },
                    type: 'danger'
                });
                //alert('Nhập lại mật khẩu mới không chính xác');
            }
        }).catch(function (e) {
            $.notify("Sai mật khẩu", {
                animate: {
                    enter: 'animated bounceInDown',
                    exit: 'animated bounceOutUp'
                },
                type: 'danger'
            });
            //alert('Sai mật khẩu');
        });
    }
    function update_firebase(refLink, key, data) // ex: reflink : user/xuanph@twin.vn/message, key: -KqBMrqtWcx2IRvfB9CM, data {content: 'hihi',isRead : 1}
    {
        var update = {};
        update['/' + refLink + '/' + key] = data;
        firebase.database().ref().update(update);
    }
    function insert_firebase(refLink, data) {
        var insert = {};
        var newKey = firebase.database().ref(refLink).push().key;
        insert['/' + refLink + '/' + newKey] = data;
        firebase.database().ref().update(insert).then(function(res){
            console.log(res);
        }).catch(function(ex){
            console.log(ex);
        });

    }
}]);
function removeByValue(array, value) {
    return array.filter(function (elem, _index) {
        return value != elem.id ? true : false;
    });
}
