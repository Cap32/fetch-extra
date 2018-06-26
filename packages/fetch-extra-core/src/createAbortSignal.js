export default function createAbortSignal(EventTarget) {
	return class AbortSignal extends EventTarget {
		constructor() {
			super();

			this._aborted = false;
			this._onabort = null;
		}

		get aborted() {
			return this._aborted;
		}

		get onabort() {
			return this._onabort;
		}
		set onabort(listener) {
			if (this._aborted) return false;
			if (this._onabort) this.removeEventListener('abort', this._onabort);
			this._onabort = listener;
			this.addEventListener('abort', listener);
			return true;
		}
	};
}
