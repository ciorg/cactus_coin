function assignedRole(req: any) {
    if (req && req.user) {
        return req.user.role;
    }

    return undefined;   
}

function roleCheck(roles: string[]) {
    return (req: any, res: any, next: any) => {
        const role = assignedRole(req);
    
        if (roles.some((r) => r === role)) {
            next();
            return;
        }
    
        res.redirect('/home');
    }
}

export = roleCheck;