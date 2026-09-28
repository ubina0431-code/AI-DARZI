"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const design_controller_1 = require("../controllers/design.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('customer'));
router.get('/', design_controller_1.getMyDesigns);
router.post('/', design_controller_1.createManualDesign);
router.post('/generate', design_controller_1.generateDesignFromPrompt);
router.get('/:id', design_controller_1.getDesignById);
router.put('/:id', design_controller_1.saveDesign);
router.post('/:id/refine', design_controller_1.refineDesign);
router.delete('/:id', design_controller_1.deleteDesign);
router.post('/:id/duplicate', design_controller_1.duplicateDesign);
exports.default = router;
//# sourceMappingURL=design.routes.js.map