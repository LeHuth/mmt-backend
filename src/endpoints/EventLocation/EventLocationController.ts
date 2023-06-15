import { Request, Response } from 'express';
import EventLocationModel from './EventLocationModel';

const create = async (req: Request, res: Response) => {
    try {
        const data = await EventLocationModel.create(req.body);
        return res.status(201).json(data);
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

export default { create, update, getAll, getById, deleteById };