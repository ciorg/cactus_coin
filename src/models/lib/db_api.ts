const mongoose = require('mongoose');
import Configs from '../../utils/configs';
import Logger from '../../utils/logger';

// sudo docker exec -it 768a2742624a mongo

class MongooseApi {
    log: Logger;

    constructor() {
        const configs = new Configs();
        const { mongo_settings } = configs.getConfigs();

        this.log = new Logger();
    
        mongoose.connect(
            `mongodb://${mongo_settings.url}/${mongo_settings.database}`,
            {
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );

        const db = mongoose.connection;

        db.on('error', (error: Error) => { 
            this.log.error('could not connect to db', { err: error });
            process.exit(1);
         });
    }

    schema(schema: any) {
        const Schema = mongoose.Schema;

        return new Schema(schema);
    }

    model(name: string, dbSchema: any) {
        return mongoose.model(name, dbSchema);
    }
}

export = MongooseApi;
