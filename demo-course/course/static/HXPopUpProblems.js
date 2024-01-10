// This version is designed to be called by hx.js
// Global variable HXPUPTimer is defined in the HTML.
// The hmsToTime converter function is defined in hx.js

var HXPopUpProblems = function(HXpopUpOptions, HXPUPTimer) {
  // Declaring semi-global variables for later use.
  var video = $('.video');
  var state;
  var time;
  var problemCounter;
  var skipEmAll;
  var protectedTime = false;
  var problemsBeingShown = 0;

  // Convert mm:ss format in HXPUPTimer to seconds.
  for (var i = 0; i < HXPUPTimer.length; i++) {
    for (var key in HXPUPTimer[i]) {
      if (key == 'time') {
        HXPUPTimer[i].time = hmsToTime(HXPUPTimer[i].time);
      }
    }
  }

  // Sort the pop-up timer.
  HXPUPTimer.sort(timeCompare); // Uses a custom function to sort by time.
  // Ditch any questions that are missing from the screen.
  HXPUPTimer = stripMissingQuestions(HXPUPTimer);

  // Log play/pause events from the player.
  // Also set the play/pause external control properly.
  video.on('pause', function() {
    logThatThing({ video_event: 'pause' });
    $('#hx-playpauseicon').html('&#8227;');
    $('#hx-playpauseword').html('Play');
  });

  video.on('play', function() {
    logThatThing({ video_event: 'play' });
    // Also set the play/pause external control properly.
    $('#hx-playpauseicon').html('||'); // Need a better-looking pause icon.
    $('#hx-playpauseword').html('Pause');
  });

  // Check to see whether the video is ready before continuing.
  var waitForVid = setInterval(function() {
    try {
      state = video.data('video-player-state'); // Sometimes this fails and that's ok.

      if (typeof state.videoPlayer.player.getPlayerState() !== 'undefined') {
        clearInterval(waitForVid);
        setUpData();
        setUpControls();
        mainLoop();
      }
    } catch (err) {
      console.log('waiting for first video to be ready');
    }
  }, 200);

  // Take out any problems that don't appear on the page.
  function stripMissingQuestions(timer) {
    // Get an array with all the text of all the H3's (trimming whitespace)
    let allH3 = $('h3')
      .map((x, e) =>
        $(e)
          .text()
          .trim()
      )
      .toArray();

    // Remove any items from the timer that aren't in the list of H3's
    let newTimer = timer.filter(x => allH3.includes(x.title));

    // Return the new timer.
    return newTimer;
  }

  // Checks local storage and gets data from the video.
  function setUpData() {
    // Get the video data.
    video = $('.video');
    state = video.data('video-player-state');
    time = state.videoPlayer.currentTime;

    // Storing a separate problem counter for each video.
    // Create the counter if it doesn't exist.
    if (!localStorage[state.id + '-counter']) {
      localStorage[state.id + '-counter'] = '0';
      localStorage[state.id + '-skip'] = 'false';

      // If the counter didn't exist, we're on a new browser.
      // Clear the questions from before the current time.
      clearOlderPopUps(time);
    }

    // Which problem are we on?   Using + to cast as integer.
    problemCounter = +localStorage[state.id + '-counter'];

    // Are we currently skipping problems?
    skipEmAll = localStorage[state.id + '-skip'] === 'true';
    // If so, let's update the button.
    if (skipEmAll) {
      $('#hx-sunmoon').html('&#9790;');
      $('#hx-onoff').html('Problems are Off');
      logThatThing({
        reload_event: 'turn_problems_off',
        time: time
      });
    }

    // Let's avoid situations where we're faced with a question
    // mere seconds after the page loads, shall we?
    // Unless we're past the last problem...
    if (time < HXPUPTimer[HXPUPTimer.length - 1].time) {
      if (problemCounter > 0) {
        // Go to just after the previous question...
        ISaidGoTo(HXPUPTimer[problemCounter - 1].time + 1);
      } else {
        // Or all the way back to the beginning.
        ISaidGoTo(0);
      }
    }
  }

  // Makes the buttons work and sets up event handlers.
  function setUpControls() {
    // If they seek to a specific position, set the problem counter appropriately
    // so that earlier problems don't gang up on them.
    video.on('seek', function(event, ui) {
      clearOlderPopUps(ui);
    });

    // Let someone go through the problems again if they want.
    // Also useful for debugging.
    $('#hx-popUpReset').on('click tap', function() {
      updateProblemCounter(0);
      ISaidGoTo(0);
      logThatThing({ control_event: 'reset counter and set t=0' });

      // If problems are currently on, turn them off for two seconds after we go back.
      // This addresses a bug that appears in Mobile Safari.
      // Note that you can't put questions in the first two seconds of the video
      // because of this.
      if (!skipEmAll) {
        skipEmAll = true;
        var dontSpamProblemsEarly = setTimeout(function() {
          skipEmAll = false;
        }, 2000);
      }
    });

    // Go back to one second after the previous problem.
    $('#hx-backOneProblem').on('click tap', function() {
      if (problemCounter > 1) {
        var newTime = HXPUPTimer[problemCounter - 2].time + 1;
        ISaidGoTo(newTime);
        logThatThing({ control_event: 'go back one' });
      } else {
        updateProblemCounter(0);
        ISaidGoTo(0);
        logThatThing({ control_event: 'go back one to start' });
      }
    });

    // Play or pause the video
    $('#hx-popUpPlayPause').on('click tap', function() {
      if (state.videoPlayer.isPlaying()) {
        state.videoPlayer.pause();
        $('#hx-playpauseicon').html('&#8227;');
        $('#hx-playpauseword').html('Play');
        logThatThing({ control_event: 'play' });
      } else {
        state.videoPlayer.play();
        $('#hx-playpauseicon').html('||');
        $('#hx-playpauseword').html('Pause');
        logThatThing({ control_event: 'pause' });
      }
    });

    // Let someone turn the pop-up questions on and off.
    // Give visual indication by changing the button.
    $('#hx-problemToggle').on('click tap', function() {
      if (skipEmAll) {
        skipEmAll = false;
        localStorage[state.id + '-skip'] = 'false';
        $('#hx-sunmoon').html('&#9788;');
        $('#hx-onoff').html('Problems are On');
        logThatThing({
          control_event: 'turn_problems_on',
          time: time
        });
      } else {
        skipEmAll = true;
        localStorage[state.id + '-skip'] = 'true';
        $('#hx-sunmoon').html('&#9790;');
        $('#hx-onoff').html('Problems are Off');
        logThatThing({
          control_event: 'turn_problems_off',
          time: time
        });
      }
    });
  }

  // Every 500 ms, check to see whether we're going to add a new problem.
  function mainLoop() {
    var timeChecker = setInterval(function() {
      try {
        state.videoPlayer.update(); // Forced update of time. Required for Safari.
      } catch (err) {
        // If the update fails, shut down this loop.
        // It's probably because we moved to a new tab.
        clearInterval(timeChecker);
      }
      time = state.videoPlayer.currentTime;

      if (problemCounter < HXPUPTimer.length) {
        if (time > HXPUPTimer[problemCounter].time) {
          if (!skipEmAll && !protectedTime) {
            popUpProblem(HXPUPTimer[problemCounter].title, state);
          }
          // We're still incrementing and tracking even if we skip problems.
          updateProblemCounter(problemCounter + 1);
        }
      }
    }, 500);
  }

  // Set all the time-related stuff to a particular time and then seek there.
  // Does the work of creating the dialogue.
  // It pulls a question from lower down in the page, and puts it back when we're done.
  function popUpProblem(title, state) {
    // Strip leading and trailing whitespace, 'cause it's the most common typo.
    title = title.trim();

    // Find the div for the problem based on its title.
    var problemDiv = $('h3:contains(' + title + ')').closest('.vert');

    var problemID = $('h3:contains(' + title + ')')
      .parent()
      .attr('id');

    var tempDiv;
    var dialogDiv = problemDiv;
    var includenext = false;

    // Sometimes we can't find an h3 to latch onto.
    // We put <span style="display:none" class="hx-includer">includenext</span> into an HTML bit before it.
    // The dialog then displays the next item, and appends a clone of the HTML before it.
    if (problemDiv.find('span.hx-includer').text() == 'includenext') {
      dialogDiv = problemDiv.next();
      includenext = true;
    }

    logThatThing({
      display_problem: title,
      problem_id: problemID,
      time: time
    });

    // Pause the video.
    state.videoPlayer.pause();

    // Make a modal dialog out of the chosen problem.
    dialogDiv.dialog({
      modal: true,
      dialogClass: 'hx-popup no-close',
      resizable: true,
      width: HXpopUpOptions.width,
      show: {
        effect: HXpopUpOptions.effect,
        duration: HXpopUpOptions.effectlength
      },
      position: {
        my: HXpopUpOptions.myPosition,
        at: HXpopUpOptions.atPosition,
        of: HXpopUpOptions.ofTarget
      },
      buttons: {
        Skip: function() {
          if (includenext) {
            tempDiv.remove();
          } // We added it, we should erase it.
          dialogDestroyed('skip_problem');
          $(this).dialog('destroy'); // Put the problem back when we're done.
        },
        Done: function() {
          if (includenext) {
            tempDiv.remove();
          } // We added it, we should erase it.
          dialogDestroyed('mark_done');
          $(this).dialog('destroy'); // Put the problem back when we're done.
        }
      },
      open: function() {
        // If we're including two divs, append a clone of the first one above.
        if (includenext) {
          tempDiv = problemDiv.clone();
          dialogDiv.prepend(tempDiv);
        }
        // Highlight various controls.
        $('span.ui-button-text:contains("Done")').addClass('answeredButton');
        $('input.check.Check').attr(
          'style',
          '    background: linear-gradient(to top, #9df 0%,#7bd 20%,#adf 100%); background-color:#ACF;    text-shadow: none;'
        );
        problemsBeingShown++;
      },
      close: function() {
        state.videoPlayer.play();
        if (includenext) {
          tempDiv.remove();
        } // We added it, we should erase it.
        logThatThing({ unusual_event: 'dialog closed unmarked' }); // Should be pretty rare. I took out the 'close' button.
      }
    });
  }

  // Log the destruction of the dialog and play the video if there are no more dialogs up.
  function dialogDestroyed(message) {
    logThatThing({ control_event: message });
    $('input.check.Check').removeAttr('style'); // un-blue the check button.
    problemsBeingShown--;
    if (problemsBeingShown < 1) {
      state.videoPlayer.play();
    }
  }

  // This resets the problem counter to match the time.
  function clearOlderPopUps(soughtTime) {
    logThatThing({ control_event: 'seek to ' + soughtTime });
    updateProblemCounter(0); // Resetting fresh.
    for (var i = 0; i < HXPUPTimer.length; i++) {
      if (soughtTime > HXPUPTimer[i].time) {
        updateProblemCounter(i + 1);
      } else {
        break;
      }
    }
  }

  // I blame multiple Javascript timing issues.
  function ISaidGoTo(thisTime) {
    time = thisTime;
    state.videoPlayer.player.seekTo(thisTime);
    logThatThing({ seek_to: thisTime });
  }

  // Keep the counter and the local storage in sync.
  function updateProblemCounter(number) {
    problemCounter = number;
    localStorage[state.id + '-counter'] = number.toString();
    logThatThing({ problem_counter_set: problemCounter });
  }

  // This is a sorting function for my timer.
  function timeCompare(a, b) {
    if (a.time < b.time) return -1;
    if (a.time > b.time) return 1;
    return 0;
  }

  return true;
};
