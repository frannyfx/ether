/**
 * @file Beautiful terminal logger.
 * @author Francesco Compagnoni
 * @version 2020.06.12
 */

// Imports.
import chalk from "chalk";

// Define interfaces.
interface Logger {
	info: Function,
	warn: Function,
	error: Function,
	success: Function
};

interface LogConfig {
	showIcon: boolean,
	showTag: boolean,
	showDate: boolean
};

interface LogParameters {
	highlight: Function,
	icon: String,
	error: boolean
};

// Define defaults.
const defaultConfig : LogConfig = {
	showIcon: true,
	showTag: true,
	showDate: true
};

const infoParams : LogParameters = {
	highlight: chalk.bold.blue,
	icon: "➜",
	error: false
};

const warnParams : LogParameters = {
	highlight: chalk.bold.yellow,
	icon: "⚠",
	error: true
};

const errorParams : LogParameters = {
	highlight: chalk.bold.red,
	icon: "✖",
	error: true
};

const successParams : LogParameters = {
	highlight: chalk.bold.green,
	icon: "✔",
	error: false
};

/**
 * Perform log.
 * @param tag The module tag.
 * @param logConfig The general configuration of the logger given by the user.
 * @param logParameters The parameters for this type of logging.
 * @param content The content given by the user.
 */
function log(tag: string, logConfig: LogConfig, logParameters: LogParameters, ...content : any[]) {
	// Define components
	let components = [];

	// Add in components to the log.
	if (logConfig.showIcon) components.push(logParameters.highlight(logParameters.icon));
	if (logConfig.showTag) components.push(logParameters.highlight(`[${tag}]`));
	if (logConfig.showDate) components.push(logParameters.highlight(`[${new Date().toISOString()}]`));

	// Output the log.
	if (logParameters.error) console.error(...components, ...content);
	else console.log(...components, ...content);
}

export = (tag: string, config?: LogConfig) : Logger => {
	// Set defaults.
	if (tag == null) tag = "main";
	if (!config) config = Object.assign(defaultConfig, config);

	return {
		info: (...content : any[]) => log(tag, config!, infoParams, ...content),
		warn: (...content : any[]) => log(tag, config!, warnParams, ...content),
		error: (...content : any[]) => log(tag, config!, errorParams, ...content),
		success: (...content : any[]) => log(tag, config!, successParams, ...content)
	};
};