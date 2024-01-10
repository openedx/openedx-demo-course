// This is designed to be called by hx.js
// It uses the Summernote editor.

var HXEditor = function(use_backpack, toolbar_options) {
  'use strict';

  const prefix = 'summernote_'; // slot prefix for data storage
  const blank_editor = '<p><br/></p>';
  let had_focus; // Last element that had focus.

  logThatThing('HX Editor starting');

  //***************************
  // Utility functions
  // for handling data.
  //***************************

  // These functions make handling prefixes easier.
  function getData(slot) {
    return hxGetData(prefix + slot);
  }

  function setData(slot, val) {
    if (typeof val === 'undefined') {
      // It's not a save slot, it's an object.
      let new_data = {};
      Object.keys(slot).forEach(function(k) {
        // Prefix all the data before storing it, to avoid collisions.
        new_data[prefix + k] = slot[k];
      });
      return hxSetData(new_data);
    } else {
      return hxSetData(prefix + slot, val);
    }
  }

  function clearData(slot) {
    return hxClearData(prefix + slot);
  }

  function getAllData() {
    let new_data = {};
    let old_data = hxGetAllData();
    Object.keys(old_data).forEach(function(k) {
      // Only return data with our namespace prefix.
      if (k.startsWith(prefix)) {
        // de-prefix all the stored data.
        new_data[k.replace(prefix, '')] = old_data[k];
      }
    });
    return new_data;
  }

  //********************************
  // Utility functions
  // for working with DOM elements.
  //********************************

  // The save slot is the value in data-saveslot attribute, or '' if blank.
  // Pass in the JQuery object for the editor or its child.
  function getSaveSlot(e) {
    if (e.is('[data-saveslot]')) {
      return e.attr('data-saveslot');
    } else {
      let editor = e.parents('[data-saveslot]');
      return editor.attr('data-saveslot');
    }
  }

  function getEditBox(slot) {
    return $('[data-saveslot="' + slot + '"]');
  }

  function getMarkupFrom(slot) {
    return $(getEditBox(slot))
      .find('.summernote')
      .summernote('code');
  }

  function setMarkupIn(slot, markup_string) {
    $(getEditBox(slot))
      .find('.summernote')
      .summernote('code', markup_string);
  }

  // Which entry in our menu is the topmost actual file?
  function getTopFile(menu) {
    let top_file;
    let special_entries = [
      'special-spacer1',
      'special-spacer2',
      'special-hx-new',
      'special-hx-rename'
    ];
    $(menu)
      .find('option')
      .each(function(i, e) {
        // The first time we can't find a filename in the list of special entries...
        if (special_entries.indexOf(e.value) === -1) {
          top_file = e.value;
          return false; // Breaks out of each() loop
        }
      });
    return top_file;
  }

  //********************************
  // Auto-save. Runs every minute.
  // One function for all editors on the page.
  //********************************
  function setupAutoSave() {
    console.log('setting up auto-save');
    // Wipe out the old autosave function.
    if (typeof window.HXautosavers !== 'undefined') {
      clearInterval(window.HXautosavers);
    }

    // Make an autosave function that gets data from all editors.
    window.HXautosavers = setInterval(function() {
      // Get all the save slots that are present on this page.
      let slots = new Set(
        Object.keys($('.hx-editor')).map(x =>
          $($('.hx-editor')[x]).attr('data-saveslot')
        )
      );
      // Remove undefined things from the set.
      slots.delete(undefined);

      // If there are no editors visible on the page, kill this loop.
      if ($('.hx-editor').length < 1) {
        console.log('No editors detected. Turning off auto-save.');
        clearInterval(window.HXautosavers);
      } else {
        let has_changed = false;
        let data_to_save = {};
        let existing_data = getAllData();

        // Get the data from all visible editors.
        slots.forEach(function(slot) {
          let new_data = getMarkupFrom(slot);
          if (typeof new_data === 'string') {
            // Using underscore.js to check object equality.
            if (!_.isEqual(existing_data[slot], new_data)) {
              data_to_save[slot] = new_data;
              has_changed = true;
            }
          }
        });

        // Only save if something changed.
        if (has_changed) {
          setData(data_to_save);
          // Disable save/load buttons until the backpack reloads.
          handleFocus();
          $('.hxed-visiblenotice').text(' Auto-saving...');
          $('.hxed-statusmessage .sr').text('Status: auto-saving...');
          $('.hxeditor-control').prop('disabled', true);
        } else {
          console.log('No change in data, not saving.');
        }
      }
    }, 60000);
  }

  //********************************
  // Activate an editor and load stored info.
  //********************************
  function activateEditor(slot) {
    console.log('activating ' + slot + ' editor');
    // Remove the loading indicator
    $('.hx-loading-indicator').remove();

    // Get the editor we're interested in.
    let ed = getEditBox(slot);
    if (ed.length === 0) {
      ed = $('.hx-editor');
      ed.attr('data-saveslot', '');
    }

    // Store any existing markup as default content.
    let starting_markup = ed
      .find('.hx-editor-default')
      .html()
      .trim();
    if (starting_markup === '') {
      starting_markup = blank_editor;
    }
    ed.empty();

    // Insert the div for summernote to hook onto.
    let summer = $('<div class="summernote"></div>');
    ed.append(summer);
    // Activate summernote.
    summer.summernote({
      toolbar: toolbar_options
    });

    // Save the cursor position every time we unfocus the editor.
    summer.on('summernote.blur', function() {
      console.log('saving range');
      summer.summernote('saveRange');
    });

    // Box for controls
    let control_box = $('<div/>');
    control_box.addClass('hxed-controlbox');
    ed.prepend(control_box);

    // Add save/download/delete and file menu.
    addControls(control_box);

    // Make sure the data includes a slot for the current menu.
    // Default content should not overwrite existing data.
    let data = getAllData();
    let from_slot = ed.attr('data-from-slot');
    if (data.hasOwnProperty(slot)) {
      starting_markup = data[slot];
    } else {
      if (typeof from_slot !== undefined && data[from_slot] !== undefined) {
        starting_markup = data[from_slot];
      } else {
        data[slot] = starting_markup;
      }
    }

    // Add menu and its listeners
    let file_menu = buildMenu(ed, data, getSaveSlot(ed));
    control_box.prepend(file_menu);
    attachMenuListener(file_menu);

    // Replace blank editors with the saved data if the backpack is loaded.
    if (hxBackpackLoaded) {
      if ($(getMarkupFrom(slot)).text() == '') {
        setMarkupIn(slot, starting_markup);
      }
    }

    // Watch editor box. Give warning notice if the text is too long.
    // Pretend limit is 5000 characters per file (not enforced), but the
    // actual limit is 100k total data per user (enforced).
    let notice = $('.hxed-persistentnotice');
    ed.find('.note-editable').on('input', function(e) {
      let num_chars = $(this).text().length;
      if (num_chars > 4900) {
        notice.text(5000 - num_chars + ' characters left');
      } else {
        notice.empty();
      }
    });

    // If we're not using the backpack, show a warning notice.
    if (!use_backpack) {
      let noSaveWarning = $('<div/>');
      noSaveWarning.css({
        'background-color': 'orange',
        border: '2px solid black'
      });
      noSaveWarning.append(
        'Warning: Data storage unavailable. This editor cannot save or load files. Reload the page if you want to try again.'
      );
      $('.hx-editor:visible').prepend(noSaveWarning);
    }
  }

  // Turns on ALL the editors.
  function activateAllEditors() {
    console.log('Activate All Editors');
    $('.hx-editor:visible').each(function(i, e) {
      activateEditor(getSaveSlot($(e)));
    });
  }

  //********************************
  // Build the file menu.
  // Sometimes we need to rebuild this, so it gets its own function.
  //********************************
  function buildMenu(ed, data, starting_file) {
    console.log('Build Menu');
    // If we have no files left, give us a single unnamed file.
    if (Object.keys(data).length === 0) {
      data.Untitled = blank_editor;
      ed.attr('data-saveslot', 'Untitled');
      starting_file = 'Untitled';
    }

    let file_menu = $('<select></select>');

    let spacer1 = $('<option value="special-spacer1"></option>');
    let spacer2 = $('<option value="special-spacer2"></option>');
    let new_file = $('<option value="special-hx-new">New File...</option>');
    let rename_file = $(
      '<option value="special-hx-rename">Rename File...</option>'
    );
    file_menu.addClass('hxed-filemenu hxeditor-control');
    file_menu.append(spacer1);
    file_menu.append(new_file);
    file_menu.append(rename_file);
    file_menu.append(spacer2);

    // Get all the save slots and add to menu.
    Object.keys(data).forEach(function(k) {
      let slot = $('<option value="' + k + '">' + k + '</option>');
      file_menu.append(slot);
    });

    // If we're not passed a starting file, assign it.
    if (starting_file === null) {
      starting_file = getTopFile(file_menu);
    }

    // Move starting file to top.
    file_menu
      .find('option[value="' + starting_file + '"]')
      .detach()
      .prependTo(file_menu);

    file_menu.val(starting_file);

    return file_menu;
  }

  // Pass in the jquery object for the editor box.
  function rebuildMenu(editor, data, starting_file = null) {
    // Clear and rebuild the menu.
    let new_menu = buildMenu(editor, data, starting_file);
    editor.find('.hxed-filemenu').remove();
    editor.find('.hxed-controlbox').prepend(new_menu);
    attachMenuListener(new_menu);
  }

  function attachMenuListener(menu) {
    // Catch the previous menu item in case we need it.
    menu.off('focusin.hxeditor').on('focusin.hxeditor', function() {
      $(this).attr('data-previous-val', $(menu).val());
    });

    menu.off('change.hxeditor').on('change.hxeditor', function(e) {
      let slot = e.target.value;
      console.log(slot);
      let edit_box = getEditBox(getSaveSlot($(menu)));
      let summer = edit_box.find('.summernote');

      // Ignore any blank slots.
      if (slot.startsWith('special-spacer')) {
        // put selector back where it was. Do nothing.
        $(menu).val($(this).attr('data-previous-val'));
      }
      // Two special cases: new files and renaming existing files.
      else if (slot === 'special-hx-new') {
        let new_slot = prompt('Name your file:', 'new_file');
        if (new_slot === null || new_slot === '') {
          console.log('new file cancelled');
        } else {
          // Don't allow names that are identical to existing names.
          let all_slots = Object.keys(getAllData());
          if (all_slots.indexOf(new_slot) !== -1) {
            // Reject duplicate filename.
            $(menu).val($(this).attr('data-previous-val'));
            // Give a notice.
            edit_box
              .find('.hxed-visiblenotice')
              .text('Duplicate filname, cannot create.');
            edit_box
              .find('.hxed-statusmessage .sr')
              .text('Duplicate filname, cannot create.');
            setTimeout(function() {
              edit_box.find('.hxed-visiblenotice').empty();
              edit_box.find('.hxed-statusmessage .sr').text('Status: ok');
            }, 3000);
          } else {
            edit_box.attr('data-saveslot', new_slot);
            setMarkupIn(new_slot, blank_editor);
            // Add the menu item.
            $(menu).prepend(
              '<option value="' + new_slot + '">' + new_slot + '</option>'
            );
            $(menu).val(new_slot);
            attachMenuListener(menu);
            // Save.
            setData(new_slot, blank_editor);
            // Refresh the auto-saves.
            setupAutoSave();
          }
        }
      } else if (slot === 'special-hx-rename') {
        let current_slot = getSaveSlot(summer);
        let rename_slot = prompt('Rename to:', current_slot);
        if (rename_slot === null || rename_slot === '') {
          console.log('rename cancelled');
        } else {
          // Rename the save slot.
          edit_box.attr('data-saveslot', rename_slot);
          // Change the menu item.
          let option = $('option[value="' + current_slot + '"]');
          option.detach().prependTo($(menu));
          option.val(rename_slot);
          option.empty();
          option.text(rename_slot);
          $(menu).val(rename_slot);
          attachMenuListener(menu);
          // Remove the old data.
          clearData(current_slot);
          // Save.
          setData(rename_slot, getMarkupFrom(rename_slot));
        }
      }
      // Otherwise, we're switching to a different save slot.
      else {
        // Replace text.
        let saved_markup = getData(slot);
        if (typeof saved_markup === 'undefined') {
          saved_markup = blank_editor;
        }
        summer.summernote('code', saved_markup);
        // Change the data attribute on the editor.
        edit_box.attr('data-saveslot', slot);
      }
    });
  }

  //********************************
  // Create and activate a link to download the current text.
  // Saves as an HTML fragment.
  //********************************
  function provideDownload(filename, text) {
    let element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/html;charset=utf-8,' + encodeURIComponent(text)
    );
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  //********************************
  // Save, delete, and download buttons.
  //********************************
  function addControls(control_box) {
    let download_button = $(
      '<button><span class="fa fa-download"></span> Download</button>'
    );
    download_button.addClass('hxed-download hxeditor-control');

    let save_button = $(
      '<button><span class="fa fa-floppy-o"></span> Save</button>'
    );
    save_button.addClass('hxed-save hxeditor-control');

    let save_notice = $('<span/>');
    save_notice.addClass('hxed-statusmessage');
    save_notice.attr('tabindex', '0');
    save_notice.append('<span class="sr">Status: ok</span>');
    save_notice.append(
      '<span class="hxed-visiblenotice" aria-hidden="true"></span>'
    );

    let persistent_notice = $('<span/>');
    persistent_notice.addClass('hxed-persistentnotice');
    persistent_notice.attr('aria-live', 'polite');

    let delete_button = $('<button/>');
    delete_button.attr('aria-label', 'Delete');
    delete_button.addClass('fa fa-trash hxed-deletebutton hxeditor-control');
    delete_button.attr('role', 'button');

    control_box.prepend(delete_button);
    control_box.prepend(persistent_notice);
    control_box.prepend(save_notice);
    control_box.prepend(save_button);
    control_box.prepend(download_button);

    // Save and load disabled until the backpack loads.
    // It could be already loaded, so don't disable unnecessicarily.
    if (typeof hxBackpackLoaded === 'undefined') {
      $('.hxeditor-control').prop('disabled', true);
      save_notice.text(' Loading...');
    }

    // Listener for the download button.
    // Gives learner a document with an HTML fragment.
    download_button.on('click tap', function() {
      let slot = getSaveSlot($(this));
      let markup_string = getMarkupFrom(slot);
      provideDownload(slot + '.html', markup_string);
    });

    save_button.on('click tap', function() {
      let slot = getSaveSlot($(this));
      let markup_string = getMarkupFrom(slot);

      handleFocus();

      // Note the editor's saveslot.
      console.log('Saving to ' + slot);
      setData(slot, markup_string);

      // Disable save/load buttons.
      // These will re-enable after the backpack loads.
      $('.hxed-visiblenotice').text(' Saving...');
      $('.hxed-statusmessage .sr').text('Status: Saving...');
      $('.hxeditor-control').prop('disabled', true);
    });

    delete_button.on('click tap', function() {
      let slot = getSaveSlot($(this));
      let edit_box = getEditBox(slot);

      // ARE YOU SURE???
      let wreck_it = confirm('Are you sure you want to delete this file?');
      if (wreck_it) {
        handleFocus();
        // Rebuild the menu without the offending item.
        let temp_data = getAllData();
        // Erase the text.
        edit_box.find('.summernote').summernote('code', blank_editor);

        // Remove the file from our temp version of the data.
        delete temp_data[slot];

        // Remove the data from the backpack.
        // This takes about a second, so don't wait for it.
        clearData(slot);

        // Rebuild the menu from our temp data.
        rebuildMenu(edit_box, temp_data);

        // Reassign the save slot for this editor.
        edit_box.attr('data-saveslot', $('.hxed-filemenu').children()[0].value);
      }
    });
  }

  //********************************
  // The backpack is our data storage system on edX.
  // It posts a message when it loads.
  // See https://github.com/Stanford-Online/js-input-samples/tree/master/learner_backpack
  //********************************
  $(window)
    .off('message.hxeditor')
    .on('message.hxeditor', function(e) {
      var data = e.originalEvent.data;

      // Only accept from edx sites. Won't work in Studio.
      if (e.originalEvent.origin !== location.origin) {
        return;
      }

      // Only accept objects with the right form.
      if (typeof data === 'string') {
        if (data === 'backpack_ready') {
          // When the backpack is ready, re-enable the controls.
          $('.hxeditor-control').prop('disabled', false);
          $('.hxed-visiblenotice').empty('');
          $('.hxed-statusmessage .sr').text('Status: ok');
          $('.summernote').summernote('saveRange');
          // The listener for this trigger is set on $(document)
          $(document).trigger('controlsReady');
          // Replace blank editors with the saved data.
          $('.hx-editor').each(function(i, el) {
            let slot = getSaveSlot($(el));
            let existing_markup = getMarkupFrom(slot);
            if ($(existing_markup).text() == '') {
              let new_markup = getData(slot);
              if (new_markup !== null) {
                setMarkupIn(slot, new_markup);
              } else {
                setMarkupIn(slot, blank_editor);
              }
            }
          });
        }
      }
    });

  // Publishing functions for general use.
  window.HXED = {};
  window.HXED.getEditBox = getEditBox;
  window.HXED.getSaveSlot = getSaveSlot;
  window.HXED.getMarkupFrom = getMarkupFrom;
  window.HXED.activateEditor = activateEditor;
  window.HXED.activateAllEditors = activateAllEditors;

  //********************************
  // START HERE.
  // This loop waits for summernote to load.
  // It's in an external javascript file loaded by hx-js.
  //********************************
  var timer_count = 0;
  var time_delay = 250; // miliseconds
  var loadLoop = setInterval(function() {
    console.log('time loop');
    timer_count += time_delay;

    // If it doesn't load after 7 seconds,
    // kill the indicator and inform the learner.
    if (timer_count > 7000) {
      $('.hx-editor:visible').empty();
      $('.hx-editor:visible').append(
        '<p>Editor did not load. Reload the page if you want to try again.</p>'
      );
      clearInterval(loadLoop);
    }

    if (typeof $.summernote !== 'undefined') {
      console.log('summernote loaded');
      // When it loads, stop waiting.
      clearInterval(loadLoop);
      // Turn on all editors on this page.
      activateAllEditors();
      setupAutoSave();
    }
  }, time_delay);

  // When controls are disabled, they lose focus.
  // Handle the focus explicitly by shifting it to the notice box,
  // and shifting it back when the control is reenabled.
  function handleFocus() {
    had_focus = $(':focus');

    // If the thing that had focus was the editor, don't let it shift away.
    if (had_focus.hasClass('note-editable')) {
      had_focus.parent('.summernote').summernote('saveRange');
      console.log('Put focus back on editor as soon as it loses it.');
      had_focus.one('blur', function() {
        // Yes, it genuinely needs a 0-milisecond setTimeout.
        setTimeout(function() {
          had_focus.focus();
          had_focus.parent('.summernote').summernote('restoreRange');
        }, 0);
      });
    } else {
      // If it wasn't the editor, shift focus to the status message.
      // It'll get shifted back after the controls are re-enabled.
      $('.hxed-statusmessage').focus();
      console.log('Shift focus away from');
      console.log(had_focus);
    }
  }

  // When the controls are ready again, shift focus back to them if necessary.
  $(document).on('controlsReady', function(e) {
    if (had_focus.hasClass('note-editable')) {
      console.log('Editor had focus, no need to act.');
    } else {
      console.log('Refocusing to:');
      console.log(had_focus);
      had_focus.focus();
    }
  });
};
