import TimeoutError from './TimeoutError';

export default function createTimeout(delay) {
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
