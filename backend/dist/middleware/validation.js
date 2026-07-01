"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
/**
 * Basic request body validation middleware
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        const body = req.body;
        const errors = [];
        for (const [field, rules] of Object.entries(schema)) {
            const value = body[field];
            // Check if required
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            // Check types if value is provided
            if (value !== undefined && value !== null && value !== '') {
                switch (rules.type) {
                    case 'string':
                        if (typeof value !== 'string')
                            errors.push(`${field} must be a string`);
                        break;
                    case 'number':
                        if (typeof value !== 'number' && isNaN(Number(value))) {
                            errors.push(`${field} must be a numeric value`);
                        }
                        break;
                    case 'boolean':
                        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== 1 && value !== 0) {
                            errors.push(`${field} must be a boolean`);
                        }
                        break;
                    case 'array':
                        if (!Array.isArray(value))
                            errors.push(`${field} must be an array`);
                        break;
                    case 'object':
                        if (typeof value !== 'object' || Array.isArray(value))
                            errors.push(`${field} must be an object`);
                        break;
                }
            }
        }
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors
            });
        }
        next();
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validation.js.map