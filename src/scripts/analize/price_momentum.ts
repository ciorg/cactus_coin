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

        const processed = this.prepData(btcData.res);
        this.plSimulation(processed);
       

        console.log(processed[processed.length - 1]);

        await db.close();
        this.logger.info('closing');
    }

    prepData(incoming: DBCoinRes[]): PriceData[] {
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

    plSimulation(preppedData:PriceData[]): void {
        this.movingAvg(preppedData, 15);
        this.movingAvg(preppedData, 3);

        let holding = 0;
        let pl = 0;
        const pDate: number[] = [];
        const sDate: number[] = [];

        for (const d of preppedData) {
            const pm = this.momentum(d.ma_3, d.ma_15);
            d.momentum = pm;

            if (pm > 105 && holding === 0) {
                holding = 100 / d.price;
                pl -= 100;
                pDate.push(d.timestamp);
            }

            if (pm < 90 && holding > 0) {
                pl += (holding * d.price);
                sDate.push(d.timestamp); 
                holding = 0;
            }
        }

        console.log(pl, holding, pDate, sDate);
    }

    momentum(ma1: number, ma2: number): number {
        //  (1 + ((3 day moving avg - 12 day moving avg) / 12 day moving avg)) * 100
        return (1 + ((ma1 - ma2) / ma2)) * 100
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

