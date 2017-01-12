'use strict';
angular.module('conFusion.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
  $scope.reservationData={};
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
   $ionicModal.fromTemplateUrl('templates/reserve.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.closeReserve = function() {
    $scope.modal.hide();
  };
  $scope.reserve = function() {
    $scope.modal.show();
  };
  $scope.doReserve = function() {
    console.log('reservationData', $scope.reservationData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
   

})

 .controller('MenuController', ['$scope', 'menuFactory','favorityFactory','baseURL', '$ionicListDelegate',
    function($scope, menuFactory,favorityFactory,baseURL,$ionicListDelegate) {
            $scope.baseURL=baseURL; 
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showDetails = false;
            $scope.showMenu = false;
            $scope.message = "Loading ...";
            
            menuFactory.getDishes().query(
                function(response) {
                    $scope.dishes = response;
                    $scope.showMenu = true;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });

                        
            $scope.select = function(setTab) {
                $scope.tab = setTab;
                
                if (setTab === 2) {
                    $scope.filtText = "appetizer";
                }
                else if (setTab === 3) {
                    $scope.filtText = "mains";
                }
                else if (setTab === 4) {
                    $scope.filtText = "dessert";
                }
                else {
                    $scope.filtText = "";
                }
            };

            $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
            };
    
            $scope.toggleDetails = function() {
                $scope.showDetails = !$scope.showDetails;
            };
            $scope.addFavorite= function(index){
               console.log('favorite iteme'+ index);
               favorityFactory.addFavorite(index);
               $ionicListDelegate.closeOptionButtons();
            };
        }])
    .controller('FavoriteController', ['$scope', 'menuFactory','favorityFactory','baseURL', '$ionicListDelegate','$ionicPopup','$ionicLoading','$timeout',
    function($scope, menuFactory,favorityFactory,baseURL,$ionicListDelegate,$ionicPopup,$ionicLoading,$timeout) {
        
        $scope.baseURL=baseURL;
        $scope.shouldShowDelete=false;
        $scope.showMenu = false;
        $ionicLoading.show({
            template:'<ion-spinner></ion-spinner>Loading...'
        });
        //get favorites dishes id
        $scope.favorites=favorityFactory.getFavorites();
        //get dishes
        menuFactory.getDishes().query(
                function(response) {
                    $scope.dishes = response;
                    $scope.showMenu = true;
                     $timeout(function(){
                        $ionicLoading.hide();
                    },1000);
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                    $timeout(function(){
                        $ionicLoading.hide();
                    },1000);
                });
        
        $scope.toggleDelete=function(){
            $scope.shouldShowDelete = !$scope.shouldShowDelete;
            console.log('shouldShowDelete flag'+ $shouldShowDelete);
        };
        $scope.deleteFavorite=function(index){
            var confirmPopup=$ionicPopup.confirm({
                title:'confirm Delete',
                template:'are you sure you want to delete this item ?'
            });
            confirmPopup.then(function(res){
                if(res){
                   favorityFactory.deleteFavorite(index);
                }else{
                    console.log('cancel delete item');
                }
            });
            $scope.shouldShowDelete= false;
        }
        
    }])
        .filter('favoriteFilter',function(){
            return function(dishes,favorites){
                var out=[];
                for(var i=0; i<favorites.length;i++){
                    for(var j=0; j<dishes.length ;j++){
                        if(dishes[j].id === favorites[i].id){
                            out.push(dishes[j]);
                        }
                    }
                }
                return out;
            }
        })

        .controller('ContactController', ['$scope', function($scope) {

            $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
            
            var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];
            
            $scope.channels = channels;
            $scope.invalidChannelSelection = false;
                        
        }])

        .controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope,feedbackFactory) {
            
            $scope.sendFeedback = function() {
                
                console.log($scope.feedback);
                
                if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
                    $scope.invalidChannelSelection = true;
                    console.log('incorrect');
                }
                else {
                    $scope.invalidChannelSelection = false;
                    feedbackFactory.save($scope.feedback);
                    $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
                    $scope.feedback.mychannel="";
                    $scope.feedbackForm.$setPristine();
                    console.log($scope.feedback);
                }
            };
        }])

        .controller('DishDetailController', ['$scope', '$stateParams','menuFactory','$ionicModal','favorityFactory','baseURL','$ionicPopover', function($scope, $stateParams,menuFactory, $ionicModal,favorityFactory,baseURL,$ionicPopover) {
            $scope.baseURL=baseURL; 
            $scope.dish = {};
            $scope.comment={};
            $scope.showDish = false;
            $scope.message="Loading ...";
            $scope.addFavorite= function(index){
               console.log('favorite iteme'+ index);
               favorityFactory.addFavorite(index);
            };
           $ionicModal.fromTemplateUrl('templates/commentDish.html', {
                scope: $scope
            }).then(function(modal) {
                $scope.modal = modal;
            });
            $scope.closeCommentDish = function() {
                $scope.modal.hide();
            };
            $scope.CommentDish = function() {
                $scope.modal.show();
            };
            $scope.doComment = function() {
                console.log('comment', $scope.comment);
                $scope.comment.date = new Date().toISOString();
                console.log($scope.comment);
                $scope.dish.comments.push($scope.comment);
                menuFactory.getDishes().update({id:$scope.dish.id},$scope.dish);
//                $scope.commentForm.$setPristine();
                $scope.comment = {rating:"",comment:"", author:"", date:""};
                $scope.closeCommentDish();
                $scope.closePophover();
            };      

            $scope.dish = menuFactory.getDishes().get({id:parseInt($stateParams.id,10)})
            .$promise.then(
                            function(response){
                                $scope.dish = response;
                                $scope.showDish = true;
                                console.log($scope.dish.id);
                                var template = '<ion-popover-view><ion-content><ion-list><ion-item ng-click="CommentDish()">add Comment</ion-item><ion-item ng-click="addFavorite(dish.id)">add dish</ion-item></ion-list></ion-content></ion-popover-view>';
                                $scope.popover = $ionicPopover.fromTemplate(template, {
                                    scope: $scope
                                });
                                $scope.displayPopover=function($event){
                                    $scope.popover.show($event);
                                };
                                $scope.closePophover=$scope.closePopover = function() {
                                    $scope.popover.hide();
                                };
                                  //Cleanup the popover when we're done with it!
                                $scope.$on('$destroy', function() {
                                    $scope.popover.remove();
                                });
                                  // Execute action on hidden popover
                                 $scope.$on('popover.hidden', function() {
                                    // Execute action
                                 });
                                  // Execute action on remove popover
                                $scope.$on('popover.removed', function() {
                                    // Execute action
                                 });

                            },
                            function(response) {
                                $scope.message = "Error: "+response.status + " " + response.statusText;
                            }
            );
            
            
            
        }])

        .controller('DishCommentController', ['$scope', 'menuFactory', function($scope,menuFactory) {
            
            $scope.mycomment = {rating:5, comment:"", author:"", date:""};
            
            $scope.submitComment = function () {
                
                $scope.mycomment.date = new Date().toISOString();
                console.log($scope.mycomment);
                
                $scope.dish.comments.push($scope.mycomment);
                 menuFactory.getDishes().update({id:$scope.dish.id},$scope.dish);
                
                $scope.commentForm.$setPristine();
                
                $scope.mycomment = {rating:5, comment:"", author:"", date:""};
            }
        }])

        // implement the IndexController and About Controller here

         .controller('IndexController', ['$scope', 'menuFactory', 'corporateFactory', 'baseURL', function($scope, menuFactory, corporateFactory, baseURL) {

                        $scope.baseURL = baseURL;
                        $scope.leader = corporateFactory.get({id:3});
                        $scope.showDish = false;
                        $scope.message="Loading ...";
                        $scope.dish = menuFactory.getDishes().get({id:0})
                        .$promise.then(
                            function(response){
                                $scope.dish = response;
                                $scope.showDish = true;
                            },
                            function(response) {
                                $scope.message = "Error: "+response.status + " " + response.statusText;
                            }
                        );
                        $scope.promotion = menuFactory.getPromotion().get({id:0});
         }])

        .controller('AboutController', ['$scope', 'corporateFactory','baseURL', function($scope,corporateFactory,baseURL) {
                    $scope.baseURL=baseURL;
                    $scope.leaders ={};
                    $scope.showLeaders = false;
                    $scope.message = "Loading ...";
                    corporateFactory.query(function(response) {
                        $scope.leaders  = response;
                        $scope.showLeaders = true;
                        console.log($scope.leaders);
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
                    console.log($scope.leaders);
            
                    }])
          


;