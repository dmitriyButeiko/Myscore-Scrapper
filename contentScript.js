function startMatchesCheckingInterval()
{
    var currentWindowLocation = window.location.href;

    if(currentWindowLocation.indexOf("myscoreScrapper") > 2)
    {   
        console.log("Myscore Scrapper Page...");

        $(document).ready(function(){
            chrome.storage.local.get(['matches_urls_info_object'], function(result){
                var matches_urls_info_object = result.matches_urls_info_object || false;

                console.log(matches_urls_info_object);

                matches_urls_info_object.matches_urls_result = matches_urls_info_object.matches_urls_result || [];

                matches_urls_info_object.matches_urls_result_another = matches_urls_info_object.matches_urls_result_another || [];


                matches_urls_info_object.handled_years_urls = matches_urls_info_object.handled_years_urls || [];

                currentWindowLocationSplitted = currentWindowLocation.split("?openedvia=myscoreScrapper");
                matches_urls_info_object.handled_years_urls.push(currentWindowLocationSplitted[0]);

                var resultsCheckingInterval = setInterval(function(){
                  if($("ul.ifmenu li.selected a").text() == "Eredmények")
                  {
                      console.log("CLEARING RESULTS CHECKING INTERVAL...");
                      clearInterval(resultsCheckingInterval);





                      var moreMatchesButtonInterval = setInterval(function(){
                          if($("#tournament-page-results-more").css("display") != "none")
                          {
                              console.log("CLICKING TOURNAMENT RESULTS MORE...");

                              document.querySelector("#tournament-page-results-more a").click();
                          }
                          else
                          {
                              console.log("More button does not exists.. Clearing the interval");
                              clearInterval(moreMatchesButtonInterval);

                              setTimeout(function(){
                                  console.log("Matches Links:");

                                  var matchesUrls = getMatchesLinksFromThePage(currentWindowLocation);

                                  for(var a = 0; a < matchesUrls.length; a++)
                                  {
                                      matches_urls_info_object.matches_urls_result_another.push(matchesUrls[a]);
                                  }


                                  chrome.storage.local.set({"matches_urls_info_object" : matches_urls_info_object}, function(result){
                                  });
                              }, 500);
                          }
                      }, 2000);
                  }
                  else
                  {
                      console.log("Results table still not available...");

                      if($("body > div.error").html().length > 5)
                      {
                          clearInterval(resultsCheckingInterval);
                          chrome.storage.local.set({"matches_urls_info_object" : matches_urls_info_object}, function(result){
                          });
                      }
                  }
                }, 500);
            });
        });
        return;
    }

    var metchesCheckingInterval = setInterval(function(){
      console.log("CHECKING FOR FETCHING URLS COMMAND...");

      chrome.storage.local.get(["matches_urls_info_object"], function(result){
          var matches_urls_info_object = result.matches_urls_info_object || false;

//clearInterval(metchesCheckingInterval);
          //console.log(matches_urls_info_object);
          //return;

          if(matches_urls_info_object || matches_urls_info_object.start_matches_urls_scrapping)
          {
              var already_handled_urls = matches_urls_info_object.handled_matches_urls;
              clearInterval(metchesCheckingInterval);
              startUrlsFetching(already_handled_urls);
          }
      });
    }, 1000);
}


function transferData()
{
            chrome.storage.local.get(['matches_urls_info_object'], function(result){
                var matches_urls_info_object = result.matches_urls_info_object || false;


                var matches_urls_part = matches_urls_info_object.matches_urls_result || [];

                var results_stringifies = JSON.stringify(matches_urls_part);
                console.log(results_stringifies);
            });
}


//transferData();


startMatchesCheckingInterval();


function startUrlsFetching(already_handled_urls)
{
    console.log("START URLS FETCHING...");
    var atpTournamentLinks = fetchATPTournamentsResults();
    var urlsToHandleArray = [];
            var lastLinkReached = false;

    for(var i = 0; i < atpTournamentLinks.length; i++)
    {
        //console.log("CURRENT LINK TO HANDLE: " + atpTournamentLinks[i]);

        /*if(tournamentLinkHandled(already_handled_urls, atpTournamentLinks[i]))
        {
            console.log("LINK ALREADY HANDLED...");
            continue;
        }*/

        atpTournamentLinks[i] = atpTournamentLinks[i].substring(0, atpTournamentLinks[i].length - 1);
        var currentLinkToWatch = "https://www.eredmenyek.com" + atpTournamentLinks[i];

        //console.log("HANDLING LINK...");

        var startYear = 2006;
        var endYear = (new Date()).getFullYear();


        for(var currentYearToFetch = startYear; currentYearToFetch < endYear; currentYearToFetch++)
        {
            currentYearLinkToWatch = currentLinkToWatch + "-" + currentYearToFetch + "/eredmenyek/"
            //console.log("CURRENT YEAR SPECIFIC LINK: " + currentYearLinkToWatch);


            if(currentYearLinkToWatch == "https://www.eredmenyek.com/tenisz/atp-egyeni/stockholm-2014/eredmenyek/")
            {
                lastLinkReached = true;
                continue;
            }


            if(lastLinkReached == false)
            {
                continue;
            }

            urlsToHandleArray.push(currentYearLinkToWatch);
        }
    }


    //console.log(urlsToHandleArray);
    //return;
    //console.log("RESULT URLS TO HANDLE ARRAY...");


    processEachWindow(0, urlsToHandleArray);
}



