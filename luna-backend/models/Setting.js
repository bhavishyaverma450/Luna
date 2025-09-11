const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    appLockEnabled: {
        type: Boolean,
        default: false
    },
    biometricEnabled: {
        type: Boolean,
        default: false
    },
    appAppearance: {
        type: String,
        enum: ['light', 'dark', 'automatic'],
        default: 'automatic'
    },
    hideAppIcon: {
        type: Boolean,
        default: false
    },
    notifications: {
        type: Boolean,
        default: true
    },
    darkMode: {
        type: Boolean,
        default: false
    },
    autoUpdate: {
        type: Boolean,
        default: true
    },
    dataSharing: {
        type: Boolean,
        default: false
    },
    personalizedAds: {
        type: Boolean,
        default: false
    },
    analytics: {
        type: Boolean,
        default: true
    },
    appPrivacy: { type: Boolean, default: false }
});

const Setting = mongoose.model('Setting', SettingSchema);
module.exports = Setting;