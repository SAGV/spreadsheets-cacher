"use strict"

let requestify      = require('requestify')
let helpers         = require('./support/helpers')
let downloadService = require('../components/download.service.js')
let config          = require('../config.js')

describe('downloadSpreadsheet', function() {
  beforeEach(function() {
    this.fakeUrl = '/fake/url'
    this.fakeLocations = ['location1', 'location2']
    this.fakeLocationsAnswer = {
      getBody: jasmine.createSpy('getBody').andReturn(this.fakeLocations)
    }

    spyOn(requestify, 'get').andReturn(helpers.fakePromise(true, this.fakeLocationsAnswer))
  })

  it('should download spreadsheet successfully', function(done) {
    downloadService.downloadSpreadsheet(this.fakeUrl)
    .then(result => {
      expect(result).toBe(this.fakeLocations)
      expect(requestify.get).toHaveBeenCalledWith(config.spreadsheetsEndpoint + this.fakeUrl + downloadService.urlEnding)
      done()
    })
  })
})
