import EventEmitter from 'events';

export default class EventTargetNode extends EventEmitter {
	addEventListener(...args) {
		this.addListener(...args);
	}

	removeEventListener(...args) {
		this.removeListener(...args);
	}

	dispatchEvent(event) {
		const { type } = event;
		this.emit(type, event);
	}
}
