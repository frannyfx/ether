import { Route, Method } from "../../server/router"
import { setPower, getPower } from "../../hardware"

const route : Array<Route> = [{
	method: Method.GET,
	url: "/power",
	handler: (request: any, response) => {
		response.send({ok: true, result: { power: getPower() }});
	}
}, {
	method: Method.PUT,
	url: "/power",
	handler: (request: any, response) => {
		setPower(true);
		response.send({ok: true});
	}
}, {
	method: Method.DELETE,
	url: "/power",
	handler: (request: any, response) => {
		setPower(false);
		response.send({ok: true});
	}
}];

export default route;