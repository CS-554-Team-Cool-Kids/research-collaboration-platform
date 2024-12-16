import React, {useState} from 'react';
import ReactModal from 'react-modal';
import {useQuery, useMutation} from '@apollo/client';
import queries from '../../queries.js';
import { useAuth } from "../../context/AuthContext";

ReactModal.setAppElement('#root');
const customStyles = {
    content: {
        top:'20%',
        left:'50%',
        right:'auto',
        bottom:'auto',
        marginRight:'-50%',
        transform:'translate(-50%, -50%)',
        width:'60%',
        border:'none',
        borderRadius:'20px',
        padding:'0'
    }
};

function EditUser(props){
    const {authState} = useAuth();
    const userId = authState.user.id;

    const [showEditUser, setShowEditUser] = useState(props.isOpen);
    const [user, setUser] = useState(props.user);
    const [editUser] = useMutation(queries.EDIT_USER);
    let firstName, lastName, email, role, department, bio;

    const {
        data: departmentData,
        loading: departmentLoading,
        error: departmentError
    } = useQuery(queries.GET_ENUM_DEPARTMENT);

    const handleSubmit = (e) => {
        e.preventDefault();
        editUser({
            variables: {
                _id: userId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                role: role,
                department: department,
                bio: bio,
            }
        });
        firstName.value='';
        lastName.value='';
        email.value='';
        role.value='';
        department.value='';
        bio.value='';
        props.handleClose();
        alert("Your profile has been updated!");
    };

    if(departmentLoading) return <p>Loading departments...</p>;
    if(departmentError) {
        return (
            <p>Error loading departments: {departmentError.message}</p>
        );
    }

    return(
        <>
            <ReactModal
                name='editUser'
                isOpen={showEditUser}
                contentLabel="Edit User"
                style={customStyles}
            >
                <form
                    className="modal-form"
                    id="editUser"
                    onSubmit={handleSubmit}
                >
                    <div className="d-card">
                        <div className="d-card-header">
                            <h2>Edit User</h2>
                        </div>
                        <div className="d-card-body">
                            {/* First Name */}
                            <div className="form-floating">
                                <input
                                    className="form-control"
                                    type="text"
                                    id="firstName"
                                    ref={(node) => {firstName = node;}}
                                    defaultValue={user.firstName}
                                    autoFocus={true}
                                />
                                <label htmlFor="firstName">First Name</label>
                            </div>

                            {/* Last Name */}
                            <div className="form-floating">
                                <input
                                    className="form-control"
                                    type="text"
                                    id="lastName"
                                    ref={(node) => {lastName = node;}}
                                    defaultValue={user.lastName}
                                />
                                <label htmlFor="lastName">Last Name</label>
                            </div>

                            {/* Email */}
                            <div className="form-floating">
                                <input
                                    className="form-control"
                                    type="text"
                                    id="email"
                                    ref={(node) => {email = node;}}
                                    defaultValue={user.email}
                                />
                                <label htmlFor="email">Email</label>
                            </div>

                            {/* Role */}
                            <div className="form-floating">
                                <select
                                    className="form-control"
                                    id="role"
                                    ref={(node) => {role = node;}}
                                >
                                    <option value="" disabled>Select Role</option>
                                    <option value="STUDENT">STUDENT</option>
                                    <option value="PROFESSOR">PROFESSOR</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            {/* Department */}
                            <div className="form-floating">
                                <select
                                    className="form-control"
                                    id="department"
                                    ref={(node) => {department = node;}}
                                >
                                    <option value="" disabled>Select Department</option>
                                    {departmentData?._type?.enumValues.map((dept) => (
                                        <option key={dept.name} value={dept.name}>
                                            {dept.name.replace(/_/g, " ")}
                                        </option>
                                    ))}
                                </select>
                                <label htmlFor="department">Department</label>
                            </div>

                            {/* BIO */}
                            <div className="form-floating">
                                <textarea
                                    className="form-control"
                                    id="bio"
                                    ref={(bio) => {bio = node;}}
                                    defaultValue={user.bio}
                                    rows="3"
                                ></textarea>
                                <label htmlFor="bio">Bio:</label>
                            </div>

                            <div className="row">
                                <button
                                    className="btn btn-primary"
                                    type="submit"
                                    id="submit"
                                    onClick={() => {
                                        setShowEditUser(false)
                                        props.handleClose()
                                    }}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </ReactModal>
        </>
    );
}

export default EditUser;