const { join } = require('path');
const { mkdir } = require('fs').promises;
const shell = require('shelljs');
const cmd = require('../../lib/commands');
const { tmpDir } = require('./output');
const { linkPackage } = require('./utils');

const argv = {
	_: [],
	src: 'src',
	dest: 'build',
	config: 'preact.config.js',
	prerenderUrls: 'prerender-urls.json',
	'inline-css': true,
};

exports.create = async function (template, options) {
	let dest = await tmpDir();

	let opts = Object.assign({ name: `test-${template}`, cwd: '.' }, options);
	await cmd.create(template, dest, opts);

	return dest;
};

exports.build = async function (cwd, options, installNodeModules = false) {
	if (!installNodeModules) {
		await mkdir(join(cwd, 'node_modules'), { recursive: true }); // ensure exists, avoid exit()
		await linkPackage('preact', cwd);
		await linkPackage('preact-render-to-string', cwd);
	} else {
		shell.exec(`npm --prefix ${cwd} i`);
	}

	let opts = Object.assign({ cwd }, argv, options);
	return await cmd.build(opts.src, opts);
};

exports.watch = function (cwd, port, host = '127.0.0.1') {
	const args = { ...argv };
	delete args.dest;
	delete args['inline-css'];
	let opts = Object.assign({ cwd, host, port, https: false }, args);
	return cmd.watch(argv.src, opts);
};
