(function() {

  function select_text() {
    var doc = document;
    var element = $(this)[0];
    if (doc.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
  }

  function select_element(element) {
    if (element.hasClass('active')) {
      selected_element = null;
    } else {
      if (selected_element) {
        selected_element.removeClass('active');
      }
      selected_element = element;
    }
    element.toggleClass('active');
  }

  function update_selected_element_values(element) {
    var values = element.children('dd');

    selected_element_properties.each(function() {
      var field = $(this);
      var id = field.data('id');
      var selector = '[itemprop="' + id + '"]';

      var el = values.siblings(selector).filter(':first');
      field.text(el.val());
    });
  }

  function select_property(property) {
    var id = property.data("id");
    var name = property.data("name");
    var units = property.data("units");
    var value = property.next().find('.value').filter(':first').text();

    // update the property

    property.siblings().removeClass("active");
    property.addClass("active");

    // update the element cells

    $("#periodic-table td.element dd.active").removeClass("active");

    itemprop = "[itemprop=\"" + id + "\"]";
    $("#periodic-table td.element dd" + itemprop).addClass("active");

    // update the values in the showcase cell

    var destination = $('#periodic-table td.showcase dd.property');
    destination.children('span.value').data('id', id);
    destination.children('span.value').text(value);
    destination.children('dd.property span.units').text(units);

    // update the table with the selected property

    $('#periodic-table').removeClass();
    $('#periodic-table').addClass(id);
  }

  function setup_element_value() {
    var element = $(this);
    element.val(element.text());
  }

  function format_atomic_weight() {
    // display only 2 decimal places
    var element = $(this);
    var formatted = parseFloat(element.text()).toFixed(2);
    if (!isNaN(formatted)) {
      // remove decimal places if they are .00
      if (formatted.match('\.00$')) {
        formatted = formatted.substring(0, formatted.length - 3);
      }
      element.text(formatted);
    }
  }

  function on_element_hover() {
    var element = $(this);
    if (selected_element == null) {
      update_selected_element_values(element);
    }
  }

  function on_element_click() {
    var element = $(this);
    select_element(element);
    update_selected_element_values(element);
  }

  function on_property_click(event) {
    var property =$(this);
    select_property(property);
  }

  var selected_element = null;
  var selected_element_properties = $('#periodic-table tr.header .value');

  // element cells

  $('#periodic-table td.element dd')
    .each(setup_element_value);

  $('#periodic-table td.element dd[itemprop="atomic_weight"]')
    .each(format_atomic_weight);

  $('#periodic-table td.element dl')
    .hover(on_element_hover)
    .click(on_element_click);

  // property cell

  $("#periodic-table td.properties dt")
    .click(on_property_click);

  $("#periodic-table td.properties dd")
    .click(select_text);

  // showcase cell

  $('#periodic-table td.showcase dd[data-id="name"]')
    .click(select_text);

  $('#periodic-table td.showcase dd.property span.value')
    .click(select_text);

}).call(this);
