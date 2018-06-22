import createAbortSignal from './createAbortSignal';

export default function createAbortController(EventTarget, createAbortEvent) {
	const AbortSignal = createAbortSignal(EventTarget);

	const AbortController = function AbortController() {
		this.signal = new AbortSignal();
	};

	AbortController.prototype.abort = function () {
		const { signal } = this;
		if (!signal._aborted) {
			signal._aborted = true;
			const abortEvent = createAbortEvent();
			signal.dispatchEvent(abortEvent);
		}
	};

	return AbortController;
}
