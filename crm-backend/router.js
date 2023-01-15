const Router = require('express');
const router = new Router();
const controller = require('./controller');

router.post('/client', controller.postClient);
router.get('/clients', controller.getClients);
router.get('/id', controller.getClient);
router.delete('/delete', controller.deleteClient);
router.patch('/change', controller.patchClient);

module.exports = router;
