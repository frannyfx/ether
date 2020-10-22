import { Route, Method } from "../../server/router"
import { getHost, setHost } from "../../hardware/reactive"

const route : Array<Route> = [{
	method: Method.GET,
	url: "/api/reactive/host",
	handler: (_, response) => {
		response.send({ok: true, result: { host: getHost() }});
	}
}, {
	method: Method.PUT,
	url: "/api/reactive/host/:host",
	handler: (request: any, response) => {
		try {
			// Parse host & port.
			let hostAndPort = request.params.host.split(":");
			let host = hostAndPort[0];
			let port = parseInt(hostAndPort[1]);
			if (isNaN(port)) throw Error();
			
			// Set host & port and return success.
			setHost(host, port);
			response.send({ok: true});
		} catch {
			response.send({ok: false});
		}
	}
}];

export default route;