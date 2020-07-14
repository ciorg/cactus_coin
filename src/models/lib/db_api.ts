const mongoose = require('mongoose');
import Configs from '../../utils/configs';

// sudo docker exec -it 768a2742624a mongo

class MongooseApi {
    constructor() {
        const configs = new Configs();
        const { mongo_settings } = configs.getConfigs();
    
        mongoose.connect(
            `mongodb://${mongo_settings.url}/${mongo_settings.database}`,
            {
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
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
