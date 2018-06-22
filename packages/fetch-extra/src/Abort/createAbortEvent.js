export default function createAbortEvent() {
	const event = document.createEvent('Event');
	event.initEvent('abort', true, true);
	return event;
}
