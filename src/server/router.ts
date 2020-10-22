// Modules
const logger = require("../utils/logger")("router");
import { IncomingMessage } from "http";
import { promises as fs } from "fs";
import path from "path";

// Enums and interfaces
export enum Method {
	GET = 0,
	POST = 1,
	DELETE = 2
}

export interface Handler {
	(request: IncomingMessage, response: any): void
}

export interface Route {
	method: Method,
	url: String,
	handler: Handler,
	schemas?: {
		params?: any,
		body?: any
	}
}

function isRoute(route: any): route is Route {
	return route && route.method != undefined && route.url != undefined && route.handler != undefined;
}

async function loadRoutes(directory: string) : Promise<Array<Route>> {
	// Read directory
	var entities;
	try {
		entities = await fs.readdir(directory, {withFileTypes: true});
	} catch (e) { return []; }

	// Find more directories to search.
	let recursive: Array<Array<Route>> = await Promise.all(entities.filter(entity => entity.isDirectory()).map(dir => {
		return loadRoutes(path.join(directory, dir.name));
	}));

	// Filter out files not JS or not routes.
	let routes = await Promise.all(entities.filter(entity => entity.isFile() && entity.name.match(/([a-zA-Z0-9\s_\\.\-\(\):])+(.js)$/)).map(async file => {
		// Validate the route and handle sub-routes
		var route = (await import(path.join(directory, file.name))).default;
		if (!Array.isArray(route))
			route = [route];

		return route.filter((subRoute: any) => isRoute(subRoute));
	}));

	// Expand the sub-arrays.
	let final: Array<Route> = [];
	let expandedRoutes: Array<Array<Route>> = routes.filter(route => !Array.isArray(route));
	routes.filter(route => Array.isArray(route)).map(routeArray => expandedRoutes.push(...routeArray));
	return final.concat.apply(expandedRoutes, recursive);
}

function registerRoute(fastify: any, route: Route) {
	// Call correct fastify method.
	var register = (url: any, handler: any) => {};
	switch (route.method) {
		case Method.GET: {
			register = (url: any, handler: any) => fastify.get(url, handler);
			break;
		}
		case Method.POST: {
			register = (url: any, handler: any) => fastify.post(url, handler);
			break;
		}
		case Method.DELETE: {
			register = (url: any, handler: any) => fastify.delete(url, handler);
			break;
		}
		default: {
			logger.warn(`Unhandled route method '${Method[route.method]}' for route '${route.url}'.`);
			break;
		}
	}

	register(route.url, async (request: IncomingMessage, response: any) => {
		try {
			route.handler(request, response);
		} catch (e) {
			logger.error(`Unhandled error at route ${Method[route.method]} '${route.url}' - ${e.message}`);
			response.send({ok: false});
		}
	});

	logger.success(`Successfully registered route ${Method[route.method]} '${route.url}'.`);
}

export default async function (fastify: any, options: any, done: Function) {
	// Load the routes.
	(await loadRoutes(options.directory)).map(route => registerRoute(fastify, route));
	done();
}