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



// Middleware to set completedAt when status becomes 'done'
taskSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.status) {
        update.completedAt = update.status === 'done' ? new Date() : null;
    }
    next();
});

// Also handle findOneAndUpdate
taskSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.status === 'done' && !update.completedAt) {
        this.set({ completedAt: new Date() });
    }else {
        this.set ({ completedAt: null });
    }
    next ()
})

const Task = mongoose.model('Task', taskSchema);
export default Task;