function processEachWindow(currentResultsSearchCounter, atpTournamentYearsLinks)
{
    /*if(!lastScrappedUrlReached)
    {
       lastScrappedUrlReached = false;
    }*/

    if(currentResultsSearchCounter == atpTournamentYearsLinks.length)
    {
        return true;
    }

    chrome.storage.local.get(['matches_urls_info_object'], function(result){
      var matches_urls_info_object = result.matches_urls_info_object || false;

      var handled_years_urls = matches_urls_info_object.handled_years_urls || [];
      var currentLinksAlreadyHandled = false;


      /*for(var v = 0; v < handled_years_urls.length; v++)
      {
          if(handled_years_urls[v] == atpTournamentYearsLinks[currentResultsSearchCounter])
          {
              currentLinksAlreadyHandled = true;
              break;
          }
      }*/

      if(currentLinksAlreadyHandled)
      {
          return processEachWindow(currentResultsSearchCounter + 1, atpTournamentYearsLinks);
      }
      else
      {
          var openedWindow = handleNewWindow(atpTournamentYearsLinks[currentResultsSearchCounter]);

          var checkHandledUrlsUpdated = setInterval(function(){
            chrome.storage.local.get(['matches_urls_info_object'], function(result){
                var matches_urls_info_object = result.matches_urls_info_object || false;
                var handled_years_urls_updated = matches_urls_info_object.handled_years_urls || [];

                var currentLinksAlreadyHandledUpdated = false;

                for(var g = 0; g < handled_years_urls_updated.length; g++)
                {
                    if(handled_years_urls_updated[g] == atpTournamentYearsLinks[currentResultsSearchCounter])
                    {
                        currentLinksAlreadyHandledUpdated = true;

                        openedWindow.close();
                        clearInterval(checkHandledUrlsUpdated);
                        return processEachWindow(currentResultsSearchCounter + 1, atpTournamentYearsLinks);
                        break;
                    }
                }
            });
          }, 3000);
      }
    });
}






function handleNewWindow(url)
{
    var currentKey = "KEY-" + (Math.floor(Math.random() * 999999) + 1 );
    //return window.open(url + "?openedvia=myscoreScrapper", currentKey, "width=200, height=100");
    return window.open(url + "?openedvia=myscoreScrapper", "_blank");
}


function tournamentLinkHandled(already_handled_urls, atpTournamentLink)
{
    for(var i = 0; i > already_handled_urls.length; i++)
    {
        if(already_handled_urls[i] == atpTournamentLink)
        {
            return true;
        }
    } 

    return false;
}



/*var menu_items = document.querySelectorAll('.ifmenu li a');

for(var i = 0; i < menu_items.length; i++)
{
   if(menu_items[i].innerText == "Archívum")
   {

   }
}*/

function clearLocalStorage()
{

}



function fetchATPTournamentsResults()
{
  var menu_items = document.querySelectorAll('#lmenu_5724 ul li a');
  var total_tournaments_links_result = [];



  for(var i = 0; i < menu_items.length; i++)
  {
      total_tournaments_links_result.push(menu_items[i].getAttribute("href"));
  }

  return total_tournaments_links_result;
}

function getMatchesLinksFromThePage(currentWindowLocation)
{
  var currentWindowLocation = currentWindowLocation.split("/eredmenyek/");

  currentWindowLocation = currentWindowLocation[0];

  currentWindowLocation = currentWindowLocation.split("-");

  currentTournamentYear = parseInt(currentWindowLocation[currentWindowLocation.length - 1]);


  var total_matches_result = [];

  $("table.tennis tbody > tr").each(function(){
    if($(this).attr("id") == undefined)
    {
      return;
    }

      total_matches_result.push({
        link : $(this).attr("id"),
        time : $(this).find("td.time").text(),
        score : $(this).find("td.score").text(),
        team_home : $(this).find("td.team-home").text(),
        team_away : $(this).find("td.team-away").text(),
        score : $(this).find("td.score").text(),
        year : currentTournamentYear
      });
  });

  return total_matches_result;
}


//console.log(getMatchesLinksFromThePage());

var moreMatchesButtonInterval = setInterval(function(){
  if($("#tournament-page-results-more").css("display") != "none")
  {
    $("#tournament-page-results-more a").click();
  }
  else
  {
    console.log("More button does not exists.. Clearing the interval");
    clearInterval(moreMatchesButtonInterval);
  }

}, 2000);

