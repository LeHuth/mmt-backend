import {Request, Response} from "express";
import EventModel, {IEvent} from "./EventModel";
import {Document} from "mongoose";
import {uploadImage} from "../../helper";
import paymentController from "../Payment/PaymentController";


const teapot = (req: Request, res: Response) => {
    return res.status(418).json({message: "I'm a teapot"});
};

const create = (req: Request, res: Response) => {
    const {image, imageName} = req.body;
    if (!image || !imageName) {
        return res.status(400).json({message: "Image and imageName are required"});
    }
    uploadImage(image, imageName).then((img_url) => {
        req.body.image = img_url;
        paymentController.createProduct(req.body, req.body.organizer).then((data) => {
            req.body.stripe_id = data.account.id;
            req.body.organizer_stripe_id = data.account.id;
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
    })

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

const getAll = (req: Request, res: Response) => {
    EventModel.find().then((data: Document[]) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

const getById = (req: Request, res: Response) => {
    EventModel.findById(req.params.id).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
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
    const {title, description} = req.query;

    interface Filter {
        title?: { $regex: string, $options: string },
        description?: { $regex: string, $options: string },
        date?: { $regex: string, $options: string },
        time?: { $regex: string, $options: string },
        location?: { $regex: string, $options: string },
        category?: { $regex: string, $options: string },
        tags?: { $regex: string, $options: string },
        organizer?: { $regex: string, $options: string },
        maxParticipants?: { $regex: string, $options: string },
    }

    const filter: Filter = {};

    if (title) {
        filter.title = {$regex: title as string, $options: "i"};
    }
    if (description) {
        filter.description = {$regex: description as string, $options: "i"};
    }
    EventModel.find(filter).then((data) => {

        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });

}

export default {teapot, create, getAll, update, getById, deleteById, filter};