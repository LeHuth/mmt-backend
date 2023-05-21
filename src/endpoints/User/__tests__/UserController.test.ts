import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import { before, after, afterEach, beforeEach, describe, it } from "mocha";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../../../server";
import UserModel from "../UserModel";

chai.use(chaiHttp);

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_BAD_REQUEST = 400;

const createUser = async () => {
  return UserModel.create({
    username: "testuser",
    email: "test@test.com",
    password: "password",
    isAdmin: false,
    isOrganizer: false,
  });
};

beforeEach(async () => {
  try {
      await mongoose.connection.dropDatabase();
  } catch (error) {
      console.error(error);
      throw error;
  }
});

describe("getUser", () => {
  it("should return user if user exists", async () => {
    const user = await createUser();
    const res = await chai.request(app).get(`/user/${user._id}`);
    expect(res.status).to.equal(HTTP_STATUS_OK);
    expect(res.body).to.have.property("name", user.username);
    expect(res.body).to.have.property("email", user.email);
    expect(res.body).to.have.property("admin", user.isAdmin);
    expect(res.body).to.have.property("organizer", user.isOrganizer);
  });

  it("should return 404 if user does not exist", async () => {
    const res = await chai.request(app).get("/user/60c72b1f9f1b2c001f8e4d8e");
    expect(res.status).to.equal(HTTP_STATUS_NOT_FOUND);
  });
});

describe("registration", () => {
  it("should return 400 if username, email or password is missing", async () => {
    const res = await chai
      .request(app)
      .post("/register")
      .send({ username: "test", email: "test@test.com" });
    expect(res.status).to.equal(HTTP_STATUS_BAD_REQUEST);
  });

  it("should return 400 if email is not valid", async () => {
    const res = await chai
      .request(app)
      .post("/register")
      .send({ username: "test", email: "test", password: "password" });
    expect(res.status).to.equal(HTTP_STATUS_BAD_REQUEST);
  });
});

describe("login", () => {
  it("should return 400 if email or password is incorrect", async () => {
    const res = await chai
      .request(app)
      .post("/login")
      .send({ email: "test@test.com", password: "wrongPassword" });
    expect(res.status).to.equal(HTTP_STATUS_BAD_REQUEST);
  });

  it("should return a token if email and password are correct", async () => {
    const user = await createUser();
    const res = await chai
      .request(app)
      .post("/login")
      .send({ email: "test@test.com", password: "password" });
    expect(res.status).to.equal(HTTP_STATUS_OK);
    expect(res.body).to.have.property("token");
  });
});

describe("getUsers", () => {
  it("should return a list of users", async () => {
    await createUser();
    const res = await chai.request(app).get("/users");
    expect(res.status).to.equal(HTTP_STATUS_OK);
    expect(res.body.users).to.be.an("array");
  });
});

describe("createUser", () => {
  it("should return 400 if username, email, password, isAdmin or isOrganizer is missing", async () => {
    const res = await chai
      .request(app)
      .post("/users")
      .send({ username: "test", email: "test@test.com" });
    expect(res.status).to.equal(HTTP_STATUS_BAD_REQUEST);
  });
});

describe("updateUser", () => {
  it("should return 400 if username, email, password, isAdmin or isOrganizer is missing", async () => {
    const user = await createUser();
    const res = await chai
      .request(app)
      .put(`/users/${user._id}`)
      .send({ username: "newtestuser", email: "newtest@test.com" });
    expect(res.status).to.equal(HTTP_STATUS_BAD_REQUEST);
  });
});

describe("deleteUser", () => {
  it("should return 404 if user does not exist", async () => {
    const res = await chai
      .request(app)
      .delete("/users/60c72b1f9f1b2c001f8e4d8e");
    expect(res.status).to.equal(HTTP_STATUS_NOT_FOUND);
  });

  it("should return 200 if user is successfully deleted", async () => {
    const user = await createUser();
    const res = await chai.request(app).delete(`/users/${user._id}`);
    expect(res.status).to.equal(HTTP_STATUS_OK);
  });
});