import {Request, Response} from 'express';
import EventLocationModel from './EventLocationModel';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

const create = async (req: Request, res: Response) => {
    try {
        let eventLocation = new EventLocationModel({_id: uuidv4(), ...req.body});
        eventLocation = await eventLocation.save();
        return res.status(201).json(eventLocation);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return res.status(500).json({message});
    }
}

const update = async (req: Request, res: Response) => {
    try {
        const data = await EventLocationModel.findByIdAndUpdate(req.params.id, req.body, {new: true});
        return res.status(200).json(data);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return res.status(500).json({message});
    }
}

const getAll = async (req: Request, res: Response) => {
    try {
        const data = await EventLocationModel.find();
        return res.status(200).json(data);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return res.status(500).json({message});
    }
}

const getById = async (req: Request, res: Response) => {
    try {
        const data = await EventLocationModel.findById(req.params.id);
        return res.status(200).json(data);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return res.status(500).json({message});
    }
}

const deleteById = async (req: Request, res: Response) => {
    try {
        const data = await EventLocationModel.findByIdAndDelete(req.params.id);
        return res.status(200).json(data);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return res.status(500).json({message});
    }
}

const filter = async (req: Request, res: Response) => {
    try {
        const {name} = req.query;

        interface IFilter {
            name?: { $regex: string, $options: string }
        }

        const filter: IFilter = {}

        if (name) {
            filter.name = {$regex: name as string, $options: "i"};
        }
        const data = await EventLocationModel.find(filter).select('name');
        return res.status(200).json(data);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return res.status(500).json({message});
    }
}

export default {create, update, getAll, getById, deleteById, filter};