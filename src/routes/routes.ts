import express from 'express';

import portal from './portal';
import user from './user';
import rb from './rb';

const router = express.Router();

router.use(portal);
router.use(user);
router.use(rb);

 export = router;
