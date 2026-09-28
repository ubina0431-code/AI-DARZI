"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const measurement_controller_1 = require("../controllers/measurement.controller");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('customer', 'tailor'));
router.get('/', measurement_controller_1.getMyMeasurements);
router.post('/ai/advisor', measurement_controller_1.adviseMeasurements);
router.post('/', measurement_controller_1.createMeasurement);
router.get('/:id', measurement_controller_1.getMeasurementById);
router.put('/:id', measurement_controller_1.updateMeasurement);
router.delete('/:id', measurement_controller_1.deleteMeasurement);
// AI measurement workflow
router.post('/ai/session', measurement_controller_1.startAIMeasurementSession);
router.post('/ai/session/:sessionId/process', upload_1.upload.array('photos', 3), measurement_controller_1.processAIMeasurement);
router.post('/ai/session/:sessionId/save', measurement_controller_1.saveMeasurementsFromSession);
exports.default = router;
//# sourceMappingURL=measurement.routes.js.map