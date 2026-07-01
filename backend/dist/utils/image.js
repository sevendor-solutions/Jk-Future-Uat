"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullImageUrl = void 0;
const getFullImageUrl = (req, filename) => {
    if (!filename)
        return null;
    if (filename.startsWith('http'))
        return filename;
    const host = req.get('host');
    if (!host)
        return filename;
    return `${req.protocol}://${host}/uploads/${filename}`;
};
exports.getFullImageUrl = getFullImageUrl;
//# sourceMappingURL=image.js.map