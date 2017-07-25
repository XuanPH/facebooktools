myApp.controller('loginController', ['$scope', '$location', function ($scope, $location) {
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            $scope.$apply(function () {
                $location.path('/');
            });
        } else {
            console.log('not logged');
        }
    });
    //$scope.userloged = "";
    $scope.register = function () {
        var res = firebase.auth().createUserWithEmailAndPassword($scope.reg_user_id, $scope.reg_user_pwd);
        res.then(function () {
            var userid = firebase.auth().currentUser.uid;
            console.log(userid);
            const dbUser = firebase.database().ref('user/' + userid).set({
                    level : "member",
                    message : {
                        "123456" : {
                            'content' : 'Chào mừng tới xuanphuong.xyz',
                            'isRead' : 0
                        }
                    }
            });
             $.notify("Đăng ký thành công", {
                animate: {
                    enter: 'animated bounceInDown',
                    exit: 'animated bounceOutUp'
                },
                type: 'success'
            });
        }).catch(function (e) {
            alert(e.message);
        });
    };
    $scope.login = function () {
        var res = firebase.auth().signInWithEmailAndPassword($scope.user_id, $scope.user_pwd);
        res.then(function () {
            $.notify("Đăng nhập thành công", {
                animate: {
                    enter: 'animated bounceInDown',
                    exit: 'animated bounceOutUp'
                },
                type: 'success'
            });
        }).catch(function (e) {
            $.notify("Lỗi: "+e.message, {
                animate: {
                    enter: 'animated bounceInDown',
                    exit: 'animated bounceOutUp'
                },
                type: 'danger'
            });
        });
    };
    $scope.validatePassword = function () {
        if ($scope.reg_user_pwd != $scope.regre_user_pwd && $scope.reg_user_pwd != '' && $scope.regre_user_pwd != '') {
            return true;
        }
        return false;
    }
}]);