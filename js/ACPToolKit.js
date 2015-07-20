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

    var wm = new WindowManager('autocompaste-display');

    module.showWindows = function (options) {

        var data_file = options.data_file;
        var stimuli = options.stimuli;
        
        wm.destroyAllWindows();
        var engine = new AutoComPaste.Engine();
        var iface = new AutoComPaste.Interface(wm, engine, data_file);
        var start = new Date().getTime();

        // Highlight the relevant text.
        iface.addEventListener('loaded', function () {
            var lines_to_highlight = stimuli.split("\n\n");
        
            var windows = wm.getWindowList();
            for (var i = 0; i < windows.length; i++) {
                if (windows[i] == 'text_editor') {
                    continue;
                }

                var win = wm.getWindowContent(windows[i]);
                var content = $(win).find('pre').html();
                lines_to_highlight.map (function (value, index, array) {
                    content = content.replace (value,
                    "<span class=\"highlighted\">" + value + "</span>");
                });

              $(win).find('pre')
                .empty()
                .append(content);
            }
        });

        // Measure the time and submit input strings.
        $('#experiment-form').submit(function (submit_event) {
            var end = new Date().getTime() - start;
            $('#experiment-raw').val($('#autocompaste-display .autocompaste-textarea').val());
            $('#experiment-time').val(end);
        });

        // Window switching capability through shortcuts.
        // Users can cycle through windows using Alt+Q (closest to Alt+Tab).
        var switcher_list = [ ];
        var switcher_list_item = -1;
        var switcher_list_pause_update = false;

        wm.addEventListener('windowcreated', function (created_event) {
            switcher_list.push(created_event.name);
        });

        wm.addEventListener('windowfocus', function (focus_event) {
            if (switcher_list_pause_update) {
                return;
            }

            // Search list for focused window.
            switcher_list = switcher_list.filter(function (value, index, array) {
                return focus_event.name != value;
            });

            switcher_list.push(focus_event.name);
        });

        $(window).keydown(function (keydown_event) {
            if (keydown_event.altKey && keydown_event.keyCode == 81) {
                switcher_list_pause_update = true;

                switcher_list_item--;
                if (switcher_list_item < -1) {
                    switcher_list_item = switcher_list.length - 2;
                }
          
                if (switcher_list_item == -1) {
                    switcher_list_item = switcher_list.length - 1;
                }

                wm.setFocus(switcher_list[switcher_list_item]);
            }
        });
      
        $(window).keyup(function (keyup_event) {
            if (keyup_event.keyCode == 18) {
                switcher_list_pause_update = false;
                wm.setFocus (switcher_list[switcher_list_item]);
                switcher_list_item = -1;
            }
        });
    }

    return module;
})();
