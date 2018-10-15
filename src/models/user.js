'use strict';

const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userModel = new Schema({
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    likes: [{ type: ObjectId, ref: 'User' }]
});


userModel.statics.findAndFormatUser = async function (id) {

    try {
        const user = await this.aggregate([
            { $match: { _id: id } },
            {
                $project: {
                    username: 1,
                    noOfLikes: {
                        $size: '$likes'
                    }
                }
            }
        ]).exec();
        if (user.length === 0) {
            throw new Error('User doesnt exist');
        }

        return user[0];
    }
    catch (error) {
        throw new Error(error);
    }
};

userModel.statics.getMostLiked = async function (id) {

    try {
        const listMostLiked = await this.aggregate([{
            $project: {
                _id: 1,
                username: 1,
                didLike: {
                    $in: [id, '$likes']
                },
                noOfLikes: {
                    $size: '$likes'
                }
            }
        },
        {
            $sort: { 'numberOfItems': -1 }
        }
        ]).exec();
        return listMostLiked;
    }
    catch (error) {
        throw new Error(error);
    }

};

module.exports = Mongoose.model('User', userModel, 'users');
