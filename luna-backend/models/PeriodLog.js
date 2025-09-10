const mongoose = require('mongoose');

const PeriodLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    start_date: {
        type: String, // Stored as an ISO date string (YYYY-MM-DD)
        required: true, // This field is now required
    },
    end_date: {
        type: String, // Stored as an ISO date string (YYYY-MM-DD)
        required: true, // This field is also now required
    },
    symptoms: {
        type: [String],
        default: [],
    },
    notes: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('PeriodLog', PeriodLogSchema);