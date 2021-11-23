import { Request } from 'express';
const exifParser = require('exif-parser');
import Actions from '../utils/db_actions';
import CactusModel from '../models/cactus';
import crypto from 'crypto';
import { truncateCoordinates, validLat, validLon } from './lib/geo_utils';
import { formatDate, toUnixTime, isEmpty } from '../utils/useful_funcs';
import * as I from '../interfaces';

class CactusImg {
    cactus_actions: Actions;

    constructor() {
        this.cactus_actions = new Actions(CactusModel);
    }

    async create(req: Request) {
        const { user }: any = req;

        if (req.file == null || req.file?.buffer == null) {
            return {
                error: true,
                msg: 'Image was not uploaded'
            };
        }

        const parser = exifParser.create(req.file?.buffer);

        const exif: I.Exif = parser.parse();

        const [
            geoPoint,
            geoTrunc
        ] = this._getGeoData(exif.tags);

        if (geoPoint == null || geoTrunc == null) {
            return {
                error: true,
                resp: {},
                msg: 'could not get location from image'
            };
        }

        const image = exif.hasThumbnail() ? exif.getThumbnailBuffer() : req.file?.buffer;

        const cactusInfo: I.CactusInfo = {
            _id: this.createCactusKey(geoTrunc),
            created: new Date(),
            img_date: new Date(toUnixTime(exif.tags.CreateDate)),
            image,
            checked: false,
            user_id: user._id,
            geo_point: geoPoint,
            truncated_geo: geoTrunc
        }

        return this.cactus_actions.create(cactusInfo);
    }

    async forVerifcation(req: Request): Promise<I.Result> {
        const result = await this.cactus_actions
            .search(
                { checked: false },
                { created: 1, img_date: 1, image: 1, truncated_geo: 1 }
            );

        if (result.res) {
            result.res = result.res.map((r: any) => {
                return {
                    created: formatDate(r.created),
                    image: r.image.toString('base64'),
                    img_date: formatDate(r.img_date),
                    truncated_geo: r.truncated_geo,
                    id: r._id
                }
            });
        }

        return result;
    }

    async approveReject(req: Request) {
        const update = {
            checked: true,
            valid: req.params.pass === 'yes' ? true : false,
            checked_date: new Date()
        }

        return this.cactus_actions.update(req.params.id, update);
    }

    async getCacti(req: Request): Promise<I.Result> {
        const { user }: any = req;

        const result = await this.cactus_actions
            .search(
                { user_id: user._id },
                { created: 1, img_date: 1, image: 1, checked: 1, valid: 1, truncated_geo: 1 }
            );

        if (result.res) {
            result.res = result.res.map((r: any) => {
                let valid = 'n/a';

                if (r.valid === true) valid = 'yes';
                if (r.valid === false) valid = 'no';

                return {
                    created: formatDate(r.created),
                    image: r.image.toString('base64'),
                    img_date: formatDate(r.img_date),
                    truncated_geo: r.truncated_geo,
                    valid,
                    checked: r.checked === true ? 'yes' : 'no',
                    id: r._id
                }
            });
        }

        return result;
    }

    async update(req: Request) {
        // const updateFields: { name?: string, image?: string, write_up?: string } = {};

        // this._addImagePath(req, updateFields);

        // if(req.body) {
        //     if (req.body.rb_brand_name) updateFields.name = this.utils.sanitizeStrings(req.body.rb_brand_name);
        //     if (req.body.write_up) updateFields.write_up = this.utils.sanitizeStrings(req.body.write_up);
        // }

        // return this.rb_actions.update(req.params.id, updateFields);
    }

    createCactusKey(coords: number[]): string {
        const shasum = crypto.createHash('md5');
        shasum.update(coords.join('_'), 'utf8');
        return shasum.digest('hex');
    }

    _getGeoData(tags: I.ExifTags): number[][] {
        const lat = tags.GPSLatitude;
        const lon = tags.GPSLongitude;

        if (!validLat(lat) || !validLon(lon)) {
            return [];
        }

        const truncated = truncateCoordinates([lon, lat], 5);

        return [
            [lon, lat],
            truncated
        ];
    }
}

export = CactusImg;
