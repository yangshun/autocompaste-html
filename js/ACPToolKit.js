var ACPToolKit = (function () {
    // ACPToolKit depends on DataStorage. Must be loaded after DataStorage.js.
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

    module.generateFormInCSV = function (formResponses, type) {
        var headers = [];
        var data = [];
        var pid = ACPToolKit.getCurrentParticipantId();
        formResponses.unshift({ name: 'pid', value: pid });
        formResponses.forEach(function (item) {
            headers.push(item.name);
            data.push(item.value);
        });
        arrayToCSV([headers, data], 'acp-' + pid + '-' + type);
    }

    function arrayToCSV (twoDiArray, fileName) {
        //  http://stackoverflow.com/questions/17836273/export-javascript-data
        //  -to-csv-file-without-server-interaction
        var csvRows = [];
        for (var i = 0; i < twoDiArray.length; ++i) {
            for (var j = 0; j < twoDiArray[i].length; ++j) {
                twoDiArray[i][j] = '\"' + twoDiArray[i][j] + '\"';
            }
            csvRows.push(twoDiArray[i].join(','));
        }

        var csvString = csvRows.join('\r\n');
        var $a = $('<a></a>', {
                href: 'data:attachment/csv;charset=utf-8,' + escape(csvString),
                target: '_blank',
                download: fileName + '.csv'
            });

        $('body').append($a[0]);
        $a.get(0).click();
        $a.remove();  
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
