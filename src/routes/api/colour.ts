import { Route, Method } from "../../server/router"
import { setColour, getColour } from "../../hardware"

const route : Array<Route> = [{
	method: Method.GET,
	url: "/api/colour",
	handler: (_, response) => {
		response.send({ok: true, result: { colour: getColour() }});
	}
}, {
	method: Method.PUT,
	url: "/api/colour/:red/:green/:blue",
	handler: (request: any, response) => {
		setColour({red: parseInt(request.params.red), green: parseInt(request.params.green), blue: parseInt(request.params.blue)});
		response.send({ok: true});
	}
}];

export default route;