import {Request, Response} from "express";
import EventModel from "./EventModel";
import {Document} from "mongoose";
import {uploadImage} from "../../helper";

const teapot = (req:Request, res:Response) => {
    return res.status(418).json({message: "I'm a teapot"});
};

const create = (req:Request, res: Response) => {
    const {image , imageName} = req.body;
    if(!image || !imageName) {
        return res.status(400).json({message: "Image and imageName are required"});
    }
    uploadImage(image, imageName).then((img_url) => {
        req.body.image = img_url;
        EventModel.create(req.body)
            .then((data) => {
                return res.status(201).json(data);})
            .catch((err) => {
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

const update = (req:Request, res:Response) => {
    EventModel.findByIdAndUpdate(req.params.id, req.body,{new:true}).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

const getAll = (req:Request, res:Response) => {
    EventModel.find().then((data:Document[]) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

const getById = (req:Request, res:Response) => {
    EventModel.findById(req.params.id).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

const deleteById = (req:Request, res:Response) => {
    EventModel.findByIdAndDelete(req.params.id).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

export default {teapot, create, getAll, update, getById, deleteById};