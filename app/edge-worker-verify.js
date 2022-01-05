window = globalThis;

async function handleRequest(request)
{
	return new Response('status: ok.', {
		headers: new Headers({'content-type': 'text/plain'})
	});
}

addEventListener('fetch', event => {
	const result = handleRequest(event.request);
	event.waitUntil(result);
	event.respondWith(result);
});
