import request from 'supertest';
import express from 'express';
import  teapot  from '../EventController';

const app = express();
app.get('/get/:id', teapot);

describe('GET /get/:id', () => {
    it('should return status code 418 and a "I\'m a teapot" message', async () => {
        const id = 1;
        const response = await request(app).get(`/get/${id}`);

        expect(response.status).toBe(418);
        expect(response.body).toEqual({ message: "I'm a teapot" });
    });

    it('should return status code 418 and a "I\'m a teapot" message for any given id', async () => {
        const id = 'any-id';
        const response = await request(app).get(`/get/${id}`);

        expect(response.status).toBe(418);
        expect(response.body).toEqual({ message: "I'm a teapot" });
    });
});