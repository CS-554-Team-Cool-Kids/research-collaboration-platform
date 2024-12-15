import React, {useState} from 'react';
import ReactModal from 'react-modal';
import {useQuery, useMutation} from '@apollo/client';
import queries from '../../queries.js';

ReactModal.setAppElement('#root');
const customeStyles = {
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

    const [showEditUser, setShowEditUser] = useState(props.isOpen);
    const [user, setUser] = useState(props.user);
    const [editUser, setEditUser] = useMutation(queries.EDIT_USER);
    
    

    return(
        <>
            <ReactModal
                name='editUser'
            ></ReactModal>
        </>
    );
}

export default EditUser;