import React, { useEffect, useState } from "react";
import JobCard from "./JobCard";
import Header2 from "../../components/Header2";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import JobDetailsModal from "./JobDetailsModal";
import axios from "axios";
import jobBanner from "../../assets/job-banner.png";
import { motion } from "framer-motion";
import {
  BsSearch,
  BsFilter,
  BsBriefcase,
  BsClock,
  BsCurrencyDollar,
  BsPeople,
  BsStar,
  BsArrowRight,
  BsLightbulb,
  BsCheckCircle,
  BsXCircle,
} from "react-icons/bs";
import { Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const FreelancersDashboard = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState([
    {
      experienceLevel: "Intermediate",
      description: "Hello",
      title: "Full Stack Developer",
    },
  ]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    experienceLevel: [],
    applicants: [],
    duration: [],
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [userId, setUserId] = useState(null);
  const [chatSocket, setChatSocket] = useState(null);

  const API_URL = "http://localhost:5000/api/auth";

  const [minPrice, setMinPrice] = useState(2500);
  const [maxPrice, setMaxPrice] = useState(7500);
  const priceGap = 1000;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "minPrice") {
      if (parseInt(maxPrice) - parseInt(value) >= priceGap) {
        setMinPrice(value);
      }
    } else if (name === "maxPrice") {
      if (parseInt(value) - parseInt(minPrice) >= priceGap) {
        setMaxPrice(value);
      }
    }
  };

  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    if (name === "rangeMin") {
      if (parseInt(maxPrice) - parseInt(value) >= priceGap) {
        setMinPrice(value);
      }
    } else if (name === "rangeMax") {
      if (parseInt(value) - parseInt(minPrice) >= priceGap) {
        setMaxPrice(value);
      }
    }
  };

  const handleFilterChange = (category, value) => {
    setSelectedFilters((prev) => {
      const newFilters = {
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter((item) => item !== value)
          : [...prev[category], value],
      };
      console.log("Filter changed:", { category, value, newFilters });
      return newFilters;
    });
  };

  const resetFilters = () => {
    setSelectedFilters({
      experienceLevel: [],
      applicants: [],
      duration: [],
    });
    setMinPrice(2500);
    setMaxPrice(7500);
    setSearchTerm("");
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_URL}/jobposts/fetch/`);
        console.log("Raw job data:", response.data.data);
        if (response.data.data && response.data.data.length > 0) {
          console.log("First job structure:", response.data.data[0]);
        }
        setJobs(response.data.data);
      } catch (error) {
        console.error("Error fetching job posts:", error);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    // Fetch current user
    fetch("/api/auth/current-user/", { credentials: "include" })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(`Server error: ${res.status} - ${text}`);
        }
        // Try to parse as JSON, but log the text first
        try {
          const data = JSON.parse(text);
          return data;
        } catch (err) {
          console.error("Response was not valid JSON:", text);
          throw err;
        }
      })
      .then((data) => {
        if (data.success && data.user && data.user._id) {
          setUserId(data.user._id);
        }
      })
      .catch((err) => {
        console.error("Error fetching current user:", err);
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const ws = new WebSocket(`ws://localhost:5000/ws/notify/${userId}/`);
    setChatSocket(ws);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (location.pathname.startsWith("/ws/messages")) return;
      if (data.system) {
        toast((t) => (
          <span>
            {data.message}
            <button
              style={{
                marginLeft: 12,
                color: "#007674",
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
              onClick={() => {
                const roomId = data.room_id;
                window.location.href = `/ws/messages?room=${roomId}&user=${data.sender}`;
                toast.dismiss(t.id);
              }}
            >
              Go to chat
            </button>
          </span>
        ));
      } else {
        toast(`New message: ${data.message}`);
      }
    };
    return () => ws.close();
  }, [userId, location.pathname]);

  const handleCardClick = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  // Function to get filter counts based on current data
  const getFilterCounts = () => {
    const counts = {
      experienceLevel: {},
      applicants: {},
      duration: {},
    };

    jobs.forEach((job) => {
      // Experience level counts - handle different field names
      const expLevel =
        job.experienceLevel || job.experience_level || "Not Specified";
      counts.experienceLevel[expLevel] =
        (counts.experienceLevel[expLevel] || 0) + 1;

      // Applicants counts - handle different field names
      const applicants = job.applicants || job.applicant_count || 0;
      let applicantRange = "30 +";
      if (applicants < 5) applicantRange = "Less than 5";
      else if (applicants <= 10) applicantRange = "5 to 10";
      else if (applicants <= 15) applicantRange = "10 to 15";
      else if (applicants <= 20) applicantRange = "15 to 20";
      else if (applicants <= 30) applicantRange = "20 to 30";
      counts.applicants[applicantRange] =
        (counts.applicants[applicantRange] || 0) + 1;

      // Duration counts - handle different field names
      const duration = job.duration || job.project_duration || "Not Specified";
      counts.duration[duration] = (counts.duration[duration] || 0) + 1;
    });

    return counts;
  };

  const filterCounts = getFilterCounts();

  // Enhanced filtering logic
  const filteredJobs = jobs.filter((job) => {
    // Search filter
    const searchMatch =
      !searchTerm ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Experience level filter - handle different possible values
    const experienceMatch =
      selectedFilters.experienceLevel.length === 0 ||
      selectedFilters.experienceLevel.includes("Any") ||
      selectedFilters.experienceLevel.some((selectedLevel) => {
        // Handle different possible formats of experience level
        const jobLevel = job.experienceLevel || job.experience_level || "";
        return (
          jobLevel.toLowerCase().includes(selectedLevel.toLowerCase()) ||
          selectedLevel.toLowerCase().includes(jobLevel.toLowerCase())
        );
      });

    // Price range filter - handle different possible field names
    const jobMinPrice = parseFloat(
      job.hourlyRateFrom || job.hourly_rate_from || job.minPrice || 0
    );
    const jobMaxPrice = parseFloat(
      job.hourlyRateTo || job.hourly_rate_to || job.maxPrice || 0
    );
    const priceMatch =
      (jobMinPrice >= minPrice && jobMinPrice <= maxPrice) ||
      (jobMaxPrice >= minPrice && jobMaxPrice <= maxPrice) ||
      (jobMinPrice <= minPrice && jobMaxPrice >= maxPrice);

    // Applicants filter
    const applicantsMatch =
      selectedFilters.applicants.length === 0 ||
      selectedFilters.applicants.some((filter) => {
        const applicants = job.applicants || job.applicant_count || 0;
        switch (filter) {
          case "Less than 5":
            return applicants < 5;
          case "5 to 10":
            return applicants >= 5 && applicants <= 10;
          case "10 to 15":
            return applicants >= 10 && applicants <= 15;
          case "15 to 20":
            return applicants >= 15 && applicants <= 20;
          case "20 to 30":
            return applicants >= 20 && applicants <= 30;
          case "30 +":
            return applicants > 30;
          default:
            return true;
        }
      });

    // Duration filter - handle different possible field names
    const durationMatch =
      selectedFilters.duration.length === 0 ||
      selectedFilters.duration.some((selectedDuration) => {
        const jobDuration = job.duration || job.project_duration || "";
        return (
          jobDuration.toLowerCase().includes(selectedDuration.toLowerCase()) ||
          selectedDuration.toLowerCase().includes(jobDuration.toLowerCase())
        );
      });

    const finalMatch =
      searchMatch &&
      experienceMatch &&
      priceMatch &&
      applicantsMatch &&
      durationMatch;

    // Debug logging when filters are applied
    if (
      selectedFilters.experienceLevel.length > 0 ||
      selectedFilters.applicants.length > 0 ||
      selectedFilters.duration.length > 0
    ) {
      console.log(`Job "${job.title}" filtering:`, {
        jobLevel: job.experienceLevel || job.experience_level,
        jobDuration: job.duration || job.project_duration,
        jobApplicants: job.applicants || job.applicant_count,
        selectedFilters,
        finalMatch,
      });
    }

    // Temporarily disable all filters except search for debugging
    return searchMatch; // && experienceMatch && priceMatch && applicantsMatch && durationMatch;
  });

  // Monitor filtered jobs for debugging
  useEffect(() => {
    console.log("Current filter state:", selectedFilters);
    console.log("Total jobs:", jobs.length);
    console.log("Filtered jobs:", filteredJobs.length);
    if (filteredJobs.length === 0 && jobs.length > 0) {
      console.log("No jobs match the current filters!");
    }
  }, [selectedFilters, jobs, filteredJobs]);

  return (
    <>
      <style>
        {`
          .filter-card {
            border: 2px solid #e3e3e3;
            border-radius: 18px;
            padding: 18px 20px;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
            cursor: pointer;
            margin-bottom: 12px;
            position: relative;
            overflow: hidden;
          }
          
          .filter-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }
          
          .filter-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 118, 116, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #007674;
          }
          
          .filter-card:hover::before {
            transform: scaleX(1);
          }
          
          .filter-card.selected {
            background: linear-gradient(135deg, rgba(0, 118, 116, 0.08) 0%, rgba(0, 118, 116, 0.03) 100%);
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.12), 0 3px 10px rgba(0, 0, 0, 0.08);
          }
          
          .filter-card.selected::before {
            transform: scaleX(1);
          }
          
          .search-input {
            border: 2px solid #e3e3e3;
            border-radius: 18px;
            padding: 16px 20px 16px 50px;
            font-size: 1rem;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
            position: relative;
          }
          
          .search-input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 8px 25px rgba(0, 118, 116, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .search-input::placeholder {
            color: #999;
            font-weight: 400;
          }
          
          .price-range-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #e3e3e3;
            outline: none;
            margin: 15px 0;
          }
          
          .price-range-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 3px;
            background: #007674;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 118, 116, 0.3);
            transition: all 0.3s ease;
          }
          
          .price-range-slider::-webkit-slider-thumb:hover {
            background: #005a58;
            box-shadow: 0 3px 8px rgba(0, 118, 116, 0.4);
          }
          
          .price-range-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 3px;
            background: #007674;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 6px rgba(0, 118, 116, 0.3);
          }
          
          .price-input {
            display: flex;
            align-items: end;
            gap: 8px;
            margin-bottom: 20px;
          }
          
          .price-input > div {
            flex: 1;
            min-width: 0;
          }
          
          .price-input label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #666;
            margin-bottom: 6px;
            display: block;
          }
          
          .price-input input {
            border: 2px solid #e3e3e3;
            border-radius: 12px;
            padding: 10px 12px;
            font-size: 0.9rem;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            width: 100%;
            box-sizing: border-box;
          }
          
          .price-input input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 16px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-1px);
          }
          
          .price-separator {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 40px;
            color: #666;
            font-weight: 600;
            font-size: 1rem;
            flex-shrink: 0;
          }
          
          .mobile-filter-toggle {
            display: none;
            width: 100%;
            padding: 15px 20px;
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            color: white;
            border: none;
            border-radius: 15px;
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 118, 116, 0.3);
          }
          
          .mobile-filter-toggle:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.4);
          }
          
          .filter-content {
            transition: all 0.3s ease;
          }
          
          @media (max-width: 991.98px) {
            .mobile-filter-toggle {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 0.95rem;
              padding: 12px 16px;
            }
            
            .filter-content {
              max-height: 0;
              overflow: hidden;
              opacity: 0;
            }
            
            .filter-content.expanded {
              max-height: 2000px;
              opacity: 1;
            }
            
            .filter-card {
              margin-bottom: 10px;
              padding: 12px 15px;
            }
            
            .filter-card span {
              font-size: 0.9rem !important;
            }
            
            .price-input {
              gap: 6px;
            }
            
            .price-input input {
              font-size: 0.85rem;
              padding: 8px 10px;
            }
            
            .price-input label {
              font-size: 0.8rem;
            }
            
            .search-input {
              font-size: 0.9rem;
              padding: 12px 16px 12px 40px;
            }
            
            .search-input::placeholder {
              font-size: 0.85rem;
            }
            
            h4 {
              font-size: 1.2rem !important;
            }
            
            h5 {
              font-size: 1rem !important;
            }
            
            p {
              font-size: 0.9rem !important;
            }
            
            .badge {
              font-size: 0.75rem !important;
            }
            
            .btn-link {
              font-size: 0.85rem !important;
            }
            
            /* Hero Section Mobile Adjustments */
            .card h1 {
              font-size: 1.8rem !important;
            }
            
            .card p {
              font-size: 1rem !important;
            }
            
            /* Job Listings Mobile Adjustments */
            .card-body h4 {
              font-size: 1.1rem !important;
            }
            
            .card-body p {
              font-size: 0.85rem !important;
            }
            
            /* General Mobile Typography */
            .text-muted {
              font-size: 0.85rem !important;
            }
            
            .small {
              font-size: 0.8rem !important;
            }
          }
        `}
      </style>
      <Header2 />

      <div
        className="min-vh-100 section-container"
        style={{
          backgroundColor: "#fff",
          padding: "40px 0",
          fontFamily: "Urbanist, sans-serif",
          fontWeight: 500,
        }}
      >
        <div className="container-fluid px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card border-0 shadow-lg mb-5"
            style={{
              borderRadius: "25px",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0, 118, 116, 0.1)",
              overflow: "hidden",
            }}
          >
            <div className="row g-0">
              <div className="col-lg-8 p-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1
                    className="fw-semibold mb-3"
                    style={{
                      color: "#121212",
                      fontSize: "2.5rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Discover Exciting New Projects!
                  </h1>
                  <p
                    className="mb-3"
                    style={{
                      fontSize: "1.2rem",
                      color: "#666",
                      lineHeight: "1.6",
                    }}
                  >
                    Unlock a world of opportunities with our constantly updated
                    project listings. Whether you're looking to take on a
                    freelance challenge or land a full-time role, we've got
                    something for you.
                  </p>
                  <p
                    className="mb-0"
                    style={{
                      fontSize: "1.15rem",
                      color: "#666",
                      lineHeight: "1.6",
                    }}
                  >
                    Browse top positions across various industries and find the
                    perfect fit for your skills and passion.
                  </p>
                </motion.div>
              </div>
              <div className="col-lg-4 d-flex align-items-center justify-content-center p-4">
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  src={jobBanner}
                  alt="Job Opportunities"
                  className="img-fluid"
                  style={{
                    maxHeight: "300px",
                    objectFit: "contain",
                    borderRadius: "20px",
                  }}
                />
              </div>
            </div>
          </motion.div>

          <div className="row g-4">
            {/* Left Column - Filters */}
            <div className="col-lg-3">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="card border-0 shadow-lg h-100"
                style={{
                  borderRadius: "25px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  border: "1px solid rgba(0, 118, 116, 0.1)",
                }}
              >
                <div className="card-body p-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    className="mobile-filter-toggle"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  >
                    <span>
                      <BsFilter className="me-2" />
                      Filters & Search
                    </span>
                    <BsArrowRight
                      style={{
                        transform: isFilterExpanded
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </button>

                  {/* Filter Content */}
                  <div
                    className={`filter-content ${
                      isFilterExpanded ? "expanded" : ""
                    }`}
                  >
                    {/* Search Bar */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="position-relative">
                        <BsSearch
                          className="position-absolute"
                          style={{
                            top: "50%",
                            left: "15px",
                            transform: "translateY(-50%)",
                            color: "#666",
                            zIndex: 1,
                          }}
                        />
                        <input
                          type="text"
                          className="search-input w-100"
                          placeholder="Search jobs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ paddingLeft: "45px" }}
                        />
                      </div>
                    </motion.div>

                    {/* Filter Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4
                          className="fw-semibold mb-0"
                          style={{ color: "#121212", fontSize: "1.4rem" }}
                        >
                          Filters
                        </h4>
                        <div>
                          <button
                            onClick={resetFilters}
                            className="btn btn-link p-0"
                            style={{
                              textDecoration: "none",
                              fontSize: "0.9rem",
                              color: "#dc3545",
                              fontWeight: "600",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = "#c82333";
                              e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = "#dc3545";
                              e.target.style.transform = "scale(1)";
                            }}
                          >
                            Reset All
                          </button>
                        </div>
                      </div>
                      <div
                        style={{
                          height: "3px",
                          background:
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                          borderRadius: "2px",
                          width: "60px",
                        }}
                      />
                    </motion.div>

                    {/* Experience Level */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="mb-3">
                        <h5
                          className="fw-semibold mb-2"
                          style={{ color: "#121212", fontSize: "1.2rem" }}
                        >
                          <BsBriefcase
                            className="me-2"
                            style={{ color: "#007674" }}
                          />
                          Experience Level
                        </h5>
                        <div
                          style={{
                            height: "2px",
                            background:
                              "linear-gradient(135deg, rgba(0, 118, 116, 0.3) 0%, rgba(0, 118, 116, 0.1) 100%)",
                            borderRadius: "1px",
                            width: "40px",
                          }}
                        />
                      </div>
                      {[
                        { label: "Any", count: jobs.length },
                        {
                          label: "Entry Level",
                          count:
                            filterCounts.experienceLevel["Entry Level"] || 0,
                        },
                        {
                          label: "Intermediate",
                          count:
                            filterCounts.experienceLevel["Intermediate"] || 0,
                        },
                        {
                          label: "Expert",
                          count: filterCounts.experienceLevel["Expert"] || 0,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`filter-card ${
                            selectedFilters.experienceLevel.includes(item.label)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleFilterChange("experienceLevel", item.label)
                          }
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              {selectedFilters.experienceLevel.includes(
                                item.label
                              ) ? (
                                <BsCheckCircle
                                  className="me-2"
                                  style={{ color: "#007674" }}
                                />
                              ) : (
                                <div
                                  className="me-2"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid #e3e3e3",
                                    borderRadius: "3px",
                                  }}
                                />
                              )}
                              <span
                                style={{ color: "#121212", fontSize: "1rem" }}
                              >
                                {item.label}
                              </span>
                            </div>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "rgba(0, 118, 116, 0.1)",
                                color: "#007674",
                                fontSize: "0.8rem",
                              }}
                            >
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </motion.div>

                    {/* Price Range */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="mb-3">
                        <h5
                          className="fw-semibold mb-2"
                          style={{ color: "#121212", fontSize: "1.2rem" }}
                        >
                          <BsCurrencyDollar
                            className="me-2"
                            style={{ color: "#007674" }}
                          />
                          Project Price Range
                        </h5>
                        <div
                          style={{
                            height: "2px",
                            background:
                              "linear-gradient(135deg, rgba(0, 118, 116, 0.3) 0%, rgba(0, 118, 116, 0.1) 100%)",
                            borderRadius: "1px",
                            width: "40px",
                          }}
                        />
                      </div>
                      <div className="price-input">
                        <div>
                          <label>Min</label>
                          <input
                            type="number"
                            name="minPrice"
                            value={minPrice}
                            onChange={handleInputChange}
                            placeholder="₹0"
                          />
                        </div>
                        <div className="price-separator">-</div>
                        <div>
                          <label>Max</label>
                          <input
                            type="number"
                            name="maxPrice"
                            value={maxPrice}
                            onChange={handleInputChange}
                            placeholder="₹10,000"
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Number of Applicants */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="mb-3">
                        <h5
                          className="fw-semibold mb-2"
                          style={{ color: "#121212", fontSize: "1.2rem" }}
                        >
                          <BsPeople
                            className="me-2"
                            style={{ color: "#007674" }}
                          />
                          Number of Applicants
                        </h5>
                        <div
                          style={{
                            height: "2px",
                            background:
                              "linear-gradient(135deg, rgba(0, 118, 116, 0.3) 0%, rgba(0, 118, 116, 0.1) 100%)",
                            borderRadius: "1px",
                            width: "40px",
                          }}
                        />
                      </div>
                      {[
                        {
                          label: "Less than 5",
                          count: filterCounts.applicants["Less than 5"] || 0,
                        },
                        {
                          label: "5 to 10",
                          count: filterCounts.applicants["5 to 10"] || 0,
                        },
                        {
                          label: "10 to 15",
                          count: filterCounts.applicants["10 to 15"] || 0,
                        },
                        {
                          label: "15 to 20",
                          count: filterCounts.applicants["15 to 20"] || 0,
                        },
                        {
                          label: "20 to 30",
                          count: filterCounts.applicants["20 to 30"] || 0,
                        },
                        {
                          label: "30 +",
                          count: filterCounts.applicants["30 +"] || 0,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`filter-card ${
                            selectedFilters.applicants.includes(item.label)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleFilterChange("applicants", item.label)
                          }
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              {selectedFilters.applicants.includes(
                                item.label
                              ) ? (
                                <BsCheckCircle
                                  className="me-2"
                                  style={{ color: "#007674" }}
                                />
                              ) : (
                                <div
                                  className="me-2"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid #e3e3e3",
                                    borderRadius: "3px",
                                  }}
                                />
                              )}
                              <span
                                style={{ color: "#121212", fontSize: "1rem" }}
                              >
                                {item.label}
                              </span>
                            </div>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "rgba(0, 118, 116, 0.1)",
                                color: "#007674",
                                fontSize: "0.8rem",
                              }}
                            >
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </motion.div>

                    {/* Project Duration */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <div className="mb-3">
                        <h5
                          className="fw-semibold mb-2"
                          style={{ color: "#121212", fontSize: "1.2rem" }}
                        >
                          <BsClock
                            className="me-2"
                            style={{ color: "#007674" }}
                          />
                          Project Duration
                        </h5>
                        <div
                          style={{
                            height: "2px",
                            background:
                              "linear-gradient(135deg, rgba(0, 118, 116, 0.3) 0%, rgba(0, 118, 116, 0.1) 100%)",
                            borderRadius: "1px",
                            width: "40px",
                          }}
                        />
                      </div>
                      {[
                        {
                          label: "Less than 1 month",
                          count:
                            filterCounts.duration["Less than 1 month"] || 0,
                        },
                        {
                          label: "1 to 3 months",
                          count: filterCounts.duration["1 to 3 months"] || 0,
                        },
                        {
                          label: "3 to 6 months",
                          count: filterCounts.duration["3 to 6 months"] || 0,
                        },
                        {
                          label: "More than 6 months",
                          count:
                            filterCounts.duration["More than 6 months"] || 0,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`filter-card ${
                            selectedFilters.duration.includes(item.label)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleFilterChange("duration", item.label)
                          }
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              {selectedFilters.duration.includes(item.label) ? (
                                <BsCheckCircle
                                  className="me-2"
                                  style={{ color: "#007674" }}
                                />
                              ) : (
                                <div
                                  className="me-2"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid #e3e3e3",
                                    borderRadius: "3px",
                                  }}
                                />
                              )}
                              <span
                                style={{ color: "#121212", fontSize: "1rem" }}
                              >
                                {item.label}
                              </span>
                            </div>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "rgba(0, 118, 116, 0.1)",
                                color: "#007674",
                                fontSize: "0.8rem",
                              }}
                            >
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Job Listings */}
            <div className="col-lg-9">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="card border-0 shadow-lg h-100"
                style={{
                  borderRadius: "25px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  border: "1px solid rgba(0, 118, 116, 0.1)",
                }}
              >
                <div className="card-body p-4">
                  {/* Results Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="d-flex justify-content-between align-items-center mb-4"
                  >
                    <div>
                      <h4
                        className="fw-semibold mb-1"
                        style={{ color: "#121212", fontSize: "1.4rem" }}
                      >
                        Available Jobs
                      </h4>
                      <p
                        className="mb-0"
                        style={{ color: "#666", fontSize: "1rem" }}
                      >
                        {filteredJobs.length} jobs found
                      </p>
                    </div>
                    <div className="d-flex align-items-center">
                      <BsLightbulb
                        className="me-2"
                        style={{ color: "#007674" }}
                      />
                      <span style={{ color: "#666", fontSize: "0.9rem" }}>
                        Don't wait—your next big opportunity is just a click
                        away!
                      </span>
                    </div>
                  </motion.div>

                  {/* Job Cards Grid */}
                  <div className="row g-3">
                    {filteredJobs.map((job, index) => (
                      <motion.div
                        key={index}
                        className="col-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                      >
                        <JobCard job={job} onClick={handleCardClick} />
                      </motion.div>
                    ))}
                  </div>

                  {/* No Results */}
                  {filteredJobs.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="text-center py-5"
                    >
                      <div
                        className="d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background: "rgba(0, 118, 116, 0.1)",
                          color: "#007674",
                        }}
                      >
                        <BsSearch size={40} />
                      </div>
                      <h5
                        className="fw-semibold mb-2"
                        style={{ color: "#121212" }}
                      >
                        No jobs found
                      </h5>
                      <p style={{ color: "#666", fontSize: "1rem" }}>
                        Try adjusting your filters or search terms
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <JobDetailsModal
          job={selectedJob}
          show={showModal}
          onClose={closeModal}
        />
      </div>
    </>
  );
};

export default FreelancersDashboard;
