export function formatDate(date: Date): string {
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();

    return `${formatMonth(month)}/${makeTwoDigit(day)}/${year}`;

}

function formatMonth(mon: number): string {
    let m = mon + 1;

    return makeTwoDigit(m);
}

export function makeTwoDigit(num: number): string {
    if (num < 10) return `0${num}`;

    return String(num);

}

export function toCurrency(value: number | string): string {
    return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function setDecimals(value: number | string, digits = 4): string {
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: digits }); 
}

export function currencyToNumber(value: string): number {
    return Number.parseFloat(value.replace(/\$|,/g, ''));
}

export function toUnixTime(time: number): number {
    if (`${time}`.length < 13) return time * 1000;

    return time;
}

export function isEmpty(value: any): boolean {
    if (Array.isArray(value) || typeof value === 'string') return value.length === 0;

    if(typeof value === 'number') return value === 0;

    if (Object.prototype.toString.call(value) === '[object Object]') {
        return Object.keys(value).length === 0;
    }

    return value == null;
}
