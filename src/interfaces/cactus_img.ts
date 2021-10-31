export interface CactusInfo {
    _id: string;
    created: Date;
    img_date: Date;
    image: Buffer;
    user_id: string;
    valid?: string;
    checked: boolean;
    geo_point: number[];
    truncated_geo: number[];
}