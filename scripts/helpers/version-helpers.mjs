export function foundryCoreVersion() {
	let version = game.version.split(".");
	return {major: parseInt(version[0]), minor: version[1]};
}
