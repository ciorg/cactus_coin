const mongoose = require('mongoose');

//sudo docker exec -it 768a2742624a mongo
class MongooseApi {
    constructor(url: string) {
        mongoose.connect(
            url,
            {
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
