fromStreams(['createdItems', 'updatedItems']).when({
	itemCreated: function (s,e) {
		linkEvent(e,'createdItems-');
	},
	itemUpdated: function (s,e) {
		linkEvent(e,'updatedItems-');
	}
});

function linkEvent(e, streamPrefix)
{
	var emailparts = e.body.user.split('@');
	if(emailparts.length == 2)
	{
		linko(streamPrefix + emailparts[1],e);	
	}
}