"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('customer'), review_controller_1.createReview);
router.get('/tailor/:tailorId', review_controller_1.getTailorReviews);
router.put('/:id/respond', auth_1.authenticate, (0, auth_1.authorize)('tailor'), review_controller_1.respondToReview);
exports.default = router;
//# sourceMappingURL=review.routes.js.map