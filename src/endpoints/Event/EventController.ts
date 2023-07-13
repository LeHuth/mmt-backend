import {Request, Response} from "express";
import EventModel from "./EventModel";
import {uploadImage} from "../../helper";


const teapot = (req: Request, res: Response) => {
    return res.status(418).json({message: "I'm a teapot"});
};

const create = (req: Request, res: Response) => {
    console.log('start request')
    const {image, imageName, images} = req.body;
    if (!images || images.length === 0) {
        return res.status(400).json({message: "Image and imageName are required"});
    }
    console.log('images present')
    uploadImage(image, imageName, images).then((img_urls_array) => {
        console.log('images uploaded')
        req.body.images = img_urls_array;
        req.body.happenings = req.body.happenings.map((happening: any) => {
            happening.place = happening.place._id;
            return happening;
        });
        console.log('happenings mapped')
        EventModel.create(req.body)
            .then((data) => {
                return res.status(201).json(data);
            })
            .catch((err) => {
                return res.status(500).json({message: err.message});
            });
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    })

    /*uploadImage(image, imageName).then((img_url) => {
        req.body.image = img_url;
        paymentController.createProduct(req.body, req.body.organizer).then((stripe_data) => {
            req.body.stripe_id = stripe_data.product.id;
            req.body.organizer_stripe_id = stripe_data.account.id;
            EventModel.create(req.body)
                .then((data) => {
                    return res.status(201).json(data);
                })
                .catch((err) => {
                    return res.status(500).json({message: err.message});
                });
        }).catch((err) => {
            return res.status(500).json({message: err.message});
        });
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    })*/

    /* TODO: Reimplement image upload
    uploadImage(req.body.image, req.body.imageName)
        .then((img_url) => {
            req.body.image = img_url;

        }).catch((err) => {
            return res.status(500).json({message: err.message});
        });*/
}

const update = (req: Request, res: Response) => {
    EventModel.findByIdAndUpdate(req.params.id, req.body, {new: true}).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

const getAll = async (req: Request, res: Response) => {
    const allEvents = await EventModel.find().populate({
        path: 'happenings.place',
        model: 'EventLocation',
        localField: 'happenings.place',
        foreignField: '_id'
    }).populate({
        path: 'tags',
        model: 'TagModel',
        localField: 'tags',
        foreignField: '_id',
    }).populate({
        path: 'category',
        model: 'Category',
        localField: 'category',
        foreignField: '_id',
    });

    res.status(200).json(allEvents);
}

const getById = async (req: Request, res: Response) => {
    const event = await EventModel.findById(req.params.id).populate({
        path: 'happenings.place',
        model: 'EventLocation',
        localField: 'happenings.place',
        foreignField: '_id'
    }).populate({
        path: 'tags',
        model: 'TagModel',
        localField: 'tags',
        foreignField: '_id',
    }).populate({
        path: 'category',
        model: 'Category',
        localField: 'category',
        foreignField: '_id',
    });

    res.status(200).json(event);
    /*EventModel.findById(req.params.id).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });*/
}

const deleteById = (req: Request, res: Response) => {
    EventModel.findByIdAndDelete(req.params.id).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

const filter = (req: Request, res: Response) => {
    //get query params
    const {name, description} = req.query;

    interface Filter {
        name?: { $regex: string, $options: string },/*
        description?: { $regex: string, $options: string },
        date?: { $regex: string, $options: string },
        time?: { $regex: string, $options: string },
        location?: { $regex: string, $options: string },
        category?: { $regex: string, $options: string },
        tags?: { $regex: string, $options: string },
        organizer?: { $regex: string, $options: string },
        maxParticipants?: { $regex: string, $options: string },*/
    }

    const filter: Filter = {};

    if (name) {
        filter.name = {$regex: name as string, $options: "i"};
    }

    console.log(filter);
    EventModel.find(filter).select('name').then((data) => {

        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });

}

const getByCategory = (req: Request, res: Response) => {
    EventModel.find({category: req.params.id}).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

export default {teapot, create, getAll, update, getById, deleteById, filter, getByCategory};