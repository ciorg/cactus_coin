import express, { Request, Response } from 'express';
import * as fs from 'fs-extra';
import path from 'path';
import CryptoData from '../controllers/crypto_data'
import * as I from '../interface';

const router = express.Router();
const cryptoData = new CryptoData();

router.get('/crypto/markets',
    async (req: Request, res: Response) => {
        const data = await cryptoData.getData('market');

        if (data.error) {
            return res.redirect('/error');
        }

        res.render('pages/public/crypto_data/markets', {
            user: req.user,
            data: data.res
        });
    }
);

router.get('/crypto/coin/:id',
    async(req: Request, res: Response) => {
        const id = req.params.id;
    
        // const data = await cryptoData.coin(id, 30);

        const tData = fs.readJsonSync(path.join(process.cwd(), 'tests', 'fixtures', 'coin_resp.json'));

        var options = {
            series: [{
            name: 'XYZ MOTORS',
            data: tData.price_history
          }],
            chart: {
            type: 'area',
            stacked: false,
            height: 350,
            zoom: {
              type: 'x',
              enabled: true,
              autoScaleYaxis: true
            },
            toolbar: {
              autoSelected: 'zoom'
            }
          },
          dataLabels: {
            enabled: false
          },
          markers: {
            size: 0,
          },
          title: {
            text: 'Stock Price Movement',
            align: 'left'
          },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              inverseColors: false,
              opacityFrom: 0.5,
              opacityTo: 0,
              stops: [0, 90, 100]
            },
          },
          yaxis: {
            labels: {
              formatter: function (val: any) {
                return (val / 1000000).toFixed(0);
              },
            },
            title: {
              text: 'Price'
            },
          },
          xaxis: {
            type: 'datetime',
          },
          tooltip: {
            shared: false,
            y: {
              formatter: function (val:any) {
                return (val / 1000000).toFixed(0)
              }
            }
          }
          };

        const data: I.Result = {
            res: {
                market_data: tData.market_data,
                chart_options: options
            }
        };

        if (data.error) {
            return res.redirect('/error');
        }

        res.render('pages/public/crypto_data/coin', {
            user: req.user,
            market_data: data.res.market_data,
            chart_options: data.res.chart_options
        });
    }
);

export = router;
