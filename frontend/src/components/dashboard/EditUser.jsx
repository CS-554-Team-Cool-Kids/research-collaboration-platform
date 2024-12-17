import React, {useState} from 'react';
import {useQuery, useMutation} from '@apollo/client';
import queries from '../../queries.js';
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

import {
    checkIsProperFirstOrLastName,
    checkIsProperString,
    checkIsProperPassword,
    validateEmail
} from "../../helpers";

const EditUser = () => {
    const {authState} = useAuth();
    const userId = authState.user.id;

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("");
    const [bio, setBio] = useState("");

    const [editUser] = useMutation(queries.EDIT_USER);

    const {
        data: userData,
        loading: userLoading,
        error: userError
    } = useQuery(queries.GET_USER_BY_ID, {
        variables: {id: userId},
        fetchPolicy: 'network-only'
    });

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
        const user = userData.getUserById;
        const {
            firstName,
            lastName,
            email,
            oldPassword,
            newPassword,
            confirmPassword,
            role,
            department,
            bio
        } = e.target.elements;

        try {
            if(firstName.value){
                firstName.value = checkIsProperFirstOrLastName(firstName.value, "firstName");
            } else {
                setFirstName(user.firstName);
            }
            if(lastName.value){
                lastName.value = checkIsProperFirstOrLastName(lastName.value, "lastName");
            } else {
                setLastName(user.lastname);
            }
            if(email.value){
                email.value = validateEmail(email.value);
            } else {
                setEmail(user.email);
            }
            if(oldPassword && newPassword && oldPassword.value !== newPassword.value){
                alert("Old password and new password do not match");
                return;
            }
            if(newPassword.value){
                newPassword.value = checkIsProperPassword(newPassword.value);
            }
            if(newPassword.value && confirmPassword && newPassword.value !== confirmPassword.value){
                alert("Password and confirm password do not match");
                return;
            }
            if(role.value){
                role.value = checkIsProperString(role.value, "role");
            } else {
                setRole(user.role);
            }
            if(department.value){
                department.value = checkIsProperString(department.value, "department");
            } else {
                setDepartment(user.department);
            }
            if(bio.value){
                bio.value = checkIsProperString(bio.value, "bio");
            } else {
                setBio(user.bio);
            }

            const {data} = await editUser({
                variables: {
                    id: userId,
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: email.value,
                    newPassword: newPassword.value,
                    role: role.value,
                    department: department.value,
                    bio: bio.value,
                }
            });

            navigate("/dashboard");

        } catch(error) {
            alert("Error: " +  error.message);
            console.error(error)
        }
    }

    if(userLoading) return <p>Loading user data...</p>;
    if(userError) return <p>Error loading user data: {userError.message}</p>

    return (
        <div className="d-card col-12 col-md-6 glassEffect my-4 mx-auto">
            <div className="d-card-header">
                <h2>Edit User</h2>
            </div>
            <div className="d-card-body">
                <form id="editUserForm" onSubmit={handleSubmit} autoComplete="off">
                    {/* First Name */}
                    <div className="form-floating md-3">
                        <input 
                            className="form-control"
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <label htmlFor="firstName">First Name:</label>
                    </div>

                    {/* Last Name */}
                    <div className="form-floating md-3">
                        <input 
                            className="form-control"
                            type="text"
                            id="lastName"
                            name="lastName"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                        <label htmlFor="lastName">Last Name:</label>
                    </div>

                    {/* Email */}
                    <div className="form-floating md-3">
                        <input 
                            className="form-control"
                            type="email"
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="email">Email:</label>
                    </div>

                    {/* Password */}
                    <div className="form-floating md-3">
                        <input 
                            className="form-control"
                            type="password"
                            id="oldPassword"
                            name="oldPassword"
                            placeholder="Old Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <label htmlFor="oldPassword">Old Password:</label>
                    </div>

                    <div className="form-floating md-3">
                        <input 
                            className="form-control"
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <label htmlFor="newPassword">New Password</label>
                    </div>

                    <div className="form-floating md-3">
                        <input 
                            className="form-control"
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                    </div>

                    {/* Role */}
                    <div className="form-floating md-3">
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

                    {/* Department */}
                    <div className="form-floating md-3">
                        {departmentLoading ? (
                            <select className="form-select" disabled>
                                <option>Loading departments...</option>
                            </select>
                        ) : departmentError ? (
                            <select className="form-select" disabled>
                                <option>Error Loading Departments</option>
                            </select>
                        ) : (
                            <select
                                className="form-select"
                                id="department"
                                name="department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                <option value="">Select a Department</option>
                                {departmentData.__type.enumValues.map((dept) => (
                                    <option key={dept.name} value={dept.name}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <label htmlFor="department">Department</label>
                    </div>

                    {/* Bio */}
                    <div className="form-floating md-3">
                        <textarea
                            className="form-control"
                            id="bio"
                            name="bio"
                            placeholder="Bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows="3"
                            style={({height:"100px"})}
                        ></textarea>
                        <label htmlFor="bio">Bio:</label>
                    </div>

                    {/* Submit Button */}
                    <div className="row">
                        <div className="col-6 mt-3">
                            <button
                                className="btn btn-primary col-12 py-2"
                                type="submit"
                                id="submit"
                            >Submit</button>
                        </div>
                        <div className="col-6 mt-3">
                            <Link 
                                className="btn btn-secondary col-12 py-2" 
                                to="/dashboard"
                            >Cancel</Link>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default EditUser;