import PriceModel from '../../models/coin_price';
import DB from '../../utils/db';
import DbActions from '../../utils/db_actions';
import Logger from '../../utils/logger';
// extract data
// sort by date
// calculate momentum
// add price action
// calculate profit / loss

interface DBCoinRes {
    _id: string;
    date: Date;
    price: number;
    market_cap:number;
    volume: number;
    coin_id: string;
}

interface Response {
    res: DBCoinRes[]
}

interface PriceData {
    timestamp: number;
    price: number;
    market_cap: number;
    volume: number;
    [ma_key: string]: number;
}


class PriceMomentum {
    dbActions: DbActions;
    logger: Logger;

    constructor() {
        this.dbActions = new DbActions(PriceModel);
        this.logger = new Logger();
    }

    async getData() {
        const db = new DB();
        await db.connect();


        const btcData: Response = await this.dbActions.search('coin_id', 'bitcoin');

        const processed = this.prepData(btcData.res.slice(0, 11));

        this.movingAvg(processed, 10);

        for (const p of processed) {
            console.log(p.price);
        }

        console.log(processed);

        await db.close();
        this.logger.info('closing');
    }

    prepData(incoming: DBCoinRes[]): PriceData[] {
        /*
        gather by coin
        {
            bitcoin: [
                [timestamp, price, marketcap, volume]
            ]
        }
        */

        const priceData: PriceData[] = [];

        for (const i of incoming) {
            priceData.push({
                timestamp: i.date.getTime()/1000,
                price: i.price,
                market_cap: i.market_cap,
                volume: i.volume
            });
        }

        return priceData.sort((a, b) => a.timestamp - b.timestamp);
    }

    calculatePL() {
        /*
            [timestamp, price, marketcap, volume, 10day, 2day, delta/ 10day, buysignal]
        */
    }

    movingAvg(docs: PriceData[], length: number) {
        const ma: number[] = [];

        for (let i = 0; i < docs.length; i++) {
            // add current price
            ma.push(docs[i].price);

            // no need to sum if less than wanted ma
            if (i < length - 1) continue;

            docs[i][`ma_${length}`] = (this.sumArray(ma)) / length;
            
            // remove earliest item
            ma.shift();
        }
    }

    sumArray(nArray: number[]): number {
        return nArray.reduce((total, n) => total += n, 0);
    }


}

const pm = new PriceMomentum;

pm.getData();

