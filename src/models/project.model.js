import mongoose from 'mongoose'

const projectSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    status: {
        enum: ['in_progress', 'todo', 'done', 'delayed', 'cancelled'],
        default: 'todo',
        required: true,
        type: String,
    },
    deadline: {
        type: Date,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
}, { timestamps: true });