            chrome.storage.local.get(['matches_urls_info_object'], function(result){
                var matches_urls_info_object = result.matches_urls_info_object || false;


                var matches_urls_part = matches_urls_info_object.matches_urls_result_another || [];

                //matches_urls_info_object.matches_urls_result = [];
     //chrome.storage.local.set({"matches_urls_info_object" : matches_urls_info_object}, function(result){
                               //   });
                //return;
                //var results_stringifies = JSON.stringify(matches_urls_part);
                

               	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://cars.dmitriybuteiko.com/myscore_scrapper/save_partial_data_json.php", true);
	//xhr.setRequestHeader('Content-Type', 'application/json');

	var testArray = {
		data : matches_urls_part
	};


	console.log("SENDING RESULT ARRAY TO THE SERVER...");
	xhr.send(JSON.stringify(testArray));


	xhr.onload = function() {
  		console.log("GENERATION RESPONSE:")
  		console.log(this.responseText);
	}
            });