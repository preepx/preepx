const Company = require("../../../models/Company");
const Recruiter = require("../../../models/Recruiter");
const SubscriptionPlan = require("../../../models/SubscriptionPlan");
const RecruiterSubscription = require("../../../models/RecruiterSubscription");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../../common/exceptions/customErrors");

const getRecruiterContext = async (recruiterId) => {
  const recruiter = await Recruiter.findById(recruiterId).populate("companyId");
  if (!recruiter) throw new NotFoundError("Recruiter not found");
  return recruiter;
};

const assertVerifiedCompany = async (recruiterId) => {
  const recruiter = await getRecruiterContext(recruiterId);
  const companyId = recruiter.companyId?._id || recruiter.companyId;
  if (!companyId) throw new ForbiddenError("Complete company profile before this action");

  const company = await Company.findById(companyId);
  if (!company) throw new ForbiddenError("Complete company profile before this action");
  if (company.verificationStatus !== "VERIFIED") {
    throw new ForbiddenError("Company verification required. Status: " + company.verificationStatus);
  }
  return { recruiter, company };
};

const getOnboardingStatus = async (recruiterId) => {
  const recruiter = await getRecruiterContext(recruiterId);
  const company = recruiter.companyId;
  return {
    onboardingStep: recruiter.onboardingStep,
    onboardingCompleted: recruiter.onboardingCompleted,
    profileComplete: recruiter.profileComplete,
    recruiter: {
      fullName: recruiter.fullName,
      email: recruiter.email,
      designation: recruiter.designation,
      phone: recruiter.phone,
      companyName: recruiter.companyName,
      companyWebsite: recruiter.companyWebsite,
    },
    company: company
      ? {
          _id: company._id,
          name: company.name,
          website: company.website,
          logo: company.logo,
          description: company.description,
          industry: company.industry,
          companySize: company.companySize,
          linkedin: company.linkedin,
          officialEmail: company.officialEmail,
          verificationStatus: company.verificationStatus,
        }
      : null,
  };
};

const updateRecruiterProfile = async (recruiterId, data) => {
  const recruiter = await Recruiter.findById(recruiterId);
  if (!recruiter) throw new NotFoundError("Recruiter not found");

  if (data.fullName) recruiter.fullName = data.fullName;
  if (data.designation !== undefined) recruiter.designation = data.designation;
  if (data.phone !== undefined) recruiter.phone = data.phone;

  if (recruiter.onboardingStep === "profile") {
    recruiter.onboardingStep = "company";
  }
  await recruiter.save();
  return recruiter;
};

const upsertCompanyProfile = async (recruiterId, data) => {
  const recruiter = await Recruiter.findById(recruiterId);
  if (!recruiter) throw new NotFoundError("Recruiter not found");

  let company;
  if (recruiter.companyId) {
    company = await Company.findById(recruiter.companyId);
    if (!company || company.primaryRecruiterId.toString() !== recruiterId.toString()) {
      throw new ForbiddenError("Not authorized to update this company");
    }
    Object.assign(company, {
      name: data.name ?? company.name,
      website: data.website ?? company.website,
      logo: data.logo ?? company.logo,
      description: data.description ?? company.description,
      industry: data.industry ?? company.industry,
      companySize: data.companySize ?? company.companySize,
      linkedin: data.linkedin ?? company.linkedin,
      officialEmail: data.officialEmail ?? company.officialEmail,
    });
    await company.save();
  } else {
    company = await Company.create({
      name: data.name || recruiter.companyName,
      website: data.website || recruiter.companyWebsite || "",
      logo: data.logo || "",
      description: data.description || "",
      industry: data.industry || "",
      companySize: data.companySize || "",
      linkedin: data.linkedin || "",
      officialEmail: data.officialEmail || "",
      primaryRecruiterId: recruiterId,
      verificationStatus: "PENDING",
    });
    recruiter.companyId = company._id;
    recruiter.companyName = company.name;
  }

  if (recruiter.onboardingStep === "company") {
    recruiter.onboardingStep = "verification";
  }
  await recruiter.save();
  return company;
};

