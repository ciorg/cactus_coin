import jsYaml from 'js-yaml';
import path from 'path';
import fs from 'fs';
import * as I from '../interface';

class Configs {
    configs: any;
    constructor() {
        const file = fs.readFileSync(path.join(process.cwd(), 'config.yaml'), 'utf8');
        this.configs = jsYaml.safeLoad(file);
    }

    getConfigs(): I.ConfigSettings {
            return this.configs;
    }
}

export = Configs;