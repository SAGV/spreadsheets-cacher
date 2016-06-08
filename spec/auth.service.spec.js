"use strict"

let helpers         = require('./support/helpers')
let config          = require('../config')
let AuthService     = require('../components/auth.service')

describe('AuthService', function() {
  beforeEach(function() {
    this.correctPassword = "password"
    this.incorrectPassword = "drowssap"

    config.password = "password"

    this.req = {
      path: '/api',
      headers: {
        authorization: this.correctPassword
      }
    }

    this.res = {
      status: jasmine.createSpy('status'),
      send: jasmine.createSpy('send')
    }

    this.next = jasmine.createSpy('next')
  })

  describe('authorizationCheck', function() {
    it('should skip the check if authorization is not needed', function() {
      this.req.path = "/hello"

      AuthService.authorizationCheck(this.req, this.res, this.next)

      expect(this.next).toHaveBeenCalled()
    })

    it('should always pass if no password is set in the config', function() {
      config.password = false
      this.req.headers.authorization = undefined

      AuthService.authorizationCheck(this.req, this.res, this.next)

      expect(this.next).toHaveBeenCalled()
    })

    it('should pass if the password is valid', function() {
       AuthService.authorizationCheck(this.req, this.res, this.next)

       expect(this.next).toHaveBeenCalled()
    })

    it('should return 403 if the password is invalid', function() {
      this.req.headers.authorization = this.incorrectPassword

      AuthService.authorizationCheck(this.req, this.res, this.next)

      expect(this.res.status).toHaveBeenCalledWith(403)
      expect(this.res.send).toHaveBeenCalled()
      expect(this.next).not.toHaveBeenCalled()
    })

    it('should return 401 if no authorization header', function() {
      this.req.headers.authorization = undefined

      AuthService.authorizationCheck(this.req, this.res, this.next)

      expect(this.res.status).toHaveBeenCalledWith(401)
      expect(this.res.send).toHaveBeenCalled()
      expect(this.next).not.toHaveBeenCalled()
    })

  })
})
