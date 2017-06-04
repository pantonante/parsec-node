var channel = "roomlight";

function publishState(pn, state){
	pn.publish({
	    channel : channel,
	    message : {"state": state},
	    callback : function(m){
	        console.log(m)
	    }
	});
	console.log(channel)
}

$(document).ready(function() {
	var pubnub = PUBNUB.init({
    publish_key: 'pub-c-61fc79c8-2976-4a6c-b5f4-392ea1b11711',
    subscribe_key: 'sub-c-3f10f284-209e-11e7-b284-02ee2ddab7fe',
    error: function (error) {
        console.log('Error:', error);
    }
	});

	console.log("subscribing");
	pubnub.subscribe({
	    channel : channel,
	    message : function(m){
	    	console.log(m.state);
	        if(m.state=="ON"){
	        	$("#roomlight input").attr("checked", true);
	        }
	        else if(m.state=="OFF"){
	        	$("#roomlight input").attr("checked", false);
	        }
	    },
	    error : function (error) {
	        // Handle error here
	        console.log(JSON.stringify(error));
	    }
	});

	$('.toggle').each(function( index ) { // Update to the current state
		pubnub.history({
        channel: channel,
        count: 1,
        callback: function(message) {
        	console.log(message["0"]["0"]);
        	if(message["0"]["0"].state=="ON")
        		$("#roomlight input").attr("checked", true);
        }
      });
	});

	if($('.toggle')) { // send update after click
		$('.toggle input').click(function(){
			console.log($(this)[0].checked);
			if($(this)[0].checked){
				publishState(pubnub, "ON");
			} else {
				publishState(pubnub, "OFF");
			}
		});
	}
});