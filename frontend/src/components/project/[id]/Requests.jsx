import React, { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useMutation, useLazyQuery } from "@apollo/client";
import queries from "../../../queries";
import Modal from "react-modal";
import "../../../assets/css/modal.css";

const Requests = () => {
  const { refetch } = useOutletContext(); // Get refetch function from Outlet context
  const [data, setData] = useState(null); // Using null as initial state for clearer checks
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicantDetails, setApplicantDetails] = useState(null);

  const [fetchUserById, { loading: userLoading, error, data: userData }] =
    useLazyQuery(queries.GET_USER_BY_ID, {
      fetchPolicy: "network-only",
    });

  useEffect(() => {
    const reloadData = async () => {
      try {
        const { data: refetchedData } = await refetch();
        if (refetchedData !== data) {
          setData(refetchedData);
        }
      } catch (error) {
        console.error("Error refetching project data:", error);
      } finally {
        setLoading(false);
      }
    };
    reloadData();
  }, [refetch, data]); // Only re-run when refetch or data changes

  const [changeStatus] = useMutation(queries.CHANGE_APPLICATION_STATUS);

  const handleAccept = async (applicationId) => {
    try {
      await changeStatus({
        variables: { id: applicationId, status: "APPROVED" },
      });
      // await refetch(); // Refetch data after changing status
      setData((prevData) => {
        const updatedApplications = prevData.getProjectById.applications.map(
          (application) =>
            application._id === applicationId
              ? { ...application, status: "APPROVED" }
              : application
        );
        return {
          ...prevData,
          getProjectById: {
            ...prevData.getProjectById,
            applications: updatedApplications,
          },
        };
      });
    } catch (err) {
      console.error("Error accepting application:", err);
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await changeStatus({
        variables: { id: applicationId, status: "REJECTED" },
      });
      await refetch(); // Refetch data after changing status
      setData((prevData) => {
        const updatedApplications = prevData.getProjectById.applications.map(
          (application) =>
            application._id === applicationId
              ? { ...application, status: "REJECTED" }
              : application
        );
        return {
          ...prevData,
          getProjectById: {
            ...prevData.getProjectById,
            applications: updatedApplications,
          },
        };
      });
    } catch (err) {
      console.error("Error rejecting application:", err);
    }
  };

  const handleClick = async (application) => {
    setIsModalOpen(true);

    await fetchUserById({
      variables: { id: application.applicant._id },
      onCompleted: (fetchedData) => {
        setApplicantDetails(fetchedData.getUserById);
      },
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className={`d-card glassEffect transition-fade-in-out fade-in`}>
        <div className="d-card-header">
          <h2>Loading...</h2>
        </div>
        <div className="d-card-body">
          <p>Loading project requests...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.getProjectById) {
    return (
      <div className={`d-card glassEffect transition-fade-in-out fade-in`}>
        <div className="d-card-header">
          <h2>Error</h2>
        </div>
        <div className="d-card-body">
          <p>Error loading requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`d-card glassEffect transition-fade-in-out fade-in`}>
      <div className="d-card-header">
        <h2>Requests</h2>
      </div>
      <div className="d-card-body">
        <div className="col-12">
          {data.getProjectById.applications.length > 0 ? (
            data.getProjectById.applications
              .filter((application) => application.status === "PENDING")
              .map((application) => (
                <div key={application._id} className="row mt-3">
                  <div
                    className="col my-auto request-name"
                    onClick={() => handleClick(application)}
                  >
                    {application.applicant.firstName}{" "}
                    {application.applicant.lastName}
                  </div>
                  <div className="col-auto">
                    <button
                      className="btn btn-success mx-2"
                      onClick={() => handleAccept(application._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-danger mx-2"
                      onClick={() => handleReject(application._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p>No applications found</p>
          )}
        </div>
      </div>
      <ApplicantModal
        isOpen={isModalOpen}
        onClose={closeModal}
        applicantDetails={applicantDetails}
        loading={userLoading}
      />
    </div>
  );
};

export default Requests;

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const ApplicantModal = ({ isOpen, onClose, applicantDetails, loading }) => {
  if (loading) {
    return (
      <div className={`d-card glassEffect transition-fade-in-out fade-in`}>
        <div className="d-card-header">
          <h2>Loading...</h2>
        </div>
        <div className="d-card-body">
          <p>Loading project requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {applicantDetails && (
        <Modal
          isOpen={isOpen}
          onRequestClose={onClose}
          style={customStyles}
          contentLabel="Applicant Details Modal"
          // htmlOpenClassName="modal-open"
        >
          <div className="modal-header p-2 text-white d-flex justify-content-between align-items-center">
            <h5 className="modal-title">
              {applicantDetails.firstName} {applicantDetails.lastName}
            </h5>
            <button
              className="btn-close invertColor"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-2">
            {/*<h6 className="mb-3 text-secondary">Basic Information</h6>*/}
            <ul className="list-group">
              <li className="list-group-item">
                <strong>Email:</strong> {applicantDetails.email}
              </li>
              <li className="list-group-item">
                <strong>Role:</strong> {applicantDetails.role}
              </li>
              <li className="list-group-item">
                <strong>Department:</strong> {applicantDetails.department}
              </li>
              <li className="list-group-item">
                <strong>Bio:</strong>{" "}
                {applicantDetails?.bio || "No Bio Available"}
              </li>
            </ul>

            {/*<h6 className="mb-3 text-secondary">Applications</h6>*/}
            {/*{applicantDetails.applications && applicantDetails.applications.length > 0 ? (*/}
            {/*    <div className="accordion" id="applicationsAccordion">*/}
            {/*        {applicantDetails.applications.map((application, index) => (*/}
            {/*            <div className="accordion-item" key={application._id}>*/}
            {/*                <h2 className="accordion-header" id={`heading${index}`}>*/}
            {/*                    <button*/}
            {/*                        className="accordion-button"*/}
            {/*                        type="button"*/}
            {/*                        data-bs-toggle="collapse"*/}
            {/*                        data-bs-target={`#collapse${index}`}*/}
            {/*                        aria-expanded={index === 0 ? "true" : "false"}*/}
            {/*                        aria-controls={`collapse${index}`}*/}
            {/*                    >*/}
            {/*                        Project: {application.project.title}*/}
            {/*                    </button>*/}
            {/*                </h2>*/}
            {/*                <div*/}
            {/*                    id={`collapse${index}`}*/}
            {/*                    className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}*/}
            {/*                    aria-labelledby={`heading${index}`}*/}
            {/*                    data-bs-parent="#applicationsAccordion"*/}
            {/*                >*/}
            {/*                    <div className="accordion-body">*/}
            {/*                        <p><strong>Status:</strong> {application.status}</p>*/}
            {/*                        <p><strong>Application*/}
            {/*                            Date:</strong> {new Date(application.applicationDate).toLocaleDateString()}*/}
            {/*                        </p>*/}
            {/*                        <p><strong>Last*/}
            {/*                            Updated:</strong> {new Date(application.lastUpdatedDate).toLocaleDateString()}*/}
            {/*                        </p>*/}
            {/*                        <p><strong>Number of Comments:</strong> {application.numOfComments}*/}
            {/*                        </p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        ))}*/}
            {/*    </div>*/}
            {/*) : (*/}
            {/*    <p className="text-muted">No applications found.</p>*/}
            {/*)}*/}
          </div>
        </Modal>
      )}
    </div>
  );
};
