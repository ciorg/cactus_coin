export interface RootBeer {
    _id: string;
    name: string;
    created: Date;
    user: string;
    image?: string;
    rating?: number;
    rank?: number;
    popular?: number;
}

export interface User {
    username: string;
    password: string;
    role: string;
    registered: Date;
    active: boolean;
    _id: string;
}

export interface Result {
    res: any;
    error?: boolean;
}

export interface Rating {
    rb_id: string;
    created: Date;
    user: string;
    branding: number;
    after_taste: number;
    aroma: number;
    bite: number;
    carbonation: number;
    flavor: number;
    smoothness: number;
    sweetness: number;
    total: number;
}