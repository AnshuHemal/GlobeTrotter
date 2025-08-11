import React, { useState, useEffect } from "react";
import Header2 from "../components/Header2";
import { Modal } from "react-bootstrap";

const dummySuggestions = {
    Paris: [
        {
            name: "Eiffel Tower",
            description: "Iconic symbol of Paris with city views.",
            type: "Landmark",
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400",
            budget: "$500"
        },
        {
            name: "Louvre Museum",
            description: "World's largest art museum.",
            type: "Museum",
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
            budget: "$300"
        },
    ],
    London: [
        {
            name: "Big Ben",
            description: "Famous clock tower.",
            type: "Landmark",
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400",
            budget: "$400"
        },
        {
            name: "British Museum",
            description: "Historic artifacts from around the world.",
            type: "Museum",
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400",
            budget: "$250"
        },
    ],
};

const places = Object.keys(dummySuggestions);

const ItineraryModal = ({ show, onHide, suggestion, allSuggestions, defaultStartDate, defaultEndDate }) => {
    const initialSections = allSuggestions.map((section) => ({
        ...section,
        startDate: defaultStartDate || "",
        endDate: defaultEndDate || "",
        error: ""
    }));
    const [sections, setSections] = useState(initialSections);

    // Reset sections every time modal is opened or closed
    useEffect(() => {
        setSections(initialSections);
        // eslint-disable-next-line
    }, [show, allSuggestions, defaultStartDate, defaultEndDate]);

    const handleSectionDateChange = (idx, field, value) => {
        setSections((prev) =>
            prev.map((sec, i) => {
                if (i !== idx) return sec;
                let newSec = { ...sec, [field]: value };
                let error = "";
                if (field === 'endDate' && newSec.startDate && value) {
                    if (new Date(value) <= new Date(newSec.startDate)) {
                        error = "End date must be after start date.";
                        newSec.endDate = sec.endDate; // Don't update to invalid value
                    } else {
                        newSec.endDate = value;
                    }
                }
                if (field === 'startDate' && newSec.endDate && value) {
                    if (new Date(newSec.endDate) <= new Date(value)) {
                        error = "End date must be after start date.";
                    }
                }
                newSec.error = error;
                return newSec;
            })
        );
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton style={{ background: '#f8f9fa', color: '#222' }}>
                <Modal.Title style={{ fontWeight: 600 }}>Build Itinerary Screen</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ background: '#fff', color: '#222' }}>
                {sections.map((section, idx) => (
                    <div key={idx} className="mb-4 p-3" style={{ border: '2px solid #e3e3e3', borderRadius: '16px', background: '#f8f9fa' }}>
                        <h5 style={{ color: '#222' }}>Section {idx + 1}: {section.name}</h5>
                        <div className="mb-2" style={{ color: '#444' }}>
                            {section.description}
                        </div>
                        <div className="d-flex flex-wrap gap-3">
                            <div className="flex-grow-1">
                                <label className="form-label">Start Date</label>
                                <input type="date" className="form-control bg-white text-dark" value={section.startDate} onChange={e => handleSectionDateChange(idx, 'startDate', e.target.value)} />
                            </div>
                            <div className="flex-grow-1">
                                <label className="form-label">End Date</label>
                                <input type="date" className="form-control bg-white text-dark" value={section.endDate} onChange={e => handleSectionDateChange(idx, 'endDate', e.target.value)} />
                                {section.error && <div className="text-danger small mt-1">{section.error}</div>}
                            </div>
                            <div className="flex-grow-1">
                                <label className="form-label">Budget</label>
                                <input type="text" className="form-control bg-white text-dark" value={section.budget} readOnly />
                            </div>
                        </div>
                    </div>
                ))}
            </Modal.Body>
        </Modal>
    );
};

const PlanTripPage = () => {
    const [form, setForm] = useState({
        startDate: "",
        endDate: "",
        place: "Paris",
        persons: 1,
        personType: "Adult",
    });
    const [modalShow, setModalShow] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const suggestions = dummySuggestions[form.place] || [];

    const handleSuggestionClick = (s) => {
        setSelectedSuggestion(s);
        setModalShow(true);
    };

    const handleModalClose = () => {
        setModalShow(false);
        setSelectedSuggestion(null);
    };

    return (
        <>
            <Header2 />
            <div
                className="min-vh-100 section-container"
                style={{ backgroundColor: "#fff", padding: "40px 0", fontFamily: "Urbanist, sans-serif", fontWeight: 500 }}
            >
                <div className="container-fluid px-4">
                    <div className="row g-4">
                        {/* Left Column - Filters */}
                        <div className="col-lg-3">
                            <div className="card border-0 shadow-lg h-100" style={{ borderRadius: "25px", background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                                <div className="card-body p-4">
                                    <h4 className="fw-semibold mb-3" style={{ color: "#121212", fontSize: "1.4rem" }}>Plan a New Trip</h4>
                                    <form className="d-flex flex-column gap-3">
                                        <div>
                                            <label className="form-label">Start Date</label>
                                            <input type="date" className="form-control" name="startDate" value={form.startDate} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="form-label">End Date</label>
                                            <input type="date" className="form-control" name="endDate" value={form.endDate} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="form-label">Place</label>
                                            <select className="form-select" name="place" value={form.place} onChange={handleChange}>
                                                {places.map((p) => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Number of Persons</label>
                                            <input type="number" min="1" className="form-control" name="persons" value={form.persons} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="form-label">Person Type</label>
                                            <select className="form-select" name="personType" value={form.personType} onChange={handleChange}>
                                                <option value="Adult">Adult</option>
                                                <option value="Child">Child</option>
                                            </select>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        {/* Right Column - Suggestions */}
                        <div className="col-lg-9">
                            <div className="card border-0 shadow-lg h-100" style={{ borderRadius: "25px", background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", border: "1px solid rgba(0, 118, 116, 0.1)" }}>
                                <div className="card-body p-4">
                                    <h4 className="fw-semibold mb-3" style={{ color: "#121212", fontSize: "1.4rem" }}>Suggestions for Places to Visit/Activities</h4>
                                    <div className="row g-4">
                                        {suggestions.length === 0 && <div className="text-muted">No suggestions available for this place.</div>}
                                        {suggestions.map((s, idx) => (
                                            <div className="col-md-6 col-lg-4" key={idx}>
                                                <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: "18px", cursor: 'pointer' }} onClick={() => handleSuggestionClick(s)}>
                                                    <img src={s.image} alt={s.name} className="card-img-top" style={{ borderTopLeftRadius: "18px", borderTopRightRadius: "18px", height: "140px", objectFit: "cover" }} />
                                                    <div className="card-body">
                                                        <h5 className="card-title mb-1">{s.name}</h5>
                                                        <div className="mb-2 text-warning fw-bold small">
                                                            <span>★ {s.rating}</span>
                                                        </div>
                                                        <div className="mb-2"><span className="badge bg-info text-dark">{s.type}</span></div>
                                                        <p className="card-text text-muted small">{s.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ItineraryModal show={modalShow} onHide={handleModalClose} suggestion={selectedSuggestion} allSuggestions={suggestions} defaultStartDate={form.startDate} defaultEndDate={form.endDate} />
        </>
    );
};

export default PlanTripPage;
