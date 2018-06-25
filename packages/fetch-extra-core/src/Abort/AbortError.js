export default class AbortError extends Error {
	constructor() {
		super('The user aborted a request.');
		this.name = 'AbortError';
	}
}
