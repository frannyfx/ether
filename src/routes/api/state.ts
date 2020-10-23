import { Route, Method } from "../../server/router"
import { getState } from "../../hardware"

const route : Array<Route> = [{
	method: Method.GET,
	url: "/api/state",
	handler: (_, response) => {
		response.send({ok: true, result: { state: getState() }})
	}
}];

export default route;