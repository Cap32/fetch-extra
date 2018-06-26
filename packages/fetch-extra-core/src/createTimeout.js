export default function createTimeout(delay, TimeoutError) {
	let timeoutId;
	const timeoutPromise = new Promise((resolve, reject) => {
		timeoutId = setTimeout(() => reject(new TimeoutError()), delay);
	});
	timeoutPromise.clear = () => {
		/* istanbul ignore else */
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};
	return timeoutPromise;
}
