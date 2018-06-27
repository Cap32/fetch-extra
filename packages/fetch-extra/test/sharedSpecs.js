export default function sharedSpecs(name, Event, EventTarget) {
	describe(name, () => {
		describe('Event', async () => {
			test('should event includes `type`', async () => {
				const type = 'foo';
				expect(new Event(type).type).toBe(type);
			});
		});

		describe('EventTarget', async () => {
			test('should eventTarget includes some methods', async () => {
				expect(new EventTarget()).toMatchObject({
					addEventListener: expect.any(Function),
					removeEventListener: expect.any(Function),
					dispatchEvent: expect.any(Function)
				});
			});

			test('eventTarget.addEventListener()', async () => {
				const eventTarget = new EventTarget();
				const listener = jest.fn();
				const event = new Event('foo');
				eventTarget.addEventListener('foo', listener);
				eventTarget.dispatchEvent(event);
				eventTarget.dispatchEvent(event);
				expect(listener).toHaveBeenCalledTimes(2);
			});

			test('eventTarget.removeEventListener()', async () => {
				const eventTarget = new EventTarget();
				const listener = jest.fn();
				const event = new Event('foo');
				eventTarget.addEventListener('foo', listener);
				eventTarget.removeEventListener('foo', listener);
				eventTarget.dispatchEvent(event);
				expect(listener).not.toBeCalled();
			});
		});
	});
}
