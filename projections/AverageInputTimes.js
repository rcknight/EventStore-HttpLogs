fromStreams(['createdItems', 'updatedItems']).when({
	$init: function () {
		return { 
			createAverage: 0,
			createSum: 0,
			createCount: 0,
			updateAverage: 0,
			updateCount: 0,
			updateSum: 0,
			cloneAverage: 0,
			cloneCount: 0,
			cloneSum: 0,
			byCustomer: {}
		};
	},
	itemCreated: function (s,e) {
		doUpdates(s, e, 'create');
	},
	itemUpdated: function (s,e) {
		doUpdates(s, e, 'update');
	},
	itemCloned: function (s,e) {
		doUpdates(s, e, 'clone');
	}
});

function doUpdates(s, e, type) {
	//filter out weird ones wher the detection didnt work
	if(e.body.secondsTaken <= 1)
		return;

	updateAverage(s, e, type);

	var emailparts = e.body.user.split('@');
	if(emailparts.length == 2)
	{
		if(s.byCustomer[emailparts[1]] === undefined)
		{
			s.byCustomer[emailparts[1]] = {
				createAverage: 0,
				createSum: 0,
				createCount: 0,
				updateAverage: 0,
				updateCount: 0,
				updateSum: 0,
				cloneAverage: 0,
				cloneCount: 0,
				cloneSum: 0
			};
		}

		updateAverage(s.byCustomer[emailparts[1]], e, type);
	}
}

function updateAverage(s,e,type)
{
	s[type + 'Sum'] += e.body.secondsTaken;
	s[type + 'Count']++;
	s[type + 'Average'] = s[type + 'Sum'] / s[type + 'Count'];	
}
