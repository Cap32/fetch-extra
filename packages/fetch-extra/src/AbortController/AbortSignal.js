import EventEmitter from 'events';

export default class AbortSignal extends EventEmitter {
	constructor() {
		super();

		this.aborted = false;
		this.onabort = null;
	}

	addEventListener(eventName, listener) {
		this.on(eventName, ev => {
			if (!this.aborted) {
				this.aborted = true;
				listener.call(this, ev);
				if (typeof this.onabort === 'function') this.onabort(ev);
			}
		});
	}

	removeEventListener(eventName, listener) {
		this.removeListener(eventName, listener);
	}
}
