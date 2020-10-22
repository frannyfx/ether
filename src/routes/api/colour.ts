import { Route, Method } from "../../server/router"
import { setColour, setMode, Mode } from "../../hardware"

const route : Array<Route> = [{
	method: Method.PUT,
	url: "/mode/:mode",
	handler: (request: any, response) => {
		setMode(parseInt(request.params.mode));
		response.send({ok: true});
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