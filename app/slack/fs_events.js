/*
Future Features
- Pagination: "Here are a few events, would you like to see more?"
- Better matching of strings
- Something to make this more useful than just going to connect?
-

*/

var request = require('request');
var parseString = require('xml2js').parseString;
var key = process.env.CONNECT_EVENTS_TOKEN;
var fs_events = {
	name: 'fs_events',
	events: function(controller, bot){
  var feedLimit = 100;
  var feedURL = 'https://api.orgsync.com/api/v3/communities/529/events.rss?key='+ key + '&per_page='+feedLimit+'&upcoming=true&portals%5B%5D=83586&portals%5B%5D=50443&portals%5B%5D=50042&portals%5B%5D=50038&portals%5B%5D=50448&portals%5B%5D=81791&portals%5B%5D=50450&portals%5B%5D=50056&portals%5B%5D=50451&featured=true'


  controller.hears(['Show me (.*) events'], ['direct_message', 'mention', 'direct_mention'], function(bot,message){
    var query = new RegExp('(' + message.match[1] + ')', "i");
    bot.reply(message, {"type": "typing"});
    request(feedURL, function(err,res,body){
      if (!err && res.statusCode == 200) {
        // Parse XML string into JSON
        parseString(body, function(error,result){

          var events = result.rss.channel[0].item;
          var events_to_attach = [];
          var max_results = 10;
          var resultCount = 0;

          events.forEach(function(event, i){
            // Check if title of event contains user query & limit max results
            if (query.test(event.title[0]) && resultCount < max_results) {
              resultCount++;
              var thumb = null;
              if (event["media:content"]) {
                thumb = event["media:content"][0]["$"].url;
              }
              events_to_attach.push({
                'fallback': event.title[0],
                'color': "#BC5435",
                'title': event.title[0],
                'title_link': event.link[0],
                'thumb_url': thumb,
                'fields': [
                  {
                    'title': "Location",
                    'value': event["event:location"][0],
                    'short':true
                  },
                  {
                    'title': "Date & Time",
                    'value': new Date(event["event:startdate"][0]),
                    'short': true
                  }
                ]
              })
            }
          });
          if (resultCount > 0)
          {
            var post = {
              channel: message.channel,
              attachments: events_to_attach,
              text: ' '
            }

              bot.reply(message, post);
          } else {
            bot.reply(message, "Sorry <@" + message.user + ">, there are no upcoming _" + message.match[1] + "_ events. :slightly-frowning-face:")
          }

        });
      }
    })
  });


	}
}

module.exports = fs_events;
