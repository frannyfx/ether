import { FastifyRequest } from "fastify";
import { Route, Method } from "../../server/router"
import { setColour } from "../../hardware"

const route : Route = {
	method: Method.POST,
	url: "/colour/:red/:green/:blue",
	handler: (request : any, response) => {
		setColour(parseInt(request.params.red), parseInt(request.params.green), parseInt(request.params.blue));
		response.send({ok: true});
	}
};

export default route;