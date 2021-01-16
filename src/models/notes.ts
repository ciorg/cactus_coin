import mongoose, { Schema } from 'mongoose';

const NoteSchema = new Schema({
    created: {
        type: Date,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    content: String,
    tags: [String]
});

export = mongoose.model('note', NoteSchema);
