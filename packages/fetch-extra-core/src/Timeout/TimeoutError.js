export default class TimeoutError extends Error {
	constructor() {
		super('Timeout.');
		this.name = 'TimeoutError';
	}
}
