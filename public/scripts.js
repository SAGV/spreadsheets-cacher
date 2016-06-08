angular.module('SpreadsheetsAdmin', [])

.controller('SpreadsheetsAdminController', function($scope, $http, $q, $window, $timeout) {
  var password = null
  var buttonMessages = {
    default: "Wipe the cache",
    success: function(num) { return "Removed " + num + " record" + (num === 1 ? "" : "s") },
    wait: "Removing…"
  }

  $scope.loggedInSuccessfully = false
  $scope.loading = false
  $scope.errorMessage = null
  $scope.passwordForm = { typedPassword: "" }
  $scope.wipeButtonMessage = buttonMessages.default
  $scope.wipeButtonSuccess = false

  var initialize = function() {
    checkIfLogged()
  }
 
  var checkIfLogged = function() {
     password = $window.localStorage.getItem('password') || null

     if (password) {
      $scope.loggedInSuccessfully = true
      $http.defaults.headers.common.Authorization = password
     }
  }

  $scope.validatePassword = function() {
    $scope.loading = true
    $scope.errorMessage = null
    var typedPassword = $scope.passwordForm.typedPassword
    $http.defaults.headers.common.Authorization = typedPassword

    $http.get('/api/validatePassword', {})
    .then(function(result) {
      $scope.loggedInSuccessfully = true
      password = typedPassword
      $window.localStorage.setItem('password', typedPassword);
    }, function(error) {
      $scope.errorMessage = "Invalid password :-/"
    })
    .finally(function() {
      $scope.loading = false
    })
  }

  $scope.removePassword = function() {
    $window.localStorage.removeItem('password')
    $window.location.reload()
  }

  $scope.wipeAllTheCache = function() {
    $scope.loading = true
    $scope.errorMessage = null
    $scope.wipeButtonMessage = buttonMessages.loading

    $http.post('/api/wipe')
      .then(function(result) {
        console.log(result)
        $scope.wipeButtonMessage = buttonMessages.success(result.data.numRemoved)
        $scope.wipeButtonSuccess = true
        $timeout(function() {
          $scope.wipeButtonMessage = buttonMessages.default
          $scope.wipeButtonSuccess = false
        }, 3000)
      }, function(result) {
        $scope.errorMessage = result.data.errorDescription
        $scope.wipeButtonMessage = buttonMessages.default
      })
      .finally(function() {
        loading = false
      })
  }

  initialize()
})
