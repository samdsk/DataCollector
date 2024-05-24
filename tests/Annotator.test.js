const { connect, close, clearDatabase } = require("./db_handler");
const mongoose = require("mongoose");

const { Annotator } = require("../schema/Annotator");
const { Role } = require("../schema/Role");
const { Background } = require("../schema/Background");
const { Domain } = require("../schema/Domain");
const { JobPost } = require("../schema/JobPost");
const { Label } = require("../schema/Label");
const { Annotation } = require("../schema/Annotation");
const { Token } = require("../schema/Token");

const delete_list = ["annotators"];

const role_1 = {
  role: "Role_1",
  reliability_score: 3,
};

const background_1 = {
  background: "Background_1",
};

const annotator_1 = {
  email: "asd@asd.com",
};

const domain_1 = {
  domain: "Domain_1",
};

const label_1 = {
  label: "Label_1",
};

const job_1 = {
  _id: "test_1",
  job_type: "JobType_1",
  title: "Title_1",
  company: "Company_1",
  location: "Location_1",
  description: "Description_1",
};

const token_1 = {
  token: "Token_1",
};

var role = null;
var background = null;
var domain = null;
var job = null;
var label = null;

describe("Annotator Schema", () => {
  beforeAll(async () => {
    await connect();
    background = await Background.create(background_1);
    role = await Role.create(role_1);
    domain = await Domain.create(domain_1);
    label = await Label.create(label_1);
    job = await JobPost.create(job_1);
  });

  afterAll(async () => {
    await close();
  });

  afterEach(async () => {
    await clearDatabase(delete_list);
  });

  test("Valid Annotator", async () => {
    const annotator = {
      role: role._id,
      email: "name@example.com",
      background: background._id,
    };
    await expect(Annotator.create(annotator)).resolves.not.toThrow();
  });
  test("Annotator delete and cascade to Annotation and Token", async () => {
    const annotator = {
      role: role._id,
      email: "name@example.com",
      background: background._id,
    };

    const res_annotator = await Annotator.create(annotator);

    const annotation_1 = {
      source: job._id,
      annotator: res_annotator._id,
      label: label._id,
      reason: "Reason_1",
      domain: domain._id,
      role: role._id,
      background: background._id,
    };

    const annotation = await Annotation.create(annotation_1);

    token_1.annotation = annotation._id;

    const token = await Token.create(token_1);

    await expect(
      Annotator.deleteOne({ _id: res_annotator._id })
    ).resolves.not.toThrow();

    expect(await Annotator.findById(res_annotator._id)).toBe(null);
    expect(await Annotation.findById(annotation._id)).toBe(null);
    expect(await Token.findById(token._id)).toBe(null);
  });

  test("Cant delete with out an ID", async () => {
    await expect(Annotator.deleteOne({ role: "Anything" })).rejects.toThrow(
      "usage: Annotator.deleteOne({_id:id})"
    );
  });

  test("Invalid role id", async () => {
    const annotator = {
      role: new mongoose.Types.ObjectId(),
      email: "name@example.com",
      background: background._id,
    };
    await expect(Annotator.create(annotator)).rejects.toThrow(
      "Annotator validation failed: role: Invalid Role"
    );
  });

  test("Invalid background id", async () => {
    const annotator = {
      role: role._id,
      email: "name@example.com",
      background: new mongoose.Types.ObjectId(),
    };
    await expect(Annotator.create(annotator)).rejects.toThrow(
      "Annotator validation failed: background: Invalid Background"
    );
  });

  test("Invalid email", async () => {
    const annotator = {
      role: role._id,
      email: "nameatexample.com",
      background: background._id,
    };
    await expect(Annotator.create(annotator)).rejects.toThrow(
      "Annotator validation failed: email: Invalid Email"
    );
  });
});
