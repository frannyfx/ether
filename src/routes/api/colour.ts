import { Route, Method } from "../../server/router"
import { setColour } from "../../hardware"

const route : Array<Route> = [{
	method: Method.PUT,
	url: "/mode/:mode",
	handler: (request: any, response) => {
		
	}
}, {
	method: Method.PUT,
	url: "/colour/:red/:green/:blue",
	handler: (request: any, response) => {
		setColour({red: parseInt(request.params.red), green: parseInt(request.params.green), blue: parseInt(request.params.blue)});
		response.send({ok: true});
	}
}];

export default route;