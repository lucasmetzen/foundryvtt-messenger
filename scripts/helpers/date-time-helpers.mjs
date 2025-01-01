export function isToday(date) {
	const today = new Date();
	return date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
}

export function formatTimeHHMMSS(date) {
	return padLeadingZero(date.getHours()) + ":" + padLeadingZero(date.getMinutes()) + ":" + padLeadingZero(date.getSeconds());
}

export function formatDateYYYYMMDD(date) {
	return date.getFullYear() + "-" + padLeadingZero(date.getMonth()+1) + "-" + padLeadingZero(date.getDate());
}

function padLeadingZero(num) {
	return ('00' + num).slice(-2);
}
