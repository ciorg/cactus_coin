import path from 'path';
import fs from 'fs-extra';
import SaveCoinData from './coin_categories';

async function go() {
    const scd = new SaveCoinData('usd', 1000);

    const res = await scd.getTopCoins();
}

async function readCategories() {
    const codeObj: { [key: string]: string } = {};

    const incoming = path.join(process.cwd(), 'categories.txt');
    const cats = path.join(process.cwd(), 'cats.txt');

    const data = fs.readJSONSync(incoming);

    const codes = fs.readFileSync(cats, 'utf8');

    const codified = prepCats(codes);

    for (const [code, full] of codified) {
        codeObj[full] = code;
    }

    fs.writeJSONSync(path.join(process.cwd(), 'crypto_cats.json'), codeObj, { spaces: 4 });

    for (const d of data) {
        const norm = prepFullCat(d);

        const code = codeObj[norm];

        if (code == null) {
            console.log(code, norm, d);
        }
    }
}

function prepCats(file: any) {
    return file.split('\n').filter((line: any) => line != null && line.length > 0)
        .map((line: string) => {
            const [code, full] = line.split('\t');

            const normalized = prepFullCat(full);

            return [code.trim(), normalized];
        });
}

function prepFullCat(catName: string): string {
    return catName.replace(/\s|\W/g, '');
}

readCategories();
