export default function Event(type) {
	const event = document.createEvent('Event');
	event.initEvent(type, true, true);
	return event;
}
