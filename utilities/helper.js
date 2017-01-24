
function complementArray(u, a) {
	var c = [];
	for (var i = 0; i < u.length; i++) {
		if (a.indexOf(u[i]) == -1)
			c.push(u[i]);
	}
	return c;
}

// return index of entry with smallest absolute value, assuming - preferred over +
function indexAbsMin(list) {
	var min = list[0];
	var index = 0;
	for (var i = 1; i < list.length; i++) {
		if (Math.abs(list[i]) < Math.abs(min) || (min > 0 && list[i]+min == 0)) {
			min = list[i];
			index = i;
		}
	}
	return index;
}

// return {(n1, n2):|n1|+|n2|=nSum}
function absSumPairs(nSum) {
	var n1 = 0;
	var n2 = nSum;
	var pairs = [];
	while (n2 >= 0) {
		pairs.push({n1:-n1, n2:-n2});
		if (n1 != 0) pairs.push({n1:n1, n2:-n2});
		if (n2 != 0) pairs.push({n1:-n1, n2:n2});
		if (n1*n2 != 0) pairs.push({n1:n1, n2:n2});
		
		n1++;
		n2--;
	}
	return pairs;
}