const submitVerification = async (recruiterId) => {
  const recruiter = await getRecruiterContext(recruiterId);
  if (!recruiter.companyId) throw new BadRequestError("Company profile required");
  const company = await Company.findById(recruiter.companyId);
  company.verificationStatus = "PENDING";
  await company.save();
  recruiter.onboardingStep = "subscription";
  await recruiter.save();
  return company;
};

const completeOnboarding = async (recruiterId, planSlug = "starter") => {
  const recruiter = await getRecruiterContext(recruiterId);
  let plan = await SubscriptionPlan.findOne({ slug: planSlug, isActive: true });
  if (!plan) {
    plan = await SubscriptionPlan.findOne({ isActive: true });
  }
  if (!plan) throw new BadRequestError("No subscription plan available");

  await RecruiterSubscription.findOneAndUpdate(
    { recruiterId },
    {
      recruiterId,
      companyId: recruiter.companyId,
      planId: plan._id,
      status: "trial",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true }
  );

  recruiter.onboardingStep = "completed";
  recruiter.onboardingCompleted = true;
  await recruiter.save();
  return { onboardingCompleted: true };
};

const assertProfileComplete = async (recruiterId) => {
  const recruiter = await getRecruiterContext(recruiterId);
  if (!recruiter.profileComplete) {
    throw new ForbiddenError("Complete your recruiter and company profile before posting jobs");
  }
  return recruiter;
};

const completeProfileForJobs = async (recruiterId, data) => {
  const { profile, company } = data;
  if (!profile?.fullName?.trim()) throw new BadRequestError("Full name is required");
  if (!profile?.designation?.trim()) throw new BadRequestError("Designation is required");
  if (!profile?.phone?.trim()) throw new BadRequestError("Phone is required");
  if (!company?.name?.trim()) throw new BadRequestError("Company name is required");
  if (!company?.description?.trim()) throw new BadRequestError("Company description is required");
  if (!company?.industry?.trim()) throw new BadRequestError("Industry is required");

  await updateRecruiterProfile(recruiterId, profile);
  await upsertCompanyProfile(recruiterId, {
    ...company,
    website: company.website || "",
    officialEmail: company.officialEmail || profile.email || "",
  });

  const recruiter = await Recruiter.findByIdAndUpdate(
    recruiterId,
    { profileComplete: true, companyName: company.name },
    { new: true }
  );

  return recruiter;
};

const seedPlansIfEmpty = async () => {
  const count = await SubscriptionPlan.countDocuments();
  if (count > 0) return;
  await SubscriptionPlan.insertMany([
    { name: "Starter", slug: "starter", priceInr: 2999, limits: { activeJobs: 3, candidateViews: 100, assessmentCredits: 20, aiMatching: true, aiInterviews: false, analytics: false } },
    { name: "Growth", slug: "growth", priceInr: 5999, limits: { activeJobs: 10, candidateViews: 500, assessmentCredits: 100, aiMatching: true, aiInterviews: true, analytics: true } },
    { name: "Pro", slug: "pro", priceInr: 11999, limits: { activeJobs: 25, candidateViews: 2000, assessmentCredits: 500, aiMatching: true, aiInterviews: true, analytics: true } },
    { name: "Enterprise", slug: "enterprise", priceInr: 0, limits: { activeJobs: 999, candidateViews: 99999, assessmentCredits: 9999, aiMatching: true, aiInterviews: true, analytics: true } },
  ]);
};

module.exports = {
  getRecruiterContext,
  assertVerifiedCompany,
  assertProfileComplete,
  getOnboardingStatus,
  updateRecruiterProfile,
  upsertCompanyProfile,
  completeProfileForJobs,
  submitVerification,
  completeOnboarding,
  seedPlansIfEmpty,
};
