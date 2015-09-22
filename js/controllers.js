// CONTROLLERS
picalApp.controller('homeController', ['$scope', 'settingsService', function($scope, settingsService) {
    console.log('Starting homeController');
    //
    if (settingsService.maxSyncAttempts == "0" ) {
        settingsService.maxSyncAttempts = "17";
    }
    console.log(settingsService.maxSyncAttempts);
}]);

picalApp.controller('splashController', ['$scope', 'settingsService', function($scope, settingsService) {
    //
}]);

picalApp.controller('syncController', ['$scope', 'settingsService' , '$http', function($scope, settingsService, $http) {
    console.log('Starting syncController');
    $scope.syncAttempts = 0;
    $scope.minTripTime = 999999;
    getSyncData('http://www.sharoger.com/time.pl');
    
    function getSyncData(url) {
        var beforeTrip = new Date().getTime();
        $http
            .get(url)
            .success(function(response) {
                $scope.syncAttempts++;
                var afterTrip = new Date().getTime();
                var tripTime = afterTrip - beforeTrip;
                // only continue doing calcs if this trip time is quicker than all previous attempts
                if (tripTime < parseInt($scope.minTripTime)) {
                    $scope.minTripTime = tripTime;
                    var midTrip = beforeTrip + Math.floor((tripTime / 2));
                    var serverTime = Math.floor(response * 1000);
                    $scope.localTimeBeforeTrip = beforeTrip;
                    $scope.localTimeAfterTrip = afterTrip;
                    $scope.tripTime = tripTime;
                    $scope.midTrip = midTrip;
                    $scope.serverTime = serverTime;
                    $scope.serverOffset = serverTime - midTrip;
                }
                if ($scope.syncAttempts < parseInt(settingsService.maxSyncAttempts) &&
                    tripTime > 250) {
                    getSyncData(url);
                } else {
                    $scope.syncAttempts = parseInt(settingsService.maxSyncAttempts);
                }
            }
        );
    }

}]);

picalApp.controller('loginController', ['$scope', 'settingsService', function($scope, settingsService) {

    $scope.submit = function () {
        if ($scope.newEmail && $scope.newPassword) {
            var ref = new Firebase("https://pical-proto.firebaseio.com");
            ref.createUser({
                email    : $scope.newEmail,
                password : $scope.newPassword
            }, function(error, userData) {
                if (error) {
                    console.log("Error creating user:", error);
                } else {
                    console.log("Successfully created user account with uid:", userData.uid);
                    $scope.newPassword;
                    $scope.login();
                }
            });
        }
    }
    
    $scope.login = function () {
        var ref = new Firebase("https://pical-proto.firebaseio.com");
        ref.authWithPassword({
            email    : $scope.newEmail,
            password : $scope.newPassword
        }, function(error, authData) {
            if (error) {
                console.log("Login Failed!", error);
            } else {
                console.log("Authenticated successfully with payload:", authData);
            }
        });
    }
}]);

picalApp.controller('pastController', ['$scope', 'settingsService', function($scope, settingsService) {
    //
}]);

picalApp.controller('nextController', ['$scope', 'settingsService', function($scope, settingsService) {
    console.log(settingsService.nextEvent); 
    $scope.timeTillNextEvent = settingsService.timeTillNextEvent();
}]);

picalApp.controller('futureController', ['$scope', 'settingsService', function($scope, settingsService) {
    //
}]);

picalApp.controller('settingsController', ['$scope', 'settingsService' , function($scope, settingsService) {
    console.log('Starting settingsController...');
    console.log(parseInt(settingsService.maxSyncAttempts || 444));
    
    $scope.maxSyncAttempts = settingsService.maxSyncAttempts;
    $scope.$watch('maxSyncAttempts', function() {
        settingsService.maxSyncAttempts = $scope.maxSyncAttempts;
        console.log('...updating...', settingsService.maxSyncAttempts);
    });
    
}]);

picalApp.controller('ExampleController', ['$scope', '$interval', 'settingsService', function($scope, $interval, settingsService) {
    $scope.format = 'M/d/yy h:mm:ss a';
    $scope.blood_1 = 100;
    $scope.blood_2 = 120;

    var stop;
    $scope.fight = function() {
        // Don't start a new fight if we are already fighting
        if ( angular.isDefined(stop) ) return;

        stop = $interval(function() {
            if ($scope.blood_1 > 0 && $scope.blood_2 > 0) {
                $scope.blood_1 = $scope.blood_1 - 3;
                $scope.blood_2 = $scope.blood_2 - 4;
            } else {
                $scope.stopFight();
            }
        }, 100);
    };

    $scope.stopFight = function() {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    };

    $scope.resetFight = function() {
        $scope.blood_1 = 100;
        $scope.blood_2 = 120;
    };

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $scope.stopFight();
    });
}])

// Register the 'myCurrentTime' directive factory method.
// We inject $interval and dateFilter service since the factory method is DI.
.directive('myCurrentTime', ['$interval', 'settingsService', 'dateFilter', function($interval, settingsService, dateFilter) {
    // return the directive link function. (compile function not needed)
    return function(scope, element, attrs) {
        var stopTime; // so that we can cancel the time updates

        // used to update the UI
        function updateTimeRemaining() {
            //element.text(dateFilter(new Date(), format));
            element.text( settingsService.timeTillNextEvent() );
            
        }

        // watch the expression, and update the UI on change.
        scope.$watch(attrs.myCurrentTime, function(value) {
            updateTimeRemaining();
        });

        stopTime = $interval(updateTimeRemaining, 1000);

        // listen on DOM destroy (removal) event, and cancel the next UI update
        // to prevent updating time after the DOM element was removed.
        element.on('$destroy', function() {
            $interval.cancel(stopTime);
        });
    }
}]);

                                           
