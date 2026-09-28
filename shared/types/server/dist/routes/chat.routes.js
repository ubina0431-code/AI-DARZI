"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/conversations', chat_controller_1.getMyConversations);
router.get('/order/:orderId', chat_controller_1.getConversation);
router.get('/:conversationId/messages', chat_controller_1.getMessages);
router.post('/:conversationId/messages', chat_controller_1.sendMessage);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map