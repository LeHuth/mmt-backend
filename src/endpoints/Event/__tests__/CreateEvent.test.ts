/*
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from "../../../server";
import jwt from "jsonwebtoken";
import * as process from "process";

const expect = chai.expect;
const should = chai.should();

chai.use(chaiHttp);

describe('Event Routes', () => {
    let token = '';

    // @ts-ignore
    it('should a auth token', (done) => {
        chai.request(server)
            .post('/users/user/login')
            .send({
                email: 'organizer@mail.de',
                password: 'organizer'
            }).end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            token = res.body.token;
            done();
        }).timeout(10000)
    });


    it('should create an event', (done) => {
        // decode token
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not set');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // @ts-ignore
        const userId = decoded.user.id;

        chai.request(server)
            .post('/events/create',).set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Event',
                description: 'This is a test event.',
                date: new Date(),
                time: '12:00',
                location: 'Test Location',
                category: 'TestCategory',
                tags: ['tag1', 'tag2'],
                organizer: userId,
                image: 'test-image-url',
                ticketInfo: {
                    ticketTypes: [
                        {
                            name: 'General Admission',
                        }
                    ],
                    name: 'General Admission',
                    price: 20,
                    available: 100,
                }
            })
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                done();
            });
    });

    it('should return 400 if missing required fields', (done) => {
        chai.request(server)
            .post('/events/create')
            .send({
                missing: 'required',
            })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });
});*/
