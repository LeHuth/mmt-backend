import {Router} from "express";
import ReviewController from "./ReviewController";

const router = Router();


// get all reviews
router.get('/get/all', ReviewController.getReviews);

// get reviews by event id
router.get('/get/event/:id', ReviewController.getReviewsByEventId);

// get reviews by user id
router.get('/get/user/:id', ReviewController.getReviewsByUserId);

// create new review
router.post('/create', ReviewController.createReview);

// delete review
router.delete('/delete/:id', ReviewController.deleteReview);

//get my reviews for event
router.get('/my/:id', ReviewController.getMyReviewsForEvent);

//get all reviews for event
router.get('/all/:id', ReviewController.getAllReviewsForEvent);

export default router;

