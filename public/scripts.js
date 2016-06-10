angular.module('SpreadsheetsAdmin', [])

.controller('SpreadsheetsAdminController', function($scope, $http, $q, $window, $timeout) {
  var password = null
  var buttonMessages = {
    default: "Remove all the spreadsheets",
    success: function(num) { return "Removed " + num + " record" + (num === 1 ? "" : "s") },
    wait: "Removing…"
  }

  $scope.loggedInSuccessfully = false
  $scope.loading = false
  $scope.errorMessage = null
  $scope.passwordForm = { typedPassword: "" }
  $scope.wipeButtonMessage = buttonMessages.default
  $scope.wipeButtonSuccess = false
  $scope.spreadsheets = null

  var initialize = function() {
    checkIfLogged()
    getAllSpreadsheets()
  }
 
  /*
    Auth
  */

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

  /*
    Getting info
  */

  var getAllSpreadsheets = function() {
    $http.get('/api/getInfo/all')
    .then(function(result) {
       $scope.spreadsheets = result.data.spreadsheets
    }, function(error) {
      $scope.errorMessage = "Something went wrong… Please, reload the page!"
    })
    .finally(function() {
      $scope.loading = false
    })
  }


  /*
    Removing
  */

  $scope.wipeSelectedSpreadsheet = function(spreadsheet) {
    $scope.loading = true
    $scope.errorMessage = null

    $http.post('/api/remove/selected', { uri: spreadsheet.uri })
      .then(function(result) {
      }, function(result) {
        $scope.errorMessage = result.data.errorDescription
      })
      .finally(function() {
        getAllSpreadsheets()
        loading = false
      })
  }

  $scope.wipeAllTheCache = function() {
    $scope.loading = true
    $scope.errorMessage = null
    $scope.wipeButtonMessage = buttonMessages.loading

    $http.post('/api/remove/all')
    .then(function(result) {
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
      getAllSpreadsheets()
      loading = false
    })
  }

  initialize()
})

.filter('fromNow', function() {
  return function(date) {
    return moment(date).fromNow()
  }
})
