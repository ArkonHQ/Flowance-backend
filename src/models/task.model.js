import mongoose from "mongoose";
import {date} from "joi";
import * as schema from "mongoose/types/types.d.ts";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['todo', 'done', 'cancelled', 'in_progress'],
        default: 'done',
    },
    priority: {
        type: String,
        enum: [ 'low', 'medium', 'high' ],
        default: 'medium',
    },
    deadline: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    assignee: {
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
}, { timestamps: true } );

export default mongoose.model('Task', taskSchema);