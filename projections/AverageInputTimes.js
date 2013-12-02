fromStreams(['createdItems', 'updatedItems']).when({
	$init: function () {
		return { 
			creationAverage: 0,
			creationSum: 0,
			creationCount: 0,
			updateAverage: 0,
			updateCount: 0,
			updateSum: 0
		};
	},
	itemCreated: function (s,e) {
		s.creationSum += e.body.secondsTaken;
		s.creationCount++;
		s.creationAverage = s.creationSum / s.creationCount;
		return s;
	},
	itemUpdated: function (s,e) {
		s.updateSum += e.body.secondsTaken;
		s.updateCount++;
		s.updateAverage = s.updateSum / s.updateCount;
		return s;
	}
});