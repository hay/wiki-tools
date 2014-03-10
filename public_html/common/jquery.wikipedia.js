/*
 *  jQuery Plugin - Wikipedia V1.0
 *
 *  todo: add description here
 *
 *  Autor: Marcel Grolms - www.suabo.de 2013
 */
$.fn.WikipediaWidget = function(wikipediaPage, options) {
  //init defaults
  var showTitle = true;
  var maxThumbnails = 3;
  var cutFirstInfoTableRows = 4;
  var maxInfoTableRows = 8;
  var thumbMaxWidth  = '180px';
  var thumbMaxHeight = '180px';

  //option handling
  if(options != undefined) {
    //we got more options
    $.each(options, function(option, value) {
      switch(option) {
        case "showTitle":
          showTitle = value;
        break;

        case "maxThumbnails":
          maxThumbnails = value;
        break;

        case "maxInfoTableRows":
          maxInfoTableRows = value;
        break;

        case "cutFirstInfoTableRows":
          cutFirstInfoTableRows = value;
        break;

        case "thumbMaxHeight":
          thumbMaxHeight = value;
        break;

        case "thumbMaxWidth":
          thumbMaxWidth = value;
        break;
      }
    });
  }

  //check if pagetitle ist set
  if(wikipediaPage == undefined) { console.log('Kein Wikipedia Suchtitel!Keine Abfrage gestartet!');return; }
  //init given wikiContainer from the Selector init
  var wikiContainer = this;
  wikiContainer.append('<div class="ajaxLoading"><img src="img/ajax-loader.gif"></div>');
  //get data.parse.images
  $.getJSON('http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?', {page:wikipediaPage, prop:'text|images', uselang:'de'}, function(parsedata) {
    //remove loading image
    wikiContainer.find('.ajaxLoading').remove();
    //debug
    //console.log(parsedata);
    //drop text to div container
    var content = $(parsedata.parse.text["*"]).wrap('<div></div>').parent();
    //insert title
    if(showTitle) {
      wikiContainer.append('<div class="wikipediaTitle"></div>').find('.wikipediaTitle').html(parsedata.parse.title);
    }
    //get images of right side table
    var rightTableImages = content.find('table a.image img');
    //append first image to main container
    wikiContainer.append($(rightTableImages).first().removeAttr('srcset').removeAttr('height').removeAttr('width').wrap('<div class="wikipediaLogo"></div>').parent());
    //append description to main container
    var description = content.find('p').first().text();
    wikiContainer.append('<div class="wikipediaDescription"></div>').find('.wikipediaDescription').append(description);
    //get thumbnail images
    var rightThumbnails = content.find('.thumb a.image img');
    wikiContainer.append('<ul class="wikipediaThumbGallery"></ul>');
    //add maxThumbnails to main container
    $.each(rightThumbnails, function(index, Thumbnail) {
      //add thumb with thumbMaxHeight and thumbMaxWidth
      if(index<maxThumbnails) wikiContainer.find('.wikipediaThumbGallery').append($(Thumbnail).removeAttr('srcset').removeAttr('height').removeAttr('width').css({'width': 'auto', 'height': 'auto', 'max-width': thumbMaxWidth, 'max-height': thumbMaxHeight}).wrap('<li class="wikipediaThumbnail"></li>').parent());
    });
    //get right side table
    var rightTable = content.find('table.infobox, table.float-right').first();
    //init new table
    var newTable = $('<table class="wikipediaInfoTable"></table>');
    //parse new table from right side table with cutFirstInfoTable and maxInfoTableRows
    $.each(rightTable.find('tr'), function(index, element) {
      if(index>cutFirstInfoTableRows && index<(cutFirstInfoTableRows+maxInfoTableRows)) newTable.append(element);
    });
    //append new table to main container
    wikiContainer.append(newTable);
    wikiContainer.append($('<div class="clear"></div>'));
  });
};