import { type Config } from './config';
import { defaultConfig } from './default-config';

export type AnkiMeta = {
	config: Config;
};

export class ConfigLoader {
	private readonly prefix;

	constructor(prefix: string) {
		this.prefix = prefix;
	}

	async load(): Promise<Config> {
		const path = `${this.prefix}/meta.json`;

		try {
			const response = await fetch(path);
			const meta: AnkiMeta = (await response.json()) as AnkiMeta;
			console.log(`use real config: ${JSON.stringify(meta, null, '\t')}`)
			return meta.config;
		} catch (_) {
			console.log('use default config');
			return defaultConfig;
		}
	}
}
