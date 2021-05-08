import express from 'express';
import { CODE } from '@local/shared';
import * as auth from '../auth';

const router = express.Router();

router.post('/hours', (req, res) => {
    // TODO save new hours.md file
})

module.exports = router;