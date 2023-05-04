/*import { connect, disconnect } from 'mongoose';
import EventModel from "../EventModel";

const testEvent = {
    title: 'Test Event',
    description: 'This is a test event.',
    date: new Date(),
    time: '12:00',
    location: 'Test Location',
    category: 'TestCategory',
    tags: ['tag1', 'tag2'],
    organizer: 'Test Organizer',
    image: 'test-image-url',
    ticketInfo: {
        ticketTypes: [
            {
                name: 'General Admission',
                price: 20,
                available: 100,
            },
        ],
    },
};

describe('EventModel', () => {
    beforeAll(async () => {
        await connect('mongodb://localhost:27017/test_database');
    });

    afterAll(async () => {
        await disconnect();
    });

    it('should create and save an event successfully', async () => {
        const event = new EventModel(testEvent);
        const savedEvent = await event.save();

        expect(savedEvent._id).toBeDefined();
        expect(savedEvent.title).toBe(testEvent.title);
        expect(savedEvent.description).toBe(testEvent.description);
        expect(savedEvent.date).toEqual(testEvent.date);
        expect(savedEvent.time).toBe(testEvent.time);
        expect(savedEvent.location).toBe(testEvent.location);
        expect(savedEvent.category).toBe(testEvent.category);
        expect(savedEvent.tags).toEqual(testEvent.tags);
        expect(savedEvent.organizer).toBe(testEvent.organizer);
        expect(savedEvent.image).toBe(testEvent.image);
        expect(savedEvent.ticketInfo).toEqual(testEvent.ticketInfo);
    });
});
*/