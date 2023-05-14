import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { before, describe, it } from 'mocha';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../../server';
import UserModel from '../../User/UserModel';

chai.use(chaiHttp);

describe('getUser', () => {
  const mongod = new MongoMemoryServer();

  before(async () => {
    const uri = await mongod.getUri();
    await mongoose.connect(uri);
  });

  it('should return user if user exists', async () => {
    const user = await UserModel.create({ username: 'testuser', email: 'test@test.com', password: 'password', isAdmin: false, isOrganizer: false });
    const res = await chai.request(app).get(`/user/${user._id}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('name', user.username);
    expect(res.body).to.have.property('email', user.email);
    expect(res.body).to.have.property('admin', user.isAdmin);
    expect(res.body).to.have.property('organizer', user.isOrganizer);
  });

  it('should return 404 if user does not exist', async () => {
    const res = await chai.request(app).get('/user/60c72b1f9f1b2c001f8e4d8e');
    expect(res.status).to.equal(404);
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  });
});