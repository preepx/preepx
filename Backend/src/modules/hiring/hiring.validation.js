const Joi = require("joi");

const createJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(20).required(),
  role: Joi.string().trim().min(2).max(100).required(),
  department: Joi.string().allow("").max(100),
  employmentType: Joi.string().valid("full_time", "part_time", "contract", "internship"),
  experienceMin: Joi.number().min(0).max(50),
  experienceMax: Joi.number().min(0).max(50),
  location: Joi.string().max(200),
  workMode: Joi.string().valid("remote", "hybrid", "on_site"),
  salaryMin: Joi.number().min(0),
  salaryMax: Joi.number().min(0),
  requiredSkills: Joi.array().items(Joi.string().trim()).max(30),
  preferredSkills: Joi.array().items(Joi.string().trim()).max(30),
  skills: Joi.array().items(Joi.string().trim()).max(30),
  education: Joi.string().allow("").max(500),
  responsibilities: Joi.string().allow("").max(5000),
  requirements: Joi.string().allow("").max(5000),
  assessmentRequired: Joi.boolean(),
  aiInterviewRequired: Joi.boolean(),
  applicationDeadline: Joi.date().iso(),
  status: Joi.string().valid("draft", "published", "paused", "closed", "archived", "open"),
  assessmentConfig: Joi.object({
    mcqCount: Joi.number().min(5).max(30),
    codingCount: Joi.number().min(1).max(5),
    useCustomQuestions: Joi.boolean(),
    customMcqQuestions: Joi.array(),
    customCodingQuestions: Joi.array(),
  }),
});

const updateJobSchema = createJobSchema.fork(["title", "description", "role"], (s) => s.optional());

const recruiterProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100),
  designation: Joi.string().allow("").max(100),
  phone: Joi.string().allow("").max(20),
});

const companyProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  website: Joi.string().allow("").max(500),
  description: Joi.string().allow("").max(2000),
  industry: Joi.string().allow("").max(100),
  companySize: Joi.string().allow("").max(50),
  linkedin: Joi.string().allow("").max(500),
  officialEmail: Joi.string().email().allow(""),
});

const pipelineMoveSchema = Joi.object({
  status: Joi.string().required(),
  note: Joi.string().allow("").max(500),
});

const scheduleInterviewSchema = Joi.object({
  applicationId: Joi.string().required(),
  scheduledAt: Joi.date().iso().required(),
  interviewType: Joi.string().valid("video", "phone", "in_person", "ai"),
  meetingLink: Joi.string().uri().allow(""),
  notes: Joi.string().allow("").max(1000),
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details.map((d) => d.message).join(", ") });
  }
  req.body = value;
  next();
};

module.exports = {
  validateCreateJob: validate(createJobSchema),
  validateUpdateJob: validate(updateJobSchema),
  validateRecruiterProfile: validate(recruiterProfileSchema),
  validateCompanyProfile: validate(companyProfileSchema),
  validatePipelineMove: validate(pipelineMoveSchema),
  validateScheduleInterview: validate(scheduleInterviewSchema),
};
