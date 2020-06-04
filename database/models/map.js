const Schema = require("mongoose").Schema;

const MapSchema = new Schema(
    {
        fileName: {
            type: String,
            required: [true, "The filename is required"],
        },
        mappers: {
            type: [String],
            required: [true, "Mappers are required"],
        },
        mapFile: {
            type: Buffer,
            required: [true, "Map file is required"],
        },
        uploadDate: {
            type: Date,
            default: new Date(),
        },
        encoding: {
            type: String,
            required: true,
        },
        mimetype: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
    },
    { timestamps: {} },
);

module.exports = exports = MapSchema;
