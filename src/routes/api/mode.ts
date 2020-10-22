import { Route, Method } from "../../server/router"
import { getMode, setMode } from "../../hardware"

const route : Array<Route> = [{
	method: Method.GET,
	url: "/api/mode/",
	handler: (_, response) => {
		response.send({ok: true, result: { mode: getMode() }});
	}
}, {
	method: Method.PUT,
	url: "/api/mode/:mode",
	handler: (request: any, response) => {
		setMode(parseInt(request.params.mode));
		response.send({ok: true});
	}
}];

export default route;