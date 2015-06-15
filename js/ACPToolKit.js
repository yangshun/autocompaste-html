var ACPToolKit = (function () {
    // Depends on DataStorage. Must be loaded after it.
    var module = {};
    

    module.setCurrentParticipantId = function (pid) {
        DataStorage.setItem('pid', pid);
    }

    module.getCurrentParticipantId = function (pid) {
        var pid = DataStorage.getItem('pid');
        if (!pid) {
            alert('Current participant not set!');
            pid = prompt('Enter current participant ID:').toString();
            this.setCurrentParticipantId(pid);
        }
        console.log(pid)
        return pid;
    }

    module.clearAllData = function () {
        ['pid', 'pretest', 'trials', 'posttest'].forEach(function (key) {
            DataStorage.removeItem(key);
        });        
    }


    $(function () {
        // Populate interface with current participant's ID
        var $pidEl = $('.js-pid');
        if ($pidEl.length > 0) {
           $pidEl.text(module.getCurrentParticipantId());
        }
    });

    return module;
})();
