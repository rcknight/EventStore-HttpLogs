fromStream('logEvents').when({
	$init: function () {
		return {
			creates: {},
			updates: {}
		}
	},
	$any: function (s,e) {
		
		//grab the data we need from the event body
		var route=e.body["cs-uri-stem"],
			user=e.body["cs-username"],
			date=new Date(e.body.date),
			time=new Date(e.body.time);

		//merge date and time
		date.setUTCHours(time.getUTCHours());
		date.setUTCMinutes(time.getUTCMinutes());
		date.setUTCSeconds(time.getUTCSeconds());

		//bail out if necessary data is missing
		if(route === undefined || user === undefined)
			return;

		//remove any case strangeness from user and url
		route = route.toLowerCase();
		user = user.toLowerCase();

		//find interesting events ... if i had been smarter
		//about setting event types we wouldnt need this
		switch(route)
		{
			case '/home/newitem':
				//record the start time against the user
				s.creates[user] = date;
				break;
			case '/home/edititem':
				s.updates[user] = date;
				break;
			case '/home/savenewitem':
				//if we don't have a start time just skip
				if(s.creates[user] !== undefined)
				{
					//skip weird outliers over 10 mins
					//they probably went for a cup of coffee
					if(date - s.updates[user] > 10*60*1000)
					{
						s.updates[user] = undefined;
						return;
					}
					
					//emit the time taken
					emit('createdItems', 'itemCreated', {
						"date": date,
						"user": user,
						"secondsTaken": (date - s.creates[user]) / 1000
					});

					//reset user tracking
					s.creates[user] = undefined;
				}
				break;
			case '/home/updateitem':
				//if we don't have a start time just skip
				if(s.updates[user] !== undefined)
				{
					//skip weird outliers over 10 mins
					//they probably went for a cup of coffee
					if(date - s.updates[user] > 10*60*1000)
					{
						s.updates[user] = undefined;
						return;
					}
					
					//emit the time taken
					emit('updatedItems', 'itemUpdated', {
						"date": date,
						"user": user,
						"secondsTaken": (date - s.updates[user]) / 1000
					});

					//reset user tracking
					s.updates[user] = undefined;
				}
				break;
		}

		return s;
	}
});