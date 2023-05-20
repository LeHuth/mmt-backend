import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../../server";
import jwt from "jsonwebtoken";
import * as process from "process";

const expect = chai.expect;
const should = chai.should();

chai.use(chaiHttp);

describe('Event Routes', () => {
    let userID = '';

    it('should create an user', (done) => {
        chai.request(server)
            .post('/users/user/registration')
            .send({
                username: 'test',
                email: 'create@user.test',
                password: 'test',
                isAdmin: false,
                isOrganizer: false
            }).end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            userID = res.body._id;
            done();
        })
    });

    it('should get user by id', (done) => {
        chai.request(server)
            .get(`/users/user/get/${userID}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res.body._id).to.equal(userID);
                done();
            });
    });

    it('should delete user by id', (done) => {
        chai.request(server)
            .delete(`/users/user/delete/${userID}`)
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    });

});
