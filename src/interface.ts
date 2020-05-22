export interface RootBeer {
    name: string;
    created: Date;
    user: string;
    image?: string;
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