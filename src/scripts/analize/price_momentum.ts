import PriceModel from '../../models/coin_price';
import DB from '../../utils/db';
import DbActions from '../../utils/db_actions';
import Logger from '../../utils/logger';

interface DBCoinRes {
    _id: string;
    date: Date;
    price: number;
    market_cap:number;
    volume: number;
    coin_id: string;
}


interface Control {
    [timestamp: string]: number;
}

interface ProfitAndLoss {
    [coin: string]: {
        orders: Order[];
    }
}

interface Order {
    open_timestamp: Date;
    open_price: number;
    close_timestamp: Date;
    close_price: number;
}

interface PriceDataPoint {
    timestamp: Date;
    price: number;
    market_cap: number;
    volume: number;
    [ma: string]: any;
}

interface RangeStats {
    mo_hit: DataTuple;
    pmo_hit_high: DataTuple;
    pmo_hit_low: DataTuple;
    end: DataTuple
}

type DataTuple = [number, Date];


class PriceMomentum {
    dbActions: DbActions;
    logger: Logger;
    control: Control; 

    constructor() {
        this.dbActions = new DbActions(PriceModel);
        this.logger = new Logger();
        this.control = {};
    }

    async getData() {
        const db = new DB();
        await db.connect();


        const allData = await this.dbActions.getAll();
        const groupedByCoinId = this.groupByCoin(allData.res);

        const coinStats: { [coin_id: string]: RangeStats[] } = {};

        for (let i = 110; i <= 500; i+=10) {
            const start = i;
            const end = i - 30;
    
            for (const [coin, data] of Object.entries(groupedByCoinId)) {
                coinStats[coin] = this.getStats(this.prepData(data), start, end);
            }
    
            const groupAnalysis = this.analyze(coinStats);
            console.log(`${start}->${end}`, groupAnalysis);
        }

        await db.close();
        this.logger.info('closing');
    }

    groupByCoin(allData: DBCoinRes[]) {
        const grouped: { [coin_id: string]: DBCoinRes[] } = {};

        for (const dp of allData) {
            const id = dp.coin_id;
    
            if (grouped[id]) {
                grouped[id].push(dp);
                continue;
            }

            grouped[id] = [dp];
        }

        return grouped;
    }

    prepControl(incoming: DBCoinRes[]) {
        for (const i of incoming) {
            this.control[i.date.getTime()] = i.price;
        }
    }

    prepData(incoming: DBCoinRes[]) {
        const priceData: PriceDataPoint[]= [];

        for (const i of incoming) {
            priceData.push({
                timestamp: i.date,
                price: i.price,
                market_cap: i.market_cap,
                volume: i.volume
            });
        }

        return priceData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    analyze(data: { [coin_id: string]: RangeStats[] }) {
        let moHits = 0;
        let double = 0;
        let lowBeforeHigh = 0;
        let below = 0;
        let endBelow = 0;
        let duration = 0;

        for (const cycles of Object.values(data)) {
            for (const c of cycles) {
                const moP = c.mo_hit[0];
                const moDate = c.mo_hit[1];
                const high = c.pmo_hit_high[0];
                const low = c.pmo_hit_low[0];
                const highDate = c.pmo_hit_high[1];
                const lowDate = c.pmo_hit_low[1];
                const endP = c.end[0];
                const endD = c.end[1];
    
                if (moP > 0) moHits ++;
    
                if (high !== Infinity && high >= 2 * moP) double++;
    
                if (low < moP && lowDate < highDate) lowBeforeHigh++;

                if (low < moP) below++;

                if (endP < moP) endBelow++;

                duration += (endD.getTime() - moDate.getTime());
            }
        }

        const avgDuration = ((duration / 1000) / 86400) / moHits
    
        return [moHits, below, endBelow, double, lowBeforeHigh, Math.round(avgDuration)];
    }

    getStats(preppedData: PriceDataPoint[], start: number, stop: number): RangeStats[] {
        let moHitPrice = 0;
        let moHitDate = new Date();

        let pMoHitHighP = -Infinity;
        let pMoHitHighDate = new Date();

        let pMoHitLowP = Infinity;
        let pMoHitLowDate = new Date();

        let endCycleP = 0;
        let endCycleD = new Date();

        this.movingAvg(preppedData, 30);
        this.movingAvg(preppedData, 3);

        let inCycle = false;

        const cycles: RangeStats[] = [];

        for (const d of preppedData) {
            const { price, timestamp } = d;

            const momentum = this.momentum(d.ma_3, d.ma_30);

            if (moHitPrice === 0 && momentum >= start) {
                inCycle = true;
                moHitPrice = price;
                moHitDate = timestamp;
            }

            if (inCycle && price > pMoHitHighP) {
                pMoHitHighP = price;
                pMoHitHighDate = timestamp;
            }

            if (inCycle && price < pMoHitLowP) {
                pMoHitLowP = price;
                pMoHitLowDate = timestamp;
            }

            if (inCycle && momentum <= stop) {
                endCycleP = price;
                endCycleD = timestamp;

                cycles.push({
                    mo_hit: [moHitPrice, moHitDate],
                    pmo_hit_high: [pMoHitHighP, pMoHitHighDate],
                    pmo_hit_low: [pMoHitLowP, pMoHitLowDate],
                    end: [endCycleP, endCycleD]
                });

                pMoHitHighP = -Infinity;
                pMoHitLowP = Infinity;
                moHitPrice = 0;
                inCycle = false;
            }
        }

        return cycles;
    }

    plSimulation(preppedData:PriceDataPoint[]): Order[] {
        this.movingAvg(preppedData, 30);
        this.movingAvg(preppedData, 3);

        const orders: Order[] = [];

        const order: Order = {
            open_timestamp: new Date(),
            open_price: 0,
            close_timestamp: new Date(),
            close_price: 0
        };

        for (const d of preppedData) {
            const pm = this.momentum(d.ma_3, d.ma_30);
            d.momentum = pm;

            if (pm > 120 && order.open_price === 0) {
                order.open_timestamp = d.timestamp;
                order.open_price = d.price;
            }
        }

        const lastDataPoint = preppedData[preppedData.length - 2]

        order.close_timestamp = lastDataPoint.timestamp;
        order.close_price = lastDataPoint.price;

        orders.push(order);

        return orders;
    }

    closeOrder(position: Order): Order {
        return Object.assign({}, position);
    }

    momentum(ma1: number, ma2: number): number {
        //  (1 + ((3 day moving avg - 12 day moving avg) / 12 day moving avg)) * 100
        return (1 + ((ma1 - ma2) / ma2)) * 100
    }

    movingAvg(docs: PriceDataPoint[], length: number) {
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


    compareWithControl(orders: Order[]) {
        const buyDate = orders[0].open_timestamp;
        const closeDate = orders[0].close_timestamp;
        const buyPrice = orders[0].open_price;
        const closePrice = orders[0].close_price;
        const btcPriceOnBuyDate = this.control[buyDate.getTime()];
        const btcPriceOnCloseDate = this.control[closeDate.getTime()];

        const comparison = {
            buy_date: buyDate,
            buy_price: buyPrice,
            close_price: closePrice,
            price_diff: ((closePrice - buyPrice) / buyPrice) * 100,
            buy_date_btc_price: btcPriceOnBuyDate,
            close_date_btc_price: btcPriceOnCloseDate,
            btc_price_diff: ((btcPriceOnCloseDate - btcPriceOnBuyDate) / btcPriceOnBuyDate) * 100
        }

        return comparison;
    }

}

const pm = new PriceMomentum;

pm.getData();

