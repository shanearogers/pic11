// SERVICES
picalApp.service('settingsService', function() {
   
    this.maxSyncAttempts = "11";
    this.nextEvent = 1442370000;
    this.timeTillNextEvent = function () {
        return this.nextEvent - parseInt(new Date().getTime() / 1000);
    }
    
});