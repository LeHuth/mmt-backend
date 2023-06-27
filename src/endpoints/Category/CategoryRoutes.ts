import {Router} from 'express';
import CategoryController from './CategoryController';

const router = Router();


router.get('/get/all', CategoryController.getAllCategories);

router.get('/get/active/', CategoryController.getActiveCategories);
export default router;
