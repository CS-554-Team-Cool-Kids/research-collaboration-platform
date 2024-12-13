import React, { useState } from "react";
import KeyIcon from "../../assets/svg/KeyIcon";
import { useMutation, useQuery } from "@apollo/client";
import queries from "../../queries.js";
import { useNavigate } from "react-router-dom";

import {
  checkIsProperFirstOrLastName,
  checkIsProperString,
  checkIsProperPassword,
  validateEmail,
} from "../../helpers";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [addUser] = useMutation(queries.ADD_USER);

  const {
    data: departmentData,
    loading: departmentLoading,
    error: departmentError,
  } = useQuery(queries.GET_ENUM_DEPARTMENT);

  const {
    data: roleData,
    loading: roleLoading,
    error: roleError,
  } = useQuery(queries.GET_ENUM_ROLE);

  const filteredRoles = roleData
    ? roleData.__type.enumValues.filter(
        (role) => role.name.toLowerCase() !== "admin"
      )
    : [];

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      role,
      department,
      bio,
    } = e.target.elements;

    // Add logic to handle form submission (e.g., API call)
    console.log({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      role,
      department,
      bio,
    });

    try {
      email.value = validateEmail(email.value);
      password.value = checkIsProperPassword(password.value);
      firstName.value = checkIsProperFirstOrLastName(
        firstName.value,
        "firstName"
      );
      lastName.value = checkIsProperFirstOrLastName(lastName.value, "lastName");
      role.value = checkIsProperString(role.value, "role");
      department.value = checkIsProperString(department.value, "department");
      if (bio.value) {
        bio.value = checkIsProperString(bio.value, "bio");
      }
      if (password.value !== confirmPassword.value) {
        alert("Passwords do not match");
        return;
      }
      const { data } = await addUser({
        variables: {
          email: email.value,
          password: password.value,
          firstName: firstName.value,
          lastName: lastName.value,
          role: role.value,
          department: department.value,
          bio: bio.value || null,
        },
      });

      console.log(data);
      navigate("/auth/login");
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  return (
    <div className="d-card col-12 col-md-6 glassEffect my-4 mx-auto">
      <div className="d-card-header">
        <h2>
          <KeyIcon /> Register
        </h2>
      </div>
      <div className="d-card-body">
        <form id="registerform" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-floating mb-3">
            <input
              className="form-control"
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <label htmlFor="firstName">First Name:</label>
          </div>

          <div className="form-floating mb-3">
            <input
              className="form-control"
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <label htmlFor="lastName">Last Name:</label>
          </div>

          <div className="form-floating mb-3">
            <input
              className="form-control"
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email:</label>
          </div>

          <div className="form-floating mb-3">
            <input
              className="form-control"
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password:</label>
          </div>

          <div className="form-floating mb-3">
            <input
              className="form-control"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <label htmlFor="confirmPassword">Confirm Password:</label>
          </div>

          <div className="form-floating mb-3">
            {roleLoading ? (
              <select className="form-select" disabled>
                <option>Loading Roles...</option>
              </select>
            ) : roleError ? (
              <select className="form-select" disabled>
                <option>Error loading Roles</option>
              </select>
            ) : (
              <select
                className="form-select"
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select a Role</option>
                {filteredRoles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            )}
            <label htmlFor="role">Role:</label>
          </div>

          <div className="form-floating mb-3">
            {departmentLoading ? (
              <select className="form-select" disabled>
                <option>Loading departments...</option>
              </select>
            ) : departmentError ? (
              <select className="form-select" disabled>
                <option>Error loading departments</option>
              </select>
            ) : (
              <select
                className="form-select"
                id="department"
                name="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="">Select a department</option>
                {departmentData.__type.enumValues.map((dept) => (
                  <option key={dept.name} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}
            <label htmlFor="department">Department:</label>
          </div>

          <div className="form-floating mb-3">
            <textarea
              className="form-control"
              id="bio"
              name="bio"
              placeholder="Short Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="3"
              style={{ height: "100px" }}
              required
            ></textarea>
            <label htmlFor="bio">Bio:</label>
          </div>

          <div className="row">
            <div className="offset-4 col-4 mt-3">
              <button
                className="btn btn-primary col-12 py-2"
                type="submit"
                id="submit"
              >
                Register
              </button>
            </div>
          </div>
        </form>
        <div className="mt-2">
          <a href="/auth/login">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
