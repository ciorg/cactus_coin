import UserModel from '../models/user';
import escapeString from 'js-string-escape';
import safe from 'safe-regex';


class Utils {
    async addUserName(objArray: any[]) {
        console.log(objArray);
        for (const i of objArray) {
            const user = await UserModel.findById(i.user);
            i.user = user.username;
        }
    }

    sanitizeRegex(search: string) {
        const escaped = escapeString(search); 

        if (safe(escaped)) {
            return escaped;
        }

        return null;
    }

    makeRegex(search: string) {
        const sanitized = this.sanitizeRegex(search);

        if (sanitized) {
            try {
                return new RegExp(sanitized, 'i');
            } catch (e) {
                return null
            }
        }

        return null;
    }

}

export = Utils;