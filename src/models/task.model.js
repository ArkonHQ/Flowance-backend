import mongoose from "mongoose";


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
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true,
    },
    completedAt: {
        type: Date,
        default: null
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
}, { timestamps: true } );



taskSchema.pre('findOneAndUpdate', function () {
    const update = this.getUpdate();
    if (update.status) {
        update.completedAt = update.status === 'done' ? new Date() : null;
    }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;