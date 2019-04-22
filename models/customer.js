const mongoose = require('mongoose');
const Joi = require('joi');

customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    isGold: {
        type: Boolean,
        default: false
    },
    phone: String
})


const Customer = mongoose.model('Custumers', customerSchema);

function validateCostumer(customer) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        isGold: Joi.bool(),
        phone: Joi.string().max(10).required()
    };

    return Joi.validate(customer, schema);
}

exports.Customer = Customer;
exports.validate = validateCostumer;
exports.customerSchema = customerSchema;