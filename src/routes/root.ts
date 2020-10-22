import { FastifyRequest } from "fastify";
import { Route, Method } from "../server/router"

const route : Route = {
	method: Method.GET,
	url: "/",
	handler: (request, response) => {
		response.sendFile("index.html");
	}
};

export default route;