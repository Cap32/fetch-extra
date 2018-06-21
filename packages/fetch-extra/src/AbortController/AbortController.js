import AbortSignal from './AbortSignal';

const AbortController = function AbortController() {
	this.signal = new AbortSignal();
};

AbortController.prototype.abort = function () {
	this.signal.emit('abort');
};

export default AbortController;
