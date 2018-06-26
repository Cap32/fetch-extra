import createAbortSignal from './createAbortSignal';

export default function createAbortController({
	AbortController,
	EventTarget,
	Event
}) {
	if (AbortController) return AbortController;

	const AbortSignal = createAbortSignal(EventTarget);

	const AbortControllerPolyfill = function AbortController() {
		this.signal = new AbortSignal();
	};

	AbortControllerPolyfill.prototype.abort = function () {
		const { signal } = this;
		if (!signal._aborted) {
			signal._aborted = true;
			const abortEvent = new Event('abort');
			signal.dispatchEvent(abortEvent);
		}
	};

	return AbortControllerPolyfill;
}
