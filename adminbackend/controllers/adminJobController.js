const Job = require("../models/Job");

// @desc    Get all third party admin jobs
const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isThirdParty: true }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a third party admin job
const createAdminJob = async (req, res) => {
  try {
    const {
      title,
      externalCompanyName,
      externalCompanyLogo,
      applyLink,
      description,
      skills,
      employmentType,
      experienceMin,
      experienceMax,
      location,
      workMode,
      salaryMin,
      salaryMax
    } = req.body;

    const newJob = await Job.create({
      isThirdParty: true,
      status: "published",
      title,
      role: title,
      externalCompanyName,
      externalCompanyLogo,
      applyLink,
      description,
      skills,
      requiredSkills: skills,
      employmentType,
      experienceMin,
      experienceMax,
      location,
      workMode,
      salaryMin,
      salaryMax,
      assessmentRequired: false,
      aiInterviewRequired: false
    });

    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a third party admin job
const updateAdminJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, isThirdParty: true },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a third party admin job
const deleteAdminJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, isThirdParty: true });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Fetch and save real jobs from third party platforms based on a keyword
const fetchAIJobs = async (req, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ 
        message: "API Key missing! Please create a free account on RapidAPI, subscribe to JSearch API, and add RAPIDAPI_KEY to your .env file." 
      });
    }

    // Using JSearch (Google Jobs) API via RapidAPI
    // Since the free API only returns page 1 (cursor-based pagination is hard without state),
    // we will randomly pick a country every time you click "Fetch Jobs" to get new jobs from around the world!
    // By default, we set country to India ('in') to guarantee high job volume.
    // If the keyword contains 'remote', we can optionally add remote_jobs_only
    const isRemote = keyword.toLowerCase().includes('remote');
    
    let apiUrl = `https://jsearch.p.rapidapi.com/search-v2?query=${encodeURIComponent(keyword)}&num_pages=1&country=in`;
    
    if (isRemote) {
      apiUrl += `&remote_jobs_only=true`;
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    });
    
    const data = await response.json();
    console.log("RAPIDAPI RESPONSE:", data);

    if (data.message && !data.data) {
      // RapidAPI error (e.g., "You are not subscribed to this API")
      return res.status(400).json({ message: `API Error: ${data.message}` });
    }

    if (!data || !data.data || !data.data.jobs || data.data.jobs.length === 0) {
      return res.status(404).json({ message: `No jobs found for "${keyword}"` });
    }

    // Get all jobs returned by the API (usually 10-15 per page)
    const fetchedJobs = data.data.jobs;

    const jobsToSave = fetchedJobs.map(job => {
      // Strip HTML tags from description for clean text
      const cleanDescription = (job.job_description || "").replace(/(<([^>]+)>)/gi, "").substring(0, 1500);
      
      let employmentType = "full_time";
      const jType = (job.job_employment_type || "").toLowerCase();
      if (jType.includes("contract")) employmentType = "contract";
      if (jType.includes("part")) employmentType = "part_time";
      if (jType.includes("intern")) employmentType = "internship";

      let workMode = "on_site";
      if (job.job_is_remote) {
        workMode = "remote";
      } else if ((job.job_city && job.job_city.toLowerCase().includes("hybrid")) || (job.job_title && job.job_title.toLowerCase().includes("hybrid"))) {
        workMode = "hybrid";
      }

      const locationStr = [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ");

      let expMin = 0;
      let expMax = 0;
      if (job.job_required_experience && typeof job.job_required_experience.required_experience_in_months === 'number') {
        const months = job.job_required_experience.required_experience_in_months;
        expMin = Math.floor(months / 12);
        expMax = expMin + 2; // Approximate max
      } else {
        // Fallback: Extract from description using regex
        const expMatchRange = cleanDescription.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*years?/i);
        const expMatchSingle = cleanDescription.match(/(\d+)\+?\s*years?/i);
        
        if (expMatchRange) {
          expMin = parseInt(expMatchRange[1], 10);
          expMax = parseInt(expMatchRange[2], 10);
        } else if (expMatchSingle) {
          expMin = parseInt(expMatchSingle[1], 10);
          expMax = expMin + 2;
        }
      }

      // Sanity check
      if (expMin > 20) expMin = 0;
      if (expMax > 25) expMax = 0;

      return {
        title: job.job_title || keyword,
        externalCompanyName: job.employer_name || "Unknown Company",
        externalCompanyLogo: job.employer_logo || "",
        applyLink: job.job_apply_link || job.job_google_link || "",
        description: cleanDescription,
        skills: [], // JSearch doesn't typically provide tags array, so we leave it empty or extract from description
        requiredSkills: [],
        employmentType: employmentType,
        experienceMin: expMin, 
        experienceMax: expMax, 
        location: job.job_is_remote ? "Remote" : (locationStr || "Not specified"),
        workMode: workMode,
        salaryMin: job.job_min_salary || 0,
        salaryMax: job.job_max_salary || 0,
        isThirdParty: true,
        status: "published",
        role: job.job_title || keyword,
        assessmentRequired: false,
        aiInterviewRequired: false
      };
    });

    const orConditions = jobsToSave.map(j => ({
      title: j.title,
      externalCompanyName: j.externalCompanyName
    }));

    const existingJobs = await Job.find({
      isThirdParty: true,
      $or: orConditions
    });

    const newJobsToSave = jobsToSave.filter(newJob => {
      return !existingJobs.some(existing => 
        existing.title === newJob.title && 
        existing.externalCompanyName === newJob.externalCompanyName
      );
    });

    if (newJobsToSave.length === 0) {
      return res.status(200).json({ 
        message: "Jobs fetched successfully, but all of them are already in your database (no new jobs to add).", 
        count: 0, 
        jobs: [] 
      });
    }

    const savedJobs = await Job.insertMany(newJobsToSave);
    res.status(201).json({ 
      message: `Successfully fetched and saved ${savedJobs.length} new jobs.`, 
      count: savedJobs.length, 
      jobs: savedJobs 
    });
  } catch (error) {
    console.error("Error fetching third-party jobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAdminJobs,
  createAdminJob,
  updateAdminJob,
  deleteAdminJob,
  fetchAIJobs
};
