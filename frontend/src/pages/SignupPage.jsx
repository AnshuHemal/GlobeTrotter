import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCamera, AiOutlineUser } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import animation from "../assets/travel2.mp4";
import freelancer from "../assets/freelancer.svg";
import client from "../assets/client.svg";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import Header from "../components/Header";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [fullname, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // New state variables for profile photo, country, and city
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry);
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2');
      const countriesData = response.data
        .map(country => ({
          name: country.name.common,
          code: country.cca2
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setCountries(countriesData);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('Failed to load countries. Please try again.');
    } finally {
      setIsLoadingCountries(false);
    }
  };

    const fetchCities = async (countryCode) => {
    setIsLoadingCities(true);
    setSelectedCity("");
    try {
      // Using a free cities API (no key required)
      const countryName = countries.find(c => c.code === countryCode)?.name || '';
      const response = await axios.post(`https://countriesnow.space/api/v0.1/countries/cities`, {
        country: countryName
      });
      
      if (response.data && response.data.data) {
        const citiesData = response.data.data.slice(0, 20).map(city => ({
          name: city,
          region: ''
        }));
        setCities(citiesData);
        // toast.success(`Loaded cities for ${countryName}`);
      } else {
        throw new Error('No cities data received');
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      // Fallback to a simple list of major cities for the selected country
      const fallbackCities = getFallbackCities(countryCode);
      setCities(fallbackCities);
      const countryName = countries.find(c => c.code === countryCode)?.name || '';
      toast.info(`Using fallback cities for ${countryName}`);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // Fallback cities for when API fails
  const getFallbackCities = (countryCode) => {
    const fallbackCitiesMap = {
      'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
      'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur'],
      'GB': ['London', 'Birmingham', 'Leeds', 'Glasgow', 'Sheffield', 'Bradford', 'Edinburgh', 'Liverpool', 'Manchester', 'Bristol'],
      'CA': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
      'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'],
      'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
      'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
      'IT': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania'],
      'ES': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
      'JP': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama'],
      'BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
      'MX': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Ciudad Juárez', 'León', 'Zapopan', 'Nezahualcóyotl', 'Monterrey'],
      'RU': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod', 'Chelyabinsk', 'Samara', 'Omsk', 'Rostov'],
      'KR': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Buenos Aires', 'Changwon'],
      'SG': ['Singapore'],
      'AE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
      'SA': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif', 'Tabuk', 'Buraidah', 'Khamis Mushait', 'Al Hofuf'],
      'EG': ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Luxor', 'Mansoura', 'El-Mahalla El-Kubra', 'Aswan'],
      'ZA': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Kimberley', 'Nelspruit', 'Polokwane'],
      'NG': ['Lagos', 'Kano', 'Ibadan', 'Kaduna', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos']
    };

    return fallbackCitiesMap[countryCode]?.map(city => ({ name: city, region: '' })) || [];
  };

    const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (JPG, PNG, or GIF).');
        return;
      }
      
      // Validate specific image types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a JPG, PNG, or GIF image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB.');
        return;
      }

      // Validate file extension
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error('Please select a file with .jpg, .jpeg, .png, or .gif extension.');
        return;
      }

      setProfilePhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target.result);
      };
      reader.onerror = () => {
        toast.error('Error reading the image file. Please try again.');
      };
      reader.readAsDataURL(file);
      
      toast.success('Profile photo selected successfully!');
    }
  };

  const removeProfilePhoto = () => {
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
  };

  const validatePassword = () => {
    const criteria = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    const criteriaMessages = [
      "Password must be at least 8 characters long.",
      "Password must contain at least one uppercase letter.",
      "Password must contain at least one lowercase letter.",
      "Password must contain at least one number.",
      "Password must contain at least one special character.",
    ];

    const failedCriteria = criteria.reduce((acc, isValid, index) => {
      if (!isValid) acc.push(criteriaMessages[index]);
      return acc;
    }, []);

    if (failedCriteria.length > 0) {
      setPasswordError(failedCriteria.join(" "));
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/send-otp/`,
        { email },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        setOtpSent(true);
        toast.success("OTP sent to your email!");
      } else {
        toast.error("Failed to send OTP. Try again.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput) {
      toast.error("Please enter the OTP.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/verify-otp/`,
        { email, code: otpInput },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        toast.success("Email verified successfully!");
        setIsEmailVerified(true);
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Enhanced validation
    if (!fullname || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isEmailVerified) {
      toast.error("Please verify your email before signing up.");
      return;
    }

    if (!validatePassword()) {
      toast.error(passwordError);
      return;
    }

    // Validate country and city selection
    if (!selectedCountry) {
      toast.error("Please select your country.");
      return;
    }

    if (!selectedCity) {
      toast.error("Please select your city.");
      return;
    }

    if (!agreeToTerms) {
      toast.error("You must agree to the terms of service and privacy policy.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Show loading state
      toast.loading("Creating your account...", { id: "signup" });

      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', 'user');
      formData.append('country', selectedCountry);
      formData.append('city', selectedCity);

      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }

      const response = await axios.post(
        `${API_URL}/signup/`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response?.data?.success) {
        toast.success("Account created successfully!", { id: "signup" });
        navigate("/");
      } else {
        toast.error("Failed to create account.", { id: "signup" });
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      // Handle specific error cases
      if (error?.response?.status === 400) {
        toast.error(error?.response?.data?.message || "Invalid data provided.", { id: "signup" });
      } else if (error?.response?.status === 409) {
        toast.error("An account with this email already exists.", { id: "signup" });
      } else if (error?.response?.status === 413) {
        toast.error("Profile photo is too large. Please use a smaller image.", { id: "signup" });
      } else {
        toast.error(
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
          { id: "signup" }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div
        className="container-fluid d-flex align-items-center justify-content-center section-container"
        style={{ backgroundColor: "#fff", padding: "10px" }}
      >
        <div
          className="row shadow-lg rounded bg-white p-3 w-100"
          style={{ maxWidth: "1200px" }}
        >
          {/* Left Side Section */}
          <div
            className="col-lg-6 col-12 p-3"
            style={{
              maxHeight: "600px",
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <h3
              className="mb-4 display-6 about-one-heading-text text-center"
              style={{ fontSize: "38px" }}
            >
              Let's, - Create Account!
            </h3>

            {/* Profile Photo Picker - Centered at top */}
            <div className="mb-4 d-flex justify-content-center">
              <div className="position-relative" style={{ cursor: "pointer" }}>
                <div
                  className="position-relative"
                  onClick={() => document.getElementById('profile-photo-input').click()}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid #e0e0e0",
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#007674";
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  {profilePhotoPreview ? (
                    <img
                      src={profilePhotoPreview}
                      alt="Profile Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <AiOutlineUser size={50} color="#6c757d" />
                  )}

                  {!profilePhotoPreview && (
                    <div
                      className="position-absolute bottom-0 end-0"
                      style={{
                        backgroundColor: "#007674",
                        color: "white",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px"
                      }}
                    >
                      <AiOutlineCamera size={16} />
                    </div>
                  )}
                </div>

                {/* Delete Icon - Only show when image is selected */}
                {profilePhotoPreview && (
                  <div
                    className="position-absolute top-0 end-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProfilePhoto();
                    }}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "12px",
                      border: "2px solid white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#c82333";
                      e.target.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#dc3545";
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    ✕
                  </div>
                )}

                <input
                  type="file"
                  id="profile-photo-input"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            <form onSubmit={handleSignUp}>
              <div className="modern-input mb-4">
                <input
                  type="text"
                  className="input-field"
                  placeholder=" "
                  value={fullname}
                  required
                  onChange={(e) => setFullName(e.target.value)}
                />
                <label className="input-label">Full Name</label>
              </div>

              {/* Country Dropdown */}
              <div className="modern-input mb-4">
                <select
                  className="input-field"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  required
                  style={{
                    appearance: "none",
                    backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007674%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22/%3E%3C/svg%3E')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                    backgroundSize: "12px auto",
                    paddingRight: "30px"
                  }}
                >
                  <option value="">Select Country</option>
                  {isLoadingCountries ? (
                    <option disabled>Loading countries...</option>
                  ) : (
                    countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* City Dropdown */}
              <div className="modern-input mb-4">
                <select
                  className="input-field"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  required
                  disabled={!selectedCountry}
                  style={{
                    appearance: "none",
                    backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007674%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22/%3E%3C/svg%3E')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                    backgroundSize: "12px auto",
                    paddingRight: "30px",
                    opacity: !selectedCountry ? 0.6 : 1
                  }}
                >
                  <option value="">
                    {!selectedCountry ? "Select Country First" : "Select City"}
                  </option>
                  {isLoadingCities ? (
                    <option disabled>Loading cities...</option>
                  ) : (
                    cities.map((city, index) => (
                      <option key={index} value={city.name}>
                        {city.name} {city.region ? `(${city.region})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div
                className="modern-input mb-4 d-flex align-items-center"
                style={{ gap: "10px" }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  disabled={isEmailVerified}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isValidEmail(e.target.value)) {
                      setShowVerifyButton(true);
                    } else {
                      setShowVerifyButton(false);
                    }
                  }}
                  className="input-field"
                  placeholder=" "
                  style={{
                    color: isEmailVerified ? "green" : "inherit",
                    flex: "1",
                  }}
                />
                <label className="input-label">Email Address</label>
                {showVerifyButton && !isEmailVerified && (
                  <button
                    type="button"
                    className="btn btn-sm w-25"
                    onClick={handleSendOtp}
                    style={{ backgroundColor: "#007674", color: "white" }}
                  >
                    Verify Email
                  </button>
                )}
              </div>

              {!isEmailVerified && otpSent && (
                <div className="modern-input mb-4">
                  <input
                    type="text"
                    className="input-field"
                    placeholder=" "
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    maxLength="6"
                  />
                  <label className="input-label">Enter OTP</label>
                  <button
                    type="button"
                    className="btn btn-sm mt-2"
                    onClick={handleVerifyOtp}
                    style={{ backgroundColor: "#007674", color: "white" }}
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              <div className="modern-input mb-2 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  className="input-field"
                  placeholder=" "
                />
                <label className="input-label">Password</label>
                <span
                  onClick={handleShowPassword}
                  className="password-toggle position-absolute top-50 end-0 translate-middle-y me-2"
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </span>
              </div>

              <div
                className={`mb-3 password-strength-meter ${isPasswordFocused ? "visible" : ""
                  }`}
                style={{ marginTop: "10px" }}
              >
                {isPasswordFocused && (
                  <PasswordStrengthMeter password={password} />
                )}
              </div>

              {passwordError && (
                <div className="text-danger mt-2">
                  <small>{passwordError}</small>
                </div>
              )}

              <div
                className="my-3 d-flex justify-content-center align-items-center"
                style={{ fontSize: "15px" }}
              >
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  checked={agreeToTerms}
                  onChange={() => setAgreeToTerms(!agreeToTerms)}
                  required
                />
                <label htmlFor="termsCheckbox" className="ms-2">
                  Yes, I understand and agree to the{" "}
                  <a
                    href="https://example.com/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007674" }}
                  >
                    Terms of Service
                  </a> {" "}
                  and{" "}
                  <a
                    href="https://example.com/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007674" }}
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              <button
                type="submit"
                className="login-button border-0 w-100 mt-3"
                disabled={isSubmitting}
                style={{
                  fontSize: "16px",
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer"
                }}
              >
                {isSubmitting ? "Creating Account..." : "Create My Account Now !"}
              </button>

              <div
                className="text-center mt-3 display-6"
                style={{ fontSize: "16px", fontWeight: "500" }}
              >
                Already have an account?{" "}
                <Link
                  to={"/login"}
                  className="text-decoration-none ms-1"
                  style={{
                    fontSize: "16px",
                    color: "#007674",
                  }}
                >
                  Log in now!
                </Link>
              </div>
            </form>
          </div>

          <div className="col-lg-6 col-12 d-flex flex-column justify-content-center overflow-x-hidden align-items-center text-center mb-4 mb-lg-0">

            <div className="w-100 px-3" style={{ maxWidth: "500px" }}>
              <video src={animation} loop autoPlay></video>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for new components */}
      <style jsx>{`
        .modern-input select.input-field {
          background-color: transparent;
          border: none;
          border-bottom: 2px solid #e0e0e0;
          border-radius: 0;
          padding: 10px 0;
          font-size: 16px;
          transition: border-color 0.3s ease;
          width: 100%;
        }

        .modern-input select.input-field:focus {
          outline: none;
          border-bottom-color: #007674;
        }

        .modern-input select.input-field:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }

        .modern-input select.input-field option {
          background-color: white;
          color: #333;
        }

        .profile-photo-container {
          transition: all 0.3s ease;
        }

        .profile-photo-container:hover {
          transform: scale(1.05);
        }

        .camera-icon-container {
          transition: all 0.3s ease;
        }

        .camera-icon-container:hover {
          background-color: #005a5a !important;
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
};

export default SignupPage;
