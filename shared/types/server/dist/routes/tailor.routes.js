"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tailor_controller_1 = require("../controllers/tailor.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', tailor_controller_1.getTailors);
router.get('/cities', tailor_controller_1.getCities);
router.get('/me', auth_1.authenticate, (0, auth_1.authorize)('tailor'), tailor_controller_1.getMyTailorProfile);
router.get('/:id', tailor_controller_1.getTailorById);
router.put('/profile', auth_1.authenticate, (0, auth_1.authorize)('tailor'), tailor_controller_1.updateTailorProfile);
router.post('/:id/favorite', auth_1.authenticate, (0, auth_1.authorize)('customer'), tailor_controller_1.toggleFavorite);
exports.default = router;
//# sourceMappingURL=tailor.routes.js.map