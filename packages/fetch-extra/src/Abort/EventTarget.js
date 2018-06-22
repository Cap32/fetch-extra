export default class EventTargetPonyfill {
	constructor() {
		this._target = document.createTextNode('');
	}

	addEventListener(...args) {
		this._target.addEventListener(...args);
	}

	removeEventListener(...args) {
		this._target.removeEventListener(...args);
	}

	dispatchEvent(event) {
		this._target.dispatchEvent(event);
	}
}
