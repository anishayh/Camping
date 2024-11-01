const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');  // Import sanitizeHtml

// Define the custom extension for Joi
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) {
                    return helpers.error('string.escapeHTML', { value });
                }
                return clean;
            }
        }
    }
});

// Extend the Joi object with the escapeHTML rule
const extendedJoi = Joi.extend(extension);

// Define your schemas using the extended Joi
module.exports.campgroundSchema = extendedJoi.object({
    campground: extendedJoi.object({
        title: extendedJoi.string().required().escapeHTML(),
        price: extendedJoi.number().required().min(0),
        location: extendedJoi.string().required().escapeHTML(),
        description: extendedJoi.string().required().escapeHTML()
    }).required(),
    deleteImages: extendedJoi.array()
});

module.exports.reviewSchema = extendedJoi.object({
    review: extendedJoi.object({
        rating: extendedJoi.number().required().min(1).max(5),
        body: extendedJoi.string().required().escapeHTML()
    }).required()
});




