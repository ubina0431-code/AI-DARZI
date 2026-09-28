"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManualDesign = exports.duplicateDesign = exports.deleteDesign = exports.saveDesign = exports.refineDesign = exports.generateDesignFromPrompt = exports.getDesignById = exports.getMyDesigns = void 0;
const Design_1 = require("../models/Design");
const DesignVersion_1 = require("../models/DesignVersion");
const AIDesignGeneration_1 = require("../models/AIDesignGeneration");
const gemini_service_1 = require("../ai/gemini.service");
const getMyDesigns = async (req, res) => {
    try {
        const { page = '1', limit = '12', status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const filter = { customerId: req.user.id };
        if (status)
            filter.status = status;
        const [designs, total] = await Promise.all([
            Design_1.Design.find(filter).sort({ updatedAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
            Design_1.Design.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: {
                designs,
                pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch designs.' });
    }
};
exports.getMyDesigns = getMyDesigns;
const getDesignById = async (req, res) => {
    try {
        const design = await Design_1.Design.findOne({ _id: req.params.id, customerId: req.user.id });
        if (!design) {
            res.status(404).json({ success: false, message: 'Design not found.' });
            return;
        }
        const versions = await DesignVersion_1.DesignVersion.find({ designId: design._id }).sort({ version: -1 }).limit(10);
        res.json({ success: true, data: { design, versions } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch design.' });
    }
};
exports.getDesignById = getDesignById;
const generateDesignFromPrompt = async (req, res) => {
    try {
        const { prompt, title, context } = req.body;
        if (!prompt) {
            res.status(400).json({ success: false, message: 'Prompt is required.' });
            return;
        }
        const startTime = Date.now();
        const result = await gemini_service_1.geminiService.generateDesignFromPrompt(prompt, context);
        const processingTime = Date.now() - startTime;
        // Save AI generation record
        const aiGen = await AIDesignGeneration_1.AIDesignGeneration.create({
            customerId: req.user.id,
            prompt,
            structuredSpec: result.structuredSpec,
            model: result.model,
            tokensUsed: result.tokensUsed,
            processingTimeMs: processingTime,
            success: true,
        });
        // Create design
        const design = await Design_1.Design.create({
            customerId: req.user.id,
            title: title || result.summary || 'My Design',
            prompt,
            specification: result.structuredSpec,
            aiGenerationId: aiGen._id,
            status: 'draft',
            currentVersion: 1,
        });
        // Update AI gen with design ID
        await AIDesignGeneration_1.AIDesignGeneration.findByIdAndUpdate(aiGen._id, { designId: design._id });
        // Save first version
        await DesignVersion_1.DesignVersion.create({
            designId: design._id,
            customerId: req.user.id,
            version: 1,
            specification: result.structuredSpec,
            prompt,
            aiGenerationId: aiGen._id,
            changeDescription: 'Initial design created from prompt',
        });
        res.status(201).json({
            success: true,
            message: 'Design created successfully!',
            data: {
                design,
                summary: result.summary,
                suggestions: result.suggestions,
                aiAssisted: result.model !== 'fallback',
            },
        });
    }
    catch (error) {
        console.error('Design generation error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate design.' });
    }
};
exports.generateDesignFromPrompt = generateDesignFromPrompt;
const refineDesign = async (req, res) => {
    try {
        const { instruction } = req.body;
        const design = await Design_1.Design.findOne({ _id: req.params.id, customerId: req.user.id });
        if (!design) {
            res.status(404).json({ success: false, message: 'Design not found.' });
            return;
        }
        const result = await gemini_service_1.geminiService.refineDesign(design.specification, instruction);
        const newVersion = design.currentVersion + 1;
        // Save new version
        await DesignVersion_1.DesignVersion.create({
            designId: design._id,
            customerId: req.user.id,
            version: newVersion,
            specification: result.updatedSpec,
            editInstruction: instruction,
            changeDescription: result.changeDescription,
        });
        // Update main design
        design.specification = result.updatedSpec;
        design.currentVersion = newVersion;
        await design.save();
        res.json({
            success: true,
            message: 'Design updated.',
            data: {
                design,
                changeDescription: result.changeDescription,
                suggestions: result.suggestions,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to refine design.' });
    }
};
exports.refineDesign = refineDesign;
const saveDesign = async (req, res) => {
    try {
        const { title, specification, status } = req.body;
        const design = await Design_1.Design.findOneAndUpdate({ _id: req.params.id, customerId: req.user.id }, { title, specification, status: status || 'saved' }, { new: true, runValidators: true });
        if (!design) {
            res.status(404).json({ success: false, message: 'Design not found.' });
            return;
        }
        res.json({ success: true, message: 'Design saved.', data: design });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save design.' });
    }
};
exports.saveDesign = saveDesign;
const deleteDesign = async (req, res) => {
    try {
        const design = await Design_1.Design.findOneAndDelete({ _id: req.params.id, customerId: req.user.id });
        if (!design) {
            res.status(404).json({ success: false, message: 'Design not found.' });
            return;
        }
        await DesignVersion_1.DesignVersion.deleteMany({ designId: req.params.id });
        res.json({ success: true, message: 'Design deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete design.' });
    }
};
exports.deleteDesign = deleteDesign;
const duplicateDesign = async (req, res) => {
    try {
        const original = await Design_1.Design.findOne({ _id: req.params.id, customerId: req.user.id });
        if (!original) {
            res.status(404).json({ success: false, message: 'Design not found.' });
            return;
        }
        const copy = await Design_1.Design.create({
            customerId: req.user.id,
            title: `${original.title} (Copy)`,
            specification: original.specification,
            tags: original.tags,
            status: 'draft',
            currentVersion: 1,
        });
        res.status(201).json({ success: true, message: 'Design duplicated.', data: copy });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to duplicate design.' });
    }
};
exports.duplicateDesign = duplicateDesign;
const createManualDesign = async (req, res) => {
    try {
        const { title, specification, tags } = req.body;
        const design = await Design_1.Design.create({
            customerId: req.user.id,
            title: title || 'My Design',
            specification: specification || {},
            tags: tags || [],
            status: 'draft',
            currentVersion: 1,
        });
        await DesignVersion_1.DesignVersion.create({
            designId: design._id,
            customerId: req.user.id,
            version: 1,
            specification: design.specification,
            changeDescription: 'Design created manually',
        });
        res.status(201).json({ success: true, data: design });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create design.' });
    }
};
exports.createManualDesign = createManualDesign;
//# sourceMappingURL=design.controller.js.map