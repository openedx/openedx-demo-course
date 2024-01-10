var HXVideoChime = function(hxChimeOptions) {
  // Declaring semi-global variables for later use.
  // HXChimeTimer is defined in HTML on the page.
  var video = $('.video');
  var chimebox = $('.hx-video-chimebox');

  logThatThing('Video chimes starting');

  // Let people turn the chimes on and off.
  let chimetoggle = $('<button class="chimetoggle"></button>');

  chimebox.append(chimetoggle);
  chimetoggle.wrap('<p>');
  if (localStorage.hxChimesOff === 'true') {
    chimetoggle.text('Turn video chimes off');
  } else {
    chimetoggle.text('Turn video chimes on');
  }
  chimetoggle.on('click tap', function() {
    localStorage.hxChimesOff = localStorage.hxChimesOff !== 'true';
    chimetoggle.text(
      localStorage.hxChimesOff === 'true'
        ? 'Turn video chimes off'
        : 'Turn video chimes on'
    );
  });

  // Mark each video and set of controls with a class and anchor
  // that will let us handle each of them separately.
  // Numbering from 1 to make things easier for course creators.
  video.each(function(index) {
    $(this).addClass('for-video-' + (index + 1));
  });
  video.each(function(index) {
    $(this)
      .parent()
      .prepend('<a name="video' + (index + 1) + '"></a>');
  });

  video.each(function(vidnumber) {
    var thisVid = $(this);
    var chimeData = setUpLists(vidnumber);
    // Check to see whether the video is ready before continuing.
    var waitForVid = setInterval(function() {
      try {
        var state = thisVid.data('video-player-state'); // Sometimes this fails and that's ok.

        if (typeof state.videoPlayer !== 'undefined') {
          if (
            typeof state.videoPlayer.player.getPlayerState() !== 'undefined'
          ) {
            console.log('video data loaded');
            mainLoop(state, chimeData, vidnumber);
            clearInterval(waitForVid);
          }
        }
      } catch (err) {
        console.log('waiting for video ' + (vidnumber + 1) + ' to be ready');
      }
    }, 250);
  });

  // Make a list of all the times where there would be chimes.
  function setUpLists(vidnumber) {
    console.log('setting up lists of chimes');

    let sortedTimer = HXChimeTimer[vidnumber].slice().sort(timeCompare);
    let chimeData = {
      text: sortedTimer.map(e => e.title),
      timer: sortedTimer.map(e => hmsToTime(e.time)),
      sounds: sortedTimer.map(e => e.sound),
      played: []
    };

    // Write a list on-screen.
    chimeData.text.forEach(function(e, i) {
      let ch = $('<span>');
      ch.text(timeToHMS(chimeData.timer[i]) + ' - ' + chimeData.text[i]);
      $(chimebox[vidnumber]).append(ch);
      $(chimebox[vidnumber]).append($('<br>'));
    });

    return chimeData;
  }

  // Every 250 ms, check to see whether we're going to play a chime.
  function mainLoop(state, chimeData, vidnumber) {
    console.log('start main loop for chimes');
    let time = 0;
    let lastTime = 0;
    let twoAgo = 0;
    let chimeTime = 0;
    let okToPlay = true;

    console.log(state);

    var timeChecker = setInterval(function() {
      try {
        state.videoPlayer.update(); // Forced update of time. Required for Safari.
      } catch (err) {
        // If this fails, shut down this loop.
        // It's probably because we moved to a new tab.
        clearInterval(timeChecker);
      }

      twoAgo = lastTime;
      lastTime = time;
      time = state.videoPlayer.currentTime;
      chimeTime = chimeData.timer[nextChime(chimeData, lastTime)];

      // Don't chime on initial play event.
      // Note: The time when the "play" event actually fires is late.
      // Checking the time is more reliable.
      if (twoAgo === lastTime) {
        okToPlay = false;
      } else {
        okToPlay = true;
      }

      // console.log(lastTime, chimeTime, time);
      // If the chime time is the median value, play a chime.
      if (
        lastTime <= chimeTime &&
        time >= chimeTime &&
        okToPlay &&
        localStorage.hxChimesOff !== 'false'
      ) {
        playChime(chimeData, lastTime, vidnumber);
      }
    }, 250);
  }

  // Play the current chime.
  function playChime(chimeData, time, vidnumber) {
    let n = nextChime(chimeData, time);
    let assetURL = getAssetURL(window.location.href, 'complete');
    let audio = new Audio(assetURL + chimeData.sounds[n]);
    audio.play();
    console.log(
      'Playing chime ' +
        (n + 1) +
        ', ' +
        chimeData.sounds[n] +
        ', for video ' +
        (vidnumber + 1)
    );
  }

  function nextChime(chimeData, time) {
    let next = 0;
    for (let n = 0; n < chimeData.timer.length; n++) {
      if (chimeData.timer[n] < time) {
        next++;
      }
    }
    return next;
  }

  // This is a sorting function for my timer.
  function timeCompare(a, b) {
    if (hmsToTime(a.time) < hmsToTime(b.time)) return -1;
    if (hmsToTime(a.time) > hmsToTime(b.time)) return 1;
    return 0;
  }

  return true;
};
